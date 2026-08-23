import express from "express";
import u from "@/utils";
import { z } from "zod";
import { error } from "@/lib/responseFormat";
import compressing from "compressing";
import path from "node:path";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

// Chuẩn hóa tên tệp/thư mục trong gói zip: loại ký tự nguy hiểm, tránh path traversal
function safeName(name: string | null | undefined, fallback: string): string {
  const cleaned = (name ?? "")
    .replace(/[\/\\]+/g, "_") // bỏ dấu phân cách đường dẫn
    .replace(/[\x00-\x1f<>:"|?*]+/g, "") // ký tự không hợp lệ trên hệ tệp
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

// Ánh xạ loại tài nguyên -> thư mục tiếng Việt trong gói xuất
const ASSET_DIR: Record<string, string> = {
  role: "nhan-vat", // nhân vật
  scene: "boi-canh", // bối cảnh
  tool: "dao-cu", // đạo cụ
  audio: "giong-noi", // giọng đọc
};

// Xuất toàn bộ tài nguyên của một dự án: kịch bản, hình ảnh nhân vật/bối cảnh/đạo cụ,
// phân cảnh (storyboard), video, tiểu thuyết gốc và tệp mô tả project.json -> đóng gói zip
export default router.post(
  "/",
  validateFields({
    projectId: z.number(),
  }),
  async (req, res) => {
    const { projectId } = req.body;
    try {
      // 1) Metadata dự án
      const project = await u.db("o_project").where("id", projectId).first();
      if (!project) {
        res.status(404).send(error("Không tìm thấy dự án"));
        return;
      }

      // 2) Kịch bản
      const scripts = await u
        .db("o_script")
        .where("projectId", projectId)
        .select("id", "name", "content", "createTime");

      // 3) Tài nguyên (nhân vật/bối cảnh/đạo cụ/giọng) kèm đường dẫn tệp ảnh
      const assets = await u
        .db("o_assets")
        .leftJoin("o_image", "o_assets.imageId", "o_image.id")
        .where("o_assets.projectId", projectId)
        .select(
          "o_assets.id",
          "o_assets.name",
          "o_assets.type",
          "o_assets.describe",
          "o_assets.prompt",
          "o_image.filePath",
        );

      // 4) Phân cảnh (storyboard)
      const storyboards = await u
        .db("o_storyboard")
        .where("projectId", projectId)
        .select("id", "index", "filePath", "prompt", "videoDesc", "scriptId");

      // 5) Video
      const videos = await u
        .db("o_video")
        .where("projectId", projectId)
        .select("id", "filePath", "state", "time", "scriptId");

      // 6) Tiểu thuyết gốc
      const novels = await u
        .db("o_novel")
        .where("projectId", projectId)
        .select("id", "chapter", "chapterData", "reel", "chapterIndex");

      const zipStream = new compressing.zip.Stream();
      const missing: string[] = []; // tệp có trong DB nhưng không đọc được trên đĩa
      const used = new Set<string>(); // chống trùng tên trong cùng thư mục

      // Sinh đường dẫn tương đối duy nhất trong zip
      const uniquePath = (dir: string, base: string, ext: string): string => {
        let rel = `${dir}/${base}${ext}`;
        let i = 1;
        while (used.has(rel)) rel = `${dir}/${base}-${i++}${ext}`;
        used.add(rel);
        return rel;
      };

      // Đọc 1 tệp từ OSS và thêm vào zip; nếu thiếu thì bỏ qua và ghi nhận
      const addOssFile = async (
        filePath: string | null | undefined,
        dir: string,
        baseName: string,
      ): Promise<string | null> => {
        if (!filePath) return null;
        try {
          const buf = await u.oss.getFile(filePath);
          const ext = path.extname(filePath) || "";
          const rel = uniquePath(dir, baseName, ext);
          zipStream.addEntry(buf, { relativePath: rel });
          return rel;
        } catch (e) {
          missing.push(filePath);
          return null;
        }
      };

      // --- Kịch bản -> tệp .txt ---
      const scriptManifest = scripts.map((s) => {
        const rel = uniquePath("kich-ban", safeName(s.name, `kich-ban-${s.id}`), ".txt");
        zipStream.addEntry(Buffer.from(s.content ?? "", "utf8"), { relativePath: rel });
        return { id: s.id, name: s.name, file: rel };
      });

      // --- Tài nguyên hình ảnh (nhân vật, bối cảnh, đạo cụ, giọng) ---
      const assetManifest: Array<Record<string, any>> = [];
      for (const a of assets) {
        const dir = ASSET_DIR[a.type as string] || "tai-nguyen-khac";
        const file = await addOssFile(a.filePath, dir, safeName(a.name, `${a.type || "asset"}-${a.id}`));
        assetManifest.push({ id: a.id, name: a.name, type: a.type, prompt: a.prompt, describe: a.describe, file });
      }

      // --- Phân cảnh (storyboard) ---
      const storyboardManifest: Array<Record<string, any>> = [];
      for (const sb of storyboards) {
        const base = safeName(sb.index != null ? `phan-canh-${sb.index}` : `phan-canh-${sb.id}`, `phan-canh-${sb.id}`);
        const file = await addOssFile(sb.filePath, "phan-canh", base);
        storyboardManifest.push({ id: sb.id, index: sb.index, prompt: sb.prompt, videoDesc: sb.videoDesc, file });
      }

      // --- Video ---
      const videoManifest: Array<Record<string, any>> = [];
      for (const v of videos) {
        const file = await addOssFile(v.filePath, "video", `video-${v.id}`);
        videoManifest.push({ id: v.id, state: v.state, time: v.time, file });
      }

      // --- project.json: tệp kê khai toàn bộ nội dung gói xuất ---
      const manifest = {
        exportTime: Date.now(),
        project,
        counts: {
          scripts: scriptManifest.length,
          assets: assetManifest.length,
          storyboards: storyboardManifest.length,
          videos: videoManifest.length,
          novels: novels.length,
        },
        scripts: scriptManifest,
        assets: assetManifest,
        storyboards: storyboardManifest,
        videos: videoManifest,
        novels,
        missingFiles: missing, // tệp được tham chiếu trong DB nhưng không tồn tại trên đĩa
      };
      zipStream.addEntry(Buffer.from(JSON.stringify(manifest, null, 2), "utf8"), { relativePath: "project.json" });

      // --- Tên tệp tải về (ASCII an toàn + filename* UTF-8 cho tên tiếng Việt) ---
      const slug = safeName(project.name, `project-${projectId}`).replace(/\s+/g, "-");
      const asciiName = `toonflow-project-${projectId}.zip`;
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(`${slug}.zip`)}`,
      );
      zipStream.pipe(res);
    } catch (err: any) {
      // Chỉ trả lỗi JSON khi chưa bắt đầu stream zip (headers chưa gửi)
      if (!res.headersSent) {
        res.status(500).send(error(u.error(err).message || "Xuất tài nguyên thất bại"));
      } else {
        res.destroy();
      }
    }
  },
);
