import fs from "fs";
import path from "path";
import getPath from "./getPath";

/**
 * truyền vào một nối đường dẫntham số（phong cáchtên），một nối Tệptên ，LấyTệpnhất Trả vềnội dung
 * @param styleName - phong cáchthư mụctên ，lệ như  "chinese_sweet_romance"
 * @param fileName  - mục biểu Tệptên （không  .md sau  tố ），lệ như  "art_character"、"prefix"
 * @returns Tệpnội dungchuỗi ký tự，không tìm thấyTrả vềrỗng chuỗi ký tự
 */
export function getArtPrompt(styleName: string, source: string, fileName: string): string {
  const baseDir = getPath(["skills", source, styleName]);

  if (!fs.existsSync(baseDir)) {
    return "";
  }

  // Lấy prefix.md nội dung
  const prefixFile = findFileRecursive(baseDir, "prefix.md");
  const prefixContent = prefixFile ? fs.readFileSync(prefixFile, "utf-8") : "";

  const target = fileName.endsWith(".md") ? fileName : `${fileName}.md`;
  const found = findFileRecursive(baseDir, target);

  if (!found) {
    return prefixContent;
  }

  const fileContent = fs.readFileSync(found, "utf-8");
  return prefixContent ? `${prefixContent}\n${fileContent}` : fileContent;
}
/**
 * truyền vào phong cáchthư mụctên ，Lấyphong cáchdưới tất cả .md Tệpnội dung，theo Tệptên Trả về
 * @param styleName - phong cáchthư mụctên ，lệ như  "chinese_sweet_romance"
 * @returns Record<Tệptên (không sau  tố ), Tệpnội dung>
 */
export function getAllArtPrompts(styleName: string, source: string): Record<string, string> {
  const baseDir = getPath(["skills", source, styleName]);

  if (!fs.existsSync(baseDir)) {
    return {};
  }

  const result: Record<string, string> = {};
  collectMdFiles(baseDir, result);
  return result;
}

/**
 * tra nối Tệptên  của Tệp，Trả vềThứ một khớp của chỉnh đường dẫn
 */
function findFileRecursive(dir: string, targetName: string): string | null {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isFile() && entry.name === targetName) {
      return fullPath;
    }

    if (entry.isDirectory()) {
      const found = findFileRecursive(fullPath, targetName);
      if (found) return found;
    }
  }

  return null;
}

/**
 * nhận tập thư mụcdưới tất cả .md Tệpnội dung
 */
function collectMdFiles(dir: string, result: Record<string, string>): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isFile() && entry.name.endsWith(".md")) {
      const key = entry.name.replace(/\.md$/, "");
      result[key] = fs.readFileSync(fullPath, "utf-8");
    }

    if (entry.isDirectory()) {
      collectMdFiles(fullPath, result);
    }
  }
}
