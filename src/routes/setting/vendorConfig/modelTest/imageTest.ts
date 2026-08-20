import express from "express";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import u from "@/utils";
import { z } from "zod";
import { tool, jsonSchema } from "ai";
const router = express.Router();

// Kiểm tra mô hình ngôn ngữ
export default router.post(
  "/",
  validateFields({
    modelName: z.string(),
    id: z.string(),
    imageBase64: z.string().optional(),
    prompt: z.string(),
  }),
  async (req, res) => {
    const { modelName, imageBase64, id, prompt } = req.body;

    try {
      const vendorConfigData = await u.db("o_vendorConfig").where("id", id).first();

      if (!vendorConfigData) return res.status(500).send(error("Không tìm thấy cấu hình nhà cung cấp này"));
      if (!vendorConfigData.models) return res.status(500).send(error("Không tìm thấy danh sách mô hình"));

      const reqFn = await u.Ai.Image(`${id}:${modelName}`).run({
        prompt: prompt,
        referenceList: imageBase64 ? [{ type: "image", base64: imageBase64 }] : [], //Prompt hình ảnh đầu vào
        size: "1K", // Kích thước hình ảnh
        aspectRatio: "16:9",
      });
      await reqFn.save("testImage.jpg");
      const resultUrl = await u.oss.getFileUrl("testImage.jpg");
      res.status(200).send(success(resultUrl));
    } catch (err) {
      console.error(err);
      const msg = u.error(err).message;
      console.error(msg);
      res.status(500).send(error(msg));
    }
  },
);
