import express from "express";
import u from "@/utils";
import * as zod from "zod";
import { error, success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();


type ItemType = "characters" | "props" | "scenes";

// Trau chuốt Prompt
export default router.post(
  "/",
  validateFields({
    assetsId: zod.number(),
    projectId: zod.number(),
    type: zod.string(),
    name: zod.string(),
    describe: zod.string(),
  }),
  async (req, res) => {
    const { assetsId, projectId, type, name, describe } = req.body;
    // Lấy phong cách
    const project = await u.db("o_project").where("id", projectId).select("artStyle", "type", "intro").first();
    // Nếu không tìm thấy dự án tương ứng, trả về lỗi
    if (!project) return res.status(500).send(success({ message: "Dự án không tồn tại" }));

    await u.db("o_assets").where("id", assetsId).update({ promptState: "Đang tạo" });

    // Truy vấn tài nguyên để kiểm tra xem có phải là tài nguyên biến thể hay không
    const assetsData = await u.db("o_assets").where("id", assetsId).select("assetsId").first();
    if (!assetsData) return { code: 500, message: "Tài nguyên không tồn tại" };
    const typeConfig: Record<string, { promptKey: string; itemType: ItemType; label: string; nameLabel: string; visualManual: string }> = {
      role: {
        promptKey: "role-polish",
        itemType: "characters",
        label: "Ảnh tiêu chuẩn 4 góc nhìn nhân vật",
        nameLabel: "Nhân vật",
        visualManual: assetsData.assetsId ? "art_character_derivative" : "art_character",
      },
      scene: {
        promptKey: "scene-polish",
        itemType: "scenes",
        label: "Ảnh bối cảnh",
        nameLabel: "Bối cảnh",
        visualManual: assetsData.assetsId ? "art_scene_derivative" : "art_scene",
      },
      tool: {
        promptKey: "tool-polish",
        itemType: "props",
        label: "Ảnh đạo cụ",
        nameLabel: "Đạo cụ",
        visualManual: assetsData.assetsId ? "art_prop_derivative" : "art_prop",
      },
    };

    const config = typeConfig[type];
    if (!config) return res.status(500).send(error("Loại tài nguyên không được hỗ trợ"));
    if (!config.visualManual) return res.status(500).send(error("Sổ tay hướng dẫn hình ảnh chưa được cấu hình"));
    // Lấy sổ tay hướng dẫn hình ảnh
    const visualManual = await u.getArtPrompt(project.artStyle as string, "art_skills", config.visualManual);
    if (!visualManual) return res.status(500).send(error("Sổ tay hướng dẫn hình ảnh chưa được cấu hình"));
    const systemPrompt = visualManual;
    try {
      const { _output } = (await u.Ai.Text("universalAi").invoke({
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `**Tham số cơ bản:**
      **Thiết lập ${config.nameLabel}:**
      - Tên ${config.nameLabel}: ${name}
      - Mô tả ${config.nameLabel}: ${describe}`,
          },
        ],
      })) as any;

      if (!_output) return res.status(500).send("thất bại");
      await u.db("o_assets").where("id", assetsId).update({ prompt: _output, promptState: "Đã hoàn thành" });

      res.status(200).send(success({ prompt: _output, assetsId }));
    } catch (e: any) {
      await u
        .db("o_assets")
        .where("id", assetsId)
        .update({ promptState: "thất bại", promptErrorReason: u.error(e).message });
      return res.status(500).send(error(e?.data?.error?.message ?? e?.message ?? "Tạo thất bại"));
    }
  },
);
