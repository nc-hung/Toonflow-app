//Nếu cần  đo từ xa AIvui lòng sử dụng ở toonflowcài đặtthư mụcchạy npx @ai-sdk/devtools （yêu cầu bật tính năng đo từ xa trong Cài đặt khác，và toonflowcó quyền tạo thư mục trong thư mục cài đặt .devtoolsthư mục tệp ）
// ==================== Định nghĩa kiểu dữ liệu ====================
// Mô hình văn bản 
interface TextModel {
  name: string; // Tên hiển thị
  modelName: string;
  type: "text";
  think: boolean; // Dùng cho hiển thị giao diện
}

// Mô hình hình ảnh
interface ImageModel {
  name: string; // Tên hiển thị
  modelName: string;
  type: "image";
  mode: ("text" | "singleImage" | "multiReference")[];
  associationSkills?: string; // Kỹ năng liên kết, ngăn cách nhau bằng dấu phẩy
}
// Mô hình video
interface VideoModel {
  name: string; // Tên hiển thị
  modelName: string; //Duy nhất toàn cục
  type: "video";
  mode: (
    | "singleImage" // Đơn ảnh
    | "startEndRequired" // Khung đầu/cuối (bắt buộc cả hai)
    | "endFrameOptional" // Khung đầu/cuối (khung cuối tùy chọn)
    | "startFrameOptional" // Khung đầu/cuối (khung đầu tùy chọn)
    | "text" // văn bản  sinh Video
    | ("videoReference" | "imageReference" | "audioReference" | "textReference")[] // Tham chiếu hỗn hợp
  )[];
  associationSkills?: string; // Kỹ năng liên kết, ngăn cách nhau bằng dấu phẩy
  audio: "optional" | false | true; // Âm thanhCấu hình
  durationResolutionMap: { duration: number[]; resolution: string[] }[];
}

interface TTSModel {
  name: string; // Tên hiển thị
  modelName: string;
  type: "tts";
  voices: {
    title: string; //Tên hiển thị
    voice: string; //hướng lời người
  }[];
}
// Nhà cung cấpCấu hình
interface VendorConfig {
  id: string; //Định danh duy nhất của nhà cung cấp，bắt buộc Duy nhất toàn cục
  author: string;
  description?: string; //md5định dạng
  name: string;
  icon?: string; //chỉ hỗ trợbase64định dạng
  inputs: {
    key: string;
    label: string;
    type: "text" | "password" | "url";
    required: boolean;
    placeholder?: string;
  }[];
  inputValues: Record<string, string>;
  models: (TextModel | ImageModel | VideoModel)[];
}
// ==================== Hàm tiện ích toàn cục  ====================
//Instance Axios
//nén nhỏ Hình ảnhkích thước(1MB = 1 * 1024 * 1024)
declare const zipImage: (completeBase64: string, size: number) => Promise<string>;
//nén nhỏ Hình ảnhphần tỷ lệ 
declare const zipImageResolution: (completeBase64: string, width: number, height: number) => Promise<string>;
//nhiều ảnh ghép tiếp nhân Đơn ảnh maxSize  nhất lớn xuất ra kích thước，Mặc định 10mb
declare const mergeImages: (completeBase64: string[], maxSize?: string) => Promise<string>;
//Urlchuyển Base64
declare const urlToBase64: (url: string) => Promise<string>;
//Hàm polling
declare const pollTask: (
  fn: () => Promise<{ completed: boolean; data?: string; error?: string }>,
  interval?: number,
  timeout?: number,
) => Promise<{ completed: boolean; data?: string; error?: string }>;
declare const axios: any;
declare const createOpenAI: any;
declare const createDeepSeek: any;
declare const createZhipu: any;
declare const createQwen: any;
declare const createAnthropic: any;
declare const createOpenAICompatible: any;
declare const createXai: any;
declare const createMinimax: any;
declare const createGoogleGenerativeAI: any;
declare const logger: (logstring: string) => void;
declare const jsonwebtoken: any;
// ==================== Nhà cung cấpDữ liệu ====================
const vendor: VendorConfig = {
  id: "vidu",
  author: " của Coder",
  description:
    "Nền tảng tạo video AI chính thức của Vidu.\n\n🔗 [Truy cập nền tảng Vidu](https://platform.vidu.cn/login/)",
  name: "Nền tảng mở Vidu",
  inputs: [
    { key: "apiKey", label: "Khóa API (API Key)", type: "password", required: true, placeholder: "vui lòng đến Viduphương vui lòng " },
    { key: "baseUrl", label: "cổng kết nối (endpoint) đường dẫn", type: "url", required: true, placeholder: "https://api.vidu.cn/ent/v2" },
  ],
  inputValues: {
    apiKey: "",
    baseUrl: "https://api.vidu.cn/ent/v2",
  },
  models: [
    {
      name: "ViduQ3 turbo",
      type: "video",
      modelName: "ViduQ3-turbo",
      durationResolutionMap: [{ duration: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], resolution: ["540p", "720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired", "text"],
      audio: true,
    },
    {
      name: "ViduQ3 pro",
      type: "video",
      modelName: "ViduQ3-pro",
      durationResolutionMap: [{ duration: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], resolution: ["540p", "720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired", "text"],
      audio: true,
    },
    {
      name: "ViduQ2 pro fast",
      type: "video",
      modelName: "ViduQ2-pro-fast",
      durationResolutionMap: [{ duration: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], resolution: ["720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired"],
      audio: true,
    },
    {
      name: "viduQ2 turbo",
      type: "video",
      modelName: "ViduQ2-turbo",
      durationResolutionMap: [{ duration: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], resolution: ["540p", "720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired"],
      audio: true,
    },
    {
      name: "ViduQ2 pro",
      type: "video",
      modelName: "ViduQ2-pro",
      durationResolutionMap: [{ duration: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], resolution: ["540p", "720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired"], //tham chiếusinh Videokhông hợp lệThiết lậpgiá trị 
      audio: true,
    },
    {
      name: "ViduQ2",
      type: "video",
      modelName: "ViduQ2",
      durationResolutionMap: [{ duration: [5], resolution: ["1080p"] }],
      mode: ["text"],
      audio: true,
    },
    {
      name: "ViduQ1",
      type: "video",
      modelName: "ViduQ1",
      durationResolutionMap: [{ duration: [5], resolution: ["1080p"] }],
      mode: ["singleImage", "startEndRequired", "text"],
      audio: true,
    },
    {
      name: "ViduQ1 classic",
      type: "video",
      modelName: "viduQ1-classic",
      durationResolutionMap: [{ duration: [5], resolution: ["1080p"] }],
      mode: ["singleImage", "startEndRequired"],
      audio: true,
    },
    {
      name: "Vidu2.0",
      type: "video",
      modelName: "vidu2.0",
      durationResolutionMap: [{ duration: [4, 8], resolution: ["360p", "720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired"],
      audio: true,
    },
    {
      name: "viduq1 for image",
      type: "image",
      modelName: "viduq1",
      mode: ["text"],
    },
    {
      name: "viduq2 for image",
      type: "image",
      modelName: "viduq2",
      mode: ["text", "singleImage", "multiReference"],
    },
  ],
};
exports.vendor = vendor;

// ==================== Hàm Adapter ====================

// văn bản  vui lòng cầu hàm 
const textRequest: (textModel: TextModel) => { url: string; model: string } = (textModel) => {
  throw new Error("hiện tạiNhà cung cấpchỉ hỗ trợVideolớn Mô hình，！");
};
exports.textRequest = textRequest;

//Hình ảnhvui lòng cầu hàm 
interface ImageConfig {
  prompt: string; //Hình ảnhPrompt
  imageBase64: string[]; //Prompt hình ảnh đầu vào
  size: "1K" | "2K" | "4K"; // Kích thước hình ảnh
  aspectRatio: `${number}:${number}`; // dài rộng tỷ 
}
const imageRequest = async (imageConfig: ImageConfig, imageModel: ImageModel) => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const apiKey = vendor.inputValues.apiKey.replace("Token ", "");

  const size = imageConfig.size === "1K" ? "2K" : imageConfig.size;
  const sizeMap: Record<string, Record<string, string>> = {
    "16:9": {
      "1k": "1920x1080",
      "2K": "2848x1600",
      "4K": "4096x2304",
    },
    "9:16": {
      "1k": "1920x1080",
      "2K": "1600x2848",
      "4K": "2304x4096",
    },
  };

  const body: Record<string, any> = {
    model: imageModel.modelName,
    prompt: imageConfig.prompt,
    aspect_ratio: sizeMap[imageConfig.aspectRatio][size],
    seed: 0,
    resolution: size,
    ...(imageConfig.imageBase64 && { image: imageConfig.imageBase64 }),
  };

  const createImageUrl = vendor.inputValues.baseUrl + "/reference2image";
  const response = await fetch(createImageUrl, {
    method: "POST",
    headers: { Authorization: `Token ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text(); // Lấylỗithông tin
    console.error("Yêu cầu thất bại，trạng tháimã :", response.status, ", lỗithông tin:", errorText);
    throw new Error(`Yêu cầu thất bại，trạng tháimã : ${response.status}, lỗithông tin: ${errorText}`);
  }
  const data = await response.json();
  const res = await checkTaskResult(data.task_id);
  if (!res.data) {
    throw new Error("Hình ảnhchưa thể tạo");
  }
  const list = JSON.parse(JSON.stringify(res.data));
  return list[0].url;
};
exports.imageRequest = imageRequest;

interface VideoConfig {
  duration: number;
  resolution: string;
  aspectRatio: "16:9" | "9:16";
  prompt: string;
  imageBase64?: string[];
  audio?: boolean;
  mode:
    | "singleImage" // Đơn ảnh
    | "multiImage" // nhiều ảnh mô thức 
    | "gridImage" // mạng khung Đơn ảnh（truyền vào 1 ảnh  Hình ảnh，nhưng Hình ảnhlà mạng khung ảnh ）
    | "startEndRequired" // Khung đầu/cuối (bắt buộc cả hai)
    | "endFrameOptional" // Khung đầu/cuối (khung cuối tùy chọn)
    | "startFrameOptional" // Khung đầu/cuối (khung đầu tùy chọn)
    | "text" // văn bản  sinh Video
    | ("video" | "image" | "audio" | "text")[]; // Tham chiếu hỗn hợp
}

// cấu tạo  các mục đài  của metadatatham số

const buildViduMetadata = (videoConfig: VideoConfig) => ({
  aspect_ratio: videoConfig.aspectRatio,
  audio: videoConfig.audio ?? false,
  off_peak: false,
});

type MetadataBuilder = (config: VideoConfig) => Record<string, any>;
const METADATA_BUILDERS: Array<[string, MetadataBuilder]> = [["vidu", buildViduMetadata]];
const buildModelMetadata = (modelName: string, videoConfig: VideoConfig) => {
  const lowerName = modelName.toLowerCase();
  const match = METADATA_BUILDERS.find(([key]) => lowerName.includes(key));
  return match ? match[1](videoConfig) : {};
};
// kiểm tra tạokết quả
const checkTaskResult = async (taskId: string) => {
  const queryUrl = vendor.inputValues.baseUrl + "/tasks/{id}/creations";
  const apiKey = vendor.inputValues.apiKey;
  const res = await pollTask(async () => {
    const queryResponse = await fetch(queryUrl.replace("{id}", taskId), {
      method: "GET",
      headers: { Authorization: `Token ${apiKey}`, "Content-Type": "application/json" },
    });
    if (!queryResponse.ok) {
      const errorText = await queryResponse.text(); // Lấylỗithông tin
      console.error("Yêu cầu thất bại，trạng tháimã :", queryResponse.status, ", lỗithông tin:", errorText);
      throw new Error(`Yêu cầu thất bại，trạng tháimã : ${queryResponse.status}, lỗithông tin: ${errorText}`);
    }
    const queryData = await queryResponse.json();
    const status = queryData?.state ?? queryData?.data?.state;
    const fail_reason = queryData?.data?.err_code ?? queryData?.data;
    switch (status) {
      case "completed":
      case "SUCCESS":
      case "success":
        return { completed: true, data: queryData.creations };
      case "FAILURE":
      case "failed":
        return { completed: false, error: fail_reason || "tạothất bại" };
      default:
        return { completed: false };
    }
  });
  if (res.error) throw new Error(res.error);
  return res;
};

const videoRequest = async (videoConfig: VideoConfig, videoModel: VideoModel) => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const apiKey = vendor.inputValues.apiKey.replace("Token ", "");

  // cấu tạo mục Mô hìnhđúng hồi  của cộng tham số
  const metadata = buildModelMetadata(videoModel.modelName, videoConfig);

  //vui lòng cầu tham số
  const publicBody = {
    model: videoModel.modelName,
    ...(videoConfig.imageBase64 && videoConfig.imageBase64.length ? { images: videoConfig.imageBase64 } : {}),
    prompt: videoConfig.prompt,
    size: videoConfig.resolution,
    duration: videoConfig.duration,
    metadata: metadata,
  };

  const requestUrl = vendor.inputValues.baseUrl + "/start-end2video";
  const response = await fetch(requestUrl, {
    method: "POST",
    headers: { Authorization: `Token ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(publicBody),
  });
  if (!response.ok) {
    const errorText = await response.text(); // Lấylỗithông tin
    console.error("Yêu cầu thất bại，trạng tháimã :", response.status, ", lỗithông tin:", errorText);
    throw new Error(`Yêu cầu thất bại，trạng tháimã : ${response.status}, lỗithông tin: ${errorText}`);
  }
  const data = await response.json();
  const taskId = data.id;
  const result = await checkTaskResult(taskId);
  return result.data;
};
exports.videoRequest = videoRequest;

interface TTSConfig {
  text: string;
  voice: string;
  speechRate: number;
  pitchRate: number;
  volume: number;
}
const ttsRequest = async (ttsConfig: TTSConfig, ttsModel: TTSModel) => {
  throw new Error("Vidu tạm không hỗ trợgiọng nói hợp tạo （TTS）");
};
