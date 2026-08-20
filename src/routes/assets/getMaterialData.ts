import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

// Lấy hình ảnh đã tạo
export default router.post(
  "/",
  validateFields({
    projectId: z.number(),
    scriptId: z.number().optional(),
  }),
  async (req, res) => {
    const { projectId, scriptId } = req.body;
    const list = await u
      .db("o_assets")
      .leftJoin("o_image", "o_assets.id", "=", "o_image.assetsId")
      .where("o_assets.type", "clip")
      .andWhere("o_assets.projectId", projectId)
      .select("*");
    const data = await Promise.all(
      list.map(async (item) => ({
        ...item,
        filePath: item.filePath ? await u.oss.getFileUrl(item.filePath) : "",
      })),
    );
    // Lấy video kết thúc cục bộ và chèn vào data
    const ending = await u.oss.getFileUrl("/ending.mp4", "assets");
    data.push({
      id: 0,
      name: "Video kết thúc Toonflow",
      filePath: ending,
      type: "clip",
    });
    // Truy vấn track video
    const trackRows = await u
      .db("o_videoTrack")
      .where("o_videoTrack.scriptId", scriptId)
      .andWhere("o_videoTrack.projectId", projectId)
      .select("o_videoTrack.id as trackId","o_videoTrack.videoId");
    // Xử lý video theo từng nhóm track
    const video = await Promise.all(
      trackRows.map(async (track) => {
        const videoItems = await u.db("o_video").where("o_video.videoTrackId", track.trackId).andWhere("o_video.state", "Tạo thành công").select("*");
        const videoList = await Promise.all(
          videoItems.map(async (v) => ({
            id: v.id,
            filePath: v.filePath ? await u.oss.getFileUrl(v.filePath) : "",
            videoTrackId: v.videoTrackId,
          })),
        );
        return {
          id: track.trackId,
          videoId: track.videoId,
          video: videoList,
        };
      }),
    ).then((tracks) => tracks.filter((track) => track.video.length > 0));

    res.status(200).send(success({ data, video }));
  },
);
