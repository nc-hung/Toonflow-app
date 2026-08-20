import express from "express";
import u from "@/utils";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { error, success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";

const router = express.Router();

type AssetType = "role" | "scene" | "tool";

interface AssetTypeConfig {
  label: string;
  taskClass: string;
  dir: string;
  promptTitle: string;
  promptEnd: string;
}

const assetTypeConfig: Record<AssetType, AssetTypeConfig> = {
  role: {
    label: "Nhân vật",
    taskClass: "Nhân vậtảnh tạo",
    dir: "role",
    promptTitle: "Nhân vậtTiêu chuẩn4video ảnh ",
    promptEnd: "ngườiNhân vật4video ảnh ",
  },
  scene: {
    label: "Bối cảnh",
    taskClass: "Bối cảnhảnh tạo",
    dir: "scene",
    promptTitle: "Tiêu chuẩnBối cảnhảnh ",
    promptEnd: "Tiêu chuẩnBối cảnhảnh ",
  },
  tool: {
    label: "Đạo cụ",
    taskClass: "Đạo cụảnh tạo",
    dir: "props",
    promptTitle: "Tiêu chuẩnĐạo cụảnh ",
    promptEnd: "Tiêu chuẩnĐạo cụảnh ",
  },
};

// ─── cấu tạo Tạo prompt gợi ý ──────────────────────────────────────────

function buildPrompt(cfg: AssetTypeConfig, artStyle: string, name: string, prompt: string): string {
  return `
    vui lòng Dựa theodưới tham sốtạo${cfg.promptTitle}：

    **cơ sở tham số：**
    - vẽ phong phong cách: ${artStyle || "chưa nối "}

    **${cfg.label}thiết nối ：**
    - tên:${name},
    - Prompt:${prompt},

    vui lòng khung theo dòng thống tạo${cfg.promptEnd}。
  `;
}

// ─── Tạo tài nguyênHình ảnh ────────────────────────────────────────────

const requestSchema = {
  projectId: z.number(),
  model: z.string(),
  resolution: z.string(),
  id: z.number(),
  type: z.enum(["role", "scene", "tool", "storyboard"]),
  name: z.string(),
  prompt: z.string(),
  base64: z.string().optional().nullable(),
};

export default router.post("/", validateFields(requestSchema), async (req, res) => {
  const { projectId, model, resolution, id, type, name, prompt, base64 } = req.body;

  // 1. Truy vấnDự án & LấyloạiCấu hình
  const project = await u.db("o_project").where("id", projectId).select("artStyle", "type", "intro").first();
  if (!project) return res.status(500).send(success({ message: "Dự ánrỗng " }));

  const cfg = assetTypeConfig[type as AssetType];
  if (!cfg) return res.status(400).send(error("không hỗ trợ của loại"));

  // 2. sáng tạo Hình ảnhvị trí lục 
  const [imageId] = await u.db("o_image").insert({
    type,
    state: "Đang tạo",
    assetsId: id,
    model: model.split(/:(.+)/)[1],
    resolution,
  });
  await u.db("o_assets").where("id", id).update({ imageId });

  // 3. tạotham số
  const imagePath = `/${projectId}/${cfg.dir}/${uuidv4()}.jpg`;
  const userPrompt = buildPrompt(cfg, project.artStyle!, name, prompt);
  const describe = `tạo${cfg.label}ảnh ，tên：${name}，Prompt：${prompt}`;
  const relatedObjects = { id, projectId, type: cfg.label };

  try {
    const aiImage = u.Ai.Image(model);
    await aiImage.run(
      {
        prompt: userPrompt,
        referenceList: base64 ? [{ type: "image", base64 }] : [],
        size: resolution,
        aspectRatio: "16:9",
      },
      {
        taskClass: cfg.taskClass,
        describe,
        projectId,
        relatedObjects: JSON.stringify(relatedObjects),
      },
    );
    aiImage.save(imagePath);
    // 5. Cập nhậtlục  & Trả vềkết quả
    const imageData = await u.db("o_image").where("id", imageId).select("*").first();
    if (!imageData) return res.status(500).send("Tài nguyênđã Xóa");
    if (imageData.state === "Tạo thất bại") return;
    await u
      .db("o_image")
      .where("id", imageId)
      .update({
        state: "Đã hoàn thành",
        filePath: imagePath,
        type,
        model: model.split(/:(.+)/)[1],
        resolution,
      });

    const path = await u.oss.getSmallImageUrl(imagePath);
    await u.db("o_assets").where("id", id).update({ imageId });

    return res.status(200).send(success({ path, assetsId: id }));
  } catch (e) {
    await u
      .db("o_image")
      .where("id", imageId)
      .update({ state: "Tạo thất bại", errorReason: u.error(e).message });
    return res.status(400).send(error(u.error(e).message || "Hình ảnhTạo thất bại"));
  }
});
