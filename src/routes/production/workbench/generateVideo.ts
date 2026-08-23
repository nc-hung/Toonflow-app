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
    uploadData: z.array(
      z.object({
        id: z.number(),
        sources: z.string(),
      }),
    ),
    prompt: z.string(),
    model: z.string(),
    mode: z.string(),
    resolution: z.string(),
    duration: z.number(),
    audio: z.boolean().optional(),
    trackId: z.number(),
  }),
  async (req, res) => {
    const { scriptId, projectId, prompt, uploadData, model, duration, resolution, audio, mode, trackId } = req.body;
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
    const videoPath = `/${projectId}/video/${uuidv4()}.mp4`; //Videolưuđường dẫn
    let videoId = 0;
    let base64: ({ base64: string; type: string } | null)[] = [];
    let aspectRatio: "16:9" | "9:16" = "16:9";
    try {
      //LấyTạo videotỷ lệ
      const ratio = await u.db("o_project").select("videoRatio").where("id", projectId).first();
      aspectRatio = (ratio?.videoRatio as "16:9" | "9:16") || "16:9";
      //Truy vấnra Hình ảnhDữ liệu
      const images = await Promise.all(
        uploadData.map(async (item: UploadItem) => {
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
      //đem imagesmặt  của Hình ảnhchuyển tạo base64định dạng
      base64 = await Promise.all(
        images.map(async (item) => {
          if (!item) return null;
          return { base64: await u.oss.getImageBase64(item.path), type: item.sources == "audio" ? "audio" : "image" };
        }),
      );
      //thêm mới
      [videoId] = await u.db("o_video").insert({
        filePath: videoPath,
        time: Date.now(),
        state: "Đang tạo",
        scriptId,
        projectId,
        videoTrackId: trackId,
      });
    } catch (err: any) {
      // Lỗi trước khi phản hồi: báo lỗi ngay thay vì để request treo
      if (!res.headersSent) res.status(500).send(error(u.error(err).message || "Khởi tạo video thất bại"));
      return;
    }
    res.status(200).send(success(videoId));
    const relatedObjects = {
      projectId,
      videoId,
      scriptId,
      type: "Video",
    };
    const aiVideo = u.Ai.Video(model);
    aiVideo
      .run(
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
      )
      .then(async () => await aiVideo.save(videoPath))
      .then(async () => await u.db("o_video").where("id", videoId).update({ state: "Tạo thành công" }))
      .catch(async (error: any) => {
        // Chuỗi chạy nền đã tách rời: nếu lần update ghi nhận thất bại này ném lỗi mà không bắt,
        // sẽ thành unhandledRejection và bản ghi kẹt ở "Đang tạo".
        try {
          await u
            .db("o_video")
            .where("id", videoId)
            .update({
              state: "Tạo thất bại",
              errorReason: u.error(error).message,
            });
        } catch (updateErr) {
          console.error("Không thể cập nhật trạng thái video thất bại:", updateErr);
        }
      });
  },
);
