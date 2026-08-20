import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

// Xóa dự án
export default router.post(
  "/",
  validateFields({
    id: z.number(),
  }),
  async (req, res) => {
    const { id } = req.body;
    //Xóa dự án
    await u.db("o_project").where("id", id).delete();
    await u.db("o_agentWorkData").where("projectId", id).delete();
    //Xóa dự ándưới  của gốc tài 
    await u.db("o_novel").where("projectId", id).delete();
    // Xóa dự ándưới  của Kịch bản thông tin
    const scriptData = await u.db("o_script").where("projectId", id).select("id");
    const scriptIds = scriptData.map((item: any) => item.id);
    if (scriptIds && scriptIds.length > 0) {
      await u.db("o_scriptAssets").whereIn("scriptId", scriptIds).delete();
    }
    await u.db("o_script").where("projectId", id).delete();
    // Xóa dự ándưới  của tác vụ 
    await u.db("o_tasks").where("projectId", id).delete();
    // Xóa dự ándưới  của Phân cảnh
    const storyboardData = await u.db("o_storyboard").where("projectId", id).select("id");
    const storyboardIds = storyboardData.map((item: any) => item.id);
    if (storyboardIds.length > 0) {
      await u.db("o_assets2Storyboard").whereIn("storyboardId", storyboardIds).delete();
    }
    await u.db("o_storyboard").where("projectId", id).delete();
    //XóaCần Xóa tài nguyên của biệt Hình ảnh
    const assetsData = await u.db("o_assets").where("projectId", id).select("id");
    const assetsIds = assetsData.map((item: any) => item.id);
    if (assetsIds && assetsIds.length > 0) {
      // trước   o_assets.imageId trí rỗng ，giải bỏ đúng  o_image  của ngoài hàm 
      await u.db("o_assets").whereIn("id", assetsIds).update({ imageId: null });
      await u.db("o_image").whereIn("assetsId", assetsIds).delete();
    }
    // Xóa dự ándưới  của Tài nguyên
    await u.db("o_assets").where("projectId", id).delete();
    //Xóa dự ándưới  của Videođạo  và Video
    await u.db("o_videoTrack").where("projectId", id).delete();
    await u.db("o_video").where("projectId", id).delete();
    //Xóa dự ándưới  của tài nguồn 

    await u.db("memories").where("isolationKey", "like", `${id}:%`).delete();

    try {
      await u.oss.deleteDirectory(`${id}/`);
      console.log(`Dự án ${id}  của OSSthư mục tệp Xóa thành công`);
    } catch (error: any) {
      console.log(`Dự án ${id} chưa có đúng hồi  của OSSthư mục tệp ，Xóa`);
    }

    res.status(200).send(success({ message: "Xóa dự án thành công" }));
  },
);
