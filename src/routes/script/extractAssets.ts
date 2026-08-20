import express from "express";
import u from "@/utils";
import { z } from "zod";
import { error, success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { useSkill } from "@/utils/agent/skillsTools";
import { tool, jsonSchema } from "ai";
import { o_script } from "@/types/database";

const router = express.Router();

/** Tài nguyên mới : AI lần đầu nhận diện tài nguyên, cần  thông tin đầy đủ */
const NewAssetSchema = z.object({
  name: z.string().describe("Tên tài nguyên, chỉ gồm tên không kèm theo bất kỳ mô tả nào khác"),
  desc: z.string().describe("Mô tả tài nguyên"),
  type: z.enum(["role", "tool", "scene"]).describe("Loại tài nguyên: role (nhân vật), tool (đạo cụ), scene (bối cảnh)"),
  scriptIds: z.array(z.number()).describe("Mảng ID kịch bản  sử dụng tài nguyên này"),
});

/** Tài nguyên đã có: Tài nguyên đã tồn tại trong CSDL, chỉ cần  tên và kịch bản  liên kết */
const ExistingAssetRefSchema = z.object({
  name: z.string().describe("Tên tài nguyên đã có, phải trùng khớp hoàn toàn với tên trong danh sách tài nguyên hiện tại"),
  scriptIds: z.array(z.number()).describe("Mảng ID kịch bản  sử dụng tài nguyên này"),
});

export const AssetSchema = z.object({
  name: z.string().describe("Tên tài nguyên, chỉ gồm tên không kèm theo bất kỳ mô tả nào khác"),
  desc: z.string().describe("Mô tả tài nguyên"),
  type: z.enum(["role", "tool", "scene"]).describe("Loại tài nguyên: role (nhân vật), tool (đạo cụ), scene (bối cảnh)"),
});

type NewAsset = z.infer<typeof NewAssetSchema>;
type ExistingAssetRef = z.infer<typeof ExistingAssetRefSchema>;
type Asset = z.infer<typeof AssetSchema>;

/** Kết quả mỗi đợt gọi AI */
type GroupResult = {
  batchScriptIds: number[];
  newAssets: NewAsset[];
  existingRefs: ExistingAssetRef[];
} | null;

/** Chia mảng scriptIds thành các nhóm theo groupSize */
function chunkArray(arr: number[], groupSize: number): number[][][] {
  const chunks: number[][] = [];
  for (let i = 0; i < arr.length; i += 5) {
    chunks.push(arr.slice(i, i + 5));
  }
  const groupChunks = [];
  for (let i = 0; i < chunks.length; i += groupSize) {
    groupChunks.push(chunks.slice(i, i + groupSize));
  }
  return groupChunks;
}

export default router.post(
  "/",
  validateFields({
    scriptIds: z.array(z.number()),
    projectId: z.number(),
    groupSize: z.number().min(1).optional(),
  }),
  async (req, res) => {
    const { scriptIds, projectId, groupSize = 5 } = req.body;

    if (!scriptIds.length) return res.status(400).send(error("Vui lòng chọn kịch bản  trước "));
    const scripts = await u.db("o_script").whereIn("id", scriptIds);

    // Xây dựng ánh xạ scriptId -> nội dung kịch bản 
    const scriptMap = new Map(scripts.map((s: o_script) => [s.id, s]));

    await u.db("o_script").whereIn("id", scriptIds).update({
      extractState: 2,
    });

    const errors: { scriptId: number; error: string }[] = [];
    let successCount = 0;

    // Phân nhóm scriptIds theo groupSize (mặc định 5), mỗi nhóm gửi cho AI xử lý cùng lúc
    const scriptGroups = chunkArray(scriptIds as number[], groupSize);

    /** Sau khi trích xuất xong một nhóm kịch bản , lưu thống nhất vào CSDL và thiết lập liên kết */
    async function persistGroupResult(result: GroupResult) {
      if (!result) return;
      const { batchScriptIds, newAssets, existingRefs } = result;
      if (!newAssets.length && !existingRefs.length) return;

      // Truy vấn tài nguyên đã tồn tại
      const existingAssets = await u.db("o_assets").where("projectId", projectId).select("id", "name");
      const existingMap = new Map(existingAssets.map((a) => [a.name!, a.id!]));

      // Chèn tài nguyên mới  (không có trong danh sách đã tồn tại)
      const toInsert = newAssets.filter((asset) => !existingMap.has(asset.name));
      if (toInsert.length) {
        await u.db("o_assets").insert(
          toInsert.map((asset) => ({
            name: asset.name,
            type: asset.type,
            describe: asset.desc,
            projectId: projectId,
            startTime: Date.now(),
          })),
        );
      }

      // Truy vấn lại để lấy ánh xạ hoàn chỉnh name -> id
      const allAssets = await u.db("o_assets").where("projectId", projectId).select("id", "name");
      const nameToId = new Map(allAssets.map((a) => [a.name, a.id]));

      // Thu thập toàn bộ quan hệ liên kết giữa tài nguyên và kịch bản 
      const scriptAssetRows: { scriptId: number; assetId: number }[] = [];

      // Liên kết tài nguyên mới 
      for (const asset of newAssets) {
        const assetId = nameToId.get(asset.name);
        if (assetId) {
          for (const sid of asset.scriptIds) {
            scriptAssetRows.push({ scriptId: sid, assetId });
          }
        }
      }

      // Liên kết tài nguyên đã có
      for (const ref of existingRefs) {
        const assetId = nameToId.get(ref.name);
        if (assetId) {
          for (const sid of ref.scriptIds) {
            scriptAssetRows.push({ scriptId: sid, assetId });
          }
        }
      }

      // Loại bỏ trùng lặp: scriptId + assetId giống nhau chỉ giữ lại một dòng
      const uniqueRows = [...new Map(scriptAssetRows.map((r) => [`${r.scriptId}_${r.assetId}`, r])).values()];

      // Xóa liên kết cũ  của đợt scriptId này trước , sau  đó chèn liên kết mới 
      await u.db("o_scriptAssets").whereIn("scriptId", batchScriptIds).delete();
      if (uniqueRows.length) {
        await u.db("o_scriptAssets").insert(uniqueRows);
      }

      // Cập nhật trạng thái thành công cho kịch bản  của đợt này (1 = thành công)
      await u.db("o_script").whereIn("id", batchScriptIds).where("projectId", projectId).update({
        extractState: 1,
        errorReason: null,
      });
    }
    res.send(success("Bắt đầu trích xuất tài nguyên"));

    function processGroup(group: number[][][]) {
      group.map(async (itemIds) => {
        const validScripts: { id: number; script: o_script }[] = [];
        for (const scriptIds of itemIds as number[][]) {
          for (const scriptId of scriptIds) {
            const script = scriptMap.get(scriptId);
            if (!script) {
              errors.push({ scriptId, error: "Không tìm thấy kịch bản  tương ứng" });
              await u.db("o_script").where("id", scriptId).where("projectId", projectId).update({ extractState: -1, errorReason: "Không tìm thấy kịch bản  tương ứng" });
            } else {
              // Kiểm tra xem trạng thái có phải đang chờ trích xuất không
              const item = await u.db("o_script").where("projectId", projectId).where("id", scriptId).select("extractState").first();
              if (item?.extractState == 2) {
                validScripts.push({ id: scriptId, script });
              }
            }
          }
        }
        if (!validScripts.length) return;
        const validScriptIds = validScripts.map((v) => v.id);
        // Cập nhật trạng thái thành đang trích xuất
        await u.db("o_script").where("projectId", projectId).whereIn("id", validScriptIds).update({
          extractState: 0, // Đang trích xuất
        });
        // Truy vấn danh sách tài nguyên đã có trong dự án hiện tại để cung cấp cho AI tham khảo
        const existingAssets = await u.db("o_assets").where("projectId", projectId).select("name", "type");
        const existingAssetsList = existingAssets.map((a) => `${a.name}(${a.type})`).join(", ");

        // Ghép nội dung nhiều tập kịch bản , mỗi tập phân cách bằng thẻ đánh dấu
        const scriptsContent = validScripts
          .map(({ id, script }) => `===== 【ID Kịch bản : ${id}】${script.name || ""} =====\n${script.content}`)
          .join("\n\n");

        let collectedNew: NewAsset[] = [];
        let collectedExisting: ExistingAssetRef[] = [];
        try {
          const resultTool = tool({
            description: "Bắt buộc gọi công cụ này khi trả về kết quả",
            inputSchema: jsonSchema<{ newAssets: NewAsset[]; existingAssetRefs: ExistingAssetRef[] }>(
              z
                .object({
                  newAssets: z
                    .array(NewAssetSchema)
                    .describe("Danh sách tài nguyên mới  phát hiện (không có trong danh sách tài nguyên đã có), cần  đầy đủ prompt, name, desc, type và mảng scriptIds sử dụng tài nguyên này"),
                  existingAssetRefs: z
                    .array(ExistingAssetRefSchema)
                    .describe("Danh sách tham chiếu tài nguyên đã có (đã tồn tại trong danh sách tài nguyên), chỉ cần  cung cấp tên tài nguyên và mảng scriptIds sử dụng tài nguyên này"),
                })
                .toJSONSchema(),
            ),
            execute: async ({ newAssets, existingAssetRefs }) => {
              if (newAssets?.length) collectedNew = newAssets;
              if (existingAssetRefs?.length) collectedExisting = existingAssetRefs;
              return "Không cần  phản hồi thêm nội dung nào cho người dùng";
            },
          });
          const promptData = await u.db("o_prompt").where("type", "scriptAssetExtraction").first();
          let scriptAssetExtraction = "" as string | undefined;
          if (promptData && promptData.useData) {
            scriptAssetExtraction = promptData.useData;
          } else {
            scriptAssetExtraction = promptData?.data ?? undefined;
          }
          const existingHint = existingAssetsList
            ? `\n\n【Danh sách tài nguyên đã có】：${existingAssetsList}\nĐối với tài nguyên đã có, nếu xuất hiện trong kịch bản , chỉ cần  cung cấp tên tài nguyên và mảng scriptIds tương ứng trong existingAssetRefs, không cần  tạo lại desc/type. Đối với tài nguyên mới  phát hiện (không có trong danh sách đã có), vui lòng cung cấp thông tin đầy đủ trong newAssets.`
            : "";
          const output = await u.Ai.Text("universalAi").invoke({
            messages: [
              {
                role: "system",
                content:
                  scriptAssetExtraction +
                  "\n\nTrích xuất các tài nguyên (Nhân vật, Bối cảnh, Đạo cụ) xuất hiện trong kịch bản  theo chuẩn quy cách trích xuất tài nguyên, kết quả bắt buộc phải trả về thông qua công cụ resultTool." +
                  "\n\nLưu ý: Lần này sẽ cung cấp đồng thời nhiều tập kịch bản , mỗi tập kịch bản  phân cách bởi ===== 【ID Kịch bản : xxx】 =====. Bạn cần  phân tích từng tập kịch bản  sử dụng những tài nguyên nào, và đánh dấu mảng scriptIds trong kết quả đầu ra để chỉ rõ tài nguyên đó xuất hiện trong những tập nào.",
              },
              {
                role: "user",
                content: `Danh sách tài nguyên hiện có：${existingHint}\n\nVui lòng dựa theo ${validScripts.length} tập kịch bản  sau  đây để trích xuất các tài nguyên tương ứng (Nhân vật, Bối cảnh, Đạo cụ):\n\n${scriptsContent}`,
              },
            ],
            tools: { resultTool },
          });
          await persistGroupResult({
            batchScriptIds: validScriptIds,
            newAssets: collectedNew,
            existingRefs: collectedExisting,
          });
        } catch (e) {
          console.error(`[extractAssets] group=[${validScriptIds.join(",")}] trích xuất thất bại:`, e);
          for (const { id, script } of validScripts) {
            errors.push({ scriptId: id, error: (script.name || "") + ":" + u.error(e).message });
            await u
              .db("o_script")
              .where("id", id)
              .where("projectId", projectId)
              .update({ extractState: -1, errorReason: u.error(e).message });
          }
          return;
        }
        if (!collectedNew.length && !collectedExisting.length) {
          for (const { id } of validScripts) {
            errors.push({ scriptId: id, error: "AI chưa trả về bất kỳ tài nguyên nào" });
            await u.db("o_script").where("id", id).where("projectId", projectId).update({ extractState: -1, errorReason: "AI chưa trả về bất kỳ tài nguyên nào" });
          }
          return;
        }
      });
    }
    processGroup(scriptGroups);
  },
);
