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
  description: "Trọn bộ hệ sinh thái Google AI chính thức: Gemini 3.7 (Văn bản & Suy luận), Gemini 3.1 Image / Nano Banana (Tạo hình ảnh sắc nét) và Google Veo 3.1 (Sinh video độ nét cao).",
  icon: "",
  inputs: [
    { key: "apiKey", label: "Google API Key", type: "password", required: true, placeholder: "Lấy khóa API tại Google AI Studio (aistudio.google.com)" },
    { key: "baseUrl", label: "Địa chỉ yêu cầu (Tùy chọn)", type: "url", required: false, placeholder: "Mặc định: https://generativelanguage.googleapis.com" },
  ],
  inputValues: {
    apiKey: "",
    baseUrl: "",
  },
  models: [
    // 1. Mô hình Văn bản & Suy luận (Text & Reasoning)
    { name: "Gemini 3.7 Flash (Khuyên dùng)", modelName: "gemini-3.7-flash", type: "text", think: true },
    { name: "Gemini 3.6 Flash", modelName: "gemini-3.6-flash", type: "text", think: false },
    { name: "Gemini 3.5 Flash", modelName: "gemini-3.5-flash", type: "text", think: false },
    { name: "Gemini 3.1 Pro Preview", modelName: "gemini-3.1-pro-preview", type: "text", think: true },
    { name: "Gemini 2.5 Flash", modelName: "gemini-2.5-flash", type: "text", think: true },

    // 2. Mô hình Tạo hình ảnh (Image Generation)
    {
      name: "Google Gemini 3.1 Flash Image (Khuyên dùng - Nhanh & Đẹp)",
      modelName: "gemini-3.1-flash-image",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
      associationSkills: "Sinh hình ảnh thế hệ mới nhất của Google, độ chi tiết cao",
    },
    {
      name: "Google Gemini 3.0 Pro Image (Chuyên nghiệp)",
      modelName: "gemini-3-pro-image",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
      associationSkills: "Chất lượng hình ảnh điện ảnh chi tiết cao",
    },
    {
      name: "Google Nano Banana Pro",
      modelName: "nano-banana-pro-preview",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
      associationSkills: "Giữ nhận diện nhân vật và phong cách nhất quán",
    },
    {
      name: "Google Gemini 2.5 Flash Image",
      modelName: "gemini-2.5-flash-image",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
      associationSkills: "Tốc độ sinh ảnh nhanh và ổn định",
    },

    // 3. Mô hình Tạo video (Video Generation - Google Veo)
    {
      name: "Google Veo 3.1 Pro",
      modelName: "veo-3.1-generate-preview",
      type: "video",
      mode: ["text", "singleImage", "startEndRequired"],
      audio: false,
      durationResolutionMap: [
        { duration: [5, 6, 8], resolution: ["720p", "1080p"] },
      ],
    },
    {
      name: "Google Veo 3.1 Fast",
      modelName: "veo-3.1-fast-generate-preview",
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

  // Normalize modelName if old invalid model was selected
  let modelName = model.modelName;
  if (!modelName || modelName.includes("imagen-3.0") || modelName === "imagen-3.0") {
    modelName = "gemini-3.1-flash-image";
  }

  logger(`[Google Image] Bắt đầu tạo hình ảnh với mô hình: ${modelName}`);

  // Gọi Google Generative Language generateContent API với responseModalities: IMAGE
  const generateUrl = `${baseUrl}/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  // Chuẩn bị nội dung prompt và ảnh tham chiếu nếu có
  const parts: any[] = [];
  if (config.imageBase64 && config.imageBase64.length > 0) {
    for (const b64 of config.imageBase64) {
      if (b64) {
        const cleanB64 = b64.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanB64,
          }
        });
      }
    }
  }

  let promptText = config.prompt;
  if (config.aspectRatio) {
    promptText += ` --aspect-ratio ${config.aspectRatio}`;
  }
  parts.push({ text: promptText });

  const requestBody = {
    contents: [
      { parts }
    ],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"]
    }
  };

  const resp = await fetch(generateUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  const resText = await resp.text();
  let data: any = {};
  try {
    data = JSON.parse(resText);
  } catch {
    throw new Error(`Google API trả về phản hồi không hợp lệ: ${resText.slice(0, 150)}`);
  }

  if (!resp.ok) {
    const errMsg = data.error?.message || `Mã lỗi ${resp.status}`;
    throw new Error(`Google tạo ảnh thất bại: ${errMsg}`);
  }

  const candidates = data.candidates || [];
  if (candidates.length > 0) {
    const candidateParts = candidates[0].content?.parts || [];
    for (const p of candidateParts) {
      if (p.inlineData?.data) {
        const mime = p.inlineData.mimeType || "image/jpeg";
        logger("[Google Image] Tạo ảnh thành công!");
        return `data:${mime};base64,${p.inlineData.data}`;
      }
    }
  }

  throw new Error("Google không trả về dữ liệu hình ảnh (có thể do vi phạm chính sách an toàn nội dung)");
};

const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu Google API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  const baseUrl = getBaseUrl();

  let modelName = model.modelName;
  if (!modelName || modelName.includes("veo-2.0")) {
    modelName = "veo-3.1-generate-preview";
  }

  logger(`[Google Veo] Bắt đầu tạo video với mô hình: ${modelName}, thời lượng: ${config.duration}s`);

  const submitUrl = `${baseUrl}/v1beta/models/${modelName}:predictLongRunning?key=${apiKey}`;
  const instance: Record<string, any> = { prompt: config.prompt };
  if (config.imageBase64 && config.imageBase64[0]) {
    const rawB64 = config.imageBase64[0].replace(/^data:image\/\w+;base64,/, "");
    instance.image = { bytesBase64Encoded: rawB64 };
  }

  const submitResp = await fetch(submitUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      instances: [instance],
      parameters: {
        aspectRatio: config.aspectRatio || "16:9",
        durationSeconds: config.duration || 5,
        personGeneration: "allow_adult",
      }
    }),
  });

  const submitText = await submitResp.text();
  let submitData: any = {};
  try {
    submitData = JSON.parse(submitText);
  } catch {
    throw new Error(`Google Veo trả về phản hồi không hợp lệ: ${submitText.slice(0, 150)}`);
  }

  if (!submitResp.ok) {
    const errText = submitData.error?.message || `Mã lỗi ${submitResp.status}`;
    throw new Error(`Google Veo gửi tác vụ thất bại: ${errText}`);
  }

  const operationName = submitData.name;
  if (!operationName) {
    throw new Error("Google Veo không trả về mã tác vụ (Operation ID)");
  }

  logger(`[Google Veo] Tác vụ đã khởi tạo, mã: ${operationName}`);

  // Polling kết quả video
  const pollResult = await pollTask(
    async () => {
      const pollUrl = `${baseUrl}/v1beta/${operationName}?key=${apiKey}`;
      const pResp = await fetch(pollUrl, {
        headers: { "x-goog-api-key": apiKey }
      });
      const pText = await pResp.text();
      let pData: any = {};
      try {
        pData = JSON.parse(pText);
      } catch {
        return { completed: false };
      }

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
const checkForUpdates = async (): Promise<{ hasUpdate: boolean; latestVersion: string; notice: string }>;
const updateVendor = async (): Promise<string>;
// ============================================================
// Export
// ============================================================
exports.vendor = vendor;
exports.textRequest = textRequest;
exports.imageRequest = imageRequest;
exports.videoRequest = videoRequest;
exports.ttsRequest = ttsRequest;
export {};
