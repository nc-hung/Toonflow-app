import { tool, jsonSchema, Tool } from "ai";
import { z } from "zod";
import _ from "lodash";
import ResTool from "@/socket/resTool";
import u from "@/utils";

const deriveAssetSchema = z.object({
  id: z.number().describe("Biến thể tài nguyênID,Nếu thêm mới  thì để trống"),
  assetsId: z.number().describe("Tài nguyên liên kếtID"),
  prompt: z.string().describe("Prompt tạo hình"),
  name: z.string().describe("Biến thể tài nguyêntên"),
  desc: z.string().describe("Biến thể tài nguyênmô tả"),
  src: z.string().nullable().describe("Biến thể tài nguyênĐường dẫn tài nguyên"),
  state: z.enum(["Chưa tạo", "Đang tạo", "Đã hoàn thành", "Tạo thất bại"]).describe("Biến thể tài nguyênTrạng thái tạo"),
  type: z.enum(["role", "tool", "scene", "clip"]).describe("Biến thể tài nguyênloại"),
});
export const assetItemSchema = z.object({
  id: z.number().describe("Mã định danh duy nhất của tài nguyên"),
  name: z.string().describe("Tên tài nguyên"),
  type: z.enum(["role", "tool", "scene", "clip"]).describe("Loại tài nguyên"),
  prompt: z.string().describe("Prompt tạo hình"),
  desc: z.string().describe("Mô tả tài nguyên"),
  derive: z.array(deriveAssetSchema).describe("Biến thể tài nguyêndanh sách"),
});
const storyboardSchema = z.object({
  id: z.number().describe("Phân cảnhID，bắt buộc thật id"),
  duration: z.number().describe("giữ thời lượng(giây)"),
  prompt: z.string().describe("Prompt tạo hình"),
  associateAssetsIds: z.array(z.number()).describe("liên kết Tài nguyênIDdanh sách"),
  src: z.string().nullable().describe("Phân cảnhĐường dẫn tài nguyên"),
  index: z.number().nullable().optional().describe("Phân cảnhSắp xếpchữ đoạn "),
});
const workbenchDataSchema = z.object({
  name: z.string().describe("Dự ántên"),
  duration: z.string().describe("Videothời lượng"),
  resolution: z.string().describe("phần tỷ lệ "),
  fps: z.string().describe("tỷ lệ "),
  cover: z.string().optional().describe("mặt Hình ảnhđường dẫn"),
  gradient: z.string().optional().describe("vật Cấu hình"),
});
const posterItemSchema = z.object({
  id: z.number().describe("ID"),
  image: z.string().describe("Hình ảnhđường dẫn"),
});
export const flowDataSchema = z.object({
  script: z.string().describe("Nội dung kịch bản "),
  scriptPlan: z.string().describe("tính "),
  assets: z.array(assetItemSchema).describe("Biến thể tài nguyên"),
  storyboardTable: z.string().describe("Phân cảnhbản g"),
  storyboard: z.array(storyboardSchema).describe("bản g phân cảnh"),
});

export type FlowData = z.infer<typeof flowDataSchema>;

const keySchema = z.enum(Object.keys(flowDataSchema.shape) as [keyof FlowData, ...Array<keyof FlowData>]);
const flowDataKeyLabels = Object.fromEntries(
  Object.entries(flowDataSchema.shape).map(([key, schema]) => [key, (schema as z.ZodTypeAny).description ?? key]),
) as Record<keyof FlowData, string>;

interface ToolConfig {
  resTool: ResTool;
  toolsNames?: string[];
  msg: ReturnType<ResTool["newMessage"]>;
}

/**
 * thi hàng ：lưu  socket thao tác vụ sắp thực thi，nhất phát cao dẫn giả 
 * @param delayMs mục thao tác vụ  của gian  của nhất nhỏ gian cách (ms)
 */
function createSocketQueue(delayMs = 800) {
  let lastPromise: Promise<any> = Promise.resolve();
  return <T>(fn: () => Promise<T>): Promise<T> => {
    lastPromise = lastPromise.then(
      () =>
        new Promise<T>((resolve, reject) => {
          setTimeout(() => fn().then(resolve, reject), delayMs);
        }),
    );
    return lastPromise;
  };
}

export default (toolCpnfig: ToolConfig) => {
  const { resTool, toolsNames, msg } = toolCpnfig;
  const { socket } = resTool;
  const socketQueue = createSocketQueue(800);
  const workMap: Record<any, any> = {};
  const tools: Record<string, Tool> = {
    get_flowData: tool({
      description: "Lấycông việc khu Dữ liệu",
      inputSchema: jsonSchema<{ key: keyof FlowData }>(
        z
          .object({
            key: keySchema.describe("Dữ liệukey"),
          })
          .toJSONSchema(),
      ),
      execute: async ({ key }) => {
        const thinking = msg.thinking(`đangLấy${flowDataKeyLabels[key]}công việc khu Dữ liệu...`);

        const flowData: FlowData = await new Promise((resolve) => socket.emit("getFlowData", { key }, (res: any) => resolve(res)));
        thinking.appendText(`Lấyđến ${flowDataKeyLabels[key]}:\n` + JSON.stringify(flowData[key], null, 2));
        thinking.updateTitle(`Lấy${flowDataKeyLabels[key]}hoàn thành`);
        thinking.complete();
        if (workMap[key] && JSON.stringify(workMap[key]) === JSON.stringify(flowData[key])) {
          console.info(`[tools] get_flowData: ${flowDataKeyLabels[key]}Dữ liệuchưa hóa ，không cần Cập nhật`);
          return `${flowDataKeyLabels[key]}Dữ liệuchưa hóa ，không cần Cập nhật`;
        }
        workMap[key] = flowData[key];
        return flowData[key];
      },
    }),
    add_deriveAsset: tool({
      description: "thêm mới hoặc Cập nhậtBiến thể tài nguyên",
      inputSchema: jsonSchema<{ assetsId: number; id: number | null; name: string; desc: string }>(
        z
          .object({
            assetsId: z.number().describe("Tài nguyên liên kếtID"),
            id: z.number().nullable().describe("Biến thể tài nguyênID,Nếu thêm mới  thì để trống"),
            name: z.string().describe("Biến thể tài nguyêntên"),
            desc: z.string().describe("Biến thể tài nguyênmô tả"),
          })
          .toJSONSchema(),
      ),
      execute: async (raw) => {
        // dung sai ：LLM nhĩ truyền  "null" chuỗi ký tựhoặc rỗng ，thống nhất  null
        const idRaw = raw.id as unknown;
        const normalizedId = idRaw === "null" || idRaw === "" || idRaw === undefined ? null : (idRaw as number | null);
        const deriveAsset = { ...raw, id: normalizedId };

        const thinking = msg.thinking("đangthao tác vụ Tài nguyên...");
        const { projectId, scriptId } = resTool.data;
        const startTime = Date.now();
        const parentAssets = await u.db("o_assets").where("id", deriveAsset.assetsId).select("id", "type").first();
        if (!parentAssets) return "Tài nguyên liên kếtkhông tồn tại";

        const data = {
          id: deriveAsset.id ?? undefined,
          assetsId: deriveAsset.assetsId,
          projectId,
          name: deriveAsset.name,
          type: parentAssets.type,
          describe: deriveAsset.desc,
          startTime,
        };
        if (deriveAsset.id) {
          await u.db("o_assets").where("id", deriveAsset.id).update(data);
          thinking.appendText(`đã Cập nhậtBiến thể tài nguyên，ID: ${deriveAsset.id}\n`);
        } else {
          const [insertedId] = await u.db("o_assets").insert(data);
          data.id = insertedId;
          await u.db("o_scriptAssets").insert({ scriptId, assetId: insertedId });
          thinking.appendText(`đã thêm mới Biến thể tài nguyên，ID: ${insertedId}\n`);
        }
        const res = await new Promise((resolve) => socket.emit("addDeriveAsset", data, (res: any) => resolve(res)));
        thinking.updateTitle("Tài nguyênthao tác vụ hoàn thành");
        thinking.complete();
        return res ?? "thao tác vụ thành công";
      },
    }),
    del_deriveAsset: tool({
      description: "XóaBiến thể tài nguyên",
      inputSchema: jsonSchema<{ assetsId: number; id: number }>(
        z
          .object({
            assetsId: z.number().describe("Tài nguyên liên kếtID"),
            id: z.number().describe("Biến thể tài nguyênID"),
          })
          .toJSONSchema(),
      ),
      execute: async ({ assetsId, id }) => {
        const thinking = msg.thinking("đangthao tác vụ Tài nguyên...");
        const { scriptId } = resTool.data;
        await u.db("o_assets").where("id", id).del();
        await u.db("o_scriptAssets").where({ scriptId, assetId: id }).del();
        thinking.appendText(`đã XóaBiến thể tài nguyên，ID: ${id}\n`);
        const res = await new Promise((resolve) => socket.emit("delDeriveAsset", { assetsId, id }, (res: any) => resolve(res)));
        thinking.updateTitle("Tài nguyênthao tác vụ hoàn thành");
        thinking.complete();
        return res ?? "Xóa thành công";
      },
    }),
    generate_deriveAsset: tool({
      description: "tạoBiến thể tài nguyênHình ảnh",
      inputSchema: jsonSchema<{ ids: number[] }>(
        z
          .object({
            ids: z.array(z.number()).describe("Cần tạo của  Biến thể tài nguyênID"),
          })
          .toJSONSchema(),
      ),
      execute: async ({ ids }) => {
        const thinking = msg.thinking("đangtạoBiến thể tài nguyên...");
        new Promise((resolve) => socket.emit("generateDeriveAsset", { ids }, (res: any) => resolve(res)))
          .then((res) => {
            thinking.appendText(`đã tạoBiến thể tài nguyên，ID: ${JSON.stringify(res, null, 2)}\n`);
            thinking.updateTitle("Biến thể tài nguyênbắt đầuhoàn thành");
            thinking.complete();
          })
          .catch((e) => {
            thinking.appendText("Biến thể tài nguyênTạo thất bại:\n" + u.error(e).message);
            thinking.updateTitle("Biến thể tài nguyênTạo thất bại");
            thinking.complete();
          });

        return "bắt đầutạoBiến thể tài nguyên";
      },
    }),
    generate_storyboard: tool({
      description: "tạoHình ảnh phân cảnh",
      inputSchema: jsonSchema<{ ids: number[] }>(
        z
          .object({
            ids: z.array(z.number()).describe("bắt buộc Lấythật  của Phân cảnhID，hỗ trợlượng tạo"),
          })
          .toJSONSchema(),
      ),
      execute: async ({ ids }) => {
        const thinking = msg.thinking("đangtạoPhân cảnh...");
        socketQueue(
          () =>
            new Promise((resolve, reject) =>
              socket.emit("generateStoryboard", { ids }, (res: any) => {
                if (res?.error) return reject(new Error(res.error));
                resolve(res);
              }),
            ),
        )
          .then((res) => {
            thinking.appendText("tạo của Phân cảnhDữ liệu:\n" + JSON.stringify(res, null, 2));
            thinking.updateTitle("Tạo phân cảnhhoàn thành");
            thinking.complete();
          })
          .catch((e) => {
            thinking.appendText("Phân cảnhTạo thất bại:\n" + u.error(e).message);
            thinking.updateTitle("Phân cảnhTạo thất bại");
            thinking.complete();
          });

        return "bắt đầutạoPhân cảnh";
      },
    }),
    add_flowData_storyboard: tool({
      description: "thêm mới bản g phân cảnhđến công việc khu ",
      inputSchema: jsonSchema<{
        videoDesc: string;
        prompt: string | null;
        track: string;
        duration: number;
        associateAssetsIds: number[] | null;
        shouldGenerateImage: string;
      }>(
        z
          .object({
            videoDesc: z.string().describe("vẽ mặt mô tả、Bối cảnh、liên kết Tên tài nguyên、thời lượng、bối khác 、vận quay 、Nhân vậtđộng tác vụ 、tình xúc 、ánh sáng không khí 、đài từ 、âm hiệu 、liên kết Tài nguyênID"),
            prompt: z.string().nullable().describe("Hình ảnh phân cảnhPrompt"),
            track: z.string().describe("phân nhóm"),
            duration: z.number().describe("Videokhuyến nghị thời gian"),
            associateAssetsIds: z.array(z.number()).nullable().describe("Phân cảnhnơi cần  của Tài nguyênIDdanh sách"),
            shouldGenerateImage: z.enum(["true", "false"]).describe("là không Cần tạoHình ảnh phân cảnh"),
          })
          .toJSONSchema(),
      ),
      execute: async (raw) => {
        const thinking = msg.thinking("đangthêm mới  bản g phân cảnh Dữ liệu...");
        const data = {
          videoDesc: raw.videoDesc,
          prompt: raw.prompt,
          track: raw.track,
          duration: raw.duration,
          associateAssetsIds: raw.associateAssetsIds ?? [],
          shouldGenerateImage: raw.shouldGenerateImage,
        };
        socketQueue(
          () =>
            new Promise((resolve, reject) =>
              socket.emit("addStoryboard", { ...data }, (res: any) => {
                if (res?.error) return reject(new Error(res.error));
                resolve(res);
              }),
            ),
        )
          .then((res) => {
            thinking.appendText("thêm mới  của Phân cảnhDữ liệu:\n" + JSON.stringify(data, null, 2));
            thinking.updateTitle("thêm mới Phân cảnhthành công");
            thinking.complete();
          })
          .catch((e) => {
            thinking.appendText("thêm mới  của Phân cảnhDữ liệu:\n" + JSON.stringify(data, null, 2));
            thinking.updateTitle("thêm mới Phân cảnhthất bại");
            thinking.complete();
          });
        return true;
      },
    }),
  };

  return toolsNames ? Object.fromEntries(Object.entries(tools).filter(([n]) => toolsNames.includes(n))) : tools;
};
