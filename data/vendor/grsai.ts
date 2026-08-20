/**
 * Toonflow AINhà cung cấpTemplate
 * @version 2.0
 */

// ============================================================
// Định nghĩa kiểu dữ liệu
// ============================================================

type VideoMode =
  | "singleImage" //Tham chiếu đơn ảnh
  | "startEndRequired" //Khung đầu/cuối (bắt buộc cả hai)
  | "endFrameOptional" //Khung đầu/cuối (khung cuối tùy chọn)
  | "startFrameOptional" //Khung đầu/cuối (khung đầu tùy chọn)
  | "text" //văn bản  
  | (`videoReference:${number}` | `imageReference:${number}` | `audioReference:${number}`)[]; //nhiều tham chiếu（số chữ Bảnggiới hạnsố lượng）

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
  id: string; //ID duy nhất, dùng làm  tên tệp lưu trên đĩa của người dùng, cấm ký tự đặc biệt
  version: string; //Số phiên bản  dạng x.y, tuân thủ Semantic Versioning
  name: string; //Nhà cung cấptên
  author: string; //Tác giả
  description?: string; //mô tả，hỗ trợMarkdownđịnh dạng
  icon?: string; //Icon，chỉ hỗ trợBase64định dạng，kích thước khuyến nghị là 128x128pixel
  inputs: {
    key: string;
    label: string;
    type: "text" | "password" | "url";
    required: boolean;
    placeholder?: string;
  }[];
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

declare const logger: (msg: string) => void; // Hàm ghi log
declare const jsonwebtoken: any; // JWTXử lýkho 
declare const zipImage: (base64: string, size: number) => Promise<string>; // Hình ảnhnén nhỏ hàm ，Trả vềcó data URI header base64chuỗi ký tự
declare const zipImageResolution: (base64: string, w: number, h: number) => Promise<string>; // Hình ảnhphần điều chỉnh tỷ lệhàm ，Trả vềcó data URI header base64chuỗi ký tự
declare const mergeImages: (base64Arr: string[], maxSize?: string) => Promise<string>; // Hình ảnhhợp tạo hàm ，Trả vềcó data URI header base64chuỗi ký tự
declare const urlToBase64: (url: string) => Promise<string>; // URLchuyển Base64hàm ，Trả vềcó data URI header base64chuỗi ký tự
declare const pollTask: (fn: () => Promise<PollResult>, interval?: number, timeout?: number) => Promise<PollResult>; // Hàm polling，fnbất bước hàm ，intervalTruy vấngian cách ，timeoutthời gian chờ tối đa，Trả vềfn của kết quả
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
  textRequest: (m: TextModel, t: boolean, tl: 0 | 1 | 2 | 3) => any; //Mô hình văn bản 
  imageRequest: (c: ImageConfig, m: ImageModel) => Promise<string>; //Mô hình hình ảnh，Trả vềcó data URI header base64chuỗi ký tự
  videoRequest: (c: VideoConfig, m: VideoModel) => Promise<string>; //Mô hình video，Trả vềcó data URI header base64chuỗi ký tự
  ttsRequest: (c: TTSConfig, m: TTSModel) => Promise<string>; //（tạm chưa mở mở ）giọng nói Mô hình，Trả vềcó data URI header base64chuỗi ký tự
  checkForUpdates?: () => Promise<{
    hasUpdate: boolean;
    latestVersion: string;
    notice: string;
  }>; //kiểm tra Cập nhậthàm ，Trả vềcó hay không Cập nhật và số phiên bản  mới  nhất và thông báo（hỗ trợMarkdownđịnh dạng）
  updateVendor?: () => Promise<string>; //Cập nhậthàm ，Trả vềvăn bản  mã nguồn mới  nhất
};

// ============================================================
// Nhà cung cấpCấu hình
// ============================================================

const vendor: VendorConfig = {
  id: "grsai",
  version: "2.2",
  author: "Toonflow",
  name: "Grsai AI",
  description: "Adapter nền tảng Grsai AI, hỗ trợ Text-to-Image, Image-to-Image, Text-to-Video và mô hình văn bản  tương thích Gemini.\n\n🔗 [Truy cập nền tảng Grsai](https://tf.grsai.ai/)",
  inputs: [
    { key: "apiKey", label: "Khóa API (API Key)", type: "password", required: true },
    {
      key: "baseUrl",
      label: "Địa chỉ yêu cầu",
      type: "url",
      required: true,
      placeholder: "Ví dụ: https://grsai.dakka.com.cn",
    },
  ],
  inputValues: { apiKey: "", baseUrl: "https://grsai.dakka.com.cn" },
  models: [
    {
      name: "GPT Image 2",
      modelName: "gpt-image-2",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
    },
    {
      name: "Nano Banana Fast",
      modelName: "nano-banana-fast",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
    },
    {
      name: "Nano Banana 2",
      modelName: "nano-banana-2",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
    },
    {
      name: "Nano Banana Pro",
      modelName: "nano-banana-pro",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
    },
  ],
};

// ============================================================
// Công cụ bổ trợ
// ============================================================

const getHeaders = () => {
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
};

// ============================================================
// Hàm Adapter
// ============================================================

const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  return createGoogleGenerativeAI({
    baseURL: `${vendor.inputValues.baseUrl}/v1beta`,
    apiKey,
  }).chat(model.modelName);
};

const imageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const baseUrl = vendor.inputValues.baseUrl;
  const headers = getHeaders();

  // Khởi tạo vui lòng cầu tham số
  const requestBody: any = {
    model: model.modelName,
    prompt: config.prompt,
    aspectRatio: config.aspectRatio,
    webHook: "-1",
    shutProgress: true,
  };

  // Bổ sung Mô hìnhriêng biệt tham số
  if (model.modelName.startsWith("nano-banana")) {
    requestBody.imageSize = config.size;
  } else {
    requestBody.size = config.aspectRatio;
    requestBody.variants = 1;
  }

  // Xử lýảnh tham chiếu 
  if (config.referenceList && config.referenceList.length > 0) {
    requestBody.urls = config.referenceList.map((img) => img.base64);
  }

  // Chọn API endpoint đường dẫn
  const apiPath = model.modelName.startsWith("nano-banana") ? "/v1/draw/nano-banana" : "/v1/draw/completions";

  logger(`bắt đầunhắc tác vụ Hình ảnhtạotác vụ ，Mô hình：${model.modelName}`);
  logger(`${baseUrl}${apiPath}`)
  const submitResp = await fetch(`${baseUrl}${apiPath}`, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });
  if (!submitResp.ok) {
    const errorReason = await submitResp.text();
    throw new Error(`Gửi tác vụthất bại：${errorReason}`);
  }
  const submitData = await submitResp.json();
  if (submitData.code !== 0) throw new Error(`Gửi tác vụthất bại：${submitData.msg}`);

  const taskId = submitData.data.id;
  logger(`Hình ảnhGửi tác vụthành công，ID tác vụ：${taskId}`);

  // Truy vấnkết quả
  const pollResult = await pollTask(
    async () => {
      const resp = await fetch(`${baseUrl}/v1/draw/result`, {
        method: "POST",
        headers,
        body: JSON.stringify({ id: taskId }),
      });
      if (!resp.ok) {
        const errorReason = await resp.text();
        throw new Error(`Truy vấnTác vụ thất bại：${errorReason}`);
      }
      const respData = await resp.json();
      if (respData.code !== 0) return { completed: true, error: respData.msg };

      const taskData = respData.data;
      if (taskData.status === "failed")
        return {
          completed: true,
          error: taskData.failure_reason || taskData.error,
        };
      if (taskData.status === "succeeded") {
        const imgUrl = taskData.results?.[0]?.url || taskData.url;
        return { completed: true, data: imgUrl };
      }
      logger(`Hình ảnhtác vụ tạogiữa ，Tiến độ: ${taskData.progress}%`);
      return { completed: false };
    },
    3000,
    600000,
  );

  if (pollResult.error) throw new Error(pollResult.error);
  logger(`Hình ảnhtạohoàn thành，bắt đầuchuyển đổi Base64`);
  return await urlToBase64(pollResult.data!);
};

const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const baseUrl = vendor.inputValues.baseUrl;
  const headers = getHeaders();

  // Khởi tạo vui lòng cầu tham số
  const requestBody: any = {
    model: model.modelName,
    prompt: config.prompt,
    aspectRatio: config.aspectRatio,
    webHook: "-1",
    shutProgress: true,
  };

  // Xử lýtham chiếutài nguồn 
  if (config.referenceList && config.referenceList.length > 0) {
    const imageRefs = config.referenceList.filter((item) => item.type === "image") as Extract<ReferenceList, { type: "image" }>[];
    if (config.mode.includes("endFrameOptional") && imageRefs.length >= 1) {
      requestBody.firstFrameUrl = imageRefs[0].base64;
      if (imageRefs.length >= 2) requestBody.lastFrameUrl = imageRefs[1].base64;
    } else if (config.mode.some((m) => Array.isArray(m) && m.includes("imageReference:3"))) {
      requestBody.urls = imageRefs.map((img) => img.base64);
    }
  }

  logger(`bắt đầunhắc tác vụ Videotạotác vụ ，Mô hình：${model.modelName}`);
  const submitResp = await fetch(`${baseUrl}/v1/video/veo`, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });
  if (!submitResp.ok) {
    const errorReason = await submitResp.text();
    throw new Error(`Gửi tác vụthất bại： ${errorReason}`);
  }
  const submitData = await submitResp.json();
  if (submitData.code !== 0) throw new Error(`Gửi tác vụthất bại：${submitData.msg}`);

  const taskId = submitData.data.id;
  logger(`VideoGửi tác vụthành công，ID tác vụ：${taskId}`);

  // Truy vấnkết quả
  const pollResult = await pollTask(
    async () => {
      const resp = await fetch(`${baseUrl}/v1/draw/result`, {
        method: "POST",
        headers,
        body: JSON.stringify({ id: taskId }),
      });
      if (!resp.ok) {
        const errorReason = await resp.text();
        throw new Error(`Truy vấnVideoTác vụ thất bại ${errorReason}`);
      }
      const respData = await resp.json();
      logger(respData);
      if (respData.code !== 0) return { completed: true, error: respData.msg };

      const taskData = respData.data;
      if (taskData.status === "failed")
        return {
          completed: true,
          error: taskData.failure_reason || taskData.error,
        };
      if (taskData.status === "succeeded") {
        return { completed: true, data: taskData.url };
      }
      logger(`Videotác vụ tạogiữa ，Tiến độ: ${taskData.progress}%`);
      return { completed: false };
    },
    5000,
    1800000,
  );

  if (pollResult.error) throw new Error(pollResult.error);
  logger(`Videotạohoàn thành，bắt đầuchuyển đổi Base64`);
  return await urlToBase64(pollResult.data!);
};

const ttsRequest = async (config: TTSConfig, model: TTSModel): Promise<string> => {
  return "";
};

const checkForUpdates = async (): Promise<{
  hasUpdate: boolean;
  latestVersion: string;
  notice: string;
}> => {
  return {
    hasUpdate: false,
    latestVersion: "1.0",
    notice: "## mới  bản sách Cập nhậtthông ",
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
exports.imageRequest = imageRequest;
exports.videoRequest = videoRequest;
exports.ttsRequest = ttsRequest;
exports.checkForUpdates = checkForUpdates;
exports.updateVendor = updateVendor;

// Dòng mã này đảm bảo tệp hiện tại được  nhận diện là module
export {};
