import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

export default router.post(
  "/",
  validateFields({
    images: z.array(z.string()),
  }),
  async (req, res) => {
    const { images } = req.body;
    try {
      const resText = await u.Ai.Text("universalAi").invoke({
        system:
          'Vui lòng dựa theo dữ liệu hình ảnh dưới đây, trích xuất ra Prompt phong cách vẽ của hình ảnh, dùng để tạo ra các hình ảnh khác có phong cách nhất quán. Yêu cầu mô tả cụ thể, chỉ cần Prompt phong cách vẽ, không cần nội dung nào khác. Ví dụ: `(phong cách vẽ: hoạt hình 2D, 2d animation style)`, `(phong cách vẽ: chân dung siêu thực, photorealistic, lifelike, ultra detailed)`, `(phong cách vẽ: hoạt hình 3D phong cách Trung Hoa, Chinese 3D animation style)`. Nếu không thể mô tả được phong cách của hình ảnh, trả về `không thể mô tả`. Khi có nhiều hình ảnh, chỉ xuất ra một Prompt phong cách vẽ duy nhất, yêu cầu bao quát được phong cách chung của tất cả hình ảnh. Định dạng đầu ra bắt buộc phải tuân theo đúng ví dụ ở trên: bắt buộc phải chứa cụm từ "phong cách vẽ", và toàn bộ nội dung bắt buộc phải được đặt trong dấu ngoặc đơn; bên trong dấu ngoặc đơn bắt buộc phải có cả mô tả bằng tiếng Việt và mô tả tương ứng bằng tiếng Anh, ngăn cách nhau bằng dấu phẩy. Toàn bộ kết quả chỉ được gói gọn trong một Prompt duy nhất.',
        messages: [
          {
            role: "user",
            content: [
              ...images.map((image: string) => ({
                type: "image" as const,
                image,
              })),
            ],
          },
        ],
      });
      res.status(200).send(success(resText.text));
    } catch (e) {
      const err = u.error(e);
      res.status(500).send({ message: err.message });
    }
  },
);
