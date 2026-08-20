import fs from "node:fs/promises";
import fss from "fs";
import path from "node:path";
import sharp from "sharp";

/**
 * Hình ảnhnhỏ mở chọn 
 */
export interface ResizeOptions {
  /** nhất lớn chiều rộng（Mặc định 256 */
  width?: number;
  /** nhất lớn chiều cao（Mặc định 256 */
  height?: number;
  /** nhỏ mở ，Mặc địnhtỷ nhỏ mở không vượt ra giới  */
  fit?: keyof sharp.FitEnum;
  /** là không mở lớn （Mặc định true） */
  withoutEnlargement?: boolean;
}

const defaultResizeOptions: Required<ResizeOptions> = {
  width: 256,
  height: 256,
  fit: "inside",
  withoutEnlargement: true,
};

/**
 * Hình ảnhnhỏ mở sau  vào mục biểu đường dẫn（tự động sáng tạo thư mục）。
 * @param srcPath nguồn Hình ảnhđúng đường dẫn
 * @param dstPath mục biểu Hình ảnhđúng đường dẫn
 * @param opts nhỏ mở chọn 
 */
export async function resizeImage(srcPath: string, dstPath: string, opts?: ResizeOptions): Promise<void> {
  const { width, height, fit, withoutEnlargement } = { ...defaultResizeOptions, ...opts };
  await fs.mkdir(path.dirname(dstPath), { recursive: true });
  await sharp(srcPath).resize(width, height, { fit, withoutEnlargement }).toFile(dstPath);
}

/**
 * nhỏ ảnh tùy chỉnh kích thướcchọn 
 */
export type ThumbnailSize =
  | { type: "dimensions"; width: number; height: number }
  | { type: "percentage"; value: number };

/**
 * tạonhỏ ảnh 。
 * - nhỏ ảnh đã lưu ở ，trực tiếp Trả vềđường dẫn。
 * - không tồn tại，tạosau  Trả vềmục biểu đường dẫn；Tạo thất bạiTrả về null。
 *
 * @param originalPath gốc ảnh đúng đường dẫn
 * @param thumbnailPath nhỏ ảnh đúng đường dẫn
 * @param size chọn  của tùy chỉnh kích thước：nối rộng cao  hoặc  trăm phần tỷ （Mặc định 256x256 inside）
 * @returns nhỏ ảnh đường dẫn，thất bạiTrả về null
 */
export async function ensureThumbnail(
  originalPath: string,
  thumbnailPath: string,
  size?: ThumbnailSize,
): Promise<string | null> {
  // nhỏ ảnh đã lưu ở ，trực tiếp Trả về
  if (fss.existsSync(thumbnailPath)) {
    return thumbnailPath;
  }
  // gốc ảnh không tồn tại，không thức tạo
  if (!fss.existsSync(originalPath)) {
    return null;
  }
  try {
    if (size?.type === "percentage") {
      // trăm phần tỷ nhỏ mở ：trước  Lấygốc ảnh kích thước，tỷ tính toánmục biểu kích thước
      const meta = await sharp(originalPath).metadata();
      if (!meta.width || !meta.height) {
        console.warn("[image] không thức Lấygốc ảnh kích thước:", originalPath);
        return null;
      }
      const pct = size.value / 100;
      const w = Math.round(meta.width * pct);
      const h = Math.round(meta.height * pct);
      await resizeImage(originalPath, thumbnailPath, { width: w, height: h });
    } else if (size?.type === "dimensions") {
      // nối rộng cao ：tỷ nhỏ mở Adapter đến nối giới 
      await resizeImage(originalPath, thumbnailPath, {
        width: size.width,
        height: size.height,
      });
    } else {
      // Mặc định 256x256 inside
      await resizeImage(originalPath, thumbnailPath);
    }
    console.info(`[${thumbnailPath}] nhỏ ảnh Tạo thành công`);
    return thumbnailPath;
  } catch (e) {
    console.warn("[image] tạonhỏ ảnh thất bại:", e);
    return null;
  }
}
