import { generateText, streamText, wrapLanguageModel, stepCountIs, extractReasoningMiddleware } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import axios from "axios";
import { transform } from "sucrase";
import u from "@/utils";
import aiHealth, { type ClassifiedAiError } from "@/utils/aiHealth";

const MAX_FALLBACK_CANDIDATES = 4;

type AiType =
  | "scriptAgent"
  | "productionAgent"
  | "universalAi"
  | "scriptAgent:decisionAgent"
  | "scriptAgent:supervisionAgent"
  | "scriptAgent:storySkeletonAgent"
  | "scriptAgent:adaptationStrategyAgent"
  | "scriptAgent:scriptAgent"
  | "productionAgent:decisionAgent"
  | "productionAgent:supervisionAgent"
  | "productionAgent:deriveAssetsAgent"
  | "productionAgent:generateAssetsAgent"
  | "productionAgent:directorPlanAgent"
  | "productionAgent:storyboardGenAgent"
  | "productionAgent:storyboardPanelAgent"
  | "productionAgent:storyboardTableAgent";

type FnName = "textRequest" | "imageRequest" | "videoRequest" | "ttsRequest";

const AiTypeValues: AiType[] = [
  "scriptAgent",
  "productionAgent",
  "universalAi",
  "scriptAgent:decisionAgent",
  "scriptAgent:supervisionAgent",
  "scriptAgent:storySkeletonAgent",
  "scriptAgent:adaptationStrategyAgent",
  "scriptAgent:scriptAgent",
  "productionAgent:decisionAgent",
  "productionAgent:supervisionAgent",
  "productionAgent:deriveAssetsAgent",
  "productionAgent:generateAssetsAgent",
  "productionAgent:directorPlanAgent",
  "productionAgent:storyboardGenAgent",
  "productionAgent:storyboardPanelAgent",
  "productionAgent:storyboardTableAgent",
  "universalAi",
];
async function getFallbackModelName(): Promise<`${string}:${string}` | null> {
  try {
    const vendors = await u.db("o_vendorConfig").where("enable", 1);
    for (const v of vendors) {
      const models = await u.vendor.getModelList(v.id);
      const textModel = models.find((m: any) => m.type === "text");
      if (textModel) {
        return `${v.id}:${textModel.modelName}` as `${string}:${string}`;
      }
    }
    for (const vId of ["google", "deepseek", "openai", "toonflow", "atlascloud"]) {
      const v = await u.db("o_vendorConfig").where("id", vId).first();
      if (v) {
        const inputVals = JSON.parse(v.inputValues || "{}");
        if (inputVals.apiKey && inputVals.apiKey.trim()) {
          const models = await u.vendor.getModelList(vId);
          const textModel = models.find((m: any) => m.type === "text");
          if (textModel) {
            return `${vId}:${textModel.modelName}` as `${string}:${string}`;
          }
        }
      }
    }
  } catch {}
  return null;
}

async function resolveModelName(value: AiType | `${string}:${string}`): Promise<`${string}:${string}`> {
  if (AiTypeValues.includes(value as AiType)) {
    const agentUseModeVal = await u.db("o_setting").where("key", "agentUseMode").first();

    // Cấu hình nâng cao
    if (agentUseModeVal?.value == "1") {
      const agentDeployData = await u.db("o_agentDeploy").where("key", value).first();
      if (agentDeployData?.modelName) return agentDeployData.modelName as `${string}:${string}`;
      const fallback = await getFallbackModelName();
      if (fallback) return fallback;
      throw new Error(`Trong chế độ cấu hình nâng cao, chưa cấu hình mô hình cho [${value}]. Vui lòng vào Cài đặt -> Cấu hình Agent.`);
    }

    // Cấu hình cơ bản
    const [mainly] = value!.split(/:(.+)/);
    const mainlyData = await u.db("o_agentDeploy").where("key", mainly).first();
    if (mainlyData?.modelName) return mainlyData.modelName as `${string}:${string}`;
    
    const fallback = await getFallbackModelName();
    if (fallback) return fallback;
    throw new Error(`Chưa cấu hình mô hình AI cho [${mainlyData?.name || value}]. Vui lòng vào mục "Cài đặt ToonFlow -> Cấu hình Agent" để chọn Nhà cung cấp và Mô hình.`);
  }
  return value as `${string}:${string}`;
}

// Xây dựng danh sách mô hình dự phòng "gần nhất": ưu tiên các mô hình khác cùng nhà cung cấp
// (đã được sắp xếp theo thứ tự khuyến nghị trong file vendor), sau đó tới các nhà cung cấp khác đang bật.
async function buildFallbackCandidates(primaryModelName: `${string}:${string}`): Promise<`${string}:${string}`[]> {
  const seen = new Set<string>([primaryModelName]);
  const candidates: `${string}:${string}`[] = [primaryModelName];
  try {
    const [primaryVendorId] = primaryModelName.split(/:(.+)/);
    const vendors: any[] = await u.db("o_vendorConfig").where("enable", 1);
    vendors.sort((a: any, b: any) => (a.id === primaryVendorId ? -1 : b.id === primaryVendorId ? 1 : 0));
    outer: for (const v of vendors) {
      const models = await u.vendor.getModelList(v.id);
      for (const m of models) {
        if (m.type !== "text") continue;
        const candidate = `${v.id}:${m.modelName}` as `${string}:${string}`;
        if (seen.has(candidate)) continue;
        seen.add(candidate);
        candidates.push(candidate);
        if (candidates.length >= MAX_FALLBACK_CANDIDATES) break outer;
      }
    }
  } catch {}
  return candidates;
}

async function getModelConfig(value: AiType | `${string}:${string}`) {
  if (AiTypeValues.includes(value as AiType)) {
    const agentUseModeVal = await u.db("o_setting").where("key", "agentUseMode").first();
    if (agentUseModeVal?.value == "1") {
      const agentDeployData = await u.db("o_agentDeploy").where("key", value).first();
      if (agentDeployData?.modelName) return agentDeployData;
    }
    const [mainly] = value!.split(/:(.+)/);
    const mainlyData = await u.db("o_agentDeploy").where("key", mainly).first();
    return mainlyData || null;
  }
  return null;
}

async function getVendorTemplateFn(
  fnName: "textRequest",
  modelName: `${string}:${string}`,
): Promise<(think?: boolean, thinkLevel?: 0 | 1 | 2 | 3) => any>;
async function getVendorTemplateFn(fnName: Exclude<FnName, "textRequest">, modelName: `${string}:${string}`): Promise<(input: any) => any>;
async function getVendorTemplateFn(fnName: FnName, modelName: `${string}:${string}`): Promise<any> {
  if (!modelName || typeof modelName !== "string" || !modelName.trim()) {
    throw new Error("Vui lòng chọn Mô hình trên thanh công cụ trước khi thực hiện tác vụ.");
  }
  const [id, name] = modelName.split(/:(.+)/);
  if (!id || !name) {
    throw new Error("Mô hình được chọn không hợp lệ, vui lòng chọn lại mô hình.");
  }
  const vendorConfigData = await u.db("o_vendorConfig").where("id", id).first();
  if (!vendorConfigData) throw new Error(`Không tìm thấy cấu hình nhà cung cấp ${id}`);
  const modelList = await u.vendor.getModelList(id);
  const selectedModel = modelList.find((i: any) => i.modelName == name);
  if (!selectedModel) throw new Error(`Không tìm thấy mô hình ${name} trong nhà cung cấp ${id}`);
  const code = u.vendor.getCode(id);
  const jsCode = transform(code, { transforms: ["typescript"] }).code;
  const running = u.vm(jsCode);
  if (running.vendor) {
    Object.assign(running.vendor.inputValues, JSON.parse(vendorConfigData.inputValues ?? "{}"));
    running.vendor.models = modelList;
  }
  const fn = running[fnName];
  if (!fn) throw new Error(`Không tìm thấy hàm trong cấu hình nhà cung cấp ${fnName} id=${id}`);
  if (fnName == "textRequest")
    return (think?: boolean, thinkLevel: 0 | 1 | 2 | 3 = 0) => {
      const effectiveThink = think ?? !!selectedModel.think;
      return fn(selectedModel, effectiveThink, thinkLevel);
    };
  else return <T>(input: T) => fn(input, selectedModel);
}

async function withTaskRecord<T>(
  modelKey: AiType | `${string}:${string}`,
  taskClass: string,
  describe: string,
  relatedObjects: string,
  projectId: number,
  fn: (modelName: `${string}:${string}`, think: Boolean, thinkLevel: 0 | 1 | 2 | 3) => Promise<T>,
): Promise<T> {
  const modelName = await resolveModelName(modelKey);
  const [_, model] = modelName.split(/:(.+)/);
  const taskRecord = await u.task(projectId, taskClass, model, { describe: describe, content: relatedObjects });
  try {
    const result = await fn(modelName, false, 0);

    taskRecord(1);
    return result;
  } catch (e) {
    taskRecord(-1, u.error(e).message);
    throw new Error(u.error(e).message);
  }
}

async function urlToBase64(url: string, retries = 3, delay = 1000): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.get(url, { responseType: "arraybuffer" });
      const base64 = Buffer.from(res.data).toString("base64");
      return `${base64}`;
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error("urlToBase64 failed");
}
class AiText {
  private AiType: AiType | `${string}:${string}`;
  private think?: boolean;
  private thinkLevel: 0 | 1 | 2 | 3;
  constructor(AiType: AiType | `${string}:${string}`, think?: boolean, thinkLevel: 0 | 1 | 2 | 3 = 0) {
    this.AiType = AiType;
    this.think = think;
    this.thinkLevel = thinkLevel;
  }
  private async resolveModel(modelName: `${string}:${string}`, middleware?: any | any[]) {
    const switchAiDevTool = await u.db("o_setting").where("key", "switchAiDevTool").first();
    const sdkFn = await getVendorTemplateFn("textRequest", modelName);
    const baseModel = await sdkFn(this.think, this.thinkLevel);
    const mws = [
      ...(switchAiDevTool?.value === "1" ? [devToolsMiddleware()] : []),
      ...(middleware ? (Array.isArray(middleware) ? middleware : [middleware]) : []),
    ];
    return mws.length > 0 ? wrapLanguageModel({ model: baseModel, middleware: mws.length === 1 ? mws[0] : mws }) : baseModel;
  }
  // Chỉ tự động dự phòng sang mô hình khác khi gọi bằng khóa symbolic (AiType),
  // không áp dụng cho gọi trực tiếp `vendor:model` (dùng để kiểm tra đúng 1 mô hình cụ thể).
  private async resolveCandidates(): Promise<`${string}:${string}`[]> {
    const primary = await resolveModelName(this.AiType);
    if (!AiTypeValues.includes(this.AiType as AiType)) return [primary];
    return buildFallbackCandidates(primary);
  }
  async invoke(input: Omit<Parameters<typeof generateText>[0], "model">) {
    const config = await getModelConfig(this.AiType);
    const candidates = await this.resolveCandidates();

    const attempted: string[] = [];
    let lastClassified: ClassifiedAiError | null = null;
    for (const modelName of candidates) {
      attempted.push(modelName);
      try {
        const result = await generateText({
          ...(input.tools && { stopWhen: stepCountIs(Object.keys(input.tools).length * 50) }),
          ...input,
          model: await this.resolveModel(modelName),
          ...(config?.temperature && { temperature: config.temperature }),
          ...(config?.maxOutputTokens && { maxOutputTokens: config.maxOutputTokens }),
        } as Parameters<typeof generateText>[0]);
        aiHealth.recordSuccess(modelName);
        return result;
      } catch (e) {
        const classified = aiHealth.classifyAiError(e);
        aiHealth.recordFailure(modelName, classified);
        lastClassified = classified;
      }
    }
    throw new Error(aiHealth.formatFriendlyAiError(attempted, lastClassified));
  }
  async stream(input: Omit<Parameters<typeof streamText>[0], "model">) {
    const config = await getModelConfig(this.AiType);
    const candidates = await this.resolveCandidates();

    const buildStream = async (modelName: `${string}:${string}`) =>
      streamText({
        ...(input.tools && { stopWhen: stepCountIs(Object.keys(input.tools).length * 50) }),
        ...input,
        model: await this.resolveModel(modelName, extractReasoningMiddleware({ tagName: "reasoning_content", separator: "\n" })),
        ...(config?.temperature && { temperature: config.temperature }),
        ...(config?.maxOutputTokens && { maxOutputTokens: config.maxOutputTokens }),
      } as Parameters<typeof streamText>[0]);

    // Gọi trực tiếp `vendor:model` (kiểm tra 1 mô hình cụ thể): không bọc, giữ nguyên hành vi gốc.
    if (candidates.length === 1) {
      return buildStream(candidates[0]);
    }

    const attempted: string[] = [];
    let lastClassified: ClassifiedAiError | null = null;
    let picked: { result: Awaited<ReturnType<typeof buildStream>>; iter: AsyncIterator<any>; buffered: any[] } | null = null;
    let pickedModelName: `${string}:${string}` = candidates[0];

    for (const modelName of candidates) {
      attempted.push(modelName);
      const result = await buildStream(modelName);
      const iter = (result.fullStream as AsyncIterable<any>)[Symbol.asyncIterator]();
      // `fullStream` luôn phát ra một chunk bao bọc `{type:"start"}` trước tiên, bất kể cuộc gọi
      // model bên dưới có thành công hay không, nên phải "nhìn trước" xuyên qua các chunk vỏ bọc
      // (không phải nội dung, không phải lỗi) cho tới khi thấy tín hiệu thật (nội dung/step/lỗi/kết thúc)
      // mới quyết định có dùng mô hình này hay chuyển sang mô hình dự phòng tiếp theo.
      const buffered: any[] = [];
      let failed = false;
      let classified: ClassifiedAiError | null = null;
      while (true) {
        const next = await iter.next();
        if (next.done) break;
        if (next.value?.type === "error") {
          classified = aiHealth.classifyAiError(next.value.error);
          failed = true;
          break;
        }
        buffered.push(next.value);
        if (next.value?.type !== "start") break;
      }
      if (failed) {
        aiHealth.recordFailure(modelName, classified!);
        lastClassified = classified;
        continue;
      }
      aiHealth.recordSuccess(modelName);
      picked = { result, iter, buffered };
      pickedModelName = modelName;
      break;
    }

    if (!picked) {
      throw new Error(aiHealth.formatFriendlyAiError(attempted, lastClassified));
    }

    const chosenModelName = pickedModelName;
    const primaryModelName = attempted[0];
    const fellBack = chosenModelName !== primaryModelName;
    const noticeText = fellBack && lastClassified ? aiHealth.formatFallbackNotice(primaryModelName, chosenModelName, lastClassified) : null;

    const transformErrorChunk = (chunk: any) => {
      if (chunk?.type === "error") {
        const classified = aiHealth.classifyAiError(chunk.error);
        aiHealth.recordFailure(chosenModelName, classified);
        return { ...chunk, error: new Error(aiHealth.formatFriendlyAiError([chosenModelName], classified)) };
      }
      return chunk;
    };

    const pickedRef = picked;
    const chainedFullStream = (async function* () {
      if (noticeText) yield { type: "text-delta", id: "fallback-notice", text: noticeText };
      for (const chunk of pickedRef.buffered) yield transformErrorChunk(chunk);
      while (true) {
        const n = await pickedRef.iter.next();
        if (n.done) return;
        yield transformErrorChunk(n.value);
      }
    })();

    return new Proxy(picked.result as any, {
      get(target: any, prop: string | symbol, _receiver: any) {
        if (prop === "fullStream") return chainedFullStream;
        const value = Reflect.get(target, prop, target);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  }
}

function referenceList2imageBase642(id: string, input: any) {
  const version = u.vendor.getVendor(id).version;
  if (!version || isNaN(parseFloat(version)) || parseFloat(version) < 2.0) {
    input.imageBase64 = input.referenceList.map((item: any) => item.base64);
    return input;
  }
  return input;
}

export type ReferenceList = { type: "image"; base64: string } | { type: "audio"; base64: string } | { type: "video"; base64: string };

interface ImageConfig {
  prompt: string;
  referenceList?: Extract<ReferenceList, { type: "image" }>[];
  size: "1K" | "2K" | "4K";
  aspectRatio: `${number}:${number}`;
}

interface TaskRecord {
  taskClass: string; // Phân loại tác vụ
  describe: string; // Mô tả tác vụ
  relatedObjects: string; // Thông tin đối tượng liên quan, thuận tiện cho phân tích và theo dõi sau  này
  projectId: number; // ID Dự án
}

class AiImage {
  private key: `${string}:${string}`;
  private result: string = "";
  constructor(key: `${string}:${string}`) {
    this.key = key;
  }
  async run(input: ImageConfig, taskRecord?: TaskRecord) {
    const modelName = await resolveModelName(this.key);
    const exec = async (mn: `${string}:${string}`) => {
      const fn = await getVendorTemplateFn("imageRequest", mn);
      await referenceList2imageBase642(mn.split(/:(.+)/)[0], input);
      this.result = await fn(input);
      if (this.result.startsWith("http")) this.result = await urlToBase64(this.result);
      return this;
    };
    if (taskRecord) {
      await withTaskRecord(this.key, taskRecord.taskClass, taskRecord.describe, taskRecord.relatedObjects, taskRecord.projectId, exec);
      return this;
    }
    await exec(modelName);
    return this;
  }
  async save(path: string) {
    await u.oss.writeFile(path, this.result);
    return this;
  }
}

type VideoMode =
  | "singleImage" // Tham chiếu đơn ảnh
  | "startEndRequired" // Khung đầu/cuối (bắt buộc cả hai)
  | "endFrameOptional" // Khung đầu/cuối (khung cuối tùy chọn)
  | "startFrameOptional" // Khung đầu/cuối (khung đầu tùy chọn)
  | "text" // Văn bản 
  | (`videoReference:${number}` | `imageReference:${number}` | `audioReference:${number}`)[]; // Đa tham chiếu (chữ số đại diện cho số lượng giới hạn)

interface VideoConfig {
  duration: number;
  resolution: string;
  aspectRatio: "16:9" | "9:16";
  prompt: string;
  referenceList?: ReferenceList[];
  audio?: boolean;
  mode: VideoMode[];
}

class AiVideo {
  private key: `${string}:${string}`;
  private result: string = "";
  constructor(key: `${string}:${string}`) {
    this.key = key;
  }
  async run(input: VideoConfig, taskRecord?: TaskRecord) {
    const modelName = await resolveModelName(this.key);
    try {
      const exec = async (mn: `${string}:${string}`) => {
        const fn = await getVendorTemplateFn("videoRequest", mn);
        await referenceList2imageBase642(mn.split(/:(.+)/)[0], input);

        this.result = await fn(input);

        if (this.result.startsWith("http")) this.result = await urlToBase64(this.result);
      };
      if (taskRecord) {
        await withTaskRecord(this.key, taskRecord.taskClass, taskRecord.describe, taskRecord.relatedObjects, taskRecord.projectId, exec);
        return this;
      }
      await exec(modelName);
      return this;
    } catch (e) {
      throw e;
    }
  }
  async save(path: string) {
    await u.oss.writeFile(path, this.result);
    return this;
  }
}
class AiAudio {
  private key: `${string}:${string}`;
  private result: string = "";
  constructor(key: `${string}:${string}`) {
    this.key = key;
  }
  async run(input: VideoConfig, taskRecord?: TaskRecord) {
    const modelName = await resolveModelName(this.key);
    const exec = async (mn: `${string}:${string}`) => {
      try {
        const fn = await getVendorTemplateFn("ttsRequest", mn);
        await referenceList2imageBase642(mn.split(/:(.+)/)[0], input);
        this.result = await fn(input);

        if (this.result.startsWith("http")) this.result = await urlToBase64(this.result);
        return this;
      } catch (e) {}
    };
    if (taskRecord) {
      return withTaskRecord(this.key, taskRecord.taskClass, taskRecord.describe, taskRecord.relatedObjects, taskRecord.projectId, exec);
    }
    return await exec(modelName);
  }
  async save(path: string) {
    await u.oss.writeFile(path, this.result);
    return this;
  }
}

export default {
  Text: (AiType: AiType | `${string}:${string}`, think?: boolean, thinkLevel?: 0 | 1 | 2 | 3) => new AiText(AiType, think, thinkLevel),
  Image: (key: `${string}:${string}`) => new AiImage(key),
  Video: (key: `${string}:${string}`) => new AiVideo(key),
  Audio: (key: `${string}:${string}`) => new AiAudio(key),
};
