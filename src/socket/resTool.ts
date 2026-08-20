import u from "@/utils";
import { Socket } from "socket.io";
import type {
  ChatMessageStatus,
  AIMessageContent,
  TextContent,
  MarkdownContent,
  ImageContent,
  ThinkingContent,
  SearchContent,
  SuggestionContent,
  ToolCallContent,
  ActivityContent,
  ReasoningContent,
} from "./chatMessagesData";

type ContentType = AIMessageContent["type"];

class ResTool {
  public socket: Socket;
  public data: Record<string, any>;

  constructor(socket: Socket, data: Record<string, any> = {}) {
    this.socket = socket;
    this.data = data;
  }

  // Tạo tin nhắn mới 
  newMessage(role: "assistant" | "user" | "system" = "assistant", name?: string) {
    const messageId = u.uuid();
    const datetime = new Date().toISOString();

    this.socket.emit("message", {
      id: messageId,
      role,
      name,
      status: "pending" as ChatMessageStatus,
      datetime,
      content: [],
    });

    return new MessageBuilder(this.socket, messageId, role, name, datetime);
  }

  // Gửi tin nhắn lỗi
  sendError(messageId: string, error: string) {
    this.socket.emit("message:update", {
      id: messageId,
      status: "error" as ChatMessageStatus,
      ext: { error },
    });
  }

  // Gửi trạng thái hoàn thành
  sendComplete(messageId: string) {
    this.socket.emit("message:update", {
      id: messageId,
      status: "complete" as ChatMessageStatus,
    });
  }
}

// Bộ xây dựng tin nhắn
class MessageBuilder {
  private socket: Socket;
  private messageId: string;
  private messageRole: "assistant" | "user" | "system";
  private messageName?: string;
  private messageDatetime: string;

  constructor(socket: Socket, messageId: string, role: "assistant" | "user" | "system", name?: string, datetime?: string) {
    this.socket = socket;
    this.messageId = messageId;
    this.messageRole = role;
    this.messageName = name;
    this.messageDatetime = datetime ?? new Date().toISOString();
  }

  get id() {
    return this.messageId;
  }

  get role() {
    return this.messageRole;
  }

  get name() {
    return this.messageName;
  }

  get datetime() {
    return this.messageDatetime;
  }

  // Cập nhật trạng thái tin nhắn
  updateStatus(status: ChatMessageStatus) {
    this.socket.emit("message:update", {
      id: this.messageId,
      status,
    });
    return this;
  }

  // Thêm nội dung văn bản 
  text(initialText = "") {
    const contentId = u.uuid();
    const content: TextContent = {
      type: "text",
      id: contentId,
      data: "",
      status: "pending",
    };

    this.socket.emit("content:add", {
      messageId: this.messageId,
      content,
    });

    const stream = new AutoThinkingTextStream(this.socket, this.messageId, contentId, this);
    if (initialText) {
      stream.append(initialText);
    }
    return stream;
  }

  // Thêm nội dung Markdown
  markdown(initialText = "") {
    const contentId = u.uuid();
    const content: MarkdownContent = {
      type: "markdown",
      id: contentId,
      data: initialText,
      status: "pending",
    };

    this.socket.emit("content:add", {
      messageId: this.messageId,
      content,
    });

    return new ContentStream<string>(this.socket, this.messageId, contentId, "markdown");
  }

  // Thêm nội dung suy nghĩ
  thinking(title = "Đang suy nghĩ...") {
    const contentId = u.uuid();
    const content: ThinkingContent = {
      type: "thinking",
      id: contentId,
      data: { title, text: "" },
      status: "pending",
    };

    this.socket.emit("content:add", {
      messageId: this.messageId,
      content,
    });

    return new ThinkingStream(this.socket, this.messageId, contentId);
  }

  // Thêm nội dung tìm kiếm
  search(title = "Đang tìm kiếm...") {
    const contentId = u.uuid();
    const content: SearchContent = {
      type: "search",
      id: contentId,
      data: { title, references: [] },
      status: "pending",
    };

    this.socket.emit("content:add", {
      messageId: this.messageId,
      content,
    });

    return new SearchStream(this.socket, this.messageId, contentId);
  }

  // Thêm nội dung hình ảnh
  image(data: ImageContent["data"]) {
    const contentId = u.uuid();
    const content: ImageContent = {
      type: "image",
      id: contentId,
      data,
      status: "complete",
    };

    this.socket.emit("content:add", {
      messageId: this.messageId,
      content,
    });

    return this;
  }

  // Thêm nội dung gợi ý
  suggestion(suggestions: SuggestionContent["data"]) {
    const contentId = u.uuid();
    const content: SuggestionContent = {
      type: "suggestion",
      id: contentId,
      data: suggestions,
      status: "complete",
    };

    this.socket.emit("content:add", {
      messageId: this.messageId,
      content,
    });

    return this;
  }

  // Thêm nội dung gọi công cụ
  toolCall(data: ToolCallContent["data"]) {
    const contentId = u.uuid();
    const content: ToolCallContent = {
      type: "toolcall",
      id: contentId,
      data: { ...data, parentMessageId: this.messageId },
      status: "pending",
    };

    this.socket.emit("content:add", {
      messageId: this.messageId,
      content,
    });

    return new ToolCallStream(this.socket, this.messageId, contentId, data.toolCallId);
  }

  // Thêm nội dung hoạt động
  activity<T = Record<string, any>>(activityType: string, content: T) {
    const contentId = u.uuid();
    const activityContent: ActivityContent<T> = {
      type: "activity",
      id: contentId,
      data: {
        activityType,
        messageId: this.messageId,
        content,
      },
      status: "complete",
    };

    this.socket.emit("content:add", {
      messageId: this.messageId,
      content: activityContent,
    });

    return this;
  }

  // Thêm nội dung suy luận
  reasoning() {
    const contentId = u.uuid();
    const content: ReasoningContent = {
      type: "reasoning",
      id: contentId,
      data: [],
      status: "pending",
    };

    this.socket.emit("content:add", {
      messageId: this.messageId,
      content,
    });

    return new ReasoningBuilder(this.socket, this.messageId, contentId);
  }

  // Hoàn thành tin nhắn
  complete() {
    this.socket.emit("message:update", {
      id: this.messageId,
      status: "complete" as ChatMessageStatus,
    });
  }

  // Dừng tin nhắn
  stop() {
    this.socket.emit("message:update", {
      id: this.messageId,
      status: "stop" as ChatMessageStatus,
    });
  }

  // Lỗi
  error(errorMsg?: string) {
    this.socket.emit("message:update", {
      id: this.messageId,
      status: "error" as ChatMessageStatus,
      ext: errorMsg ? { error: errorMsg } : undefined,
    });
  }
}

// Lớp cơ sở luồng nội dung
class ContentStream<T> {
  protected socket: Socket;
  protected messageId: string;
  protected contentId: string;
  protected contentType: ContentType;

  constructor(socket: Socket, messageId: string, contentId: string, contentType: ContentType) {
    this.socket = socket;
    this.messageId = messageId;
    this.contentId = contentId;
    this.contentType = contentType;
  }

  get id() {
    return this.contentId;
  }

  // Nối dữ liệu dạng luồng
  append(chunk: string) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: this.contentType,
      data: chunk,
      strategy: "append",
      status: "streaming",
    });
    return this;
  }

  // Hợp nhất / Thay thế dữ liệu
  merge(data: T) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: this.contentType,
      data,
      strategy: "merge",
      status: "streaming",
    });
    return this;
  }

  // Hoàn thành nội dung
  complete(finalData?: T) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: this.contentType,
      data: finalData,
      status: "complete",
    });
    return this;
  }

  // Lỗi
  error() {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      status: "error",
    });
    return this;
  }
}

// Luồng nội dung suy nghĩ
class ThinkingStream extends ContentStream<ThinkingContent["data"]> {
  constructor(socket: Socket, messageId: string, contentId: string) {
    super(socket, messageId, contentId, "thinking");
  }

  // Nối văn bản  suy nghĩ
  appendText(chunk: string) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: "thinking",
      data: { text: chunk },
      strategy: "append",
      status: "streaming",
    });
    return this;
  }

  // Cập nhật tiêu đề
  updateTitle(title: string) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: "thinking",
      data: { title },
      strategy: "merge",
      status: "streaming",
    });
    return this;
  }
}

// Luồng nội dung văn bản : tự động chuyển <think>...</think> thành nội dung suy nghĩ
class AutoThinkingTextStream extends ContentStream<string> {
  private static readonly OPEN_TAG = "<think>";
  private static readonly CLOSE_TAG = "</think>";

  private readonly messageBuilder: MessageBuilder;
  private pending = "";
  private inThinking = false;
  private thinkingStream: ThinkingStream | null = null;
  private thinkingBuffer = "";
  private thinkingStartTime: number = 0;

  constructor(socket: Socket, messageId: string, contentId: string, messageBuilder: MessageBuilder) {
    super(socket, messageId, contentId, "text");
    this.messageBuilder = messageBuilder;
  }

  /**
   * Kiểm tra phần đuôi của str có phải là tiền tố thực không rỗng của tag.
   * Trả về số ký tự đuôi cần  giữ lại (0 nghĩa là không cần  bộ đệm).
   */
  private static tailPrefixLen(str: string, tag: string): number {
    const maxCheck = Math.min(str.length, tag.length - 1);
    for (let len = maxCheck; len >= 1; len--) {
      if (str.endsWith(tag.slice(0, len))) {
        return len;
      }
    }
    return 0;
  }

  override append(chunk: string) {
    if (!chunk) return this;

    let rest = this.pending + chunk;
    this.pending = "";

    while (rest.length > 0) {
      if (!this.inThinking) {
        // Tìm thẻ mở <think>
        const openIndex = rest.indexOf(AutoThinkingTextStream.OPEN_TAG);
        if (openIndex >= 0) {
          this.flushText(rest.slice(0, openIndex));
          this.inThinking = true;
          this.thinkingStartTime = Date.now();
          this.thinkingBuffer = "";
          this.ensureThinkingStream();
          rest = rest.slice(openIndex + AutoThinkingTextStream.OPEN_TAG.length);
          continue;
        }

        // Kiểm tra đuôi có thể là tiền tố một phần của thẻ
        const keep = AutoThinkingTextStream.tailPrefixLen(rest, AutoThinkingTextStream.OPEN_TAG);
        if (keep > 0) {
          this.flushText(rest.slice(0, rest.length - keep));
          this.pending = rest.slice(rest.length - keep);
        } else {
          this.flushText(rest);
        }
        break;
      } else {
        // Tìm thẻ đóng </think>
        const closeIndex = rest.indexOf(AutoThinkingTextStream.CLOSE_TAG);
        if (closeIndex >= 0) {
          this.flushThinking(rest.slice(0, closeIndex));
          this.finishThinking();
          rest = rest.slice(closeIndex + AutoThinkingTextStream.CLOSE_TAG.length);
          continue;
        }

        // Kiểm tra đuôi có thể là tiền tố một phần của thẻ
        const keep = AutoThinkingTextStream.tailPrefixLen(rest, AutoThinkingTextStream.CLOSE_TAG);
        if (keep > 0) {
          this.flushThinking(rest.slice(0, rest.length - keep));
          this.pending = rest.slice(rest.length - keep);
        } else {
          this.flushThinking(rest);
        }
        break;
      }
    }

    return this;
  }

  override complete(finalData?: string) {
    if (finalData) {
      this.append(finalData);
    }

    if (this.pending) {
      if (this.inThinking) {
        this.flushThinking(this.pending);
      } else {
        this.flushText(this.pending);
      }
      this.pending = "";
    }

    this.finishThinking();
    super.complete();
    return this;
  }

  override error() {
    if (this.thinkingStream) {
      this.thinkingStream.error();
      this.thinkingStream = null;
    }
    this.pending = "";
    this.thinkingBuffer = "";
    this.inThinking = false;
    return super.error();
  }

  /** Xuất văn bản  thông thường */
  private flushText(text: string) {
    if (!text) return;
    super.append(text);
  }

  /** Xuất văn bản  suy nghĩ: tích lũy nội dung đầy đủ và gửi bằng cơ chế merge để tránh mất mát */
  private flushThinking(text: string) {
    if (!text) return;
    this.thinkingBuffer += text;
    this.ensureThinkingStream().merge({ title: "Đang suy nghĩ...", text: this.thinkingBuffer });
  }

  private ensureThinkingStream() {
    if (!this.thinkingStream) {
      this.thinkingStartTime = Date.now();
      this.thinkingStream = this.messageBuilder.thinking("Đang suy nghĩ...");
    }
    return this.thinkingStream;
  }

  private finishThinking() {
    if (this.thinkingStream) {
      const elapsed = ((Date.now() - this.thinkingStartTime) / 1000).toFixed(1);
      this.thinkingStream.updateTitle(`Hoàn thành suy nghĩ (${elapsed} giây)`);
      this.thinkingStream.complete({ title: `Hoàn thành suy nghĩ (${elapsed} giây)`, text: this.thinkingBuffer });
      this.thinkingStream = null;
      this.thinkingBuffer = "";
    }
    this.inThinking = false;
  }
}

// Luồng nội dung tìm kiếm
class SearchStream extends ContentStream<SearchContent["data"]> {
  constructor(socket: Socket, messageId: string, contentId: string) {
    super(socket, messageId, contentId, "search");
  }

  // Thêm trích dẫn
  addReference(ref: Exclude<SearchContent["data"]["references"], undefined>[0]) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: "search",
      data: { references: [ref] },
      strategy: "append",
      status: "streaming",
    });
    return this;
  }

  // Thêm hàng loạt trích dẫn
  addReferences(refs: SearchContent["data"]["references"]) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: "search",
      data: { references: refs },
      strategy: "append",
      status: "streaming",
    });
    return this;
  }

  // Cập nhật tiêu đề
  updateTitle(title: string) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: "search",
      data: { title },
      strategy: "merge",
      status: "streaming",
    });
    return this;
  }
}

// Luồng gọi công cụ
class ToolCallStream extends ContentStream<ToolCallContent["data"]> {
  private toolCallId: string;

  constructor(socket: Socket, messageId: string, contentId: string, toolCallId: string) {
    super(socket, messageId, contentId, "toolcall");
    this.toolCallId = toolCallId;
  }

  // Nối khối tham số
  appendArgs(chunk: string) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: "toolcall",
      data: { toolCallId: this.toolCallId, args: chunk },
      strategy: "append",
      status: "streaming",
    });
    return this;
  }

  // Nối khối kết quả
  appendResult(chunk: string) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: "toolcall",
      data: { toolCallId: this.toolCallId, chunk },
      strategy: "append",
      status: "streaming",
    });
    return this;
  }

  // Thiết lập kết quả đầy đủ
  setResult(result: string) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: "toolcall",
      data: { toolCallId: this.toolCallId, result },
      strategy: "merge",
      status: "complete",
    });
    return this;
  }

  // Cập nhật loại sự kiện
  updateEventType(eventType: ToolCallContent["data"]["eventType"]) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: "toolcall",
      data: { toolCallId: this.toolCallId, eventType },
      strategy: "merge",
      status: "streaming",
    });
    return this;
  }
}

// Bộ xây dựng suy luận
class ReasoningBuilder {
  private socket: Socket;
  private messageId: string;
  private contentId: string;

  constructor(socket: Socket, messageId: string, contentId: string) {
    this.socket = socket;
    this.messageId = messageId;
    this.contentId = contentId;
  }

  // Thêm nội dung con
  addContent(content: AIMessageContent) {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: "reasoning",
      data: [content],
      strategy: "append",
      status: "streaming",
    });
    return this;
  }

  // Hoàn thành suy luận
  complete() {
    this.socket.emit("content:update", {
      messageId: this.messageId,
      contentId: this.contentId,
      type: "reasoning",
      status: "complete",
    });
    return this;
  }
}

export default ResTool;
export { MessageBuilder, ContentStream, ThinkingStream, SearchStream, ToolCallStream, ReasoningBuilder };
