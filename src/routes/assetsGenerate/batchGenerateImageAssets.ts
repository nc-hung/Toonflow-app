import express from "express";
import pLimit from "p-limit";
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

const requestSchema = {
  projectId: z.number(),
  model: z.string(),
  resolution: z.string(),
  concurrentCount: z.number().int().min(1).optional(),
  items: z.array(
    z.object({
      id: z.number(),
      type: z.enum(["role", "scene", "tool", "storyboard"]),
      name: z.string(),
      prompt: z.string(),
      base64: z.string().optional().nullable(),
    }),
  ),
};

export default router.post("/", validateFields(requestSchema), async (req, res) => {
  const { projectId, model, resolution, concurrentCount, items } = req.body;

  // 1. Truy vấnDự án
  const project = await u.db("o_project").where("id", projectId).select("artStyle", "type", "intro").first();
  if (!project) return res.status(500).send(error("Dự ánrỗng "));

  // 2. mục Chèn o_image vị trí lục ，nhận tập  imageId danh sách
  const totalNovelId: number[] = [];
  for (const item of items) {
    const [imageId] = await u.db("o_image").insert({
      type: item.type,
      state: "Đang tạo",
      assetsId: item.id,
    });
    await u.db("o_assets").where("id", item.id).update({ imageId });
    totalNovelId.push(imageId);
  }

  // 3. sau  đài bất bước nhất phát tạo，không phản hồi 
  const limit = pLimit(concurrentCount ?? 1);

  const tasks = items.map((item: { id: number; type: string; name: string; prompt: string; base64: string | null | undefined }, index: number) =>
    limit(async () => {
      const imageId = totalNovelId[index];
      const data = await u.db("o_image").where("id", imageId).select("state").first();
      if (data?.state === "Tạo thất bại") {
        return;
      }
      const cfg = assetTypeConfig[item.type as AssetType];
      if (!cfg) return;

      await u.db("o_assets").where("id", item.id).update({ imageId });

      const imagePath = `/${projectId}/${cfg.dir}/${uuidv4()}.jpg`;
      const userPrompt = buildPrompt(cfg, project.artStyle ?? "", item.name, item.prompt);
      const describe = `tạo${cfg.label}ảnh ，tên：${item.name}，Prompt：${item.prompt}`;
      const relatedObjects = { id: item.id, projectId, type: cfg.label };
      try {
        const aiImage = u.Ai.Image(model);
        await aiImage.run(
          {
            prompt: userPrompt,
            referenceList: item.base64 ? [{ base64: item.base64, type: "image" }] : [],
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

        const imageData = await u.db("o_image").where("id", imageId).select("*").first();
        if (!imageData) return res.status(500).send("Tài nguyênđã Xóa");
        if (!imageData) return;
        if (imageData.state === "Tạo thất bại") return;
        await u
          .db("o_image")
          .where("id", imageId)
          .update({
            state: "Đã hoàn thành",
            filePath: imagePath,
            type: item.type,
            model: model.split(/:(.+)/)[1],
            resolution,
          });

        await u.db("o_assets").where("id", item.id).update({ imageId });
      } catch (e: any) {
        await u
          .db("o_image")
          .where("id", imageId)
          .update({ state: "Tạo thất bại", errorReason: u.error(e).message });
      }
    }),
  );

  // sau  đài thực thi，không kết quả
  Promise.all(tasks).catch(() => {});

  return res.status(200).send(success({ total: items.length }));
});
