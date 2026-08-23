import u from "@/utils";

export type AiErrorKind = "overloaded" | "rateLimit" | "authError" | "invalidModel" | "network" | "timeout" | "unknown";

export interface ClassifiedAiError {
  kind: AiErrorKind;
  statusCode?: number;
  raw: string;
  retryable: boolean;
}

export interface ModelHealthRecord {
  modelName: string;
  status: "ok" | "degraded" | "down";
  consecutiveFailures: number;
  lastError?: string;
  lastErrorKind?: AiErrorKind;
  lastFailureAt?: number;
  lastSuccessAt?: number;
}

const health = new Map<string, ModelHealthRecord>();

const KIND_LABEL: Record<AiErrorKind, string> = {
  overloaded: "Máy chủ của nhà cung cấp đang quá tải (không phải do vượt hạn mức của bạn)",
  rateLimit: "Đã vượt hạn mức / giới hạn tốc độ (rate limit) của tài khoản",
  authError: "Lỗi xác thực API Key (khóa sai, hết hạn hoặc thiếu quyền)",
  invalidModel: "Mô hình không hợp lệ hoặc không còn khả dụng",
  network: "Lỗi kết nối mạng tới nhà cung cấp",
  timeout: "Hết thời gian chờ phản hồi từ nhà cung cấp",
  unknown: "Lỗi không xác định",
};

export function classifyAiError(err: unknown): ClassifiedAiError {
  const normalized = u.error(err);
  const rawMessage = String(normalized.message ?? "Lỗi không xác định");
  let metaText = "";
  try {
    metaText = JSON.stringify(normalized.meta ?? {});
  } catch {
    metaText = "";
  }
  const haystack = `${rawMessage} ${metaText}`.toLowerCase();

  const statusMatch = metaText.match(/"statusCode"\s*:\s*(\d{3})/) || metaText.match(/"status"\s*:\s*(\d{3})/);
  const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : undefined;
  const isRetryableFlag = /"isRetryable"\s*:\s*true/.test(metaText);

  let kind: AiErrorKind = "unknown";
  if (
    statusCode === 503 ||
    haystack.includes("unavailable") ||
    haystack.includes("overload") ||
    haystack.includes("high demand") ||
    haystack.includes("high load") ||
    haystack.includes("service unavailable")
  ) {
    kind = "overloaded";
  } else if (
    statusCode === 429 ||
    haystack.includes("resource_exhausted") ||
    haystack.includes("quota") ||
    haystack.includes("rate limit") ||
    haystack.includes("too many requests")
  ) {
    kind = "rateLimit";
  } else if (
    statusCode === 401 ||
    statusCode === 403 ||
    haystack.includes("api key") ||
    haystack.includes("unauthorized") ||
    haystack.includes("permission_denied") ||
    haystack.includes("invalid api")
  ) {
    kind = "authError";
  } else if (
    statusCode === 404 ||
    haystack.includes("model not found") ||
    haystack.includes("not_found") ||
    haystack.includes("does not exist") ||
    haystack.includes("unsupported model")
  ) {
    kind = "invalidModel";
  } else if (haystack.includes("timeout") || haystack.includes("timed out") || haystack.includes("aborted")) {
    kind = "timeout";
  } else if (
    haystack.includes("econnreset") ||
    haystack.includes("enotfound") ||
    haystack.includes("econnrefused") ||
    haystack.includes("fetch failed") ||
    haystack.includes("network")
  ) {
    kind = "network";
  } else if (isRetryableFlag || normalized.name === "AI_RetryError") {
    kind = "overloaded";
  }

  const retryable = kind === "overloaded" || kind === "rateLimit" || kind === "network" || kind === "timeout" || isRetryableFlag;

  return { kind, statusCode, raw: rawMessage, retryable };
}

export function recordSuccess(modelName: string) {
  const rec: ModelHealthRecord = health.get(modelName) ?? { modelName, status: "ok", consecutiveFailures: 0 };
  rec.status = "ok";
  rec.consecutiveFailures = 0;
  rec.lastSuccessAt = Date.now();
  health.set(modelName, rec);
}

export function recordFailure(modelName: string, classified: ClassifiedAiError) {
  const rec: ModelHealthRecord = health.get(modelName) ?? { modelName, status: "ok", consecutiveFailures: 0 };
  rec.consecutiveFailures += 1;
  rec.lastError = classified.raw;
  rec.lastErrorKind = classified.kind;
  rec.lastFailureAt = Date.now();
  rec.status = rec.consecutiveFailures >= 3 ? "down" : "degraded";
  health.set(modelName, rec);
}

export function getHealthSnapshot(): ModelHealthRecord[] {
  return [...health.values()].sort((a, b) => (b.lastFailureAt ?? 0) - (a.lastFailureAt ?? 0));
}

export function formatFriendlyAiError(attemptedModels: string[], classified: ClassifiedAiError | null): string {
  const label = classified ? KIND_LABEL[classified.kind] : "Lỗi không xác định";
  const modelsStr = attemptedModels.join(", ");
  const suffix = classified?.statusCode ? ` (mã lỗi ${classified.statusCode})` : "";
  const advice = classified?.retryable
    ? "Đây thường là sự cố tạm thời phía nhà cung cấp, vui lòng thử lại sau ít phút."
    : "Vui lòng kiểm tra lại cấu hình mô hình / API Key trong Cài đặt.";
  if (attemptedModels.length <= 1) {
    return `Không thể tạo phản hồi với mô hình [${modelsStr}]. Nguyên nhân: ${label}${suffix}. ${advice}`;
  }
  return `Đã tự động thử lần lượt ${attemptedModels.length} mô hình (${modelsStr}) nhưng đều thất bại. Lỗi gần nhất: ${label}${suffix}. ${advice}`;
}

export function formatFallbackNotice(fromModel: string, toModel: string, classified: ClassifiedAiError): string {
  const label = classified ? KIND_LABEL[classified.kind] : "Lỗi không xác định";
  const suffix = classified?.statusCode ? `, mã lỗi ${classified.statusCode}` : "";
  return `> ⚠️ Mô hình **${fromModel}** đang gặp sự cố (${label}${suffix}). Đã tự động chuyển sang **${toModel}**.\n\n`;
}

export default {
  classifyAiError,
  recordSuccess,
  recordFailure,
  getHealthSnapshot,
  formatFriendlyAiError,
  formatFallbackNotice,
};
