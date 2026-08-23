import express from "express";
import u from "@/utils";
import pLimit from "p-limit";
import * as zod from "zod";
import { error, success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();
interface OutlineItem {
  description: string;
  name: string;
}

interface OutlineData {
  chapterRange: number[];
  characters?: OutlineItem[];
  props?: OutlineItem[];
  scenes?: OutlineItem[];
}

interface NovelChapter {
  id: number;
  reel: string;
  chapter: string;
  chapterData: string;
  projectId: number;
}

type ItemType = "characters" | "props" | "scenes";

// Trau chuốt Prompt
export default router.post(
  "/",
  validateFields({
    items: zod.array(
      zod.object({
        assetsId: zod.number(),
        type: zod.string(),
        name: zod.string(),
        describe: zod.string(),
      }),
    ),
    projectId: zod.number(),
    concurrentCount: zod.number().int().min(1).optional(),
    otherTextPrompt: zod.string(),
  }),
  async (req, res) => {
    const { projectId, items, concurrentCount, otherTextPrompt } = req.body;
    // Lấy phong cách
    const project = await u.db("o_project").where("id", projectId).select("artStyle", "type", "intro").first();
    // Nếu không tìm thấy dự án tương ứng, trả về lỗi
    if (!project) return res.status(500).send(success({ message: "Dự án không tồn tại" }));

    // Tải dữ liệu
    const assetsIds = items.map((item: { assetsId: number }) => item.assetsId);
    // Truy vấn tất cả tài nguyên, đồng thời kiểm tra từng tài nguyên có phải là tài nguyên biến thể hay không
    const assetsDataList = await u.db("o_assets").whereIn("id", assetsIds).select("id", "assetsId");
    if (!assetsDataList || assetsDataList.length === 0) return res.status(500).send(error("Tài nguyên không tồn tại"));
    const assetsDataMap = new Map(assetsDataList.map((a: any) => [a.id, a]));
    // Sau khi tất cả các bước kiểm tra tiền xử lý đều thông qua, cập nhật hàng loạt trạng thái thành "Đang tạo"
    await u.db("o_assets").whereIn("id", assetsIds).update({ promptState: "Đang tạo" });

    const getTypeConfig = (
      isDerivative: boolean,
    ): Record<string, { promptKey: string; itemType: ItemType; label: string; nameLabel: string; visualManual: string }> => ({
      role: {
        promptKey: "role-polish",
        itemType: "characters",
        label: "Ảnh tiêu chuẩn 4 góc nhìn nhân vật",
        nameLabel: "Nhân vật",
        visualManual: isDerivative ? "art_character_derivative" : "art_character",
      },
      scene: {
        promptKey: "scene-polish",
        itemType: "scenes",
        label: "Ảnh bối cảnh",
        nameLabel: "Bối cảnh",
        visualManual: isDerivative ? "art_scene_derivative" : "art_scene",
      },
      tool: {
        promptKey: "tool-polish",
        itemType: "props",
        label: "Ảnh đạo cụ",
        nameLabel: "Đạo cụ",
        visualManual: isDerivative ? "art_prop_derivative" : "art_prop",
      },
    });

    // Chạy tạo bất đồng bộ ở chế độ nền theo từng đợt, không chờ hoàn tất mới phản hồi
    const limit = pLimit(concurrentCount ?? 1);
    const tasks = items.map((item: { assetsId: number; type: string; name: string; describe: string }) =>
      limit(async () => {
        const assetData = assetsDataMap.get(item.assetsId);
        if (!assetData) return;
        const typeConfig = getTypeConfig(!!assetData.assetsId);
        const config = typeConfig[item.type];
        if (!config) return;
        // Lấy sổ tay hướng dẫn hình ảnh
        const visualManual = await u.getArtPrompt(project.artStyle as string, "art_skills", config.visualManual);
        if (!visualManual) {
          await u.db("o_assets").where("id", item.assetsId).update({ promptState: "Tạo thất bại", promptErrorReason: "Sổ tay hướng dẫn hình ảnh chưa được cấu hình" });
          return;
        }
        const systemPrompt = visualManual;
        try {
          const { _output } = (await u.Ai.Text("universalAi").invoke({
            system: systemPrompt + "\n" + otherTextPrompt,
            messages: [
              {
                role: "user",
                content: `
                    **Tham số cơ bản:**
      **Thiết lập ${config.nameLabel}:**
      - Tên ${config.nameLabel}: ${item.name}
      - Mô tả ${config.nameLabel}: ${item.describe}`,
              },
            ],
          })) as any;

          if (!_output) {
            await u.db("o_assets").where("id", item.assetsId).update({ promptState: "Tạo thất bại" });
            return;
          }

          await u.db("o_assets").where("id", item.assetsId).update({ prompt: _output, promptState: "Đã hoàn thành" });
        } catch (e: any) {
          await u
            .db("o_assets")
            .where("id", item.assetsId)
            .update({ promptState: "thất bại", promptErrorReason: u.error(e).message });
        }
      }),
    );

    // Thực thi ở chế độ nền, không chờ lấy kết quả trả về
    Promise.all(tasks).catch((err: any) => {
      res.status(500).send(error(err));
    });

    return res.status(200).send(success({ total: items.length }));
  },
);
