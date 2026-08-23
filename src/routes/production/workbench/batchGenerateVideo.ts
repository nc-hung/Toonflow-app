import express from "express";
import u from "@/utils";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { ReferenceList } from "@/utils/ai";
const router = express.Router();

type Type = "imageReference" | "startImage" | "endImage" | "videoReference" | "audioReference";
interface UploadItem {
  fileType: "image" | "video" | "audio";
  type: Type;
  sources?: "assets" | "storyboard";
  id?: number;
  src?: string;
  label?: string;
  prompt?: string;
}

export default router.post(
  "/",
  validateFields({
    projectId: z.number(),
    scriptId: z.number(),
    trackData: z.array(
      z.object({
        uploadData: z.array(
          z.object({
            id: z.number(),
            sources: z.string(),
          }),
        ),
        trackId: z.number(),
        prompt: z.string(),
        duration: z.number(),
      }),
    ),
    model: z.string(),
    mode: z.string(),
    resolution: z.string(),
    audio: z.boolean().optional(),
  }),
  async (req, res) => {
    const { scriptId, projectId, trackData, model, resolution, audio, mode } = req.body;

    let modeData = [];
    if (Array.isArray(mode)) {
    } else if (typeof mode === "string" && mode.startsWith('["') && mode.endsWith('"]')) {
      try {
        modeData = JSON.parse(mode);
      } catch (e) {}
    }

    if (!model || !model.trim()) {
      res.status(400).send({ code: 400, msg: "Vui lòng chọn Mô hình Video trên thanh công cụ trước khi tạo video." });
      return;
    }

    let tasks: { videoId: number; videoPath: string; prompt: string; duration: number; images: any[]; trackId: number }[] = [];
    let aspectRatio: "16:9" | "9:16" = "16:9";
    try {
      // LấyTạo videotỷ lệ
      const ratio = await u.db("o_project").select("videoRatio").where("id", projectId).first();
      aspectRatio = (ratio?.videoRatio as "16:9" | "9:16") || "16:9";

      // mục  track Xử lýDữ liệunhất ChènCơ sở dữ liệu，Trả vềtác vụ danh sách
      tasks = await Promise.all(
        (trackData as { uploadData: { id: number; sources: string }[]; trackId: number; prompt: string; duration: number }[]).map(async (track) => {
          const { uploadData, trackId, prompt, duration } = track;

          // Truy vấnra Hình ảnhDữ liệu
          const images = await Promise.all(
            uploadData.map(async (item) => {
              if (item.sources === "storyboard") {
                const filePath = await u.db("o_storyboard").where("id", item.id).select("filePath").first();
                return { path: filePath?.filePath, sources: "storyBoard" };
              }
              if (item.sources === "assets") {
                const filePath = await u
                  .db("o_assets")
                  .where("o_assets.id", item.id)
                  .leftJoin("o_image", "o_assets.imageId", "o_image.id")
                  .select("o_image.filePath", "o_image.type")
                  .first();
                return { path: filePath?.filePath, sources: filePath?.type };
              }
            }),
          );

          const videoPath = `/${projectId}/video/${uuidv4()}.mp4`;
          const [videoId] = await u.db("o_video").insert({
            filePath: videoPath,
            time: Date.now(),
            state: "Đang tạo",
            scriptId,
            projectId,
            videoTrackId: trackId,
          });

          return { videoId, videoPath, prompt, duration, images, trackId };
        }),
      );
    } catch (err: any) {
      // Lỗi trước khi phản hồi: báo lỗi ngay thay vì để request treo
      if (!res.headersSent) res.status(500).send(error(u.error(err).message || "Khởi tạo video thất bại"));
      return;
    }

    res.status(200).send(success(tasks.map((t) => ({ videoId: t.videoId, trackId: t.trackId }))));

    // Chạy nền có giới hạn đồng thời để tránh gọi API video ồ ạt
    const CONCURRENCY = 3;
    const queue = [...tasks];
    const runOne = async (task: (typeof tasks)[number]) => {
      const { videoId, videoPath, prompt, duration, images } = task;
      try {
        const base64 = await Promise.all(
          images.map(async (item: any) => {
            if (!item) return null;
            return { base64: await u.oss.getImageBase64(item.path), type: item.sources == "audio" ? "audio" : "image" };
          }),
        );
        const relatedObjects = { projectId, videoId, scriptId, type: "Video" };
        const aiVideo = u.Ai.Video(model);
        await aiVideo.run(
          {
            prompt,
            referenceList: base64.filter(Boolean) as ReferenceList[],
            mode: modeData.length > 0 ? modeData : mode,
            duration,
            aspectRatio,
            resolution,
            audio,
          },
          {
            projectId,
            taskClass: "Videotạo",
            describe: "Dựa theoPromptTạo video",
            relatedObjects: JSON.stringify(relatedObjects),
          },
        );
        await aiVideo.save(videoPath);
        await u.db("o_video").where("id", videoId).update({ state: "Tạo thành công" });
      } catch (err: any) {
        // Ghi nhận thất bại phải chống lỗi: nếu chính lần update này ném lỗi mà không bắt,
        // runOne sẽ reject, worker thoát khỏi vòng lặp và bỏ lại các tác vụ còn trong hàng đợi ở "Đang tạo".
        try {
          await u.db("o_video").where("id", videoId).update({ state: "Tạo thất bại", errorReason: u.error(err).message });
        } catch (updateErr) {
          console.error("Không thể cập nhật trạng thái video thất bại:", updateErr);
        }
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
        while (queue.length) {
          const task = queue.shift();
          if (!task) break;
          await runOne(task);
        }
      }),
    );
  },
);
