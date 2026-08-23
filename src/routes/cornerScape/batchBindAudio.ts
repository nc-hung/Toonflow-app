import express from "express";
import u from "@/utils";
import { z } from "zod";
import { error, success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { tool, jsonSchema } from "ai";
const router = express.Router();

// Lấy danh sách tài nguyên
export default router.post(
  "/",
  validateFields({
    projectId: z.number(),
    assetsIds: z.array(z.number()),
    concurrentCount: z.number().min(1).optional(),
  }),
  async (req, res) => {
    const { projectId, assetsIds, concurrentCount } = req.body;
    const assetsData = await u.db("o_assets").whereIn("id", assetsIds).andWhere("projectId", projectId).select("id", "name", "describe", "type");

    const audioData = await u
      .db("o_assets")
      .where("type", "audio")
      .whereNull("assetsId")
      .andWhere("projectId", projectId)
      .select("id", "name", "describe");

    if (!audioData.length) return res.status(400).send(error("Hiện chưa thiết lập âm thanh nào, vui lòng tải lên âm thanh trong mục Tài nguyên trước"));

    const batchSize = concurrentCount ?? 1;

    async function processAsset(asset: (typeof assetsData)[number]) {
      try {
        const resultTool = tool({
          description: "Sau khi khớp xong, bắt buộc phải gọi công cụ này để báo cáo kết quả tác vụ",
          inputSchema: jsonSchema<{ id: number; audioId: number }>(
            z
              .object({
                audioId: z.number().nullable().optional().describe("ID của âm thanh khớp với tài nguyên này; nếu không có âm thanh nào phù hợp thì trả về null"),
              })
              .toJSONSchema(),
          ),
          execute: async (result) => {
            await u.db("o_assetsRole2Audio").where("assetsRoleId", asset.id).delete();
            if (result?.audioId) await u.db("o_assetsRole2Audio").insert({ assetsRoleId: asset.id, assetsAudioId: result.audioId });
            await u.db("o_assets").where("id", asset.id).update("audioBindState", "Đã hoàn thành");
            return "Không cần phản hồi thêm cho người dùng";
          },
        });

        const audioList = audioData.map((i) => `- ID:${i.id} | tên:${i.name} | mô tả:${i.describe ?? "không có"}`).join("\n");
        const promptData = await u.db("o_prompt").where("type", "audioBindPrompt").first();
        let audioBindPrompt = "" as string | undefined;
        if (promptData && promptData.useData) {
          audioBindPrompt = promptData.useData;
        } else {
          audioBindPrompt = promptData?.data ?? undefined;
        }
        const { text } = await u.Ai.Text("universalAi").invoke({
          messages: [
            {
              role: "system",
              content: `
              ${audioBindPrompt}
              `,
            },
            {
              role: "user",
              content: `
                ## Danh sách âm thanh để chọn
                ${audioList}
                ## Tài nguyên cần khớp
                - ID:${asset.id} | tên:${asset.name} | mô tả:${asset.describe ?? "không có"} | loại:${asset.type}
                Vui lòng chọn từ danh sách âm thanh trên một giọng đọc phù hợp nhất với thiết lập nhân vật của tài nguyên này, sau đó gọi hàm resultTool để báo cáo kết quả tác vụ.
           `,
            },
          ],
          tools: { resultTool },
        });
      } catch (e) {
        await u.db("o_assets").where("id", asset.id).update("audioBindState", "Tạo thất bại");
        console.error(`[bindAudio] Tài nguyên ${asset.id} xử lý thất bại:`, e);
      }
    }

    async function runWithConcurrency() {
      for (let i = 0; i < assetsData.length; i += batchSize) {
        const batch = assetsData.slice(i, i + batchSize);

        await Promise.all(batch.map((asset) => processAsset(asset)));
      }
    }
    await u
      .db("o_assets")
      .whereIn(
        "id",
        assetsData.map((i) => i.id),
      )
      .update("audioBindState", "Đang tạo");
    runWithConcurrency();
    res.status(200).send(success());
  },
);
