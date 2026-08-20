import express from "express";
import u from "@/utils";
import * as zod from "zod";
import { error, success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();


type ItemType = "characters" | "props" | "scenes";

//trau chuốtPrompt
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
    //Lấyphong cách
    const project = await u.db("o_project").where("id", projectId).select("artStyle", "type", "intro").first();
    //Nếuchưa có đến đúng hồi  của Dự án，Trả vềlỗi
    if (!project) return res.status(500).send(success({ message: "Dự ánrỗng " }));

    await u.db("o_assets").where("id", assetsId).update({ promptState: "Đang tạo" });

    //Truy vấnTài nguyênlà không là Biến thể tài nguyên
    const assetsData = await u.db("o_assets").where("id", assetsId).select("assetsId").first();
    if (!assetsData) return { code: 500, message: "Tài nguyênkhông tồn tại" };
    const typeConfig: Record<string, { promptKey: string; itemType: ItemType; label: string; nameLabel: string; visualManual: string }> = {
      role: {
        promptKey: "role-polish",
        itemType: "characters",
        label: "Nhân vậtTiêu chuẩn4video ảnh ",
        nameLabel: "Nhân vật",
        visualManual: assetsData.assetsId ? "art_character_derivative" : "art_character",
      },
      scene: {
        promptKey: "scene-polish",
        itemType: "scenes",
        label: "Bối cảnhảnh ",
        nameLabel: "Bối cảnh",
        visualManual: assetsData.assetsId ? "art_scene_derivative" : "art_scene",
      },
      tool: {
        promptKey: "tool-polish",
        itemType: "props",
        label: "Đạo cụảnh ",
        nameLabel: "Đạo cụ",
        visualManual: assetsData.assetsId ? "art_prop_derivative" : "art_prop",
      },
    };

    const config = typeConfig[type];
    if (!config) return res.status(500).send(error("không hỗ trợ của loại"));
    if (!config.visualManual) return res.status(500).send(error("trực quansổ taychưa nối nghĩa "));
    //Lấyđến trực quansổ tay
    const visualManual = await u.getArtPrompt(project.artStyle as string, "art_skills", config.visualManual);
    if (!visualManual) return res.status(500).send(error("trực quansổ taychưa nối nghĩa "));
    const systemPrompt = visualManual;
    try {
      const { _output } = (await u.Ai.Text("universalAi").invoke({
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `**cơ sở tham số：**
      **${config.nameLabel}thiết nối ：**
      - ${config.nameLabel}tên:${name},
      - ${config.nameLabel}mô tả:${describe},`,
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
