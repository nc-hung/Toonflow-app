import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

export default router.post(
  "/",
  validateFields({
    content: z.string(),
  }),
  async (req, res) => {
    const { content } = req.body;
    const systemPrompt = `bạnlà một chính bản gthức Chuyên gia。Người dùngsẽ nhắc nhà 1 đoạn Kịch bản văn bản  ，bạnCần phần tích giữa  của tập /chươngngăn cáchmô thức ，Trả vềmột JavaScriptchính bản gthức chuỗi ký tự。

cần  cầu ：
1. chính bắt buộc gói 2mục lấy nhóm ：Thứ một lấy nhóm khớptập số /chươngchỉnh số （số chữ hoặc giữa tài số chữ ），Thứ 2mục lấy nhóm khớptập  của biểu đề /tên（scriptName）。
2. Trả vềđịnh dạng là  /chính bản gthức /g，lệ như ：/Thứ \s*([0-91 2345678910trăm nghìnvạn]+)\s*tập \s*([^\n\r]*)/g
3. chỉ Trả vềchính bản gthức chuỗi ký tựsách ，không cần  có anh ấygiải tài chữ hoặc markdownđịnh dạng。
4. Nếuvăn bản  giữa chưa có dẫn  của chươngngăn cáchmô thức ，Trả vềrỗng chuỗi ký tự。`;

    const resText = await u.Ai.Text("universalAi").invoke({
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: content.slice(0, 2000),
        },
      ],
    });
    const result = (resText.text || "").trim();
    res.status(200).send(success(result));
  },
);
