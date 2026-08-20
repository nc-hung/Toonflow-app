import { tool, jsonSchema, Tool } from "ai";
import u from "@/utils";
import { z } from "zod";
import _ from "lodash";
import ResTool from "@/socket/resTool";

export const ScriptSchema = z.object({
  name: z.string().describe("Tên kịch bản "),
  content: z.string().describe("Nội dung kịch bản "),
});
export const planData = z.object({
  storySkeleton: z.string().describe("Khung cốt truyện"),
  adaptationStrategy: z.string().describe("Chiến lược chuyển thể"),
  script: z.string().describe("Nội dung kịch bản "),
});

export type planData = z.infer<typeof planData>;

const keySchema = z.enum(Object.keys(planData.shape) as [keyof planData, ...Array<keyof planData>]);
const planDataKeyLabels = Object.fromEntries(
  Object.entries(planData.shape).map(([key, schema]) => [key, (schema as z.ZodTypeAny).description ?? key]),
) as Record<keyof planData, string>;

interface ToolConfig {
  resTool: ResTool;
  toolsNames?: string[];
  msg: ReturnType<ResTool["newMessage"]>;
}

export default (toolCpnfig: ToolConfig) => {
  const { resTool, toolsNames, msg } = toolCpnfig;
  const { socket } = resTool;
  const tools: Record<string, Tool> = {
    get_novel_events: tool({
      description: "Lấy danh sách sự kiện theo chương",
      inputSchema: jsonSchema<{ chapterIndexs: number[] }>(
        z
          .object({
            chapterIndexs: z.array(z.number()).describe("Số thứ tự của chương"),
          })
          .toJSONSchema(),
      ),
      execute: async ({ chapterIndexs }) => {
        console.log("[tools] get_novel_events", chapterIndexs);
        const thinking = msg.thinking("Đang truy vấn sự kiện của chương...");
        const data = await u
          .db("o_novel")
          .where("projectId", resTool.data.projectId)
          .select("id", "chapterIndex as index", "reel", "chapter", "chapterData", "event", "eventState")
          .whereIn("chapterIndex", chapterIndexs);
        thinking.appendText("Đang truy vấn số thứ tự chương: " + chapterIndexs.join(","));
        const eventString = data.map((i: any) => [`Thứ ${i.index}chương ，biểu đề :${i.chapter}，sự kiện:${i.event}`].join("\n")).join("\n");
        thinking.appendText("Truy vấnkết quả:\n" + eventString);
        thinking.updateTitle("Truy vấnchươngsự kiệnhoàn thành");
        thinking.complete();
        return eventString ?? "không Dữ liệu";
      },
    }),
    get_planData: tool({
      description: "Lấycông việc khu Dữ liệu",
      inputSchema: jsonSchema<{ key: keyof planData }>(
        z
          .object({
            key: keySchema.describe("Dữ liệukey"),
          })
          .toJSONSchema(),
      ),
      execute: async ({ key }) => {
        console.log("[tools] get_planData", key);
        const thinking = msg.thinking(`đangLấy${planDataKeyLabels[key]}công việc khu Dữ liệu...`);
        const planData: planData = await new Promise((resolve) => socket.emit("getPlanData", { key }, (res: any) => resolve(res)));
        thinking.appendText(`Lấyđến ${planDataKeyLabels[key]}:\n` + planData[key]);
        thinking.updateTitle(`Lấy${planDataKeyLabels[key]}hoàn thành`);
        thinking.complete();
        return planData[key] ?? "không Dữ liệu";
      },
    }),
    get_novel_text: tool({
      description: "Lấytiểu thuyếtchươnggốc ban đầu văn bản  nội dung",
      inputSchema: jsonSchema<{ chapterIndex: string }>(
        z
          .object({
            chapterIndex: z.string().describe("chươngchỉnh số "),
          })
          .toJSONSchema(),
      ),
      execute: async ({ chapterIndex }) => {
        console.log("[tools] get_novel_text", "[tools] get_novel_text", chapterIndex);
        const thinking = msg.thinking(`đangLấytiểu thuyếtchươnggốc tài ...`);
        const data = await u.db("o_novel").where("projectId", resTool.data.projectId).where({ chapterIndex }).select("chapterData").first();
        const text = data && data?.chapterData ? data.chapterData : "";
        thinking.appendText(`Lấyđến gốc tài :\n` + text);
        thinking.updateTitle(`Lấytiểu thuyếtchươnggốc tài hoàn thành`);
        thinking.complete();
        return text ?? "không Dữ liệu";
      },
    }),
    get_script_content: tool({
      description: "LấyKịch bản sách nội dung",
      inputSchema: jsonSchema<{ ids: string[] }>(
        z
          .object({
            ids: z.array(z.string()).describe("sách id"),
          })
          .toJSONSchema(),
      ),
      execute: async ({ ids }) => {
        console.log("[tools] get_script_content", "[tools] get_script_content", ids);
        const thinking = msg.thinking(`đangLấysách nội dung...`);
        const data = await u.db("o_script").whereIn("id", ids).select("content", "name");
        const text = data && data.length ? data.map((d) => `<scriptItem name="${d.name}">${d.content}</scriptItem>`).join("\n") : "";
        thinking.appendText(`Lấyđến sách nội dung:\n` + JSON.stringify(data, null, 2));
        thinking.updateTitle(`Lấysách nội dunghoàn thành`);
        thinking.complete();
        return text ?? "không Dữ liệu";
      },
    }),
  };
  return toolsNames ? Object.fromEntries(Object.entries(tools).filter(([n]) => toolsNames.includes(n))) : tools;
};
