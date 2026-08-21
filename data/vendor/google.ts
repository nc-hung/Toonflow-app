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
  description: "Trọn bộ hệ sinh thái Google AI: Gemini 3.7 (Văn bản & Suy luận), Imagen 3.0 (Tạo hình ảnh chân thực chất lượng cao) và Google Veo 2 (Sinh video độ phân giải cao).",
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
    { name: "Gemini 3.7 Flash (Khuyên dùng)", modelName: "gemini-3.7-flash", type: "text", think: true },
    { name: "Gemini 3.7 Pro", modelName: "gemini-3.7-pro", type: "text", think: true },
    { name: "Gemini 3.6 Flash", modelName: "gemini-3.6-flash", type: "text", think: false },
    { name: "Gemini 3.6 Pro", modelName: "gemini-3.6-pro", type: "text", think: true },
    { name: "Gemini 3.1 Pro Preview", modelName: "gemini-3.1-pro-preview", type: "text", think: true },
    { name: "Gemini 3.0 Flash", modelName: "gemini-3.0-flash", type: "text", think: false },
    { name: "Gemini 3.0 Pro", modelName: "gemini-3.0-pro", type: "text", think: true },
    { name: "Gemini 1.5 Pro", modelName: "gemini-1.5-pro", type: "text", think: false },
    { name: "Gemini 1.5 Flash", modelName: "gemini-1.5-flash", type: "text", think: false },

    // 2. Mô hình Tạo hình ảnh (Image Generation - Google Imagen 3)
    {
      name: "Google Imagen 3.0 Pro (Khuyên dùng)",
      modelName: "imagen-3.0-generate-002",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
      associationSkills: "Chất lượng hình ảnh điện ảnh siêu nét",
    },
    {
      name: "Google Imagen 3.0 Fast (Tốc độ cao)",
      modelName: "imagen-3.0-fast-generate-001",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
      associationSkills: "Tốc độ sinh ảnh nhanh",
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

  let modelName = model.modelName;
  if (modelName === "imagen-3.0" || !modelName) {
    modelName = "imagen-3.0-generate-002";
  }

  logger(`[Google Imagen] Bắt đầu tạo hình ảnh với mô hình: ${modelName}`);

  let ratio = "1:1";
  if (config.aspectRatio === "16:9" || config.aspectRatio === "9:16" || config.aspectRatio === "4:3" || config.aspectRatio === "3:4" || config.aspectRatio === "1:1") {
    ratio = config.aspectRatio;
  }

  // 1. Thử endpoint predict (Google AI Studio REST API)
  const predictUrl = `${baseUrl}/v1beta/models/${modelName}:predict?key=${apiKey}`;
  const requestBody = {
    instances: [
      { prompt: config.prompt }
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: ratio,
      personGeneration: "ALLOW_ADULT",
      outputMimeType: "image/jpeg"
    }
  };

  try {
    const resp = await fetch(predictUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(requestBody),
    });

    const data = await resp.json();
    if (resp.ok && data.predictions && data.predictions[0]?.bytesBase64Encoded) {
      logger("[Google Imagen] Tạo ảnh thành công qua predict API!");
      return `data:image/jpeg;base64,${data.predictions[0].bytesBase64Encoded}`;
    }
    if (data.error?.message) {
      logger(`[Google Imagen] Predict trả về lỗi: ${data.error.message}, thử fallback...`);
    }
  } catch (e: any) {
    logger(`[Google Imagen] Lỗi kết nối predict: ${e.message}`);
  }

  // 2. Thử endpoint fallback generateImages
  const fallbackUrl = `${baseUrl}/v1beta/models/${modelName}:generateImages?key=${apiKey}`;
  try {
    const fallbackResp = await fetch(fallbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        prompt: config.prompt,
        numberOfImages: 1,
        aspectRatio: ratio,
        outputMimeType: "image/jpeg"
      }),
    });

    const fbData = await fallbackResp.json();
    if (fallbackResp.ok) {
      const imgBytes = fbData.generatedImages?.[0]?.image?.imageBytes || fbData.predictions?.[0]?.bytesBase64Encoded;
      if (imgBytes) {
        logger("[Google Imagen] Tạo ảnh thành công qua generateImages API!");
        return `data:image/jpeg;base64,${imgBytes}`;
      }
    }
    if (fbData.error?.message) {
      throw new Error(`Google Imagen: ${fbData.error.message}`);
    }
  } catch (e: any) {
    throw new Error(`Google Imagen tạo ảnh thất bại: ${e.message}`);
  }

  throw new Error("Google Imagen không trả về dữ liệu hình ảnh hợp lệ. Vui lòng kiểm tra quyền truy cập Imagen của API Key.");
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
