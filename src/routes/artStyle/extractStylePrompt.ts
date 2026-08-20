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
          'vui lòng Dựa theodưới Hình ảnhDữ liệu，trích xuấtra Hình ảnh của vẽ phong Prompt，hàm với Tạo hình ảnhnối phong cách，cần  cầu và cụ có ,chỉ Cần vẽ phong Prompt，không Cần anh ấynội dung："tỷ như ：`(vẽ phong ：2Dđộng phong cách,2d animation style)`,`(vẽ phong ：cấp thật ngườivượt ,photorealistic, lifelike, ultra detailed)`，`(vẽ phong ：3Dsáng ,Chinese 3D animation style)`,NếuHình ảnhphong cáchkhông thức mô tả，Trả về`không thức mô tả`,nhiều ảnh  Hình ảnh，chỉ xuất ra một hợp  của vẽ phong Prompt，cần  cầu gói tất cảHình ảnh của cùng phong cách，xuất ra định dạngbắt buộc khung theo nhở lệ giữa  của định dạng，bắt buộc gói `vẽ phong `2chữ ，và bắt buộc sử dụng quát số quát ，quát số trong bắt buộc gói giữa tài  và tài  của vẽ phong mô tả，nhất hàm số ngăn cách，tài bộ phần Cần tạo địa đạo  của tài Prompt',
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
