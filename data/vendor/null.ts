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

declare const axios: any; // HTTPvui lòng cầu kho 
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
  checkForUpdates?: () => Promise<{ hasUpdate: boolean; latestVersion: string; notice: string }>; //kiểm tra Cập nhậthàm ，Trả vềcó hay không Cập nhật và số phiên bản  mới  nhất và thông báo（hỗ trợMarkdownđịnh dạng）
  updateVendor?: () => Promise<string>; //Cập nhậthàm ，Trả vềvăn bản  mã nguồn mới  nhất
};

// ============================================================
// Nhà cung cấpCấu hình
// ============================================================

const vendor: VendorConfig = {
  id: "null",
  version: "2.0",
  author: "Toonflow",
  name: "Mẫu trống (Tùy chỉnh)",
  description: "## Mẫu phát triển tùy chỉnh, bạn có thể sử dụng mẫu này để lập trình adapter riêng.",
  inputs: [
    { key: "apiKey", label: "Khóa API (API Key)", type: "password", required: true },
    { key: "baseUrl", label: "Địa chỉ yêu cầu", type: "url", required: true, placeholder: "Ví dụ: https://api.openai.com/v1" },
  ],
  inputValues: { apiKey: "", baseUrl: "https://api.openai.com/v1" },
  models: [{ name: "GPT-4o", modelName: "gpt-4o", type: "text", think: false }],
};

// ============================================================
// Hàm Adapter
// ============================================================

const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  return createOpenAI({ baseURL: vendor.inputValues.baseUrl, apiKey }).chat(model.modelName);
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
  return { hasUpdate: false, latestVersion: "2.0", notice: "## mới  bản sách Cập nhậtthông " };
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

/**
 * ============================================================
 * AI mã tạo
 * ============================================================
 *
 * 【tả 】
 * sách Tệplà  Toonflow AI Nhà cung cấpAdapter Template。AI ở tạomới  Nhà cung cấpAdapter mã ，
 * bắt buộc khung dưới ，nhất cần  cầu Người dùngnhắc nhà mục biểu đài  của  curl gọi hàm nhở lệ hoặc  API tài liệu thông tintác vụ tải vào phụ liệu 。
 *
 * 【tiền xử lýcần  cầu 】
 * ở tạomã trước  ，vui lòng Người dùngkiếm cần  dưới thông tin（ít nhất 1 ）：
 *   1. mục biểu  API  của  curl vui lòng cầu nhở lệ （gói Địa chỉ yêu cầu、Headers、Body kết cấu 、phản hồi kết cấu ）
 *   2. mục biểu  API  của phương tài liệu tiếp hoặc tài liệu cắt ảnh /văn bản  nội dung
 *   3. Cần Adapter  của Mô hìnhloại（text / image / video / tts）thể lực hướng dẫn 
 * chưa có thông tin，hồi chính động hỏi ，không cần  rỗng chỉnh tạo  API kết cấu 。
 *
 * 【mã 】
 *
 * 1. vào ngoài bộ gói 
 *    không sử dụng  import / require，chỉ thể sử dụng sách Tệp「Khai báo toàn cục」khu vực giữa đã thông báo  của phương thức  và đúng tượng ，
 *    bao gồm：axios、logger、jsonwebtoken、zipImage、zipImageResolution、mergeImages、
 *    urlToBase64、pollTask， createOpenAI、createDeepSeek、createZhipu、createQwen、
 *    createAnthropic、createOpenAICompatible、createXai、createMinimax、
 *    createGoogleGenerativeAI  AI SDK hàm 。
 *
 * 2. ở  exports.* hàm ngoài bộ thông báo  của toàn lớn thường lượng 
 *    lỗiVí dụ: const API_URL = "https://..."; const MAX_RETRY = 3;
 *    NếuCần Cấu hình của thường lượng giá trị ，bắt buộc thông báo ở  vendor.inputValues giữa ，
 *    thông qua vendor.inputValues.xxx hỏi ，để Người dùngở giới mặt trên Cấu hình。
 *    Nếulà thuần logictrong bộ sử dụng  của lượng ，hồi trong kết ở đúng hồi  của  exports.* hàm thể trong bộ ，sử dụng nhỏ tên 。
 *
 * 3. logiclượng hợp ở  exports.* đúng hồi  của hàm trong bộ 
 *    mục Adapter hàm （textRequest / imageRequest / videoRequest / ttsRequest）
 *    hồi tự gói ，vui lòng cầu Khởi tạo 、phát gửi 、Truy vấn、kết quảgiải tích logicở hàm thể trong ，phần ra lớn lượng ngoài bộ giúp hàm 。
 *    Nếunhiều mục hàm lưu ở logic（như ký tên tính toán、Token tạo、vui lòng cầu đầu Khởi tạo ），
 *    trích xuấtTệptrong  của nhỏ tên hàm ，mở ở 「Hàm Adapter」khu  của trước   của 「Công cụ bổ trợ」khu giữa ，
 *    và không sử dụng toàn lớn tên 。
 *
 * 4. tên 
 *    tất cảlượng 、hàm 1 sử dụng nhỏ tên （camelCase），sử dụng  UPPER_SNAKE_CASE。
 *
 * 5. không Cần trùng mới  thông báo loại
 *    sách Tệpbộ đã chỉnh nối nghĩa tất cảcổng kết nối (endpoint)  và loại（VendorConfig、ImageConfig、VideoConfig、
 *    TTSConfig、TextModel、ImageModel、VideoModel、TTSModel、ReferenceList、PollResult ），
 *    AI tạomã trực tiếp sử dụng ，không cần  trùng lời thông báo 。
 *
 * 6. Trả vềgiá trị 
 *    - textRequest(model)：Trả về AI SDK  của  chat model lệ （thông qua createOpenAI hàm sáng tạo ）。
 *    - imageRequest(config, model)：Trả vềcó data URI header  base64 chuỗi ký tự（như  "data:image/png;base64,..."）。
 *      config.referenceList  Extract<ReferenceList, { type: "image" }>[] loại，
 *      mục hàm mục mục  base64 dạng thức （sourceType nối  "base64"）。
 *    - videoRequest(config, model)：Trả vềcó data URI header  base64 chuỗi ký tự（như  "data:video/mp4;base64,..."）。
 *      config.referenceList  ReferenceList[] loại，gói  image / video / audio 3loại hàm ，
 *      mục hàm mục mục  base64 dạng thức （sourceType nối  "base64"）。
 *      config.mode hiện tạikích hoạt  của Videomô thức số nhóm ，cần Dựa theo mode nối như sử dụng  referenceList。
 *    - ttsRequest(config, model)：Trả vềcó data URI header  base64 chuỗi ký tự（như  "data:audio/mp3;base64,..."）。
 *      config.referenceList  Extract<ReferenceList, { type: "audio" }>[] loại（Âm thanhtham chiếu）。
 *    khi  API Trả về của là  URL phi 2tiến chép Dữ liệu，sử dụng  urlToBase64(url) chuyển đổi 。
 *
 * 7. ReferenceList  VideoMode hướng dẫn 
 *    ReferenceList là thống nhất  của nhiều thể hàm loại，mục mục mục gói ：
 *      - type: "image" | "audio" | "video"（thể loại）
 *      - sourceType: "base64"（hiện tạiTemplatenối  base64）
 *      - base64（đúng hồi  của Dữ liệu）
 *
 *    VideoMode nối nghĩa Mô hình videohỗ trợ của tải vào mô thức ：
 *      - "text"：thuần văn bản  Tạo video
 *      - "singleImage"：đơn ảnh  Hình ảnh
 *      - "startEndRequired"：Khung đầu/cuối（hai ảnhđều bắt buộc nhắc nhà ）
 *      - "endFrameOptional"：Khung đầu/cuối (khung cuối tùy chọn)
 *      - "startFrameOptional"：Khung đầu/cuối (khung đầu tùy chọn)
 *      - số nhóm dạng thức như  ["imageReference:9", "videoReference:3", "audioReference:3"]：
 *        nhiều mô thái tham chiếumô thức ，số chữ Bảngnhở loại của nhất lớn số lượnggiới hạn。
 *
 *    ở  videoRequest giữa ，config.mode Bảngnhở hiện tạichọn lựa  của mô thức ，cần Dựa theogiá trị nối ：
 *      - như từ  config.referenceList giữa trích xuấtđúng hồi loại của hàm 
 *      - như Khởi tạo  API vui lòng cầu thể giữa  của Hình ảnh/Video/Âm thanhtham số
 *
 * 8. bất bước tác vụ Xử lý
 *    đúng với VideotạoCần Truy vấn của bất bước tác vụ ，sử dụng toàn cục  của  pollTask hàm ：
 *    const result = await pollTask(async () => {
 *      const resp = await axios.get(...);
 *      if (resp.data.status === "SUCCESS") return { completed: true, data: resp.data.url };
 *      if (resp.data.status === "FAILED") return { completed: true, error: resp.data.message };
 *      return { completed: false };
 *    }, 5000, 600000); // 5giâyTruy vấn，10phần Hết thời gian chờ
 *    if (result.error) throw new Error(result.error);
 *    return await urlToBase64(result.data!);
 *
 * 9. lỗiXử lý
 *    ở mục hàm mở đầu đối chiếu bắt cần tham số（như  API Key），thất sử dụng  throw new Error("...") ra 。
 *    API Yêu cầu thất bại，từ phản hồi giữa trích xuấtcó ý nghĩa  của lỗithông tinra ，không cần  bỏ bất thường 。
 *
 * 10. ngày xuất ra 
 *     ở liên bước sử dụng  logger("...") xuất ra ngày （như "bắt đầuGửi tác vụ"、"ID tác vụ: xxx"、"Truy vấngiữa ..."），
 *     với gọi tra 。
 *
 * 11. vendor Cấu hình
 *     - id：thuần tài nhỏ ，tác vụ Tệptên sử dụng ，số  và rỗng khung 。
 *     - version：ngữ nghĩa hóa bản sách định dạng "x.y"。
 *     - inputs：Dựa theomục biểu  API nơi cần  của chứng thông tinCấu hình（API Key、Secret、Địa chỉ yêu cầu）。
 *     - models：Dựa theomục biểu đài hỗ trợ của Mô hìnhdanh sách，tâm ý chính Thiết lập type  và các Mô hìnhcó chữ đoạn 。
 *       - VideoModel  của  mode đúng hồi  API hỗ trợ của tải vào mô thức （tham thấy  7  của  VideoMode hướng dẫn ）。
 *       - VideoModel  của  audio chữ đoạn ：true（ban đầu Tạo âm thanh）、false（không tạo）、"optional"（Người dùngchọn ）。
 *       - VideoModel  của  durationResolutionMap đúng hồi các thời lượngdưới chọn  của phần tỷ lệ 。
 *       - VideoModel  của  associationSkills chọn ，hàm với mô tảMô hình của thể lực 。
 *       - ImageModel  của  mode đúng hồi  API hỗ trợ của sinh ảnh mô thức （"text" thuần văn bản  、"singleImage" Tham chiếu đơn ảnh、"multiReference" Tham chiếu nhiều ảnh）。
 *       - TTSModel  của  voices đúng hồi chọn  của giọng đọcdanh sách。
 *
 * 12. Hình ảnhXử lý
 *     - Cần nén nhỏ Hình ảnhthể sử dụng  zipImage(base64, maxSizeKB)。
 *     - Cần gọi chỉnh Hình ảnhphần tỷ lệ sử dụng  zipImageResolution(base64, width, height)。
 *     - Cần nhiều ảnh  Hình ảnhghép hợp 1 ảnh  sử dụng  mergeImages(base64Arr, maxSize)。
 *     - trên hàm tiếp nhận  và Trả vềcó data URI header  base64 chuỗi ký tự。
 *
 * 13. Tệpkết cấu 
 *     tạo của mã bắt buộc lưu giữ sách Template của chỉnh thể kết cấu ：
 *     Định nghĩa kiểu dữ liệukhu  → Khai báo toàn cụckhu  → Nhà cung cấpCấu hìnhkhu  → [Công cụ bổ trợkhu （chọn ）] → Hàm Adapterkhu  → Exportkhu 
 *     không cần  mở xếp ，không cần  Xóađã có  của kết cấu tâm phần cách đường 。
 *     Công cụ bổ trợkhu hàm với mở trí nhiều mục Hàm Adapter của nhỏ tên giúp hàm （như  getHeaders、getBaseUrl）。
 *
 * 14. Export
 *     bắt buộc Exportdưới chữ đoạn （thông qua exports.xxx = xxx giá trị ）：
 *       - exports.vendor（bắt buộc ）
 *       - exports.textRequest（bắt buộc ）
 *       - exports.imageRequest（bắt buộc ）
 *       - exports.videoRequest（bắt buộc ）
 *       - exports.ttsRequest（bắt buộc ）
 *       - exports.checkForUpdates（chọn ）
 *       - exports.updateVendor（chọn ）
 *     chưa  của Hàm Adapterlưu lưu rỗng （return ""），không Export。
 *     Tệpđuôi bắt buộc gói  export {}; lưu Tệptrưng khác mô 。
 *
 * 【tạotrình 】
 * khi Người dùngvui lòng cầu tạomới   của Nhà cung cấpAdapter ：
 *   1. Người dùngđã nhắc nhà  curl nhở lệ hoặc  API tài liệu 。
 *   2. phần tích  API  của chứng cách thức、đầu điểm địa chỉ、vui lòng cầu /phản hồi kết cấu 。
 *   3. cơ sở với sách Templatekết cấu ，sung  vendor Cấu hình và đúng hồi  của Hàm Adapter。
 *   4. Dựa theohiện tạiTemplate của  ReferenceList nối nghĩa ，theo  base64 dạng thức Khởi tạo  và hủy  referenceList。
 *   5. chỉ Người dùngCần  của Mô hìnhloại，chưa hàm đến  của hàm lưu lưu rỗng （return ""）。
 *   6. tạochỉnh hàm  của mã ，lưu không ngữ thức lỗi、không Export。
 */
