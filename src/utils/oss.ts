import isPathInside from "is-path-inside";
import getPath, { isEletron } from "@/utils/getPath";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// hóa đường dẫn：đi bỏ trước  dẫn ，nhất đường dẫnngăn cáchthống nhất chuyển đổi dòng thống ngăn cách
function normalizeUserPath(userPath: string): string {
  // đi bỏ trước  dẫn  của  / hoặc  \
  const trimmedPath = userPath.replace(/^[/\\]+/, "");
  // tất cả / đổi dòng thống đường dẫnngăn cách（path.sep）
  // nàykiểu ở  Windows trên sẽ chuyển  \，ở  Unix trên lưu giữ  /
  return trimmedPath.split("/").join(path.sep);
}

// đối chiếu đường dẫn
function resolveSafeLocalPath(userPath: string, rootDir: string): string {
  const safePath = normalizeUserPath(userPath);
  const absPath = path.join(rootDir, safePath);
  if (!isPathInside(absPath, rootDir)) {
    throw new Error(`${userPath} không ở  OSS thư mụctrong `);
  }
  return absPath;
}

class OSS {
  private rootDir: string;
  private initPromise: Promise<void>;

  constructor() {
    this.rootDir = getPath("oss");
    // Khởi tạotự động sáng tạo thư mục
    this.initPromise = fs.mkdir(this.rootDir, { recursive: true }).then(() => {});
  }

  /**
   * thư mụcKhởi tạohoàn thành。hàm với lưu chứng tất cảTệpthao tác vụ ở thư mụcđã sáng tạo sau  thực thi。
   * @private
   */
  private async ensureInit() {
    await this.initPromise;
  }

  /**
   * Lấynối đúng đường dẫnTệp của hỏi  URL。
   * @param userRelPath Người dùngtruyền vào  của đúng Tệpđường dẫn（sử dụng  / tác vụ ngăn cách）
   * @returns Tệp của  http tiếp （sách địa phục vụ địa chỉ）
   */
  async getFileUrl(userRelPath: string, prefix?: string): Promise<string> {
    if (!prefix) prefix = "oss";
    await this.ensureInit();
    const safePath = normalizeUserPath(userRelPath);
    // URL ban đầu sử dụng  /，nơi nàyCần dòng thống ngăn cáchchuyển trả  /
    let url = `/${prefix}/`;
    if (process.env.ossURL && process.env.ossURL !== "") url = process.env.ossURL + `/${prefix}/`;
    if (process.env.NODE_ENV == "dev") url = `http://localhost:10588/${prefix}/`;
    if (isEletron()) url = `http://localhost:${process.env.PORT}/${prefix}/`;
    return `${url}${safePath.split(path.sep).join("/")}`;
  }

  /**
   * xuất nối đường dẫn của Tệpnội dung Buffer。
   * @param userRelPath Người dùngtruyền vào  của đúng Tệpđường dẫn（sử dụng  / tác vụ ngăn cách）
   * @returns Tệpnội dung của  Buffer
   * @throws đường dẫnkhông ở  OSS thư mụctrong 、Tệp không tồn tạilỗi
   */
  async getFile(userRelPath: string): Promise<Buffer> {
    await this.ensureInit();
    return fs.readFile(resolveSafeLocalPath(userRelPath, this.rootDir));
  }

  /**
   * xuất Hình ảnhTệpnhất chuyển đổi  base64 chỉnh mã  của  Data URL。
   * @param userRelPath Người dùngtruyền vào  của đúng Tệpđường dẫn（sử dụng  / tác vụ ngăn cách）
   * @returns base64 chỉnh mã  của  Data URL (lệ như : data:image/png;base64,iVBORw0KGgo...)
   * @throws đường dẫnkhông ở  OSS thư mụctrong 、Tệp không tồn tại、không là Hình ảnhTệplỗi
   */
  async getImageBase64(userRelPath: string): Promise<string> {
    await this.ensureInit();
    const absPath = resolveSafeLocalPath(userRelPath, this.rootDir);

    // kiểm tra Tệplà không lưu ở và Tệp
    const stat = await fs.stat(absPath);
    if (!stat.isFile()) {
      throw new Error(`${userRelPath} không là Tệp`);
    }

    // LấyTệptên nhất nối  MIME loại
    const ext = path.extname(userRelPath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".tiff": "image/tiff",
      ".tif": "image/tiff",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
    };

    const mimeType = mimeTypes[ext];
    if (!mimeType) {
      throw new Error(`không hỗ trợ của Hình ảnhđịnh dạng: ${ext}。hỗ trợ của định dạng: ${Object.keys(mimeTypes).join(", ")}`);
    }

    // xuất Tệpnhất chuyển đổi  base64
    const data = await fs.readFile(absPath);
    const base64 = data.toString("base64");
    // Trả vềchỉnh  của  Data URL
    return `data:${mimeType};base64,${base64}`;
  }
  /**
   * Xóanối đường dẫn của Tệp。
   * @param userRelPath Người dùngtruyền vào  của đúng Tệpđường dẫn（sử dụng  / tác vụ ngăn cách）
   * @throws đường dẫnkhông ở  OSS thư mụctrong 、Tệp không tồn tạilỗi
   */
  async deleteFile(userRelPath: string): Promise<void> {
    await this.ensureInit();
    await fs.unlink(resolveSafeLocalPath(userRelPath, this.rootDir));
  }

  /**
   * Xóanối đường dẫn của thư mục tệp tất cảnội dung。
   * @param userRelPath Người dùngtruyền vào  của đúng thư mục tệp đường dẫn（sử dụng  / tác vụ ngăn cách）
   * @throws đường dẫnkhông ở  OSS thư mụctrong 、thư mục tệp không tồn tại、mục biểu là Tệpphi thư mục tệp lỗi
   */
  async deleteDirectory(userRelPath: string): Promise<void> {
    await this.ensureInit();
    const absPath = resolveSafeLocalPath(userRelPath, this.rootDir);
    const stat = await fs.stat(absPath);
    if (!stat.isDirectory()) {
      throw new Error(`${userRelPath} không là thư mục tệp `);
    }
    await fs.rm(absPath, { recursive: true, force: true });
  }

  /**
   * Dữ liệuvào nối đường dẫn của mới  Tệphoặc đã có Tệp。
   * vào trước  tự động sáng tạo nơi cần  của thư mục tệp 。
   * @param userRelPath Người dùngtruyền vào  của đúng Tệpđường dẫn（sử dụng  / tác vụ ngăn cách）
   * @param data cần  vào  của Dữ liệu， Buffer hoặc chuỗi ký tự
   * @throws đường dẫnkhông ở  OSS thư mụctrong lỗi
   */
  async writeFile(userRelPath: string, data: Buffer | string): Promise<void> {
    await this.ensureInit();
    const absPath = resolveSafeLocalPath(userRelPath, this.rootDir);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    // Nếu data là  string，video  base64 chỉnh mã ，trước  giải mã vào 
    // tự động đi bỏ thể lưu ở  của  Data URL trước  tố （như  "data:image/png;base64,"）
    const buffer = typeof data === "string" ? Buffer.from(data.replace(/^data:[^;]+;base64,/, ""), "base64") : data;
    await fs.writeFile(absPath, buffer);
  }

  /**
   * kiểm tra nối đường dẫnTệplà không lưu ở 。
   * @param userRelPath Người dùngtruyền vào  của đúng Tệpđường dẫn（sử dụng  / tác vụ ngăn cách）
   * @returns Tệplưu ở Trả về true，Ngược lại false
   */
  async fileExists(userRelPath: string): Promise<boolean> {
    await this.ensureInit();
    try {
      const stat = await fs.stat(resolveSafeLocalPath(userRelPath, this.rootDir));
      return stat.isFile();
    } catch {
      return false;
    }
  }

  /**
   * LấyHình ảnh của nhỏ ảnh  URL（nhất dài không vượt  512px，tỷ nhỏ mở ）。
   * nhỏ ảnh lưuở gốc đường dẫncùng thư mụcdưới  của  smallImage thư mục tệp giữa 。
   * nhỏ ảnh đã lưu ở trực tiếp Trả về URL；không tồn tạicùng bước tạonhất lưusau  Trả vềnhỏ ảnh  URL，
   * Tạo thất bạiTrả vềgốc ảnh  URL。
   * @param userRelPath Người dùngtruyền vào  của đúng Tệpđường dẫn（sử dụng  / tác vụ ngăn cách）
   * @returns nhỏ ảnh  URL（đã lưu ở hoặc Tạo thành công）hoặc gốc ảnh  URL（Tạo thất bại）
   */
  async getSmallImageUrl(userRelPath: string): Promise<string> {
    // Khởi tạo nhỏ ảnh đúng đường dẫn：ở gốc đường dẫn của thư mụctầng cấp trước  Chèn smallImage thư mục
    // lệ như ：123/abc.jpg => smallImage/123/abc.jpg
    // const smallImageRelPath = `smallImage/${userRelPath.replace(/^[/\\]+/, "")}`;

    // if (await this.fileExists(smallImageRelPath)) {
    //   return this.getFileUrl(smallImageRelPath);
    // }

    // // nhỏ ảnh không tồn tại：cùng bước tạo，Tạo thất bạiTrả vềgốc ảnh  URL
    // const originalUrl = await this.getFileUrl(userRelPath);

    // try {
    //   await this.ensureInit();
    //   const srcAbsPath = resolveSafeLocalPath(userRelPath, this.rootDir);
    //   const dstAbsPath = resolveSafeLocalPath(smallImageRelPath, this.rootDir);
    //   await fs.mkdir(path.dirname(dstAbsPath), { recursive: true });
    //   await sharp(srcAbsPath)
    //     .resize(512, 512, { fit: "inside", withoutEnlargement: true })
    //     .toFile(dstAbsPath);
    //   console.info(`[${dstAbsPath}]nhỏ ảnh vào thành công`);
    return (await this.getFileUrl(userRelPath)) + "?size=20";
    // } catch (e) {
    //   // Tạo thất bạiTrả vềgốc ảnh 
    //   console.warn("[OSS] tạonhỏ ảnh thất bại:", e);
    //   return originalUrl;
    // }
  }
}

export default new OSS();
