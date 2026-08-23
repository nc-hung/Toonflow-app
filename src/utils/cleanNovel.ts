import { EventEmitter } from "events";
import { o_novel } from "@/types/database";
import u from "@/utils";
import { stripThink } from "@/utils/stripThink";
export interface EventType {
  id: number;
  event: string;
}

/*  Làm sạch dữ liệu văn bản 
 * @param textData Văn bản  cần  làm  sạch
 * @param windowSize Số lượng mỗi nhóm, mặc định 5
 * @param overlap Số lượng gối đầu, mặc định 1
 * @returns {totalCharacter: Tất cả thẻ nhân vật, totalEvent: Tất cả sự kiện}
 */

class CleanNovel {
  emitter: EventEmitter;
  /** Số tác vụ đồng thời tối đa */
  concurrency: number;

  constructor(concurrency: number = 5) {
    this.emitter = new EventEmitter();
    this.concurrency = concurrency;
  }

  private async processChapter(novel: o_novel): Promise<EventType | null> {
    try {
      const prompt = await u.getPrompts("event");
      const promptData = await u.db("o_prompt").where("type", "eventExtraction").first();
      let eventExtraction = "" as string | undefined;
      if (promptData && promptData.useData) {
        eventExtraction = promptData.useData;
      } else {
        eventExtraction = promptData?.data ?? undefined;
      }
      const resData = await u.Ai.Text("universalAi").invoke({
        system: eventExtraction ?? (prompt as string),
        messages: [
          {
            role: "user",
            content:
              "Vui lòng dựa vào số thứ tự chương tiểu thuyết: " +
              novel.chapterIndex +
              ", quyển: " +
              novel.reel +
              ", tên chương: " +
              novel.chapter +
              ", và nội dung chương để tạo tóm tắt sự kiện:\n" +
              novel.chapterData!,
          },
        ],
      });
      const preData = stripThink(resData.text);
      this.emitter.emit("item", { id: novel.id, event: preData });
      return { id: novel.id!, event: preData };
    } catch (e) {
      this.emitter.emit("item", { id: novel.id, event: null, errorReason: u.error(e).message });
      return null;
    }
  }

  async start(allChapters: o_novel[], projectId: number): Promise<EventType[]> {
    const totalEvent: EventType[] = [];

    // Kiểm soát đồng thời: giới hạn số lượng tác vụ thực thi cùng lúc
    let running = 0;
    let index = 0;
    const results: Promise<void>[] = [];

    const runNext = (): Promise<void> => {
      if (index >= allChapters.length) return Promise.resolve();
      const novel = allChapters[index++];
      running++;

      return this.processChapter(novel).then((result) => {
        if (result) totalEvent.push(result);
        running--;
        return runNext();
      });
    };

    // Khởi chạy tối đa concurrency tác vụ đồng thời
    const workers = Array.from({ length: Math.min(this.concurrency, allChapters.length) }, () => runNext());

    await Promise.all(workers);

    return totalEvent;
  }
}

export default CleanNovel;
