export interface ApiResponse {
  code: number;
  data: any;
  message: string;
}

// thành côngtrả gọi 
export function success<T>(data: T | null = null, message: string = "thành công"): ApiResponse {
  return {
    code: 200,
    data,
    message,
  };
}

// dùng đầu lỗiphản hồi 
export function error<T>(message: string = "", data: T | null = null): ApiResponse {
  return {
    code: 400,
    data,
    message,
  };
}
