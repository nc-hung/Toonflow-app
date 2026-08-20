import express from "express";
import u from "@/utils";
import { z } from "zod";
import sharp from "sharp";
import { error, success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { Output, tool } from "ai";
import { assetItemSchema } from "@/agents/productionAgent/tools";
const router = express.Router();
export type AssetData = z.infer<typeof assetItemSchema>;

export default router.post(
  "/",
  validateFields({
    storyboardIds: z.array(z.number()),
    projectId: z.number(),
    scriptId: z.number(),
    concurrentCount: z.number().min(1).optional(),
    compulsory: z.boolean().optional(),
  }),
  async (req, res) => {
    const {
      storyboardIds,
      projectId,
      scriptId,
      concurrentCount = 5,
      compulsory = false,
    }: {
      storyboardIds: number[];
      projectId: number;
      scriptId: number;
      concurrentCount: number;
      compulsory: boolean;
    } = req.body;
    if (!storyboardIds || storyboardIds.length === 0) return res.status(400).send(error("storyboardIdskhông thể rỗng "));
    // khi chưa có  storyboardIds ，thông qua AI tạomới   của bản g phân cảnhDữ liệu
    let finalStoryboardIds: number[] = storyboardIds || [];
    // shouldGenerateImage === 0  của Phân cảnhbiểu 「chưa tạo」，biểu 「Đang tạo」
    const storyboardData = await u.db("o_storyboard").where("scriptId", scriptId).where("projectId", projectId).whereIn("id", finalStoryboardIds);
    if (!storyboardData.length) return res.status(500).send(error("chưa tra đến Phân cảnhDữ liệu"));
    const storyIds = storyboardData.map((i) => i.id);
    if (compulsory) {
      await u.db("o_storyboard").whereIn("id", storyIds).where("scriptId", scriptId).update({ state: "Đang tạo", shouldGenerateImage: 1 });
    } else {
      await u.db("o_storyboard").whereIn("id", storyIds).where("scriptId", scriptId).where("shouldGenerateImage", 0).update({ state: "chưa tạo" });
      await u.db("o_storyboard").whereIn("id", storyIds).where("scriptId", scriptId).where("shouldGenerateImage", 1).update({ state: "Đang tạo" });
    }

    const projectSettingData = await u.db("o_project").where("id", projectId).select("imageModel", "imageQuality", "artStyle", "videoRatio").first();

    // theo  rowid xếp tra ra mục  storyboard liên kết  của  assetId có xếp danh sách
    const assets2StoryboardRows = await u
      .db("o_assets2Storyboard")
      .whereIn("storyboardId", storyIds)
      .orderBy("rowid")
      .select("storyboardId", "assetId");

    // nhận tập tất cả assetId，lượng tra đúng hồi  của  imageId
    const allAssetIds = [...new Set(assets2StoryboardRows.map((r: any) => r.assetId))];
    const assetImageMap: Record<number, number> = {};
    if (allAssetIds.length > 0) {
      const assetRows = await u.db("o_assets").whereIn("id", allAssetIds).select("id", "imageId");
      assetRows.forEach((row: any) => {
        assetImageMap[row.id] = row.imageId;
      });
    }

    // theo  rowid xếp trùng tạo  assetRecord，giá trị có xếp  của  imageId danh sách
    const assetRecord: Record<number, number[]> = {};
    assets2StoryboardRows.forEach((item: any) => {
      if (!assetRecord[item.storyboardId]) {
        assetRecord[item.storyboardId] = [];
      }
      const imageId = assetImageMap[item.assetId];
      if (imageId != null) {
        assetRecord[item.storyboardId].push(imageId);
      }
    });
    const realStoryData = await u.db("o_storyboard").where("scriptId", scriptId).where("projectId", projectId).whereIn("id", storyIds);
    res.status(200).send(
      success(
        realStoryData.map((i) => ({
          id: i.id,
          prompt: i.prompt,
          associateAssetsIds: assetRecord[i.id!],
          src: null,
          state: i.state,
          videoDesc: i.videoDesc,
          shouldGenerateImage: i.shouldGenerateImage,
        })),
      ),
    );

    const generateTask = async (item: (typeof storyboardData)[number]) => {
      const repeloadObj = {
        prompt: item.prompt!,
        size: projectSettingData?.imageQuality as "1K" | "2K" | "4K",
        aspectRatio: projectSettingData?.videoRatio as `${number}:${number}`,
      };
      try {
        const imageCls = await u.Ai.Image(projectSettingData?.imageModel as `${string}:${string}`).run(
          {
            referenceList: await getAssetsImageBase64(assetRecord[item.id!] || []),
            ...repeloadObj,
          },
          {
            taskClass: "tạoPhân cảnhHình ảnh",
            describe: "Phân cảnhHình ảnhtạo",
            relatedObjects: JSON.stringify(repeloadObj),
            projectId: projectId,
          },
        );
        const savePath = `/${projectId}/assets/${scriptId}/${u.uuid()}.jpg`;
        await imageCls.save(savePath);
        await u.db("o_storyboard").where("id", item.id).update({
          filePath: savePath,
          state: "Đã hoàn thành",
        });
      } catch (e) {
        u.db("o_storyboard")
          .where("id", item.id)
          .update({
            filePath: "",
            reason: u.error(e).message,
            state: "Tạo thất bại",
          });
      }
    };
    // theo  concurrentCount sát chép nhất phát số ，phần thực thi； shouldGenerateImage === 0  của Phân cảnh
    let generateList = [];
    if (compulsory) {
      generateList = storyboardData;
    } else {
      generateList = storyboardData.filter((item) => item.shouldGenerateImage !== 0);
    }
    for (let i = 0; i < generateList.length; i += concurrentCount) {
      const batch = generateList.slice(i, i + concurrentCount);
      await Promise.all(batch.map(generateTask));
    }
  },
);
async function getAssetsImageBase64(imageIds: number[]) {
  if (!imageIds.length) return [];

  const imagePaths = await u.db("o_image").whereIn("o_image.id", imageIds).select("o_image.id", "o_image.filePath");

  // tạo lập  id đến  filePath  của 
  const id2Path = new Map<number, string>();
  for (const row of imagePaths) {
    id2Path.set(row.id, row.filePath);
  }

  // lưu chứng xuất ra xếp  imageIds 1 
  const imageUrls = await Promise.all(
    imageIds.map(async (id) => {
      const filePath = id2Path.get(id);
      if (filePath) {
        try {
          return await u.oss.getImageBase64(filePath);
        } catch {
          return null;
        }
      }
      return null;
    }),
  );
  // lưu lưu xếp ，nhất và lọc bỏ vô hiệu
  return (imageUrls.filter(Boolean) as string[]).map((url) => ({ type: "image" as const, base64: url }));
}
