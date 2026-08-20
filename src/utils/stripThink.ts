/**
 * đi bỏ độ Mô hìnhxuất ra  của  <think>...</think> biểu ký nội dung
 *
 * 1. stripThink(text)          — hàm với phi thức ，trực tiếp đi bỏ chỉnh văn bản  giữa  của  <think> 
 * 2. createThinkStreamFilter() — hàm với thức ，Trả vềcó trạng thái của lọc thiết bị ， chunk lọc 
 */

/**
 * phi thức ：đi bỏ chỉnh văn bản  giữa  của  <think>...</think>
 */
export function stripThink(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

/**
 * thức ：sáng tạo một có trạng thái của  chunk lọc thiết bị 
 *
 * hàm thức ：
 * ```ts
 * const filter = createThinkStreamFilter();
 * for await (const chunk of textStream) {
 *   const filtered = filter.push(chunk);
 *   if (filtered) msg.send(filtered);
 * }
 * ```
 */
export function createThinkStreamFilter() {
  let insideThink = false;
  let buffer = "";

  return {
    /**
     * tải vào một  chunk，Trả vềlọc sau  Cần xuất ra  của văn bản  （thể rỗng chuỗi ký tự）
     */
    push(chunk: string): string {
      let output = "";
      let i = 0;

      while (i < chunk.length) {
        if (insideThink) {
          // đang <think> trong bộ ， </think>
          const closeIdx = chunk.indexOf("</think>", i);
          if (closeIdx !== -1) {
            // đến hợp biểu ký ，biểu ký nội dung
            insideThink = false;
            i = closeIdx + "</think>".length;
          } else {
            // chỉnh mục  chunk đều ở  think trong ，toàn bộ
            break;
          }
        } else {
          // không ở  <think> trong bộ 
          const openIdx = chunk.indexOf("<think>", i);
          if (openIdx !== -1) {
            // đến mở động biểu ký ，xuất ra biểu ký  của trước   của nội dung
            output += buffer + chunk.slice(i, openIdx);
            buffer = "";
            insideThink = true;
            i = openIdx + "<think>".length;
          } else {
            // chưa có phát  <think>，nhưng thể  chunk đuôi là không chỉnh  của  "<thi..."
            // đuôi thể là  "<" mở đầu  của không chỉnh biểu ký đoạn 
            const potentialStart = findPartialTag(chunk, i);
            if (potentialStart !== -1) {
              output += buffer + chunk.slice(i, potentialStart);
              buffer = chunk.slice(potentialStart);
            } else {
              output += buffer + chunk.slice(i);
              buffer = "";
            }
            break;
          }
        }
      }

      return output;
    },

    /**
     * kết thúcgọi hàm ，làm ra khu giữa lưu  của nội dung
     */
    flush(): string {
      const remaining = buffer;
      buffer = "";
      return remaining;
    },
  };
}

/**
 * kiểm tra  chunk[startIdx..]  của đuôi là không gói  "<think>"  của không chỉnh trước  tố 
 * như  "<", "<t", "<th", "<thi", "<thin", "<think"
 * Trả vềkhông chỉnh trước  tố  của ban đầu vị trí trí ，không tìm thấyTrả về -1
 */
function findPartialTag(chunk: string, startIdx: number): number {
  const tag = "<think>";
  // chỉ cần kiểm tra đuôi nhất nhiều  tag.length - 1 mục chữ 
  const searchStart = Math.max(startIdx, chunk.length - (tag.length - 1));
  for (let i = searchStart; i < chunk.length; i++) {
    const remaining = chunk.slice(i);
    if (tag.startsWith(remaining)) {
      return i;
    }
  }
  return -1;
}
