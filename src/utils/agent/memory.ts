import u from "@/utils";
import { v4 as uuidv4 } from "uuid";
import { getEmbedding, cosineSimilarity } from "./embedding";
import type { memories as MemoryRow } from "@/types/database";
import { tool, jsonSchema } from "ai";
import { z } from "zod";

// ── Giá trị cấu hình mặc định ──
const DEFAULTS: {
  messagesPerSummary: number;
  summaryMaxLength: number;
  shortTermLimit: number;
  summaryLimit: number;
  ragLimit: number;
  deepRetrieveSummaryLimit: number;
} = {
  messagesPerSummary: 3, // Cứ bao nhiêu tin nhắn thì tạo 1 lần tóm tắt (summary)
  summaryMaxLength: 500, // Độ dài tối đa (số ký tự) của một đoạn tóm tắt
  shortTermLimit: 5, // Số lượng tin nhắn chưa tổng kết mà get() trả về
  summaryLimit: 10, // Số lượng bản tóm tắt mà get() trả về
  ragLimit: 3, // Số lượng tin nhắn mà get() trả về từ tìm kiếm theo vector (RAG)
  deepRetrieveSummaryLimit: 5, // Số lượng bản tóm tắt mà deepRetrieve() trả về
};

// ── Hàm hỗ trợ tìm kiếm theo vector ──
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
      system: `Bạn là một trợ lý tóm tắt nội dung. Hãy nén các đoạn nội dung dưới đây thành một đoạn tóm tắt duy nhất, không vượt quá ${summaryMaxLength} ký tự. Chỉ xuất ra nội dung tóm tắt, không thêm tiền tố hay lời giải thích.`,
      messages: [{ role: "user", content: contents.map((c, i) => `${i + 1}. ${c}`).join("\n") }],
    });
    return text.slice(0, Number(summaryMaxLength));
  }

  private async judgeSummaryRelevance(keyword: string, summaries: { id: string; content: string }[]): Promise<string[]> {
    const list = summaries.map((s) => `[${s.id}] ${s.content}`).join("\n");
    const { text } = await u.Ai.Text(this.agentType as any).invoke({
      system:
        'Bạn là một trợ lý truy xuất thông tin. Người dùng sẽ cung cấp cho bạn một từ khóa và một danh sách các bản tóm tắt. Hãy kiểm tra những bản tóm tắt nào chứa thông tin liên quan đến từ khóa đó. CHỈ trả về danh sách id của các bản tóm tắt liên quan, dưới dạng một mảng JSON hợp lệ (không kèm bất kỳ văn bản, markdown hay lời giải thích nào khác), ví dụ: ["id1","id2"]. Nếu không có bản tóm tắt nào liên quan, trả về mảng rỗng [].',
      messages: [{ role: "user", content: `Từ khóa: ${keyword}\n\nDanh sách bản tóm tắt:\n${list}` }],
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
      if (raw == null) continue; // null / undefined thì dùng giá trị mặc định
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

    // Kiểm tra số lượng tin nhắn chưa tổng kết
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

      // Đánh dấu các tin nhắn đã được tổng kết
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
    // shortTerm: các tin nhắn gần nhất chưa được tổng kết
    const shortTerm = await u
      .db("memories")
      .where({ isolationKey, type: "message", summarized: 0 })
      .orderBy("createTime", "desc")
      .limit(Number(shortTermLimit));
    shortTerm.reverse(); // Sắp xếp lại theo thứ tự từ cũ đến mới

    // summaries: các bản tóm tắt gần đây nhất
    const summaries = await u.db("memories").where({ isolationKey, type: "summary" }).orderBy("createTime", "desc").limit(Number(summaryLimit));
    summaries.reverse();

    // rag: tìm kiếm theo vector trên toàn bộ tin nhắn
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
    // Bước 1: tìm kiếm theo vector trong các bản tóm tắt
    const queryEmbedding = await getEmbedding(keyword);
    const allSummaries = await u.db("memories").where({ isolationKey, type: "summary" });
    const topSummaries = vectorSearch(allSummaries, queryEmbedding, Number(deepRetrieveSummaryLimit));

    if (topSummaries.length === 0) return [];

    // Bước 2: dùng AI kiểm tra mức độ liên quan
    const relevantIds = await this.judgeSummaryRelevance(
      keyword,
      topSummaries.map((s) => ({ id: s.id!, content: s.content })),
    );

    if (relevantIds.length === 0) return [];

    // Bước 3: truy vấn lại các tin nhắn gốc ban đầu
    const relevantSummaries = topSummaries.filter((s) => relevantIds.includes(s.id!));
    const messageIds = relevantSummaries.flatMap((s) => JSON.parse(s.relatedMessageIds || "[]") as string[]);

    if (messageIds.length === 0) return [];

    const messages = await u.db("memories").whereIn("id", messageIds).orderBy("createTime", "asc");

    return messages.map((m) => ({ id: m.id, content: m.content, createTime: m.createTime }));
  }

  getTools() {
    return {
      deepRetrieve: tool({
        description: "Truy xuất sâu: sử dụng công cụ này khi bạn cần tìm thông tin chi tiết liên quan đến một từ khóa cụ thể",
        inputSchema: jsonSchema<{ keyword: string }>(
          z
            .object({
              keyword: z.string().describe("Từ khóa cần tìm kiếm"),
            })
            .toJSONSchema(),
        ),
        execute: async ({ keyword }) => {
          const results = await this.deepRetrieve(keyword);
          if (results.length === 0) return { found: false, message: "Không tìm thấy thông tin liên quan" };
          return { found: true, memories: results.map((r) => r.content) };
        },
      }),
    };
  }
}

export default Memory;
