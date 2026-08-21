/**
 * Toonflow AINhà cung cấpTemplate - Volcengine(Doubao)
 * @version 2.0
 */

// ============================================================
// Định nghĩa kiểu dữ liệu
// ============================================================

type VideoMode =
  | "singleImage"
  | "startEndRequired"
  | "endFrameOptional"
  | "startFrameOptional"
  | "text"
  | (`videoReference:${number}` | `imageReference:${number}` | `audioReference:${number}`)[];

interface TextModel {
  name: string;
  modelName: string;
  type: "text";
  think: boolean;
}

interface ImageModel {
  name: string;
  modelName: string;
  type: "image";
  mode: ("text" | "singleImage" | "multiReference")[];
  associationSkills?: string;
}

interface VideoModel {
  name: string;
  modelName: string;
  type: "video";
  mode: VideoMode[];
  associationSkills?: string;
  audio: "optional" | false | true;
  durationResolutionMap: { duration: number[]; resolution: string[] }[];
}

interface TTSModel {
  name: string;
  modelName: string;
  type: "tts";
  voices: { title: string; voice: string }[];
}

interface VendorConfig {
  id: string;
  version: string;
  name: string;
  author: string;
  description?: string;
  icon?: string;
  inputs: { key: string; label: string; type: "text" | "password" | "url"; required: boolean; placeholder?: string }[];
  inputValues: Record<string, string>;
  models: (TextModel | ImageModel | VideoModel | TTSModel)[];
}

type ReferenceList =
  | { type: "image"; sourceType: "base64"; base64: string }
  | { type: "audio"; sourceType: "base64"; base64: string }
  | { type: "video"; sourceType: "base64"; base64: string };

interface ImageConfig {
  prompt: string;
  referenceList?: Extract<ReferenceList, { type: "image" }>[];
  size: "1K" | "2K" | "4K";
  aspectRatio: `${number}:${number}`;
}

interface VideoConfig {
  duration: number;
  resolution: string;
  aspectRatio: "16:9" | "9:16";
  prompt: string;
  referenceList?: ReferenceList[];
  audio?: boolean;
  mode: VideoMode[];
}

interface TTSConfig {
  text: string;
  voice: string;
  speechRate: number;
  pitchRate: number;
  volume: number;
  referenceList?: Extract<ReferenceList, { type: "audio" }>[];
}

interface PollResult {
  completed: boolean;
  data?: string;
  error?: string;
}

// ============================================================
// Khai báo toàn cục
// ============================================================

declare const axios: any;
declare const logger: (msg: string) => void;
declare const jsonwebtoken: any;
declare const zipImage: (base64: string, size: number) => Promise<string>;
declare const zipImageResolution: (base64: string, w: number, h: number) => Promise<string>;
declare const mergeImages: (base64Arr: string[], maxSize?: string) => Promise<string>;
declare const urlToBase64: (url: string) => Promise<string>;
declare const pollTask: (fn: () => Promise<PollResult>, interval?: number, timeout?: number) => Promise<PollResult>;
declare const createOpenAI: any;
declare const createDeepSeek: any;
declare const createZhipu: any;
declare const createQwen: any;
declare const createAnthropic: any;
declare const createOpenAICompatible: any;
declare const createXai: any;
declare const createMinimax: any;
declare const createGoogleGenerativeAI: any;
declare const exports: {
  vendor: VendorConfig;
  textRequest: (m: TextModel, t: boolean, tl: 0 | 1 | 2 | 3) => any;
  imageRequest: (c: ImageConfig, m: ImageModel) => Promise<string>;
  videoRequest: (c: VideoConfig, m: VideoModel) => Promise<string>;
  ttsRequest: (c: TTSConfig, m: TTSModel) => Promise<string>;
  checkForUpdates?: () => Promise<{ hasUpdate: boolean; latestVersion: string; notice: string }>;
  updateVendor?: () => Promise<string>;
};

// ============================================================
// Nhà cung cấpCấu hình
// ============================================================

const vendor: VendorConfig = {
  id: "volcengine",
  version: "2.4",
  author: "leeqi",
  name: "Volcengine (Doubao)",
  description: "Mô hình lớn Doubao của Volcengine (Bytedance), hỗ trợ khả năng tạo văn bản , hình ảnh, video.\n\nCần lấy Khóa API tại [Bảng điều khiển Volcengine](https://console.volcengine.com/ark)。",
  icon: "",
  inputs: [
    { key: "apiKey", label: "Khóa API (API Key)", type: "password", required: true, placeholder: "API Key của Volcengine" },
    { key: "baseUrl", label: "Địa chỉ yêu cầu", type: "url", required: true, placeholder: "Kết thúc bằng v3, ví dụ: https://ark.cn-beijing.volces.com/api/v3" },
  ],
  inputValues: {
    apiKey: "",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
  },
    models: [
    // === Mô hình Văn bản & Suy luận ===
    { name: "Doubao-Seed-2.0-Pro (Khuyên dùng)", modelName: "doubao-seed-2-0-pro-260215", type: "text", think: true },
    { name: "Doubao-Seed-2.0-Lite", modelName: "doubao-seed-2-0-lite-260215", type: "text", think: true },
    { name: "DeepSeek-V3", modelName: "deepseek-v3-250324", type: "text", think: false },
    { name: "DeepSeek-R1 (Suy luận)", modelName: "deepseek-r1-250528", type: "text", think: true },

    // === Mô hình Tạo hình ảnh (Seedream) ===
    {
      name: "Seedream-5.0 (Khuyên dùng - Flagship)",
      modelName: "doubao-seedream-5-0-260128",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
    },
    {
      name: "Seedream-5.0-Lite (Tốc độ cao)",
      modelName: "doubao-seedream-5-0-lite-260128",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
    },
    {
      name: "Seedream-4.5",
      modelName: "doubao-seedream-4-5-251128",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
    },

    // === Mô hình Tạo Video (Seedance) ===
    {
      name: "Seedance-2.0 (Đồng bộ Âm thanh & Hình ảnh - Số 1)",
      modelName: "doubao-seedance-2-0-260128",
      type: "video",
      mode: ["text", "startFrameOptional", ["imageReference:9", "videoReference:3", "audioReference:3"]],
      audio: "optional",
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["480p", "720p"] }],
    },
    {
      name: "Seedance-2.0-Fast (Đồng bộ Âm thanh & Hình ảnh)",
      modelName: "doubao-seedance-2-0-fast-260128",
      type: "video",
      mode: ["text", "startFrameOptional", ["imageReference:9", "videoReference:3", "audioReference:3"]],
      audio: "optional",
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["480p", "720p"] }],
    },
    {
      name: "Seedance-1.5-Pro (Đồng bộ Âm thanh & Hình ảnh)",
      modelName: "doubao-seedance-1-5-pro-251215",
      type: "video",
      mode: ["text", "startFrameOptional"],
      audio: "optional",
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12], resolution: ["480p", "720p", "1080p"] }],
    },
  ],
};

// ============================================================
// Công cụ bổ trợ
// ============================================================

const getHeaders = () => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "")}`,
  };
};

const getBaseUrl = () => vendor.inputValues.baseUrl.replace(/\/+$/, "");

// ============================================================
// Hàm Adapter
// ============================================================

const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");

  const effortMap: Record<number, string> = {
    0: "minimal",
    1: "low",
    2: "medium",
    3: "high",
  };

  return createOpenAICompatible({
    name: "volcengine",
    baseURL: getBaseUrl(),
    apiKey,
    fetch: async (url: string, options?: RequestInit) => {
      const rawBody = JSON.parse((options?.body as string) ?? "{}");
      const modifiedBody = {
        ...rawBody,
        thinking: {
          type: "enabled",
        },
        reasoning_effort: effortMap[thinkLevel],
      };
      return await fetch(url, {
        ...options,
        body: JSON.stringify(modifiedBody),
      });
    },
  }).chatModel(model.modelName);
};

const imageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  const baseUrl = getBaseUrl();
  const headers = getHeaders();

  const body: any = {
    model: model.modelName,
    prompt: config.prompt || "",
    response_format: "url",
    watermark: false,
  };

  const isOldModel = model.modelName.includes("seedream-3-0");
  const is5Lite = model.modelName.includes("seedream-5-0-lite");

  // sequential_image_generation chỉ  seedream 5.0-lite/4.5/4.0 hỗ trợ
  if (!isOldModel) {
    body.sequential_image_generation = "disabled";
  }

  // tham chiếuHình ảnh：Đơn ảnh string，nhiều ảnh là  array（seedream-3.0-t2i không hỗ trợ image tham số）
  if (!isOldModel && config.referenceList && config.referenceList.length > 0) {
    const images = config.referenceList.map((ref) => ref.base64);
    body.image = images.length === 1 ? images[0] : images;
  }

  // kích thướcXử lý：ưu tiên sử dụng khuyến nghị giá trị pixel，chưa khớpsẽ truyền trực tiếp độ phân giải để Mô hìnhtự động quyết định
  const [w, h] = config.aspectRatio.split(":").map(Number);
  const sizeTable: Record<string, Record<string, string>> = {
    "1K": {
      "1:1": "1024x1024",
      "4:3": "1152x864",
      "3:4": "864x1152",
      "16:9": "1280x720",
      "9:16": "720x1280",
      "3:2": "1248x832",
      "2:3": "832x1248",
      "21:9": "1512x648",
    },
    "2K": {
      "1:1": "2048x2048",
      "4:3": "2304x1728",
      "3:4": "1728x2304",
      "16:9": "2848x1600",
      "9:16": "1600x2848",
      "3:2": "2496x1664",
      "2:3": "1664x2496",
      "21:9": "3136x1344",
    },
    "4K": {
      "1:1": "4096x4096",
      "4:3": "4704x3520",
      "3:4": "3520x4704",
      "16:9": "5504x3040",
      "9:16": "3040x5504",
      "3:2": "4992x3328",
      "2:3": "3328x4992",
      "21:9": "6240x2656",
    },
  };

  const sizeKey = config.size || "2K";
  const ratioKey = config.aspectRatio;
  const table = sizeTable[sizeKey];

  if (table && table[ratioKey]) {
    // khuyến nghị giá trị pixelkhớpđược , nhưng cần  kiểm tra xem có thỏa mãn Mô hìnhyêu cầu pixel tối thiểu
    const [pw, ph] = table[ratioKey].split("x").map(Number);
    const totalPixels = pw * ph;
    if (isOldModel) {
      // seedream-3.0-t2i: phạm vi pixel [512x512, 2048x2048]
      body.size = table[ratioKey];
    } else if (totalPixels < 3686400) {
      // 1K giá trị pixelkhông thỏa mãn Mô hìnhyêu cầu tối thiểu, truyền trực tiếp  "2K" để Mô hìnhtự động quyết định
      body.size = "2K";
    } else if (is5Lite && totalPixels > 10404496) {
      // seedream-5.0-lite tối đa  10404496，4K vượt giới hạn, chuyển sang truyền  "2K"
      body.size = "2K";
    } else {
      body.size = table[ratioKey];
    }
  } else if (isOldModel) {
    // seedream-3.0-t2i: phạm vi pixel [512x512, 2048x2048]，tính trực tiếp theo tỷ lệtính toán
    const base = sizeKey === "1K" ? 1024 : 2048;
    const calcW = Math.min(2048, Math.round(base * Math.sqrt(w / h)));
    const calcH = Math.min(2048, Math.round(base * Math.sqrt(h / w)));
    body.size = `${Math.max(512, calcW)}x${Math.max(512, calcH)}`;
  } else {
    // mới  Mô hìnhchưa khớpgiá trị khuyến nghị, truyền trực tiếp phần tỷ lệ chuỗi ký tự（cách thức1），do Mô hìnhDựa theo prompt tự động quyết địnhkích thước
    // seedream 5.0-lite hỗ trợ "2K"/"3K"，seedream 4.5 hỗ trợ "2K"/"4K"，seedream 4.0 hỗ trợ "1K"/"2K"/"4K"
    if (is5Lite) {
      body.size = sizeKey === "4K" ? "3K" : sizeKey === "1K" ? "2K" : sizeKey;
    } else {
      body.size = sizeKey === "1K" ? "2K" : sizeKey;
    }
  }

  logger(`[Hình ảnhtạo] vui lòng cầu Mô hình: ${model.modelName}, kích thước: ${body.size}`);
  const res = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Hình ảnhtạoYêu cầu thất bại: ${errorText}`);
  }
  const response = await res.json();
  logger(response);

  if (response?.error) {
    throw new Error(`Hình ảnhtạothất bại：${response.error.message || response.error.code}`);
  }

  // từ  data số nhóm giữa trích xuấtảnh đầu tiên thành công của Hình ảnh
  if (response?.data && response.data.length > 0) {
    for (const item of response.data) {
      if (item.url) {
        return await urlToBase64(item.url);
      }
      if (item.b64_json) {
        return item.b64_json;
      }
      if (item.error) {
        throw new Error(`Hình ảnhtạothất bại：${item.error.message || item.error.code}`);
      }
    }
  }

  throw new Error("Hình ảnhtạothất bại：chưa Trả vềhợp lệkết quả");
};

const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  const baseUrl = getBaseUrl();
  const headers = getHeaders();

  const content: any[] = [];

  if (config.prompt) {
    content.push({ type: "text", text: config.prompt });
  }

  if (typeof config.mode === "string") {
    switch (config.mode) {
      case "singleImage": {
        const firstImage = config.referenceList?.find((r) => r.type === "image");
        if (firstImage) {
          content.push({
            type: "image_url",
            image_url: { url: firstImage.base64 },
            role: "first_frame",
          });
        }
        break;
      }
      case "startFrameOptional": {
        const images = config.referenceList?.filter((r) => r.type === "image") ?? [];
        if (images.length > 0) {
          content.push({
            type: "image_url",
            image_url: { url: images[0].base64 },
            role: "first_frame",
          });
          if (images.length > 1) {
            content.push({
              type: "image_url",
              image_url: { url: images[1].base64 },
              role: "last_frame",
            });
          }
        }
        break;
      }
      case "startEndRequired": {
        const images = config.referenceList?.filter((r) => r.type === "image") ?? [];
        if (images.length >= 2) {
          content.push({
            type: "image_url",
            image_url: { url: images[0].base64 },
            role: "first_frame",
          });
          content.push({
            type: "image_url",
            image_url: { url: images[1].base64 },
            role: "last_frame",
          });
        }
        break;
      }
      case "endFrameOptional": {
        const images = config.referenceList?.filter((r) => r.type === "image") ?? [];
        if (images.length > 0) {
          content.push({
            type: "image_url",
            image_url: { url: images[0].base64 },
            role: "first_frame",
          });
          if (images.length > 1) {
            content.push({
              type: "image_url",
              image_url: { url: images[1].base64 },
              role: "last_frame",
            });
          }
        }
        break;
      }
      case "text":
      default:
        break;
    }
  } else if (Array.isArray(config.mode)) {
    // Chế độ đa phương thức: theo loạiphần khác trích xuấtnhất thêm
    const imageRefs = config.referenceList?.filter((r) => r.type === "image") ?? [];
    const videoRefs = config.referenceList?.filter((r) => r.type === "video") ?? [];
    const audioRefs = config.referenceList?.filter((r) => r.type === "audio") ?? [];

    for (const refDef of config.mode) {
      if (typeof refDef === "string") {
        if (refDef.startsWith("imageReference:")) {
          const maxCount = parseInt(refDef.split(":")[1], 10);
          for (const ref of imageRefs.slice(0, maxCount)) {
            content.push({
              type: "image_url",
              image_url: { url: ref.base64 },
              role: "reference_image",
            });
          }
        } else if (refDef.startsWith("videoReference:")) {
          const maxCount = parseInt(refDef.split(":")[1], 10);
          for (const ref of videoRefs.slice(0, maxCount)) {
            content.push({
              type: "video_url",
              video_url: { url: ref.base64 },
              role: "reference_video",
            });
          }
        } else if (refDef.startsWith("audioReference:")) {
          const maxCount = parseInt(refDef.split(":")[1], 10);
          for (const ref of audioRefs.slice(0, maxCount)) {
            content.push({
              type: "audio_url",
              audio_url: { url: ref.base64 },
              role: "reference_audio",
            });
          }
        }
      }
    }
  }

  const body: any = {
    model: model.modelName,
    content,
    ratio: config.aspectRatio,
    duration: config.duration,
    resolution: config.resolution || "720p",
    watermark: false,
  };

  if (model.audio === "optional") {
    body.generate_audio = config.audio !== false;
  } else if (model.audio === true) {
    body.generate_audio = true;
  } else {
    body.generate_audio = false;
  }

  logger(`[Videotạo] Gửi tác vụ, Mô hình: ${model.modelName}, thời lượng: ${config.duration}s, phần tỷ lệ : ${config.resolution}`);
  const res = await fetch(`${baseUrl}/contents/generations/tasks`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Videotạotác vụ sáng tạo thất bại: ${errorText}`);
  }
  const createResponse = await res.json();
  logger(createResponse);
  const taskId = createResponse?.id;

  if (!taskId) {
    throw new Error("Videotạotác vụ sáng tạo thất bại：chưa Trả vềID tác vụ");
  }

  logger(`[Videotạo] tác vụ đã sáng tạo , ID: ${taskId}`);

  const result = await pollTask(
    async (): Promise<PollResult> => {
      const queryRes = await fetch(`${baseUrl}/contents/generations/tasks/${taskId}`, {
        method: "GET",
        headers,
      });
      if (!queryRes.ok) {
        const errorText = await queryRes.text();
        throw new Error(`Truy vấnVideotạotác vụ trạng tháithất bại: ${errorText}`);
      }
      const task = await queryRes.json();

      logger(`[Videotạo] tác vụ trạng thái: ${JSON.stringify(task)}`);

      switch (task.status) {
        case "succeeded":
          if (task.content?.video_url) {
            return { completed: true, data: task.content.video_url };
          }
          return { completed: true, error: "tác vụ thành côngnhưng chưa Trả vềVideoURL" };
        case "failed":
          return { completed: true, error: task.error?.message || "Videotạothất bại" };
        case "expired":
          return { completed: true, error: "Videotạotác vụ Hết thời gian chờ" };
        case "cancelled":
          return { completed: true, error: "Videotạotác vụ đã xuất hủy " };
        default:
          return { completed: false };
      }
    },
    10000,
    600000 * 3,
  );

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data!;
};

const ttsRequest = async (config: TTSConfig, model: TTSModel): Promise<string> => {
  return "";
};

const checkForUpdates = async (): Promise<{ hasUpdate: boolean; latestVersion: string; notice: string }> => {
  return { hasUpdate: false, latestVersion: "2.0", notice: "" };
};

const updateVendor = async (): Promise<string> => {
  return "";
};

// ============================================================
// Export
// ============================================================

exports.vendor = vendor;
exports.textRequest = textRequest;
exports.imageRequest = imageRequest;
exports.videoRequest = videoRequest;
exports.ttsRequest = ttsRequest;
exports.checkForUpdates = checkForUpdates;
exports.updateVendor = updateVendor;

export {};
