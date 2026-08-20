import express from "express";
import u from "@/utils";
import fs from "node:fs/promises";
import { z } from "zod";
import { error, success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

// Xóađạo diễnsổ tay
export default router.post(
  "/",
  validateFields({
    name: z.string(),
  }),
  async (req, res) => {
    try {
      const { name } = req.body as { name: string };

      // an toàn đối chiếu ：không gói đường dẫnngăn cách、thuần số chữ ，cấp Xóahoặc xóa Dự ánthư mục
      if (name.includes("/") || name.includes("\\") || name === "." || name === ".." || /^\d+$/.test(name)) {
        res.status(400).send(error("tênkhông thể gói đường dẫnngăn cáchhoặc thuần số chữ "));
        return;
      }

      const artPromptsDir = u.getPath(["skills", "story_skills", name]);

      try {
        const stat = await fs.stat(artPromptsDir);
        if (!stat.isDirectory()) {
          throw new Error(`${artPromptsDir} không là thư mục tệp `);
        }
        await fs.rm(artPromptsDir, { recursive: true, force: true });
      } catch (e) {
        console.error("[Xóatrực quansổ tay] Xóathất bại:", artPromptsDir, e);
      }
      res.status(200).send(success({ message: "Xóa thành công" }));
    } catch (err) {
      res.status(500).send(error(u.error(err).message || "Xóathất bại"));
    }
  },
);
