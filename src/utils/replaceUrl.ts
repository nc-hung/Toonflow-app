import path from "node:path";

export default function replaceUrl(url: string): string {
  if (typeof url !== "string" || !url.trim()) return "";
  let cleanedPath = "";
  try {
    const pathname = new URL(url).pathname;
    cleanedPath = pathname;
  } catch (e) {
    // Nếukhông là hợp lệ của URL，trực tiếp sử dụng gốc chuỗi ký tự
    cleanedPath = url;
  }
  cleanedPath = cleanedPath.replace(/^\/oss/, "").replace(/^\/smallImage/, "");
  // đi bỏ  query tham số
  cleanedPath = cleanedPath.split("?")[0];
  // đường dẫn：đúng đường dẫntiến thi hóa sau  ，lưu không trên phần lượng 
  // sử dụng  posix hóa （lưu giữ  / ngăn cách），đi bỏ tất cả ..  và  .
  const normalized = path.posix.normalize(cleanedPath);

  // hóa sau  đường dẫn ../ mở đầu hoặc với  .. hướng dẫn phát sinh đường dẫn，nhất Trả vềrỗng chuỗi ký tự
  if (normalized.startsWith("../") || normalized === "..") {
    return "";
  }

  // đi bỏ trước  dẫn ，lưu chứng Trả về của là đúng đường dẫn
  return normalized.replace(/^\/+/, "");
}
