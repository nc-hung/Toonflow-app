import u from "@/utils";
import { v4 as uuidv4 } from "uuid";
import { getEmbedding, cosineSimilarity } from "./embedding";
import type { memories as MemoryRow } from "@/types/database";
import { tool, jsonSchema } from "ai";
import { z } from "zod";

// ── gọi Cấu hìnhMặc địnhgiá trị  ──
const DEFAULTS: {
  messagesPerSummary: number;
  summaryMaxLength: number;
  shortTermLimit: number;
  summaryLimit: number;
  ragLimit: number;
  deepRetrieveSummaryLimit: number;
} = {
  messagesPerSummary: 3, // nhiều ít mục messagephát 1 lần summarytạo
  summaryMaxLength: 500, // summarynhất lớn chữ dài độ 
  shortTermLimit: 5, // get()Trả về của kỳ chưa tổng kết messagemục số 
  summaryLimit: 10, // get()Trả về của summarymục số 
  ragLimit: 3, // get()lượng tìm kiếm Trả về của messagemục số 
  deepRetrieveSummaryLimit: 5, // deepRetrieve()lượng trả summary của mục số 
};

// ── lượng tìm kiếm giúp  ──
function vectorSearch(rows: MemoryRow[], queryEmbedding: number[], limit: number) {
  return rows
    .map((row) => {
      const emb: number[] = JSON.parse(row.embedding ?? "[]");
      return { ...row, similarity: cosineSimilarity(queryEmbedding, emb) };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

class Memory {
  private agentType: string;
  private isolationKey: string;

  constructor(agentType: string, isolationKey: string) {
    this.agentType = agentType;
    this.isolationKey = isolationKey;
  }

  private async generateSummary(contents: string[]): Promise<string> {
    const { summaryMaxLength } = await this.getConfigData({ summaryMaxLength: DEFAULTS.summaryMaxLength });
    const { text } = await u.Ai.Text(this.agentType as any).invoke({
      system: `bạnlà một nén nhỏ giúp tay 。vui lòng dưới nhiều mục nội dungNén thành1 đoạn  của cần  ，không vượt ${summaryMaxLength}mục chữ 。chỉ xuất ra cần  nội dung，không cần  cộng trước  tố hoặc giải 。`,
      messages: [{ role: "user", content: contents.map((c, i) => `${i + 1}. ${c}`).join("\n") }],
    });
    return text.slice(0, Number(summaryMaxLength));
  }

  private async judgeSummaryRelevance(keyword: string, summaries: { id: string; content: string }[]): Promise<string[]> {
    const list = summaries.map((s) => `[${s.id}] ${s.content}`).join("\n");
    const { text } = await u.Ai.Text(this.agentType as any).invoke({
      system:
        'bạnlà một thông tinkiểm kiếm giúp tay 。Người dùngsẽ cho bạnmột liên từ  và 1 nhóm cần  ，vui lòng Kiểm tranhững cần  thể gói liên từ liên  của chi thông tin。chỉ Trả vềliên cần   của iddanh sách，hàm JSONsố nhóm định dạng，lệ như  ["id1","id2"]。không cần  giải 。',
      messages: [{ role: "user", content: `liên từ : ${keyword}\n\ncần  danh sách:\n${list}` }],
    });
    try {
      const ids = JSON.parse(text);
      if (Array.isArray(ids)) return ids.map(String);
    } catch {}
    return [];
  }
  private async getConfigData<T extends Record<string, string | number>>(defaults: T): Promise<T> {
    const keys = Object.keys(defaults) as (keyof T & string)[];
    const rows = await u.db("o_setting").whereIn("key", keys);

    const dbMap: Record<string, string | null> = {};
    for (const row of rows) {
      if (row.key != null) dbMap[row.key] = row.value ?? null;
    }

    const result = { ...defaults };
    for (const key of keys) {
      const raw = dbMap[key];
      if (raw == null) continue; // null / undefined sử dụng Mặc địnhgiá trị 
      const num = Number(raw);
      (result as Record<string, string | number>)[key] = Number.isNaN(num) ? raw : num;
    }
    return result;
  }

  async add(role: string = "user", content: string, options?: { name?: string; createTime?: number }) {
    const { messagesPerSummary } = await this.getConfigData({ messagesPerSummary: DEFAULTS.messagesPerSummary });
    const id = uuidv4();
    const embedding = await getEmbedding(content);
    const isolationKey = this.isolationKey;

    await u.db("memories").insert({
      id,
      isolationKey,
      type: "message",
      role,
      name: options?.name,
      content,
      embedding: JSON.stringify(embedding),
      relatedMessageIds: null,
      summarized: 0,
      createTime: options?.createTime ?? Date.now(),
    } as any);

    // kiểm tra chưa tổng kết hủy số lượng
    const unsummarized = await u.db("memories").where({ isolationKey, type: "message", summarized: 0 }).orderBy("createTime", "asc");

    if (unsummarized.length >= Number(messagesPerSummary)) {
      const batch = unsummarized.slice(0, Number(messagesPerSummary));
      const batchIds = batch.map((m) => m.id);
      const batchContents = batch.map((m) => m.content);

      const summaryContent = await this.generateSummary(batchContents);
      const summaryEmbedding = await getEmbedding(summaryContent);
      const summaryId = uuidv4();

      await u.db("memories").insert({
        id: summaryId,
        isolationKey,
        type: "summary",
        content: summaryContent,
        embedding: JSON.stringify(summaryEmbedding),
        relatedMessageIds: JSON.stringify(batchIds),
        summarized: 0,
        createTime: Date.now(),
      } as any);

      // biểu đã tổng kết 
      await u.db("memories").whereIn("id", batchIds).update({ summarized: 1 });
    }
  }

  async get(text: string) {
    const { shortTermLimit, summaryLimit, ragLimit } = await this.getConfigData({
      shortTermLimit: DEFAULTS.shortTermLimit,
      summaryLimit: DEFAULTS.summaryLimit,
      ragLimit: DEFAULTS.ragLimit,
    });

    const isolationKey = this.isolationKey;
    // shortTerm: nhất chưa tổng kết  của  messages
    const shortTerm = await u
      .db("memories")
      .where({ isolationKey, type: "message", summarized: 0 })
      .orderBy("createTime", "desc")
      .limit(Number(shortTermLimit));
    shortTerm.reverse(); // nhất cũ  ở trước  

    // summaries: nhất  của  summary
    const summaries = await u.db("memories").where({ isolationKey, type: "summary" }).orderBy("createTime", "desc").limit(Number(summaryLimit));
    summaries.reverse();

    // rag: lượng tìm kiếm tất cả messages
    const queryEmbedding = await getEmbedding(text);
    const allMessages = await u.db("memories").where({ isolationKey, type: "message" });
    const ragResults = vectorSearch(allMessages, queryEmbedding, Number(ragLimit));

    return {
      shortTerm: shortTerm.map((m: any) => ({ id: m.id, role: m.role, name: m.name, content: m.content, createTime: m.createTime })),
      summaries: summaries.map((s) => ({
        id: s.id,
        content: s.content,
        relatedMessageIds: JSON.parse(s.relatedMessageIds || "[]"),
        createTime: (s as any).createTime,
      })),
      rag: ragResults.map((r) => ({ id: r.id, content: r.content, similarity: r.similarity })),
    };
  }

  async deepRetrieve(keyword: string) {
    const { deepRetrieveSummaryLimit } = await this.getConfigData({ deepRetrieveSummaryLimit: DEFAULTS.deepRetrieveSummaryLimit });

    const isolationKey = this.isolationKey;
    // bước 1: lượng tìm kiếm  summary
    const queryEmbedding = await getEmbedding(keyword);
    const allSummaries = await u.db("memories").where({ isolationKey, type: "summary" });
    const topSummaries = vectorSearch(allSummaries, queryEmbedding, Number(deepRetrieveSummaryLimit));

    if (topSummaries.length === 0) return [];

    // bước 2: AI Kiểm traliên 
    const relevantIds = await this.judgeSummaryRelevance(
      keyword,
      topSummaries.map((s) => ({ id: s.id!, content: s.content })),
    );

    if (relevantIds.length === 0) return [];

    // bước 3: mở Truy vấngốc ban đầu  messages
    const relevantSummaries = topSummaries.filter((s) => relevantIds.includes(s.id!));
    const messageIds = relevantSummaries.flatMap((s) => JSON.parse(s.relatedMessageIds || "[]") as string[]);

    if (messageIds.length === 0) return [];

    const messages = await u.db("memories").whereIn("id", messageIds).orderBy("createTime", "asc");

    return messages.map((m) => ({ id: m.id, content: m.content, createTime: m.createTime }));
  }

  getTools() {
    return {
      deepRetrieve: tool({
        description: "độ kiểm kiếm ：khi bạnCần trả mục liên từ liên  của chi thông tinsử dụng cụ ",
        inputSchema: jsonSchema<{ keyword: string }>(
          z
            .object({
              keyword: z.string().describe("cần  kiểm kiếm  của liên từ "),
            })
            .toJSONSchema(),
        ),
        execute: async ({ keyword }) => {
          const results = await this.deepRetrieve(keyword);
          if (results.length === 0) return { found: false, message: "không tìm thấyliên " };
          return { found: true, memories: results.map((r) => r.content) };
        },
      }),
    };
  }
}

export default Memory;
