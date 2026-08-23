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
    const systemPrompt = `Bạn là một chuyên gia về biểu thức chính quy (regex). Người dùng sẽ cung cấp một đoạn văn bản kịch bản, bạn cần phân tích mẫu phân tách tập/chương có trong đó, rồi trả về một chuỗi biểu thức chính quy (regex) JavaScript.

Yêu cầu:
1. Biểu thức chính quy bắt buộc phải chứa 2 nhóm bắt (capture group): nhóm bắt thứ nhất khớp với số tập/số chương (chữ số hoặc số viết bằng chữ), nhóm bắt thứ hai khớp với tiêu đề/tên của tập (scriptName).
2. Trả về ở định dạng /regex/g, ví dụ: /Chương\s*([0-9]+)\s*[:：]?\s*([^\n\r]*)/g
3. Chỉ trả về chuỗi biểu thức chính quy, không cần kèm lời giải thích hay định dạng markdown.
4. Nếu trong văn bản không phát hiện được mẫu phân tách chương/tập nào, trả về chuỗi rỗng.`;

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
