/**
 * Toonflow AINhà cung cấpTemplate - Kling AI
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
  id: "klingai",
  version: "2.0",
  author: "Toonflow",
  name: "Kling AI (Khả Linh)",
  description:
    "Kling AIVideotạo\n\nhỗ trợKling toàn dòng hàng Mô hình video，bao gồm kling-video-o1、kling-v3-omni、kling-v3、kling-v2-6、kling-v2-5-turbo、kling-v2-1、kling-v2-master、kling-v1-6、kling-v1-5、kling-v1 v.v.\n\nCần tại [Kling AINền tảng mở](https://klingai.com)\n\nLấy Access Key  và  Secret Key。",
  inputs: [
    { key: "accessKey", label: "Access Key", type: "password", required: true, placeholder: "Vui lòng nhập Access Key của Kling AI" },
    { key: "secretKey", label: "Secret Key", type: "password", required: true, placeholder: "Vui lòng nhập Secret Key của Kling AI" },
    { key: "baseUrl", label: "Địa chỉ yêu cầu", type: "url", required: true, placeholder: "Mặc định: https://api-beijing.klingai.com" },
  ],
  inputValues: { accessKey: "", secretKey: "", baseUrl: "https://api-beijing.klingai.com" },
    models: [
    {
      name: "Kling Video O1 Chuyên gia (Flagship)",
      modelName: "kling-video-o1:pro",
      type: "video",
      mode: ["text", "singleImage", "startEndRequired", ["imageReference:7", "videoReference:1"]],
      audio: false,
      durationResolutionMap: [{ duration: [5, 10], resolution: ["720p"] }],
    },
    {
      name: "Kling Video O1 Tiêu chuẩn",
      modelName: "kling-video-o1:std",
      type: "video",
      mode: ["text", "singleImage", "startEndRequired", ["imageReference:7", "videoReference:1"]],
      audio: false,
      durationResolutionMap: [{ duration: [5, 10], resolution: ["720p"] }],
    },
    {
      name: "Kling V3 Omni Chuyên gia",
      modelName: "kling-v3-omni:pro",
      type: "video",
      mode: ["text", "singleImage", "startEndRequired", ["imageReference:7", "videoReference:1"]],
      audio: false,
      durationResolutionMap: [{ duration: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["720p"] }],
    },
    {
      name: "Kling V3 Omni Tiêu chuẩn",
      modelName: "kling-v3-omni:std",
      type: "video",
      mode: ["text", "singleImage", "startEndRequired", ["imageReference:7", "videoReference:1"]],
      audio: false,
      durationResolutionMap: [{ duration: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["720p"] }],
    },
    {
      name: "Kling V2.6 Chuyên gia",
      modelName: "kling-v2-6:pro",
      type: "video",
      mode: ["text", "singleImage", "startEndRequired"],
      audio: false,
      durationResolutionMap: [{ duration: [5, 10], resolution: ["720p", "1080p"] }],
    },
    {
      name: "Kling V2.5 Turbo Tốc độ cao",
      modelName: "kling-v2-5-turbo:pro",
      type: "video",
      mode: ["text", "singleImage", "startEndRequired"],
      audio: false,
      durationResolutionMap: [{ duration: [5, 10], resolution: ["720p", "1080p"] }],
    },
  ],
};

// ============================================================
// Công cụ bổ trợ
// ============================================================

/**
 * tạoKling AI của JWTxác thực Token
 */
const generateAuthToken = (): string => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: vendor.inputValues.accessKey,
    exp: now + 1800,
    nbf: now - 5,
  };
  return jsonwebtoken.sign(payload, vendor.inputValues.secretKey, {
    algorithm: "HS256",
    header: { alg: "HS256", typ: "JWT" },
  });
};

/**
 * Lấycơ sở Địa chỉ yêu cầu
 */
const getBaseUrl = (): string => {
  return vendor.inputValues.baseUrl || "https://api-beijing.klingai.com";
};

/**
 * từ  ReferenceList mục mục giữa trích xuấthàm  của Dữ liệuchuỗi ký tự
 * đúng với  url loạiTrả về url，đúng với  base64 loạiTrả vềthuần  base64（đi bỏ  data: trước  tố ）
 */
const extractRawBase64 = (ref: ReferenceList): string => {
  return ref.base64.replace(/^data:[^;]+;base64,/, "");
};

/**
 * từ  ReferenceList mục mục giữa trích xuấtkèm đầu  của  base64 hoặc  url
 * hàm với  omni-video cổng kết nối (endpoint) ，cổng kết nối (endpoint)  của  image_url hỗ trợkèm trước  tố  của  base64  và  url
 */
const extractImageUrl = (ref: ReferenceList): string => {
  return ref.base64.startsWith("data:") ? ref.base64 : `data:image/jpeg;base64,${ref.base64}`;
};

/**
 * Gửi tác vụnhất Truy vấnLấykết quả của thông hàm hàm 
 */
const submitAndPoll = async (submitUrl: string, queryUrlBase: string, requestBody: any): Promise<string> => {
  const token = generateAuthToken();

  logger(`bắt đầunhắc tác vụ Kling AIVideotạotác vụ : ${submitUrl}`);
  logger(
    `vui lòng cầu tham số: ${JSON.stringify({
      ...requestBody,
      image: requestBody.image ? "[BASE64]" : undefined,
      image_tail: requestBody.image_tail ? "[BASE64]" : undefined,
      image_list: requestBody.image_list ? "[IMAGES]" : undefined,
    })}`,
  );

  const submitResp = await axios.post(submitUrl, requestBody, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (submitResp.data.code !== 0) {
    throw new Error(`nhắc tác vụ Tác vụ thất bại: ${submitResp.data.message || JSON.stringify(submitResp.data)}`);
  }

  const taskId = submitResp.data.data.task_id;
  logger(`tác vụ đã nhắc tác vụ ，ID tác vụ: ${taskId}`);

  const result = await pollTask(
    async () => {
      const freshToken = generateAuthToken();
      const queryResp = await axios.get(`${queryUrlBase}/${taskId}`, {
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      });

      if (queryResp.data.code !== 0) {
        return { completed: true, error: `Truy vấnTác vụ thất bại: ${queryResp.data.message}` };
      }

      const taskData = queryResp.data.data;
      const status = taskData.task_status;
      logger(`Truy vấngiữa ... tác vụ trạng thái: ${status}`);

      if (status === "succeed") {
        const videoUrl = taskData.task_result?.videos?.[0]?.url;
        if (!videoUrl) {
          return { completed: true, error: "tác vụ hoàn thànhnhưng chưa Lấyđến VideoURL" };
        }
        return { completed: true, data: videoUrl };
      }

      if (status === "failed") {
        return { completed: true, error: `Videotạothất bại: ${taskData.task_status_msg || "Lỗi không xác định"}` };
      }

      return { completed: false };
    },
    5000,
    600000,
  );

  if (result.error) throw new Error(result.error);
  logger(`Videotạohoàn thành，đangchuyển đổi Base64...`);
  return await urlToBase64(result.data!);
};

// ============================================================
// Hàm Adapter
// ============================================================

const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {
  throw new Error("Kling AIkhông hỗ trợMô hình văn bản ");
};

const imageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  throw new Error("Kling AIkhông hỗ trợMô hình hình ảnh");
};

const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  if (!vendor.inputValues.accessKey) throw new Error("Thiếu Access Key");
  if (!vendor.inputValues.secretKey) throw new Error("Thiếu Secret Key");

  const baseUrl = getBaseUrl();

  // giải tích  modelName，định dạng：kling-video-o1:pro => modelName=kling-video-o1, mode=pro
  const colonIdx = model.modelName.indexOf(":");
  const modelName = colonIdx > -1 ? model.modelName.substring(0, colonIdx) : model.modelName;
  const mode = colonIdx > -1 ? model.modelName.substring(colonIdx + 1) : "pro";

  // Kiểm tralà không  Omni Mô hình
  const isOmniModel = modelName === "kling-video-o1" || modelName === "kling-v3-omni";

  // Kiểm trahiện tạichọn giữa  của Videotạomô thức 
  const currentMode = config.mode;
  const isText = currentMode.includes("text");
  const isSingleImage = currentMode.includes("singleImage");
  const isStartEndRequired = currentMode.includes("startEndRequired");
  const isEndFrameOptional = currentMode.includes("endFrameOptional");
  const isStartFrameOptional = currentMode.includes("startFrameOptional");
  const hasMultiRef = Array.isArray(currentMode) && currentMode.some((m) => Array.isArray(m));

  // trích xuấtkhông cùng loại của hàm 
  const imageRefs = (config.referenceList || []).filter((r) => r.type === "image");
  const videoRefs = (config.referenceList || []).filter((r) => r.type === "video");

  // =====================================================
  // Omni Mô hình —— sử dụng  /v1/videos/omni-video cổng kết nối (endpoint) 
  // =====================================================
  if (isOmniModel) {
    const requestBody: any = {
      model_name: modelName,
      mode: mode,
      duration: String(config.duration),
      sound: config.audio === true ? "on" : "off",
    };

    if (config.prompt) {
      requestBody.prompt = config.prompt;
    }

    if (isSingleImage && imageRefs.length > 0) {
      const imageUrl = extractImageUrl(imageRefs[0]);
      requestBody.image_list = [{ image_url: imageUrl, type: "first_frame" }];
      if (!requestBody.prompt) requestBody.prompt = "Dựa theoHình ảnhTạo video";
    } else if (isStartEndRequired && imageRefs.length >= 2) {
      const firstUrl = extractImageUrl(imageRefs[0]);
      const endUrl = extractImageUrl(imageRefs[1]);
      requestBody.image_list = [
        { image_url: firstUrl, type: "first_frame" },
        { image_url: endUrl, type: "end_frame" },
      ];
      if (!requestBody.prompt) requestBody.prompt = "Dựa theoKhung đầu/cuốiHình ảnhtạoVideo";
    } else if (isEndFrameOptional && imageRefs.length >= 1) {
      const firstUrl = extractImageUrl(imageRefs[0]);
      requestBody.image_list = [{ image_url: firstUrl, type: "first_frame" }];
      if (imageRefs.length >= 2) {
        const endUrl = extractImageUrl(imageRefs[1]);
        requestBody.image_list.push({ image_url: endUrl, type: "end_frame" });
      }
      if (!requestBody.prompt) requestBody.prompt = "Dựa theoHình ảnhTạo video";
    } else if (isStartFrameOptional && imageRefs.length >= 1) {
      if (imageRefs.length >= 2) {
        const firstUrl = extractImageUrl(imageRefs[0]);
        const endUrl = extractImageUrl(imageRefs[1]);
        requestBody.image_list = [
          { image_url: firstUrl, type: "first_frame" },
          { image_url: endUrl, type: "end_frame" },
        ];
      } else {
        const endUrl = extractImageUrl(imageRefs[0]);
        requestBody.image_list = [{ image_url: endUrl, type: "end_frame" }];
      }
      if (!requestBody.prompt) requestBody.prompt = "Dựa theoHình ảnhTạo video";
    } else if (hasMultiRef && (imageRefs.length > 0 || videoRefs.length > 0)) {
      requestBody.image_list = [];
      for (let i = 0; i < imageRefs.length; i++) {
        const imageUrl = extractImageUrl(imageRefs[i]);
        requestBody.image_list.push({ image_url: imageUrl });
      }
      if (!requestBody.prompt) {
        const refs = imageRefs.map((_, idx) => `<<<image_${idx + 1}>>>`).join("、");
        requestBody.prompt = `tham chiếu${refs}Tạo video`;
      }
    }

    // tài sinh Videohoặc không Hình ảnhtải vào Cần Thiết lậprộng cao tỷ 
    const hasImageInput = requestBody.image_list && requestBody.image_list.length > 0;
    if (!hasImageInput) {
      requestBody.aspect_ratio = config.aspectRatio || "16:9";
      if (!requestBody.prompt) throw new Error("tài sinh Videochế độ yêu cầu nhắc nhà Prompt");
    }

    const apiPath = "/v1/videos/omni-video";
    return await submitAndPoll(`${baseUrl}${apiPath}`, `${baseUrl}${apiPath}`, requestBody);
  }

  // =====================================================
  // phi  Omni Mô hình —— Dựa theomô thức chọn lựa không cùng cổng kết nối (endpoint) 
  // =====================================================

  // Tham chiếu nhiều ảnhmô thức  —— sử dụng  /v1/videos/multi-image2video cổng kết nối (endpoint) （chỉ  kling-v1-6 hỗ trợ）
  if (hasMultiRef && imageRefs.length > 0) {
    const imageList = [];
    for (let i = 0; i < imageRefs.length; i++) {
      const rawBase64 = extractRawBase64(imageRefs[i]);
      imageList.push({ image: rawBase64 });
    }

    const requestBody: any = {
      model_name: modelName,
      image_list: imageList,
      prompt: config.prompt || "Dựa theotham chiếuHình ảnhTạo video",
      mode: mode,
      duration: String(config.duration),
      aspect_ratio: config.aspectRatio || "16:9",
    };

    const apiPath = "/v1/videos/multi-image2video";
    return await submitAndPoll(`${baseUrl}${apiPath}`, `${baseUrl}${apiPath}`, requestBody);
  }

  // tài sinh Videomô thức  —— sử dụng  /v1/videos/text2video cổng kết nối (endpoint) 
  if (isText) {
    if (!config.prompt) throw new Error("tài sinh Videochế độ yêu cầu nhắc nhà Prompt");

    const requestBody: any = {
      model_name: modelName,
      prompt: config.prompt,
      mode: mode,
      duration: String(config.duration),
      aspect_ratio: config.aspectRatio || "16:9",
      sound: config.audio === true ? "on" : "off",
    };

    const apiPath = "/v1/videos/text2video";
    return await submitAndPoll(`${baseUrl}${apiPath}`, `${baseUrl}${apiPath}`, requestBody);
  }

  // ảnh sinh Videomô thức （Đơn ảnh / Khung đầu/cuối / đuôi chọn ）—— sử dụng  /v1/videos/image2video cổng kết nối (endpoint) 
  if ((isSingleImage || isStartEndRequired || isEndFrameOptional || isStartFrameOptional) && imageRefs.length > 0) {
    const requestBody: any = {
      model_name: modelName,
      prompt: config.prompt || "Dựa theoHình ảnhTạo video",
      mode: mode,
      duration: String(config.duration),
      sound: config.audio === true ? "on" : "off",
    };

    if (isSingleImage) {
      requestBody.image = extractRawBase64(imageRefs[0]);
    } else if (isStartEndRequired && imageRefs.length >= 2) {
      requestBody.image = extractRawBase64(imageRefs[0]);
      requestBody.image_tail = extractRawBase64(imageRefs[1]);
    } else if (isEndFrameOptional) {
      requestBody.image = extractRawBase64(imageRefs[0]);
      if (imageRefs.length >= 2) {
        requestBody.image_tail = extractRawBase64(imageRefs[1]);
      }
    } else if (isStartFrameOptional) {
      if (imageRefs.length >= 2) {
        requestBody.image = extractRawBase64(imageRefs[0]);
        requestBody.image_tail = extractRawBase64(imageRefs[1]);
      } else {
        requestBody.image = extractRawBase64(imageRefs[0]);
      }
    }

    const apiPath = "/v1/videos/image2video";
    return await submitAndPoll(`${baseUrl}${apiPath}`, `${baseUrl}${apiPath}`, requestBody);
  }

  throw new Error("không hỗ trợ của Videotạomô thức hoặc Thiếu bắt cần   của tải vào tham số");
};

const ttsRequest = async (config: TTSConfig, model: TTSModel): Promise<string> => {
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

// Dòng mã này đảm bảo tệp hiện tại được  nhận diện là module
export {};
