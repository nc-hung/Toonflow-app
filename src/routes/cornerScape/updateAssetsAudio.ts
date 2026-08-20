import express from "express";
import u from "@/utils";
import { z } from "zod";
import { error, success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

// Thêm tài nguyên mới 
export default router.post(
  "/",
  validateFields({
    assetsId: z.number(),
    audioIds: z.array(z.number()).optional(),
  }),
  async (req, res) => {
    const { assetsId, audioIds } = req.body;
    if (audioIds && audioIds.length > 1) return res.status(400).send(error("chỉ ghép nốimột giọng đọc"));
    await u.db("o_assetsRole2Audio").where("assetsRoleId", assetsId).delete();
    if (audioIds && audioIds.length) {
      await u.db("o_assetsRole2Audio").insert({ assetsRoleId: assetsId, assetsAudioId: audioIds[0] });
    }
    res.status(200).send(success({ message: "Cập nhậtÂm thanhthành công" }));
  },
);
