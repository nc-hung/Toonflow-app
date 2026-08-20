// utils/error.ts
import { serializeError } from "serialize-error";
import { isAxiosError } from "axios";

export interface NormalizedError {
  name: string;
  message: string;
  code?: string;
  status?: number;
  stack?: string;
  cause?: NormalizedError;
  responseData?: unknown;
  meta?: Record<string, unknown>;
}

export function normalizeError(error: unknown): NormalizedError {
  // Axios Xử lý
  if (isAxiosError(error)) {
    return {
      name: "AxiosError",
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message,
      code: error.code,
      status: error.response?.status,
      stack: error.stack,
      responseData: error.response?.data,
      meta: {
        url: error.config?.url,
        method: error.config?.method,
      },
    };
  }

  // thông  Error，hàm  serialize-error Xử lý
  if (error instanceof Error) {
    const serialized = serializeError(error);
    return {
      name: serialized.name || "Error",
      message: serialized.message || "Lỗi không xác định",
      code: (serialized as any).code,
      stack: serialized.stack,
      cause: error.cause ? normalizeError(error.cause) : undefined,
      meta: extractMeta(serialized),
    };
  }

  // phi  Error
  return {
    name: "UnknownError",
    message: String(error),
    meta: { raw: serializeError(error) },
  };
}

// trích xuấttùy chỉnh biệt 
function extractMeta(obj: Record<string, unknown>): Record<string, unknown> | undefined {
  const standardKeys = ["name", "message", "stack", "cause"];
  const meta: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!standardKeys.includes(key) && value !== undefined) {
      meta[key] = value;
    }
  }

  return Object.keys(meta).length > 0 ? meta : undefined;
}

export default normalizeError;
