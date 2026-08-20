/**
 * Cổng Trung Chuyển Toonflow Chính Thức Nhà cung cấpAdapter 
 * @version 3.0
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
  id: "toonflow",
  version: "3.2",
  author: "Toonflow",
  name: "Cổng Trung Chuyển Toonflow Chính Thức",
  description:
    "## Cổng Trung Chuyển Toonflow Chính Thức\n\nCổng Trung Chuyển Toonflow Chính Thức，nhắc nhà **văn bản  、hình ảnh、Video、Âm thanh**nhiều mô thái khả năng tạo  của giữa chuyển phục vụ ，hỗ trợtiếp vào nhiều mục lớn Mô hìnhNhà cung cấp，thuận tiện cho Người dùngthống nhất quản lý  và gọi hàm không cùng Nhà cung cấp của khả năng tạo 。\n\n🔗 [Truy cập Cổng Trung Chuyển](https://api.toonflow.net/)\n\nNếunàymục Dự ánhữu ích với bạn ，ủng hộ công sức phát triển của đội ngũ chúng tôi  ☕",
  icon: "",
  inputs: [{ key: "apiKey", label: "Khóa API (API Key)", type: "password", required: true }],
  inputValues: {
    apiKey: "",
    baseUrl: "https://api.toonflow.net/v1",
  },
  models: [
    {
      name: "Seedance-2.0 (Hỗ trợ người thật)",
      modelName: "Seedance 2.0",
      type: "video",
      mode: ["text", "startFrameOptional", ["imageReference:9", "videoReference:3", "audioReference:3"]],
      audio: "optional",
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["480p", "720p"] }],
    },
    {
      name: "Seedance 2.0 fast (Hỗ trợ người thật)",
      modelName: "Seedance 2.0 fast",
      type: "video",
      mode: ["text", "startFrameOptional", ["imageReference:9", "videoReference:3", "audioReference:3"]],
      audio: "optional",
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["480p", "720p"] }],
    },
    {
      name: "Wan2.6",
      type: "video",
      modelName: "wan2.6",
      mode: ["singleImage"],
      durationResolutionMap: [{ duration: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["720p", "1080p"] }],
      audio: true,
    },
    {
      name: "Seedance 1.5 Pro",
      type: "video",
      modelName: "doubao-seedance-1-5-pro",
      mode: ["text", "endFrameOptional"],
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12], resolution: ["480p", "720p", "1080p"] }],
      audio: true,
    },
    {
      name: "ViduQ3 pro",
      type: "video",
      modelName: "ViduQ3-pro",
      mode: ["singleImage", "startEndRequired"],
      durationResolutionMap: [{ duration: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], resolution: ["540p", "720p", "1080p"] }],
      audio: false,
    },
    {
      name: "Kling-Video-O1",
      modelName: "Kling-Video-O1",
      type: "video",
      mode: ["startFrameOptional", ["imageReference:7", "videoReference:1"]],
      audio: "optional",
      durationResolutionMap: [{ duration: [5, 10, 15], resolution: ["720p", "1080p"] }],
    },
    {
      name: "Kling-V3-Omni",
      modelName: "Kling-V3-Omni",
      type: "video",
      mode: ["startFrameOptional", ["imageReference:7", "videoReference:1"]],
      audio: "optional",
      durationResolutionMap: [{ duration: [5, 10, 15], resolution: ["720p", "1080p"] }],
    },
    {
      name: "Doubao Seedream 5.0 Lite",
      type: "image",
      modelName: "doubao-seedream-5.0-Lite",
      mode: ["text", "singleImage", "multiReference"],
    },
    {
      name: "Doubao Seedream 4.5",
      type: "image",
      modelName: "doubao-seedream-4-5",
      mode: ["text", "singleImage", "multiReference"],
    },
    {
      name: "Hình ảnh Đa năngG-2.0",
      type: "image",
      modelName: "Hình ảnh Đa năngG-2.0",
      mode: ["text", "singleImage", "multiReference"],
    },
    // { name: "DeepSeek v4 pro", modelName: "deepseek-v4-pro", type: "text", think: false },
  ],
};

// ============================================================
// Công cụ bổ trợ
// ============================================================

// Trích xuất hình ảnh đầu tiên từ nội dung markdown
function extractFirstImageFromMd(content: string) {
  const regex = /!\[([^\]]*)\]\((data:image\/[^;]+;base64,[A-Za-z0-9+/=]+|https?:\/\/[^\s)]+|\/\/[^\s)]+|[^\s)]+)\)/;
  const match = content.match(regex);
  if (!match) return null;
  const raw = match[2].trim();
  const url = raw.startsWith("data:") ? raw : raw.split(/\s+/)[0];
  return { alt: match[1], url, type: url.startsWith("data:image") ? "base64" : "url" };
}

// ============================================================
// Hàm Adapter
// ============================================================

const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  const lowerName = model.modelName.toLowerCase();
  if (lowerName.includes("deepseek")) {
    logger("sử dụng deepseek");
    // Cường độ suy nghĩ DeepSeek hỗ trợ high / max (low, medium ánh xạ thành high, xhigh ánh xạ thành max)
    // thinkLevel: 0/1/2 → high, 3 → max
    const effortMap: Record<0 | 1 | 2 | 3, "high" | "max"> = {
      0: "high",
      1: "high",
      2: "high",
      3: "max",
    };

    const enableThinking = model.think && think;
    const extraBody: Record<string, any> = {
      thinking: { type: enableThinking ? "enabled" : "disabled" },
    };
    if (enableThinking) {
      extraBody.reasoning_effort = effortMap[thinkLevel];
    }

    return createDeepSeek({
      baseURL: vendor.inputValues.baseUrl,
      apiKey,
      extraBody,
    }).chat(model.modelName);
  }
  return createOpenAI({ baseURL: vendor.inputValues.baseUrl, apiKey }).chat(model.modelName);
};

const imageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  const baseUrl = vendor.inputValues.baseUrl;
  const lowerName = model.modelName.toLowerCase();
  const imageBase64List = (config.referenceList ?? []).map((r) => r.base64).filter(Boolean);

  // Gemini / nano dòng Mô hình：chạy  chat/completions cổng kết nối (endpoint) ，từ Trả về của  markdown giữa trích xuấtHình ảnh
  if (lowerName.includes("gemini") || lowerName.includes("nano")) {
    const imageConfigGoogle: Record<string, string> = {
      aspect_ratio: config.aspectRatio,
      image_size: config.size,
    };
    const messages: any[] = [];
    if (imageBase64List.length) {
      messages.push({
        role: "user",
        content: imageBase64List.map((b) => ({ type: "image_url", image_url: { url: b } })),
      });
    }
    messages.push({ role: "user", content: config.prompt + "vui lòng trực tiếp xuất ra Hình ảnh" });
    const body = {
      model: model.modelName,
      messages,
      extra_body: { google: { image_config: imageConfigGoogle } },
    };
    logger(`[imageRequest] sử dụng  gemini Adapter thiết bị ，Mô hình: ${model.modelName}`);
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Yêu cầu thất bại，trạng tháimã : ${response.status}, lỗithông tin: ${errorText}`);
    }
    const data = await response.json();
    const imageResult = extractFirstImageFromMd(data.choices[0].message.content);
    if (!imageResult) throw new Error("chưa thể từ phản hồi giữa trích xuấtHình ảnh");
    if (imageResult.type === "base64") return imageResult.url;
    return await urlToBase64(imageResult.url);
  }

  // Doubao / seedream dòng Mô hình：chạy  images/generations cổng kết nối (endpoint) 
  if (lowerName.includes("doubao") || lowerName.includes("seedream")) {
    const effectiveSize = config.size === "1K" ? "2K" : config.size;
    const sizeMap: Record<string, Record<string, string>> = {
      "16:9": { "2K": "2848x1600", "4K": "4096x2304" },
      "9:16": { "2K": "1600x2848", "4K": "2304x4096" },
    };
    const resolvedSize = sizeMap[config.aspectRatio]?.[effectiveSize];
    const body: Record<string, any> = {
      model: model.modelName,
      prompt: config.prompt,
      size: resolvedSize,
      metadata: {
        response_format: "url",
        sequential_image_generation: "disabled",
        stream: false,
        watermark: false,
      },
      ...(imageBase64List.length && { images: imageBase64List }),
    };
    logger(`[imageRequest] sử dụng  doubao Adapter thiết bị ，Mô hình: ${model.modelName}`);
    const response = await fetch(`${baseUrl}/image/generateImage`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Yêu cầu thất bại，trạng tháimã : ${response.status}, lỗithông tin: ${errorText}`);
    }
    const data = await response.json();
    const taskId = data.data;
    logger(`[imageRequest] ID tác vụ: ${taskId}`);
    const res = await pollTask(async () => {
      const queryResponse = await fetch(`${baseUrl}/image/getImageStatus`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          taskICode: taskId,
        }),
      });
      if (!queryResponse.ok) {
        const errorText = await queryResponse.text();
        throw new Error(`Truy vấn trạng thái thất bại，trạng tháimã : ${queryResponse.status}, lỗithông tin: ${errorText}`);
      }
      const queryData = await queryResponse.json();
      logger(queryData);
      const status = queryData?.status ?? queryData?.data?.status;
      logger(status);
      switch (status) {
        case "success":
          return { completed: true, data: queryData.data.data };
        case "failed":
          return { completed: true, error: queryData?.data?.failReason ?? "Videotạothất bại" };
        default:
          return { completed: false };
      }
    });
    return res.data!;
  }
  if (lowerName.includes("gpt") || lowerName.includes("Hình ảnh Đa năng")) {
    const normalizedSize = config.size === "1K" ? "1k" : config.size === "2K" ? "2k" : config.size === "4K" ? "4k" : config.size;
    const body: Record<string, any> = {
      model: model.modelName,
      prompt: config.prompt,
      size: normalizedSize,
      ...(imageBase64List.length && { images: imageBase64List }),
      metadata: {
        aspectRatio: config.aspectRatio,
      },
    };
    logger(`[imageRequest] sử dụng  doubao Adapter thiết bị ，Mô hình: ${model.modelName}`);
    const response = await fetch(`${baseUrl}/image/generateImage`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Yêu cầu thất bại，trạng tháimã : ${response.status}, lỗithông tin: ${errorText}`);
    }
    const data = await response.json();
    const taskId = data.data;
    logger(`[imageRequest] ID tác vụ: ${taskId}`);
    const res = await pollTask(async () => {
      const queryResponse = await fetch(`${baseUrl}/image/getImageStatus`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          taskICode: taskId,
        }),
      });
      if (!queryResponse.ok) {
        const errorText = await queryResponse.text();
        throw new Error(`Truy vấn trạng thái thất bại，trạng tháimã : ${queryResponse.status}, lỗithông tin: ${errorText}`);
      }
      const queryData = await queryResponse.json();
      logger(queryData);
      const status = queryData?.status ?? queryData?.data?.status;
      logger(status);
      switch (status) {
        case "success":
          return { completed: true, data: queryData.data.data };
        case "failed":
          return { completed: true, error: queryData?.data?.failReason ?? "Videotạothất bại" };
        default:
          return { completed: false };
      }
    });
    return res.data!;
  }

  throw new Error(`không hỗ trợ của Mô hình hình ảnh: ${model.modelName}`);
};

const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  const baseUrl = vendor.inputValues.baseUrl;
  const lowerName = model.modelName.toLowerCase();

  // hiện tạikích hoạt  của đơn 1  VideoMode（xuất Thứ một phi số nhóm mô thức ，hoặc số nhóm mô thức ）
  const activeMode = config.mode as string | string[];
  const imageRefs = (config.referenceList ?? []).filter((r) => r.type === "image").map((r) => r.base64);
  const videoRefs = (config.referenceList ?? []).filter((r) => r.type === "video").map((r) => r.base64);
  const audioRefs = (config.referenceList ?? []).filter((r) => r.type === "audio").map((r) => r.base64);
  if (imageRefs && imageRefs.length) {
    for (const item of imageRefs) {
      await zipImage(item, 3 * 1024 * 104);
    }
  }
  // cấu tạo Mô hìnhriêng biệt  metadata
  let metadata: Record<string, any> = {};

  if (lowerName.includes("wan")) {
    // vạntượng dòng hàng 
    if ((activeMode === "startEndRequired" || activeMode === "endFrameOptional" || activeMode === "startFrameOptional") && imageRefs.length >= 2) {
      if (imageRefs[0]) metadata.first_frame_url = imageRefs[0];
      if (imageRefs[1]) metadata.last_frame_url = imageRefs[1];
    } else if (imageRefs.length) {
      metadata.img_url = imageRefs[0];
    }
    if (typeof config.audio === "boolean") metadata.audio = config.audio;

    const body: Record<string, any> = {
      model: model.modelName,
      prompt: config.prompt,
      duration: config.duration,
      resolution: config.resolution,
      images: imageRefs,
      metadata,
    };
    logger(`[videoRequest] nhắc tác vụ vạntượng Videotác vụ ，Mô hình: ${model.modelName}`);
    const response = await fetch(`${baseUrl}/video/generateVideo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Yêu cầu thất bại，trạng tháimã : ${response.status}, lỗithông tin: ${errorText}`);
    }
    const data = await response.json();
    const taskId = data.data;
    logger(`[videoRequest] vạntượng ID tác vụ: ${taskId}`);
    const res = await pollTask(async () => {
      const queryResponse = await fetch(`${baseUrl}/video/getVideoStatus`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          taskICode: taskId,
        }),
      });
      if (!queryResponse.ok) {
        const errorText = await queryResponse.text();
        throw new Error(`Truy vấn trạng thái thất bại，trạng tháimã : ${queryResponse.status}, lỗithông tin: ${errorText}`);
      }
      const queryData = await queryResponse.json();
      logger(queryData);
      const status = queryData?.status ?? queryData?.data?.status;
      logger(status);
      switch (status) {
        case "completed":
        case "SUCCESS":
        case "success":
          return { completed: true, data: queryData.data.data };
        case "FAILURE":
        case "failed":
          return { completed: true, error: queryData?.data?.failReason ?? "Videotạothất bại" };
        default:
          return { completed: false };
      }
    });
    if (res.error) throw new Error(res.error);
    return res.data!;
  }

  if (lowerName.includes("doubao") || lowerName.includes("seedance")) {
    // Doubao/Seedance dòng hàng 
    metadata = {
      ...(typeof config.audio === "boolean" && { generate_audio: config.audio }),
      ratio: config.aspectRatio,
      references: [],
      resolution: config.resolution,
    };
    if (Array.isArray(activeMode)) {
      // nhiều tham chiếumô thức 
      imageRefs.forEach((item) => {
        metadata.references.push({
          role: "reference_image",
          type: "image_url",
          image_url: {
            url: item,
          },
        });
      });
      videoRefs.forEach((item) => {
        metadata.references.push({
          role: "reference_video",
          type: "video_url",
          video_url: {
            url: item,
          },
        });
      });
      audioRefs.forEach((item) => {
        metadata.references.push({
          role: "reference_audio",
          type: "audio_url",
          audio_url: {
            url: item,
          },
        });
      });
    } else if (activeMode === "startEndRequired" || activeMode === "endFrameOptional" || activeMode === "startFrameOptional") {
      imageRefs.forEach((item, i) => {
        metadata.references.push({
          type: "image_url",
          image_url: {
            url: item,
          },
          role: i == 0 ? "first_frame" : "last_frame",
        });
      });
    } else if (activeMode === "singleImage") {
      imageRefs.forEach((item, i) => {
        metadata.references.push({
          role: "reference_image",
          type: "image_url",
          image_url: {
            url: item,
          },
        });
      });
    }
  } else if (lowerName.includes("vidu")) {
    // Vidu dòng hàng 
    metadata = {
      aspect_ratio: config.aspectRatio,
      audio: config.audio ?? false,
      off_peak: false,
    };
  } else if (lowerName.includes("kling")) {
    const videoRefs = (config.referenceList ?? []).filter((r) => r.type === "video").map((r) => ({ video_url: r.base64 }));

    metadata = {
      aspect_ratio: config.aspectRatio,
      sound: typeof config?.audio == "boolean" ? (config?.audio ? "on" : "off") : "off",
      video_list: videoRefs,
      image_list: [],
    };

    // Hình ảnhhợp lệkiểm tra hàm 
    const isValidImage = (imageUrl: any) => {
      return imageUrl && typeof imageUrl === "string" && imageUrl.trim().length > 0;
    };

    if (activeMode === "singleImage") {
      if (lowerName.includes("omni") || lowerName.includes("o1")) {
        // chỉ ở Hình ảnhhợp lệthêm
        if (isValidImage(imageRefs[0])) {
          metadata.image_list = [{ image_url: imageRefs[0] }];
        }
      } else {
        if (isValidImage(imageRefs[0])) {
          metadata.image = imageRefs[0];
        }
      }
    } else if (activeMode === "startEndRequired" || activeMode === "endFrameOptional" || activeMode === "startFrameOptional") {
      if (lowerName.includes("omni") || lowerName.includes("o1")) {
        imageRefs.forEach((item, index) => {
          if (isValidImage(item)) {
            if (!metadata.image_list || !Array.isArray(metadata.image_list)) metadata.image_list = [];
            metadata.image_list.push({
              image_url: item,
              type: index == 0 ? "first_frame" : "end_frame",
            });
          }
        });
      } else {
        if (isValidImage(imageRefs[0])) {
          metadata.image_tail = imageRefs[0];
        }
      }
    } else if (Array.isArray(activeMode)) {
      imageRefs.forEach((item) => {
        if (isValidImage(item)) {
          if (!metadata.image_list || !Array.isArray(metadata.image_list)) metadata.image_list = [];
          metadata.image_list.push({
            image_url: item,
          });
        }
      });
    }
  } else if (lowerName.includes("grok")) {
    metadata = {
      aspectRatio: config.aspectRatio,
    };
  }

  // vui lòng cầu thể （phi vạntượng thông hàm đường dẫn）
  const publicBody: Record<string, any> = {
    model: model.modelName,
    ...(imageRefs.length && lowerName.includes("vidu") ? { images: imageRefs } : {}),
    prompt: config.prompt,
    duration: config.duration,
    resolution: config.resolution,
    metadata,
  };

  logger(`[videoRequest] nhắc tác vụ Videotác vụ ，Mô hình: ${model.modelName}`);
  const response = await fetch(`${baseUrl}/video/generateVideo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(publicBody),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Yêu cầu thất bại，trạng tháimã : ${response.status}, lỗithông tin: ${errorText}`);
  }
  const data = await response.json();
  const taskId = data.data;
  logger(`[videoRequest] ID tác vụ: ${taskId}`);

  const res = await pollTask(async () => {
    const queryResponse = await fetch(`${baseUrl}/video/getVideoStatus`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        taskICode: taskId,
      }),
    });
    if (!queryResponse.ok) {
      const errorText = await queryResponse.text();
      throw new Error(`Truy vấn trạng thái thất bại，trạng tháimã : ${queryResponse.status}, lỗithông tin: ${errorText}`);
    }
    const queryData = await queryResponse.json();
    logger(queryData);
    const status = queryData?.status ?? queryData?.data?.status;
    switch (status) {
      case "completed":
      case "SUCCESS":
      case "success":
        return { completed: true, data: queryData.data.data };
      case "FAILURE":
      case "failed":
        return { completed: true, error: queryData?.data?.failReason ?? "Videotạothất bại" };
      default:
        return { completed: false };
    }
  });

  if (res.error) throw new Error(res.error);
  return await urlToBase64(res.data!);
};

const ttsRequest = async (config: TTSConfig, model: TTSModel): Promise<string> => {
  return "";
};

const checkForUpdates = async (): Promise<{ hasUpdate: boolean; latestVersion: string; notice: string }> => {
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  const baseUrl = vendor.inputValues.baseUrl;
  const res = await fetch(`${baseUrl}/vendor/vendorCheck`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      version: vendor.version,
    }),
  });
  if (!res.ok) {
    const errorReason = await res.text();
    throw new Error(`kiểm tra Cập nhậtthất bại，${errorReason}`);
  }
  const { data } = await res.json();
  if (data?.hasUpdate && data?.latestVersion) {
    return {
      hasUpdate: data?.hasUpdate ?? false,
      latestVersion: data?.latestVersion ?? null,
      notice: data?.notice ? data?.notice : "Tác giảcó điểm ，chưa có Cập nhậtnội dung",
    };
  }
  return { hasUpdate: false, latestVersion: "", notice: "" };
};

const updateVendor = async (): Promise<string> => {
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  const baseUrl = vendor.inputValues.baseUrl;
  const response = await fetch(`${baseUrl}/vendor/downloadVendor`, {
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorReason = await response.text();
    throw new Error(`Yêu cầu thất bại: ${response.status} ${errorReason}`);
  }
  const { data } = await response.json();
  logger(data);
  return data;
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
