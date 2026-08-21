/**
 * Toonflow AI Nhà cung cấp Template - Google Gemini & Imagen & Veo
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
interface ImageConfig {
  prompt: string;
  imageBase64: string[];
  size: "1K" | "2K" | "4K";
  aspectRatio: `${number}:${number}`;
}
interface VideoConfig {
  duration: number;
  resolution: string;
  aspectRatio: "16:9" | "9:16";
  prompt: string;
  imageBase64?: string[];
  audio?: boolean;
  mode: VideoMode[];
}
interface TTSConfig {
  text: string;
  voice: string;
  speechRate: number;
  pitchRate: number;
  volume: number;
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
// Cấu hình Nhà cung cấp
// ============================================================
const vendor: VendorConfig = {
  id: "google",
  version: "2.0",
  author: "Toonflow",
  name: "Google (Gemini / Imagen / Veo)",
  description: "Trọn bộ hệ sinh thái Google AI: Gemini (Văn bản & Suy luận), Imagen 3 (Tạo hình ảnh chân thực chất lượng cao) và Google Veo 2 (Sinh video độ phân giải cao).",
  icon: "",
  inputs: [
    { key: "apiKey", label: "Google API Key", type: "password", required: true, placeholder: "Lấy khóa API tại Google AI Studio (aistudio.google.com)" },
    { key: "baseUrl", label: "Địa chỉ yêu cầu (Tùy chọn)", type: "url", required: false, placeholder: "Mặc định để trống (dùng https://generativelanguage.googleapis.com)" },
  ],
  inputValues: {
    apiKey: "",
    baseUrl: "",
  },
  models: [
    // 1. Mô hình Văn bản & Suy luận (Text & Reasoning)
    { name: "Gemini 3.1 Pro Preview", modelName: "gemini-3.1-pro-preview", type: "text", think: true },
    { name: "Gemini 3.0 Pro Preview", modelName: "gemini-3.0-pro-preview", type: "text", think: true },
    { name: "Gemini 3.0 Flash Preview", modelName: "gemini-3.0-flash-preview", type: "text", think: true },
    { name: "Gemini 2.0 Flash (Khuyên dùng)", modelName: "gemini-2.0-flash", type: "text", think: false },
    { name: "Gemini 2.0 Flash Thinking", modelName: "gemini-2.0-flash-thinking-exp-01-21", type: "text", think: true },
    { name: "Gemini 2.0 Flash Lite", modelName: "gemini-2.0-flash-lite", type: "text", think: false },
    { name: "Gemini 2.0 Pro Experimental", modelName: "gemini-2.0-pro-exp-02-05", type: "text", think: false },
    { name: "Gemini 1.5 Pro", modelName: "gemini-1.5-pro", type: "text", think: false },
    { name: "Gemini 1.5 Flash", modelName: "gemini-1.5-flash", type: "text", think: false },
    { name: "Gemini 1.5 Flash-8B", modelName: "gemini-1.5-flash-8b", type: "text", think: false },

    // 2. Mô hình Tạo hình ảnh (Image Generation - Imagen 3)
    {
      name: "Google Imagen 3.0 Pro",
      modelName: "imagen-3.0-generate-002",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
      associationSkills: "Hỗ trợ vẽ theo phong cách chân thực, anime và nghệ thuật",
    },
    {
      name: "Google Imagen 3.0 Fast",
      modelName: "imagen-3.0-fast-generate-001",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
      associationSkills: "Tốc độ sinh ảnh cực nhanh",
    },
    {
      name: "Google Imagen 3.0",
      modelName: "imagen-3.0",
      type: "image",
      mode: ["text", "singleImage"],
    },

    // 3. Mô hình Tạo video (Video Generation - Google Veo)
    {
      name: "Google Veo 2.0 Pro",
      modelName: "veo-2.0-generate-001",
      type: "video",
      mode: ["text", "singleImage", "startEndRequired"],
      audio: false,
      durationResolutionMap: [
        { duration: [5, 6, 8], resolution: ["720p", "1080p"] },
      ],
    },
    {
      name: "Google Veo 2.0 Fast",
      modelName: "veo-2.0-fast-generate-001",
      type: "video",
      mode: ["text", "singleImage"],
      audio: false,
      durationResolutionMap: [
        { duration: [5, 6, 8], resolution: ["720p", "1080p"] },
      ],
    },
  ],
};
// ============================================================
// Hàm Adapter
// ============================================================
const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu Google API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  const options: Record<string, any> = { apiKey };
  if (vendor.inputValues.baseUrl && vendor.inputValues.baseUrl.trim()) {
    options.baseURL = vendor.inputValues.baseUrl.trim();
  }
  const google = createGoogleGenerativeAI(options);
  return google(model.modelName);
};

const getBaseUrl = () => {
  if (vendor.inputValues.baseUrl && vendor.inputValues.baseUrl.trim()) {
    return vendor.inputValues.baseUrl.trim().replace(/\/+$/, "");
  }
  return "https://generativelanguage.googleapis.com";
};

const imageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu Google API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  const baseUrl = getBaseUrl();

  logger(`[Google Imagen] Bắt đầu tạo hình ảnh với mô hình: ${model.modelName}`);

  // Chuẩn hóa tỷ lệ khung hình
  let ratio = "1:1";
  if (config.aspectRatio === "16:9" || config.aspectRatio === "9:16" || config.aspectRatio === "4:3" || config.aspectRatio === "3:4" || config.aspectRatio === "1:1") {
    ratio = config.aspectRatio;
  }

  // Thử endpoint predict trước (Imagen 3 API chuẩn)
  const predictUrl = `${baseUrl}/v1beta/models/${model.modelName}:predict?key=${apiKey}`;
  const requestBody = {
    instances: [
      { prompt: config.prompt }
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: ratio,
      outputMimeType: "image/jpeg"
    }
  };

  try {
    const resp = await fetch(predictUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (resp.ok) {
      const data = await resp.json();
      const b64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (b64) {
        logger("[Google Imagen] Tạo ảnh thành công qua predict API!");
        return `data:image/jpeg;base64,${b64}`;
      }
    }
  } catch (e: any) {
    logger(`[Google Imagen] Predict API lỗi, thử endpoint fallback: ${e.message}`);
  }

  // Fallback endpoint: generateImages
  const fallbackUrl = `${baseUrl}/v1beta/models/${model.modelName}:generateImages?key=${apiKey}`;
  const fallbackResp = await fetch(fallbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: config.prompt,
      numberOfImages: 1,
      aspectRatio: ratio,
      outputMimeType: "image/jpeg"
    }),
  });

  if (!fallbackResp.ok) {
    const errText = await fallbackResp.text();
    throw new Error(`Google Imagen tạo ảnh thất bại: ${errText}`);
  }

  const fbData = await fallbackResp.json();
  const imgBytes = fbData.generatedImages?.[0]?.image?.imageBytes || fbData.predictions?.[0]?.bytesBase64Encoded;
  if (!imgBytes) {
    throw new Error("Google Imagen không trả về dữ liệu hình ảnh");
  }

  logger("[Google Imagen] Tạo ảnh thành công!");
  return `data:image/jpeg;base64,${imgBytes}`;
};

const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu Google API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  const baseUrl = getBaseUrl();

  logger(`[Google Veo] Bắt đầu tạo video với mô hình: ${model.modelName}, thời lượng: ${config.duration}s`);

  const submitUrl = `${baseUrl}/v1beta/models/${model.modelName}:predictLongRunning?key=${apiKey}`;
  const instance: Record<string, any> = { prompt: config.prompt };
  if (config.imageBase64 && config.imageBase64[0]) {
    const rawB64 = config.imageBase64[0].replace(/^data:image\/\w+;base64,/, "");
    instance.image = { bytesBase64Encoded: rawB64 };
  }

  const submitResp = await fetch(submitUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [instance],
      parameters: {
        aspectRatio: config.aspectRatio || "16:9",
        durationSeconds: config.duration || 5,
        personGeneration: "allow_adult",
      }
    }),
  });

  if (!submitResp.ok) {
    const errText = await submitResp.text();
    throw new Error(`Google Veo gửi tác vụ thất bại: ${errText}`);
  }

  const submitData = await submitResp.json();
  const operationName = submitData.name;
  if (!operationName) {
    throw new Error("Google Veo không trả về mã tác vụ (Operation ID)");
  }

  logger(`[Google Veo] Tác vụ đã khởi tạo, mã: ${operationName}`);

  // Polling kết quả video
  const pollResult = await pollTask(
    async () => {
      const pollUrl = `${baseUrl}/v1beta/${operationName}?key=${apiKey}`;
      const pResp = await fetch(pollUrl);
      if (!pResp.ok) {
        const pErr = await pResp.text();
        throw new Error(`Truy vấn trạng thái Veo thất bại: ${pErr}`);
      }
      const pData = await pResp.json();
      if (pData.error) {
        return { completed: true, error: pData.error.message || JSON.stringify(pData.error) };
      }
      if (pData.done) {
        const videoUri = pData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ||
                         pData.response?.generatedVideos?.[0]?.video?.uri ||
                         pData.response?.predictions?.[0]?.bytesBase64Encoded;
        if (videoUri) {
          return { completed: true, data: videoUri };
        }
        return { completed: true, error: "Tác vụ hoàn thành nhưng không tìm thấy URL video" };
      }
      return { completed: false };
    },
    5000,
    600000,
  );

  if (pollResult.error) throw new Error(pollResult.error);
  if (!pollResult.data) throw new Error("Google Veo chưa trả về video");

  if (pollResult.data.startsWith("data:") || pollResult.data.startsWith("http")) {
    return pollResult.data.startsWith("http") ? await urlToBase64(pollResult.data) : pollResult.data;
  }
  return `data:video/mp4;base64,${pollResult.data}`;
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
