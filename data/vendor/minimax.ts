/**
 * Toonflow AINhà cung cấpTemplate - MiniMax(Hailuo AI)
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
  uploadReference: (base64: string, fileType: "image" | "audio" | "video") => Promise<ReferenceList>;
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
  id: "minimax",
  version: "2.1",
  author: "Toonflow",
  name: "MiniMax (Hailuo AI)",
  description: "Adapter giao diện chính thức MiniMax, hỗ trợ mô hình suy luận văn bản , Text-to-Image / Image-to-Image, và tạo video (Text-to-Video, Image-to-Video, khung đầu/cuối).\n\n🔗 [Truy cập nền tảng MiniMax](https://minimaxi.com/)",
  inputs: [
    { key: "apiKey", label: "Khóa API (API Key)", type: "password", required: true },
    { key: "baseUrl", label: "Địa chỉ yêu cầu", type: "url", required: true, placeholder: "Ví dụ: https://api.minimaxi.com" },
  ],
  inputValues: { apiKey: "", baseUrl: "https://api.minimaxi.com" },
  models: [
    // Mô hình văn bản 
    { name: "MiniMax-M2.7 (Bản suy luận (Reasoning))", modelName: "MiniMax-M2.7", type: "text", think: true },
    { name: "MiniMax-M2.7 Bản tốc độ cao (Bản suy luận (Reasoning))", modelName: "MiniMax-M2.7-highspeed", type: "text", think: true },
    { name: "MiniMax-M2.5 (Bản suy luận (Reasoning))", modelName: "MiniMax-M2.5", type: "text", think: true },
    { name: "MiniMax-M2.5 Bản tốc độ cao (Bản suy luận (Reasoning))", modelName: "MiniMax-M2.5-highspeed", type: "text", think: true },
    { name: "MiniMax-M2.1 (Bản Lập trình)", modelName: "MiniMax-M2.1", type: "text", think: true },
    { name: "MiniMax-M2.1 Bản tốc độ cao (Bản Lập trình)", modelName: "MiniMax-M2.1-highspeed", type: "text", think: true },
    { name: "MiniMax-M2 (Bản Agent)", modelName: "MiniMax-M2", type: "text", think: false },
    // Mô hình hình ảnh
    { name: "Hailuo hình ảnhV1", modelName: "image-01", type: "image", mode: ["text", "singleImage"] },
    { name: "Hailuo hình ảnhV1 Livebản ", modelName: "image-01-live", type: "image", mode: ["text", "singleImage"], associationSkills: "Hỗ trợ phong cách vẽ tùy chỉnh" },
    // Mô hình video
    {
      name: "Hailuo 2.3",
      modelName: "MiniMax-Hailuo-2.3",
      type: "video",
      mode: ["text", "singleImage"],
      audio: false,
      durationResolutionMap: [
        { duration: [6], resolution: ["768P", "1080P"] },
        { duration: [10], resolution: ["768P"] },
      ],
    },
    {
      name: "Hailuo 2.3Bản tốc độ cao",
      modelName: "MiniMax-Hailuo-2.3-Fast",
      type: "video",
      mode: ["text", "singleImage"],
      audio: false,
      durationResolutionMap: [
        { duration: [6], resolution: ["768P", "1080P"] },
        { duration: [10], resolution: ["768P"] },
      ],
    },
    {
      name: "Hailuo 02",
      modelName: "MiniMax-Hailuo-02",
      type: "video",
      mode: ["text", "singleImage", "startEndRequired"],
      audio: false,
      durationResolutionMap: [
        { duration: [6], resolution: ["512P", "768P", "1080P"] },
        { duration: [10], resolution: ["512P", "768P"] },
      ],
    },
  ],
};

// ============================================================
// Công cụ bổ trợ
// ============================================================

/**
 * Lấyvui lòng cầu đầu 
 */
const getHeaders = (): Record<string, string> => {
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
};

/**
 * Lấycơ sở Địa chỉ yêu cầu
 */
const getBaseUrl = (): string => {
  return vendor.inputValues.baseUrl.replace(/\/$/, "");
};

/**
 * từ  ReferenceList mục mục giữa trích xuấtcó data URI header  base64 chuỗi ký tự
 */
const extractBase64WithHead = (ref: ReferenceList): string => {
  return ref.base64.startsWith("data:") ? ref.base64 : `data:image/png;base64,${ref.base64}`;
};

// ============================================================
// Hàm Adapter
// ============================================================

const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  const baseUrl = getBaseUrl();

  const openaiBaseUrl = `${baseUrl}/v1`;
  const extraBody = model.think ? { reasoning_split: true } : {};
  return createOpenAI({ baseURL: openaiBaseUrl, apiKey, extraBody }).chat(model.modelName);
};

const uploadReference = async (base64: string, fileType: "image" | "audio" | "video"): Promise<ReferenceList> => {
  // MiniMax của Hình ảnhcổng kết nối (endpoint) trực tiếp tiếp  base64，nén nhỏ sau  gốc kiểu Trả về
  if (fileType === "image") {
    const compressed = await zipImage(base64, 10 * 1024);
    return { type: "image", sourceType: "base64", base64: compressed };
  }
  // Videocổng kết nối (endpoint)  của Hình ảnhtham sốcũ ng là  base64，nén nhỏ đến 20MB
  return { type: fileType, sourceType: "base64", base64 } as ReferenceList;
};

const imageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const baseUrl = getBaseUrl();
  const headers = getHeaders();

  const reqBody: any = {
    model: model.modelName,
    prompt: config.prompt,
    aspect_ratio: config.aspectRatio,
    response_format: "base64",
    n: 1,
    prompt_optimizer: true,
    aigc_watermark: false,
  };

  // Xử lýImage-to-Imagetham chiếu
  const imageRefs = config.referenceList || [];
  if (imageRefs.length > 0) {
    const refBase64 = extractBase64WithHead(imageRefs[0]);
    reqBody.subject_reference = [{ type: "character", image_file: refBase64 }];
  }

  logger("bắt đầunhắc tác vụ MiniMaxhình ảnhtạotác vụ ");
  const resp = await axios.post(`${baseUrl}/v1/image_generation`, reqBody, { headers });
  if (resp.data.base_resp.status_code !== 0) {
    throw new Error(`hình ảnhtạothất bại：${resp.data.base_resp.status_msg}`);
  }
  if (resp.data.metadata.success_count === 0) {
    throw new Error("hình ảnhtạobị chính sách an toàn chặn，vui lòng điều chỉnh prompt hoặc ảnh tham chiếu");
  }

  const imgBase64 = resp.data.data.image_base64[0];
  return imgBase64.startsWith("data:") ? imgBase64 : `data:image/png;base64,${imgBase64}`;
};

const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const baseUrl = getBaseUrl();
  const headers = getHeaders();

  const reqBody: any = {
    model: model.modelName,
    prompt: config.prompt,
    duration: config.duration,
    resolution: config.resolution,
    aigc_watermark: false,
    prompt_optimizer: true,
  };

  // trích xuấtHình ảnhloại của hàm 
  const imageRefs = (config.referenceList || []).filter((r) => r.type === "image");

  if (imageRefs.length > 0) {
    // nén nhỏ Hình ảnhđến 20MBtrong 
    const compressedImages: string[] = [];
    for (const ref of imageRefs) {
      const base64 = extractBase64WithHead(ref);
      const compressed = await zipImage(base64, 20 * 1024);
      compressedImages.push(compressed);
    }

    if (config.mode.includes("startEndRequired")) {
      if (compressedImages.length < 2) throw new Error("Khung đầu/cuốichế độ yêu cầu tải lênhai ảnhHình ảnh");
      reqBody.first_frame_image = compressedImages[0];
      reqBody.last_frame_image = compressedImages[1];
    } else if (config.mode.includes("singleImage")) {
      reqBody.first_frame_image = compressedImages[0];
    }
  }

  logger("bắt đầunhắc tác vụ MiniMaxVideotạotác vụ ");
  const submitResp = await axios.post(`${baseUrl}/v1/video_generation`, reqBody, { headers });
  if (submitResp.data.base_resp.status_code !== 0) {
    throw new Error(`Gửi tác vụthất bại：${submitResp.data.base_resp.status_msg}`);
  }
  const taskId = submitResp.data.task_id;
  logger(`VideoGửi tác vụthành công，ID tác vụ: ${taskId}`);

  // Truy vấntác vụ trạng thái
  const pollResult = await pollTask(
    async () => {
      const queryResp = await axios.get(`${baseUrl}/v1/query/video_generation`, {
        headers: getHeaders(),
        params: { task_id: taskId },
      });
      if (queryResp.data.base_resp.status_code !== 0) {
        return { completed: true, error: queryResp.data.base_resp.status_msg };
      }
      const status = queryResp.data.status;
      if (status === "Success") {
        return { completed: true, data: queryResp.data.file_id };
      }
      if (status === "Fail") {
        return { completed: true, error: "Videotạothất bại" };
      }
      logger(`Videotác vụ tạogiữa ，hiện tạitrạng thái：${status}`);
      return { completed: false };
    },
    5000,
    600000,
  );

  if (pollResult.error) throw new Error(pollResult.error);
  const fileId = pollResult.data!;
  logger(`Videotác vụ tạothành công，TệpID: ${fileId}`);

  // Lấytải xuốngđịa chỉ
  const fileResp = await axios.get(`${baseUrl}/v1/files/retrieve`, {
    headers: getHeaders(),
    params: { file_id: fileId },
  });
  if (fileResp.data.base_resp.status_code !== 0) {
    throw new Error(`LấyTệpđịa chỉthất bại：${fileResp.data.base_resp.status_msg}`);
  }
  const downloadUrl = fileResp.data.file.download_url;
  logger(`Videotải xuốngđịa chỉLấythành công，bắt đầuchuyển Base64`);

  return await urlToBase64(downloadUrl);
};

const ttsRequest = async (config: TTSConfig, model: TTSModel): Promise<string> => {
  return "";
};

const checkForUpdates = async (): Promise<{ hasUpdate: boolean; latestVersion: string; notice: string }> => {
  return {
    hasUpdate: false,
    latestVersion: "2.0",
    notice:
      "## mới  bản sách Cập nhậtthông \n1. Tương thích kiến trúc mẫu mới ，hỗ trợ ReferenceList tham chiếu thống nhấtloại\n2. thêm mới  uploadReference tiền xử lýXử lýthiết bị \n3. tối ưuHình ảnhnén nhỏ  và hàm trích xuấtlogic",
  };
};

const updateVendor = async (): Promise<string> => {
  return "";
};

// ============================================================
// Export
// ============================================================

exports.vendor = vendor;
exports.textRequest = textRequest;
exports.uploadReference = uploadReference;
exports.imageRequest = imageRequest;
exports.videoRequest = videoRequest;
exports.ttsRequest = ttsRequest;
exports.checkForUpdates = checkForUpdates;
exports.updateVendor = updateVendor;

// Dòng mã này đảm bảo tệp hiện tại được  nhận diện là module
export {};