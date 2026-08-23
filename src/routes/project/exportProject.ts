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

// In JSON dễ đọc; nếu là chuỗi JSON thì parse rồi format lại, không thì trả nguyên văn
function prettyJson(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

// Xuất toàn bộ tài nguyên của một dự án thành gói .zip:
//   kich-ban/          kịch bản (.txt)
//   nhan-vat|boi-canh|dao-cu|giong-noi/  ảnh nhân vật/bối cảnh/đạo cụ + mô tả (.txt)
//   phan-canh/         ảnh phân cảnh (storyboard) + mô tả (.txt)
//   video/             video (.mp4) + prompt tạo video (.txt)
//   map-flow/          sơ đồ luồng tạo ảnh (o_imageFlow, .json)
//   dao-dien/          hướng dẫn đạo diễn + thông tin dự án (.txt)
//   tieu-thuyet/       nội dung tiểu thuyết gốc theo chương (.txt)
//   project.json       tệp kê khai toàn bộ nội dung gói xuất
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
        .select("id", "name", "content", "extractState", "errorReason", "createTime");

      // 3) Tài nguyên (nhân vật/bối cảnh/đạo cụ/giọng)
      const assets = await u
        .db("o_assets")
        .where("projectId", projectId)
        .select("id", "name", "type", "describe", "prompt", "remark", "imageId", "flowId", "audioBindState", "promptState");

      // Ảnh của tài nguyên: ưu tiên ảnh đang chọn (imageId); nếu ảnh đó lỗi/không có
      // tệp thì lấy tạm bất kỳ ảnh nào đã hoàn thành cùng assetsId (fallback bền vững)
      const imageIds = assets.map((a) => a.imageId).filter((x): x is number => x != null);
      const primaryImages = imageIds.length
        ? await u.db("o_image").whereIn("id", imageIds).select("id", "filePath", "state")
        : [];
      const primaryById = new Map<number, any>();
      for (const im of primaryImages) primaryById.set(im.id as number, im);

      const assetIds = assets.map((a) => a.id).filter((x): x is number => x != null);
      const completedImages = assetIds.length
        ? await u
            .db("o_image")
            .whereIn("assetsId", assetIds)
            .whereNotNull("filePath")
            .select("id", "filePath", "assetsId", "state")
        : [];
      const completedByAsset = new Map<number, any>();
      for (const im of completedImages) {
        const aid = im.assetsId as number;
        if (aid != null && !completedByAsset.has(aid)) completedByAsset.set(aid, im);
      }
      const resolveAssetImage = (a: any): string | null => {
        const primary = a.imageId != null ? primaryById.get(a.imageId) : null;
        if (primary && primary.filePath) return primary.filePath;
        const fb = completedByAsset.get(a.id);
        return fb ? fb.filePath : null;
      };

      // 4) Phân cảnh (storyboard)
      const storyboards = await u
        .db("o_storyboard")
        .where("projectId", projectId)
        .orderBy("index", "asc")
        .select("id", "index", "filePath", "prompt", "videoDesc", "duration", "state", "scriptId", "flowId");

      // 5) Video + prompt tạo video (o_videoTrack)
      const videos = await u
        .db("o_video")
        .where("projectId", projectId)
        .select("id", "filePath", "state", "errorReason", "time", "scriptId", "videoTrackId");
      const videoTracks = await u
        .db("o_videoTrack")
        .where("projectId", projectId)
        .select("id", "prompt", "duration", "state", "reason", "scriptId", "selectVideoId");
      const trackById = new Map<number, any>();
      for (const t of videoTracks) trackById.set(t.id as number, t);

      // 6) Tiểu thuyết gốc
      const novels = await u
        .db("o_novel")
        .where("projectId", projectId)
        .orderBy("chapterIndex", "asc")
        .select("id", "chapter", "chapterData", "reel", "chapterIndex", "event", "eventState");

      // 7) Sơ đồ luồng tạo ảnh (map flow): o_imageFlow không có projectId, liên kết qua
      // flowId của storyboard và tài nguyên. Gom tất cả flowId thuộc dự án rồi tải về.
      const flowLabels = new Map<number, string>();
      for (const sb of storyboards) {
        if (sb.flowId != null && !flowLabels.has(sb.flowId)) {
          flowLabels.set(sb.flowId, safeName(`phan-canh-${sb.index != null ? sb.index : sb.id}`, `flow-${sb.flowId}`));
        }
      }
      for (const a of assets) {
        if (a.flowId != null && !flowLabels.has(a.flowId)) {
          flowLabels.set(a.flowId, safeName(a.name, `${a.type || "asset"}-${a.id}`));
        }
      }
      const flowIds = [...flowLabels.keys()];
      const flows = flowIds.length
        ? await u.db("o_imageFlow").whereIn("id", flowIds).select("id", "flowData")
        : [];

      // LƯU Ý: compressing.zip.Stream tự "chốt" (finalize) gói zip ngay khi hàng đợi
      // entry trống ở một nhịp async. Vì vậy PHẢI đọc hết tệp từ OSS TRƯỚC, gom vào
      // mảng entries, rồi thêm tất cả một lượt (đồng bộ) và pipe. Tuyệt đối không await
      // xen giữa các lần addEntry (nếu không zip chỉ chứa entry đầu tiên).
      const entries: Array<{ path: string; buf: Buffer }> = [];
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

      const addText = (dir: string, base: string, content: string): string => {
        const rel = uniquePath(dir, base, ".txt");
        entries.push({ path: rel, buf: Buffer.from(content ?? "", "utf8") });
        return rel;
      };

      // Đọc 1 tệp từ OSS và gom vào danh sách entries; nếu thiếu thì bỏ qua và ghi nhận
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
          entries.push({ path: rel, buf });
          return rel;
        } catch (e) {
          missing.push(filePath);
          return null;
        }
      };

      // --- Kịch bản -> tệp .txt ---
      const scriptManifest = scripts.map((s) => {
        const rel = uniquePath("kich-ban", safeName(s.name, `kich-ban-${s.id}`), ".txt");
        entries.push({ path: rel, buf: Buffer.from(s.content ?? "", "utf8") });
        return { id: s.id, name: s.name, extractState: s.extractState, file: rel };
      });

      // --- Tài nguyên hình ảnh (nhân vật, bối cảnh, đạo cụ, giọng) + mô tả ---
      const assetManifest: Array<Record<string, any>> = [];
      for (const a of assets) {
        const dir = ASSET_DIR[a.type as string] || "tai-nguyen-khac";
        const base = safeName(a.name, `${a.type || "asset"}-${a.id}`);
        const filePath = resolveAssetImage(a);
        const file = await addOssFile(filePath, dir, base);
        // Ghi mô tả/prompt của tài nguyên thành tệp .txt cạnh ảnh
        const descParts = [
          `Tên: ${a.name ?? ""}`,
          `Loại: ${a.type ?? ""}`,
          a.describe ? `\nMô tả:\n${a.describe}` : "",
          a.prompt ? `\nPrompt:\n${a.prompt}` : "",
          a.remark ? `\nGhi chú:\n${a.remark}` : "",
        ].filter(Boolean);
        const descFile = addText(dir, `${base}-mo-ta`, descParts.join("\n"));
        assetManifest.push({
          id: a.id,
          name: a.name,
          type: a.type,
          prompt: a.prompt,
          describe: a.describe,
          image: file,
          desc: descFile,
        });
      }

      // --- Phân cảnh (storyboard) + mô tả ---
      const storyboardManifest: Array<Record<string, any>> = [];
      for (const sb of storyboards) {
        const idx = sb.index != null ? sb.index : sb.id;
        const base = safeName(`phan-canh-${idx}`, `phan-canh-${sb.id}`);
        const file = await addOssFile(sb.filePath, "phan-canh", base);
        const descParts = [
          `Phân cảnh #${idx}`,
          sb.duration != null ? `Thời lượng: ${sb.duration}s` : "",
          sb.prompt ? `\nPrompt tạo ảnh:\n${sb.prompt}` : "",
          sb.videoDesc ? `\nMô tả video:\n${sb.videoDesc}` : "",
        ].filter(Boolean);
        const descFile = addText("phan-canh", `${base}-mo-ta`, descParts.join("\n"));
        storyboardManifest.push({
          id: sb.id,
          index: sb.index,
          prompt: sb.prompt,
          videoDesc: sb.videoDesc,
          state: sb.state,
          image: file,
          desc: descFile,
        });
      }

      // --- Video (.mp4) + prompt tạo video ---
      const videoManifest: Array<Record<string, any>> = [];
      for (const v of videos) {
        const file = await addOssFile(v.filePath, "video", `video-${v.id}`);
        const track = v.videoTrackId != null ? trackById.get(v.videoTrackId) : null;
        if (track && track.prompt) {
          addText("video", `video-${v.id}-prompt`, track.prompt);
        }
        videoManifest.push({
          id: v.id,
          state: v.state,
          errorReason: v.errorReason,
          time: v.time,
          prompt: track ? track.prompt : null,
          file,
        });
      }
      // Prompt của các track chưa có video khớp (vẫn giữ lại để không mất dữ liệu)
      const matchedTrackIds = new Set<number>(
        videos.map((v) => v.videoTrackId).filter((x): x is number => x != null),
      );
      for (const t of videoTracks) {
        if (!matchedTrackIds.has(t.id as number) && t.prompt) {
          addText("video", `track-${t.id}-prompt`, t.prompt);
        }
      }

      // --- Map flow (sơ đồ luồng tạo ảnh) -> .json ---
      const flowManifest: Array<Record<string, any>> = [];
      for (const f of flows) {
        const label = flowLabels.get(f.id as number) || `flow-${f.id}`;
        const rel = uniquePath("map-flow", safeName(label, `flow-${f.id}`), ".json");
        entries.push({ path: rel, buf: Buffer.from(prettyJson(f.flowData), "utf8") });
        flowManifest.push({ id: f.id, label, file: rel });
      }

      // --- Hướng dẫn đạo diễn + thông tin dự án ---
      const infoLines = [
        `Dự án: ${project.name ?? ""}`,
        project.intro ? `Giới thiệu: ${project.intro}` : "",
        project.artStyle ? `Phong cách: ${project.artStyle}` : "",
        project.videoRatio ? `Tỉ lệ video: ${project.videoRatio}` : "",
        project.imageModel ? `Mô hình ảnh: ${project.imageModel}` : "",
        project.videoModel ? `Mô hình video: ${project.videoModel}` : "",
        project.directorManual ? `\n=== Hướng dẫn đạo diễn ===\n${project.directorManual}` : "",
      ].filter(Boolean);
      const directorFile = addText("dao-dien", "huong-dan-dao-dien", infoLines.join("\n"));

      // --- Tiểu thuyết gốc -> .txt theo chương ---
      const novelManifest: Array<Record<string, any>> = [];
      for (const n of novels) {
        const idx = n.chapterIndex != null ? n.chapterIndex : n.id;
        const base = safeName(n.chapter ? `chuong-${idx}-${n.chapter}` : `chuong-${idx}`, `chuong-${idx}`);
        const body = [
          n.chapter ? `Chương: ${n.chapter}` : "",
          n.reel != null ? `Reel: ${n.reel}` : "",
          n.chapterData ? `\n${n.chapterData}` : "",
        ]
          .filter(Boolean)
          .join("\n");
        const file = body ? addText("tieu-thuyet", base, body) : null;
        novelManifest.push({ id: n.id, chapter: n.chapter, chapterIndex: n.chapterIndex, file });
      }

      // --- README mô tả cấu trúc gói ---
      const readme = [
        `Gói xuất dự án: ${project.name ?? projectId}`,
        "",
        "Cấu trúc thư mục:",
        "  kich-ban/     Kịch bản (.txt)",
        "  nhan-vat/     Ảnh + mô tả nhân vật",
        "  boi-canh/     Ảnh + mô tả bối cảnh",
        "  dao-cu/       Ảnh + mô tả đạo cụ",
        "  giong-noi/    Tài nguyên giọng đọc",
        "  phan-canh/    Ảnh phân cảnh (storyboard) + mô tả",
        "  video/        Video (.mp4) + prompt tạo video",
        "  map-flow/     Sơ đồ luồng tạo ảnh (.json)",
        "  dao-dien/     Hướng dẫn đạo diễn + thông tin dự án",
        "  tieu-thuyet/  Nội dung tiểu thuyết gốc theo chương",
        "  project.json  Bảng kê khai toàn bộ nội dung",
        "",
        "Ghi chú: các tệp thiếu (ảnh/video tạo lỗi) được liệt kê trong project.json > missingFiles.",
      ].join("\n");
      entries.push({ path: "README.txt", buf: Buffer.from(readme, "utf8") });

      // --- project.json: tệp kê khai toàn bộ nội dung gói xuất ---
      const manifest = {
        exportTime: Date.now(),
        project,
        counts: {
          scripts: scriptManifest.length,
          assets: assetManifest.length,
          storyboards: storyboardManifest.length,
          videos: videoManifest.length,
          flows: flowManifest.length,
          novels: novelManifest.length,
        },
        scripts: scriptManifest,
        assets: assetManifest,
        storyboards: storyboardManifest,
        videos: videoManifest,
        flows: flowManifest,
        director: { file: directorFile },
        novels: novelManifest,
        missingFiles: missing, // tệp được tham chiếu trong DB nhưng không tồn tại trên đĩa
      };
      entries.push({ path: "project.json", buf: Buffer.from(JSON.stringify(manifest, null, 2), "utf8") });

      // --- Thêm TẤT CẢ entry một lượt (đồng bộ) rồi pipe: xem lưu ý ở trên ---
      const zipStream = new compressing.zip.Stream();
      for (const e of entries) zipStream.addEntry(e.buf, { relativePath: e.path });

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
