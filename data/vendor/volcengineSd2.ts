/**
 * Toonflow AINhà cung cấpTemplate - Volcengine(Doubao)
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
declare const crypto: any;
declare const exports: {
  vendor: VendorConfig;
  textRequest: (m: TextModel, t: boolean, tl: 0 | 1 | 2 | 3) => any;
  imageRequest: (c: ImageConfig, m: ImageModel) => Promise<string>;
  videoRequest: (c: VideoConfig, m: VideoModel) => Promise<string>;
  ttsRequest: (c: TTSConfig, m: TTSModel) => Promise<string>;
  checkForUpdates?: () => Promise<{ hasUpdate: boolean; latestVersion: string; notice: string }>;
  updateVendor?: () => Promise<string>;
};

// Cấu hình hằng số
const SERVICE = "ark";
const VERSION = "2024-01-01";
const REGION = "cn-beijing";
const HOST = "ark.cn-beijing.volcengineapi.com";
const CONTENT_TYPE = "application/json";
const SIGNED_HEADERS = "content-type;host;x-content-sha256;x-date";
const PATH = "/";
const TIMEOUT = 120_000;

// ============================================================
// Nhà cung cấpCấu hình
// ============================================================

const vendor: VendorConfig = {
  id: "volcengineSd2",
  version: "2.0",
  author: "toonflow",
  name: "Volcengine SD2.0 Người thật",
  description: "Mô hình lớn Doubao của Volcengine (Bytedance), hỗ trợ văn bản , tạo ảnh, tạo video người thật chất lượng cao.\n\nCần lấy Khóa API tại [Bảng điều khiển Volcengine](https://console.volcengine.com/ark)。",
  icon: "",
  inputs: [
    { key: "apiKey", label: "Khóa API (API Key)", type: "password", required: true, placeholder: "API Key của Volcengine" },
    { key: "baseUrl", label: "Địa chỉ yêu cầu", type: "url", required: true, placeholder: "Kết thúc bằng v3, ví dụ: https://ark.cn-beijing.volces.com/api/v3" },
    { key: "ak", label: "Volcengine  Access Key ID", type: "text", required: true, placeholder: "Khóa bí mật truy cập API Volcengine / OSS" },
    { key: "sk", label: "Volcengine  Secret Access Key", type: "password", required: true, placeholder: "Secret Access Key của Volcengine / OSS" },
    { key: "groupId", label: "ID nhóm tài nguyên", type: "text", required: true, placeholder: "ID nhóm tài nguyên Volcengine" },
    { key: "tosEndpoint", label: "Volcengine TOS Endpoint", type: "url", required: true, placeholder: "như  tos-cn-beijing.volces.com" },
    { key: "tosBucket", label: "Volcengine TOS Bucket", type: "text", required: true, placeholder: "Bucket tên" },
  ],
  inputValues: {
    apiKey: "",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    ak: "",
    sk: "",
    groupId: "",
    tosEndpoint: "",
    tosBucket: "",
  },
  models: [
    {
      name: "Seedance-2.0(Đồng bộ Âm thanh & Hình ảnh)",
      modelName: "doubao-seedance-2-0-260128",
      type: "video",
      mode: ["text", "startFrameOptional", ["imageReference:9", "videoReference:3", "audioReference:3"]],
      audio: "optional",
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["480p", "720p"] }],
    },
    {
      name: "Seedance-2.0-Fast(Đồng bộ Âm thanh & Hình ảnh)",
      modelName: "doubao-seedance-2-0-fast-260128",
      type: "video",
      mode: ["text", "startFrameOptional", ["imageReference:9", "videoReference:3", "audioReference:3"]],
      audio: "optional",
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["480p", "720p"] }],
    },
    {
      name: "Seedance-1.5-Pro(Đồng bộ Âm thanh & Hình ảnh)",
      modelName: "doubao-seedance-1-5-pro-251215",
      type: "video",
      mode: ["text", "startFrameOptional"],
      audio: "optional",
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12], resolution: ["480p", "720p", "1080p"] }],
    },
  ],
};
/** ký tên Khóa bí mật (Secret Key)phái sinh  */
function deriveSigningKey(shortDate: string) {
  const kDate = crypto.createHmac("sha256", vendor.inputValues.sk).update(shortDate).digest();
  const kRegion = crypto.createHmac("sha256", kDate).update(REGION).digest();
  const kService = crypto.createHmac("sha256", kRegion).update(SERVICE).digest();
  return crypto.createHmac("sha256", kService).update("request").digest();
}
function encodeQueryComponent(str: string): string {
  return encodeURIComponent(str).replace(/!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
}
function buildQueryString(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map((key) => {
      const value = params[key];
      return value === "" ? encodeQueryComponent(key) : `${encodeQueryComponent(key)}=${encodeQueryComponent(value)}`;
    })
    .join("&");
}
/**
 * Volcengine HMAC-SHA256 ký tên vui lòng cầu 
 * @param action  API Action tên
 * @param body    vui lòng cầu thể đúng tượng （tự động xếp hàng hóa  JSON）
 * @param method  HTTP phương thức ，Mặc định POST
 * @param header  bổ ngoài  của tùy chỉnh vui lòng cầu đầu 
 */
async function request(
  action: string,
  body: Record<string, unknown>,
  method: "GET" | "POST" = "POST",
  header: Record<string, string> = {},
): Promise<any> {
  const bodyStr = JSON.stringify(body);

  // Truy vấntham số（theo  key Sắp xếp）
  const sortedQuery = Object.fromEntries(Object.entries({ Action: action, Version: VERSION }).sort(([a], [b]) => a.localeCompare(b)));

  // thời gian & nội dung
  const date = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "Z");
  const shortDate = date.slice(0, 8);
  const xContentSha256 = crypto.createHash("sha256").update(bodyStr).digest("hex");

  // hóa vui lòng cầu chuỗi ký tự
  const queryString = buildQueryString(sortedQuery as Record<string, string>);
  const canonicalRequest = [
    method,
    PATH,
    queryString,
    `content-type:${CONTENT_TYPE}`,
    `host:${HOST}`,
    `x-content-sha256:${xContentSha256}`,
    `x-date:${date}`,
    "",
    SIGNED_HEADERS,
    xContentSha256,
  ].join("\n");

  const hashedCanonicalRequest = crypto.createHash("sha256").update(canonicalRequest).digest("hex");
  const credentialScope = `${shortDate}/${REGION}/${SERVICE}/request`;
  const stringToSign = `HMAC-SHA256\n${date}\n${credentialScope}\n${hashedCanonicalRequest}`;

  // tính toánký tên 
  const signingKey = deriveSigningKey(shortDate);
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  // nhóm vui lòng cầu đầu 
  const authorization = `HMAC-SHA256 Credential=${vendor.inputValues.ak}/${credentialScope}, SignedHeaders=${SIGNED_HEADERS}, Signature=${signature}`;
  const headers: Record<string, string> = {
    Host: HOST,
    "X-Content-Sha256": xContentSha256,
    "X-Date": date,
    "Content-Type": CONTENT_TYPE,
    Authorization: authorization,
    ...header,
  };
  return fetch(`https://${HOST}${PATH}?${queryString}`, {
    method,
    headers,
    body: bodyStr,
  });
}

// ============================================================
// Volcengine TOS V4 ký tên cụ hàm 
// ============================================================
const TOS_SIGNING_ALGORITHM = "TOS4-HMAC-SHA256";
function getTosRegion(): string {
  const ep = (vendor.inputValues.tosEndpoint || "").trim();
  const match = ep.match(/tos-([^.]+)\.volces\.com/);
  return match ? match[1] : "cn-beijing";
}
function tosTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}
function tosDateFromTimestamp(ts: string): string {
  return ts.slice(0, 8);
}
function tosBucket(): string {
  return (vendor.inputValues.tosBucket || "").trim();
}
function tosEndpoint(): string {
  return (vendor.inputValues.tosEndpoint || "").trim();
}
function tosAk(): string {
  logger(vendor.inputValues.ak);

  return (vendor.inputValues.ak || "").trim();
}
function tosSk(): string {
  logger(vendor.inputValues.sk);
  return (vendor.inputValues.sk || "").trim();
}
function hasCompleteTosConfig(): boolean {
  return Boolean(tosEndpoint() && tosBucket() && tosAk() && tosSk());
}
function tosSecurityToken(): string {
  return (vendor.inputValues.securityToken || vendor.inputValues.sessionToken || "").trim();
}
function getStorageProvider(): "tos" | "oss" {
  if (hasCompleteTosConfig()) return "tos";
  throw new Error("chưa kiểm kiểm đến hàm đúng tượng lưu trữ Cấu hình，vui lòng chỉnh  của  TOS hoặc  OSS Cấu hình");
}
function tosUriEncode(str: string, encodeSlash: boolean = false): string {
  const encoded = encodeURIComponent(str).replace(/!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
  return encodeSlash ? encoded : encoded.replace(/%2F/gi, "/");
}
function tosCanonicalQueryString(params: Record<string, string>): string {
  if (!Object.keys(params).length) return "";
  return Object.keys(params)
    .sort()
    .map((k) => `${tosUriEncode(k, true)}=${tosUriEncode(params[k], true)}`)
    .join("&");
}
function tosSigningKey(date: string, region: string, sk: string): Buffer {
  const kDate = crypto.createHmac("sha256", Buffer.from(sk, "utf8")).update(date, "utf8").digest();

  const kRegion = crypto.createHmac("sha256", kDate).update(region, "utf8").digest();

  const kService = crypto.createHmac("sha256", kRegion).update("tos", "utf8").digest();

  return crypto.createHmac("sha256", kService).update("request", "utf8").digest();
}
function tosSign(
  method: string,
  objectKey: string,
  queryParams: Record<string, string>,
  headers: Record<string, string>,
  payloadHash: string,
  timestamp: string,
): { authorization: string; canonicalRequest: string; stringToSign: string } {
  const region = getTosRegion();
  const date = tosDateFromTimestamp(timestamp);
  const scope = `${date}/${region}/tos/request`;
  const normalizedHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    normalizedHeaders[k.toLowerCase()] = v.trim();
  }
  const signedHeaderKeys = Object.keys(normalizedHeaders).sort();
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${normalizedHeaders[k]}\n`).join("");
  const signedHeaders = signedHeaderKeys.join(";");
  const canonicalRequest = [
    method,
    `/${tosUriEncode(objectKey)}`,
    tosCanonicalQueryString(queryParams),
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const hashedCanonicalRequest = crypto.createHash("sha256").update(canonicalRequest).digest("hex");
  const stringToSign = [TOS_SIGNING_ALGORITHM, timestamp, scope, hashedCanonicalRequest].join("\n");
  const signingKey = tosSigningKey(date, region, tosSk());
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  return {
    authorization: `${TOS_SIGNING_ALGORITHM} Credential=${tosAk()}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    canonicalRequest,
    stringToSign,
  };
}
async function tosFileExists(objectKey: string): Promise<boolean> {
  const bucket = tosBucket();
  const endpoint = tosEndpoint();
  if (!bucket || !endpoint || !tosAk() || !tosSk()) return false;

  const host = `${bucket}.${endpoint}`;
  const timestamp = tosTimestamp();
  const payloadHash = "UNSIGNED-PAYLOAD";
  const token = tosSecurityToken();

  const headers: Record<string, string> = {
    host,
    "x-tos-content-sha256": payloadHash,
    "x-tos-date": timestamp,
  };
  if (token) headers["x-tos-security-token"] = token;

  const { authorization } = tosSign("HEAD", objectKey, {}, headers, payloadHash, timestamp);

  const reqHeaders: Record<string, string> = {
    host,
    "x-tos-content-sha256": payloadHash,
    "x-tos-date": timestamp,
    Authorization: authorization,
  };
  if (token) reqHeaders["x-tos-security-token"] = token;

  const res = await fetch(`https://${host}/${tosUriEncode(objectKey)}`, {
    method: "HEAD",
    headers: reqHeaders,
  });

  if (res.status === 404) return false;
  return res.ok;
}
async function tosUpload(objectKey: string, data: Buffer, contentType: string): Promise<void> {
  const bucket = tosBucket();
  const endpoint = tosEndpoint();
  if (!bucket || !endpoint || !tosAk() || !tosSk()) {
    throw new Error("TOS Cấu hìnhkhông chỉnh ");
  }

  const host = `${bucket}.${endpoint}`;
  const timestamp = tosTimestamp();
  const payloadHash = crypto.createHash("sha256").update(data).digest("hex");
  const token = tosSecurityToken();

  const headers: Record<string, string> = {
    "content-type": contentType,
    host,
    "x-tos-content-sha256": payloadHash,
    "x-tos-date": timestamp,
  };
  if (token) headers["x-tos-security-token"] = token;

  const { authorization, canonicalRequest, stringToSign } = tosSign("PUT", objectKey, {}, headers, payloadHash, timestamp);

  logger(`[TOS Debug] CanonicalRequest:\n${canonicalRequest}`);
  logger(`[TOS Debug] StringToSign:\n${stringToSign}`);
  logger(`[TOS] PUT https://${host}/${objectKey}`);

  const reqHeaders: Record<string, string> = {
    "Content-Type": contentType,
    host,
    "x-tos-content-sha256": payloadHash,
    "x-tos-date": timestamp,
    Authorization: authorization,
  };
  if (token) reqHeaders["x-tos-security-token"] = token;

  const res = await fetch(`https://${host}/${tosUriEncode(objectKey)}`, {
    method: "PUT",
    headers: reqHeaders,
    body: data,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => `${res.status} ${res.statusText}`);
    throw new Error(`TOS tải lênthất bại: ${errText}`);
  }
}
function tosGetSignedUrl(objectKey: string, expiresIn: number = 7200): string {
  const bucket = tosBucket();
  const endpoint = tosEndpoint();
  const host = `${bucket}.${endpoint}`;
  const region = getTosRegion();
  const timestamp = tosTimestamp();
  const date = tosDateFromTimestamp(timestamp);
  const scope = `${date}/${region}/tos/request`;
  const token = tosSecurityToken();

  const queryParams: Record<string, string> = {
    "X-Tos-Algorithm": TOS_SIGNING_ALGORITHM,
    "X-Tos-Credential": `${tosAk()}/${scope}`,
    "X-Tos-Date": timestamp,
    "X-Tos-Expires": String(expiresIn),
    "X-Tos-SignedHeaders": "host",
  };
  if (token) queryParams["X-Tos-Security-Token"] = token;

  const canonicalRequest = [
    "GET",
    `/${tosUriEncode(objectKey)}`,
    tosCanonicalQueryString(queryParams),
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const hashedCanonicalRequest = crypto.createHash("sha256").update(canonicalRequest).digest("hex");
  const stringToSign = [TOS_SIGNING_ALGORITHM, timestamp, scope, hashedCanonicalRequest].join("\n");
  const signingKey = tosSigningKey(date, region, tosSk());
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  const finalQuery = tosCanonicalQueryString({
    ...queryParams,
    "X-Tos-Signature": signature,
  });

  return `https://${host}/${tosUriEncode(objectKey)}?${finalQuery}`;
}
/** từ  base64 Data URL giữa giải tích  MIME loại và Tệptên  */
function parseBase64(base64: string): { mimeType: string; ext: string; data: string } {
  const match = base64.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return { mimeType: "application/octet-stream", ext: "bin", data: base64 };
  }
  const mimeType = match[1];
  const extMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/wave": "wav",
    "audio/ogg": "ogg",
    "audio/aac": "aac",
  };
  return { mimeType, ext: extMap[mimeType] || "bin", data: match[2] };
}
// source ：base64
async function uploadAssets(source: string, type: "Image" | "Video" | "Audio"): Promise<string | null> {
  try {
    const { mimeType, ext, data: rawBase64 } = parseBase64(source);
    const buffer = Buffer.from(rawBase64, "base64");
    const hash = crypto.createHash("sha256").update(source).digest("hex");

    const provider = getStorageProvider();
    logger(provider);
    const objectKey = `volcengine/${type.toLowerCase()}/${hash}.${ext}`;

    let assetUrl: string;
    const exists = await tosFileExists(objectKey);
    if (!exists) {
      logger(`[TOS] tải lênTệp: ${objectKey} (${mimeType})`);
      await tosUpload(objectKey, buffer, mimeType);
    } else {
      logger(`[TOS] Tệpđã lưu ở ，tải lên: ${objectKey}`);
    }
    assetUrl = tosGetSignedUrl(objectKey, 7200);

    logger(`tạoký tên URL: ${assetUrl}`);

    const res = await request("CreateAsset", {
      GroupId: vendor.inputValues.groupId,
      URL: assetUrl,
      Name: hash,
      AssetType: type,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`sáng tạo Tài nguyênthất bại: ${errorText}`);
    }

    const resData = await res.json();
    const assetId: string = resData.Result.Id;
    logger(`Tài nguyênđã sáng tạo : ${assetId}`);

    const result = await pollTask(
      async (): Promise<PollResult> => {
        const queryRes = await request("GetAsset", { Id: assetId, AssetType: type });
        if (!queryRes.ok) {
          const errorText = await queryRes.text();
          throw new Error(`Truy vấnTài nguyêntrạng tháithất bại: ${errorText}`);
        }
        const task = await queryRes.json();
        const status: string = task.Result.Status;

        logger(`[Tài nguyênTruy vấn] trạng thái: ${JSON.stringify(task, null, 2)}`);

        switch (status) {
          case "Active":
            return { completed: true, data: assetId };
          case "Failed":
            return { completed: true, error: task.Result.Error?.Message || "Tài nguyênsáng tạo thất bại" };
          default:
            return { completed: false };
        }
      },
      10000,
      600000 * 3,
    );

    if (result.error) {
      throw new Error(result.error);
    }

    return `asset://${result.data}`;
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : String(err);
    logger(`[uploadAssets] tải lênthất bại: ${msg}`);
    return source;
  }
}

// ============================================================
// Công cụ bổ trợ
// ============================================================

const getHeaders = () => {
  if (!vendor.inputValues.apiKey) throw new Error("Thiếu API Key");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "")}`,
  };
};

const getBaseUrl = () => vendor.inputValues.baseUrl.replace(/\/+$/, "");

// ============================================================
// Hàm Adapter
// ============================================================

const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {};

const imageRequest = async (config: ImageConfig, model: ImageModel) => {};

const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  const baseUrl = getBaseUrl();
  const headers = getHeaders();

  const content: any[] = [];

  if (config.prompt) {
    content.push({ type: "text", text: config.prompt });
  }

  if (typeof config.mode === "string") {
    switch (config.mode) {
      case "singleImage": {
        const firstImage = config.referenceList?.find((r) => r.type === "image");
        if (firstImage) {
          content.push({
            type: "image_url",
            image_url: { url: firstImage.base64 },
            role: "first_frame",
          });
        }
        break;
      }
      case "startFrameOptional": {
        const images = config.referenceList?.filter((r) => r.type === "image") ?? [];
        if (images.length > 0) {
          content.push({
            type: "image_url",
            image_url: { url: images[0].base64 },
            role: "first_frame",
          });
          if (images.length > 1) {
            content.push({
              type: "image_url",
              image_url: { url: images[1].base64 },
              role: "last_frame",
            });
          }
        }
        break;
      }
      case "startEndRequired": {
        const images = config.referenceList?.filter((r) => r.type === "image") ?? [];
        if (images.length >= 2) {
          content.push({
            type: "image_url",
            image_url: { url: images[0].base64 },
            role: "first_frame",
          });
          content.push({
            type: "image_url",
            image_url: { url: images[1].base64 },
            role: "last_frame",
          });
        }
        break;
      }
      case "endFrameOptional": {
        const images = config.referenceList?.filter((r) => r.type === "image") ?? [];
        if (images.length > 0) {
          content.push({
            type: "image_url",
            image_url: { url: images[0].base64 },
            role: "first_frame",
          });
          if (images.length > 1) {
            content.push({
              type: "image_url",
              image_url: { url: images[1].base64 },
              role: "last_frame",
            });
          }
        }
        break;
      }
      case "text":
      default:
        break;
    }
  } else if (Array.isArray(config.mode)) {
    // Chế độ đa phương thức: theo loạiphần khác trích xuấtnhất thêm
    const imageRefs = config.referenceList?.filter((r) => r.type === "image") ?? [];
    const videoRefs = config.referenceList?.filter((r) => r.type === "video") ?? [];
    const audioRefs = config.referenceList?.filter((r) => r.type === "audio") ?? [];

    for (const refDef of config.mode) {
      if (typeof refDef === "string") {
        if (refDef.startsWith("imageReference:")) {
          const maxCount = parseInt(refDef.split(":")[1], 10);

          for (const ref of imageRefs.slice(0, maxCount)) {
            content.push({
              type: "image_url",
              image_url: { url: await uploadAssets(ref.base64, "Image") },
              role: "reference_image",
            });
          }
        } else if (refDef.startsWith("videoReference:")) {
          const maxCount = parseInt(refDef.split(":")[1], 10);
          for (const ref of videoRefs.slice(0, maxCount)) {
            content.push({
              type: "video_url",
              video_url: { url: await uploadAssets(ref.base64, "Video") },
              role: "reference_video",
            });
          }
        } else if (refDef.startsWith("audioReference:")) {
          const maxCount = parseInt(refDef.split(":")[1], 10);
          for (const ref of audioRefs.slice(0, maxCount)) {
            content.push({
              type: "audio_url",
              audio_url: { url: await uploadAssets(ref.base64, "Audio") },
              role: "reference_audio",
            });
          }
        }
      }
    }
  }
  const body: any = {
    model: model.modelName,
    content,
    ratio: config.aspectRatio,
    duration: config.duration,
    resolution: config.resolution || "720p",
    watermark: false,
  };

  if (model.audio === "optional") {
    body.generate_audio = config.audio !== false;
  } else if (model.audio === true) {
    body.generate_audio = true;
  } else {
    body.generate_audio = false;
  }
  logger(`[Videotạo] Gửi tác vụ, Mô hình: ${model.modelName}, thời lượng: ${config.duration}s, phần tỷ lệ : ${config.resolution}`);
  const res = await fetch(`${baseUrl}/contents/generations/tasks`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Videotạotác vụ sáng tạo thất bại: ${errorText}`);
  }
  const createResponse = await res.json();
  logger(createResponse);
  const taskId = createResponse?.id;

  if (!taskId) {
    throw new Error("Videotạotác vụ sáng tạo thất bại：chưa Trả vềID tác vụ");
  }

  logger(`[Videotạo] tác vụ đã sáng tạo , ID: ${taskId}`);

  const result = await pollTask(
    async (): Promise<PollResult> => {
      const queryRes = await fetch(`${baseUrl}/contents/generations/tasks/${taskId}`, {
        method: "GET",
        headers,
      });
      if (!queryRes.ok) {
        const errorText = await queryRes.text();
        throw new Error(`Truy vấnVideotạotác vụ trạng tháithất bại: ${errorText}`);
      }
      const task = await queryRes.json();

      logger(`[Videotạo] tác vụ trạng thái: ${JSON.stringify(task)}`);

      switch (task.status) {
        case "succeeded":
          if (task.content?.video_url) {
            return { completed: true, data: task.content.video_url };
          }
          return { completed: true, error: "tác vụ thành côngnhưng chưa Trả vềVideoURL" };
        case "failed":
          return { completed: true, error: task.error?.message || "Videotạothất bại" };
        case "expired":
          return { completed: true, error: "Videotạotác vụ Hết thời gian chờ" };
        case "cancelled":
          return { completed: true, error: "Videotạotác vụ đã xuất hủy " };
        default:
          return { completed: false };
      }
    },
    10000,
    600000 * 3,
  );

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data!;
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
