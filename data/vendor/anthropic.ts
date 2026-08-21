/**
 * Toonflow AI Nhà cung cấp Template - Anthropic Claude
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
  id: "anthropic",
  version: "2.0",
  author: "Toonflow",
  name: "Anthropic Claude",
  description: "Dòng mô hình Claude hàng đầu về viết kịch bản, lý luận và sáng tạo nội dung nghệ thuật.",
  icon: "",
  inputs: [
    { key: "apiKey", label: "Anthropic API Key", type: "password", required: true, placeholder: "Khóa API từ Anthropic Console (console.anthropic.com)" },
    { key: "baseUrl", label: "Địa chỉ yêu cầu (Tùy chọn)", type: "url", required: false, placeholder: "Mặc định để trống hoặc dùng proxy nếu có" },
  ],
  inputValues: {
    apiKey: "",
    baseUrl: "",
  },
  models: [
    { name: "Claude 3.7 Sonnet (Suy luận kết hợp)", modelName: "claude-3-7-sonnet-20250219", type: "text", think: true },
    { name: "Claude 3.5 Sonnet", modelName: "claude-3-5-sonnet-20241022", type: "text", think: false },
    { name: "Claude 3.5 Haiku", modelName: "claude-3-5-haiku-20241022", type: "text", think: false },
    { name: "Claude 3 Opus", modelName: "claude-3-opus-20240229", type: "text", think: false },
  ],
};
// ============================================================
// Hàm Adapter
// ============================================================
const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu Anthropic API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  const options: Record<string, any> = { apiKey };
  if (vendor.inputValues.baseUrl && vendor.inputValues.baseUrl.trim()) {
    options.baseURL = vendor.inputValues.baseUrl.trim();
  }
  const anthropic = createAnthropic(options);
  return anthropic(model.modelName);
};
const imageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  return "";
};
const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  return "";
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
