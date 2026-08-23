import { Knex } from "knex";
import { v4 as uuid } from "uuid";
import { getEmbedding } from "@/utils/agent/embedding";

interface TableSchema {
  name: string;
  builder: (table: Knex.CreateTableBuilder) => void;
  initData?: (knex: Knex) => Promise<void>;
}

export default async (knex: Knex, forceInit: boolean = false): Promise<void> => {
  const tables: TableSchema[] = [
    // bảng người dùng
    {
      name: "o_user",
      builder: (table) => {
        table.integer("id").notNullable();
        table.text("name");
        table.text("password");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {
        await knex("o_user").insert([{ id: 1, name: "admin", password: "admin123" }]);
      },
    },
    // bảng dự án
    {
      name: "o_project",
      builder: (table) => {
        table.integer("id");
        table.string("projectType");
        table.string("imageModel");
        table.string("imageQuality");
        table.string("videoModel");
        table.text("name");
        table.text("intro");
        table.text("type");
        table.text("artStyle");
        table.text("directorManual");
        table.text("mode");
        table.text("videoRatio");
        table.integer("createTime");
        table.integer("userId");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    // bảng phong cách mỹ thuật
    {
      name: "o_artStyle",
      builder: (table) => {
        table.integer("id").notNullable();
        table.string("name");
        table.text("fileUrl");
        table.text("label");
        table.text("prompt");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {},
    },
    // bảng cấu hình Agent
    {
      name: "o_agentDeploy",
      builder: (table) => {
        table.integer("id").notNullable();
        table.string("model");
        table.string("key");
        table.string("modelName");
        table.text("vendorId");
        table.string("desc");
        table.string("name");
        table.integer("temperature");
        table.integer("maxOutputTokens");
        table.boolean("disabled").defaultTo(false);
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {
        await knex("o_agentDeploy").insert([
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "scriptAgent",
            name: "Agent Kịch bản",
            desc: "Dùng để đọc nguyên tác tạo khung cốt truyện, chiến lược chuyển thể; khuyến nghị dùng mô hình có khả năng hiểu và tạo văn bản mạnh mẽ",
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent",
            name: "Agent Sản xuất",
            desc: "Điều phối và quản lý quy trình sản xuất; khuyến nghị dùng mô hình có tư duy logic và quản lý tác vụ tốt",
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "universalAi",
            name: "AI Đa năng",
            desc: "Dùng cho trích xuất sự kiện tiểu thuyết, sinh gợi ý tài nguyên, trích xuất thoại; khuyến nghị dùng mô hình xử lý văn bản tốt",
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "ttsDubbing",
            name: "Lồng tiếng TTS",
            desc: "Tạo giọng lồng tiếng nhân vật dựa trên nội dung kịch bản, hỗ trợ nhiều phong cách giọng và cảm xúc",
            disabled: true,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "scriptAgent:decisionAgent",
            name: "Agent Kịch bản: Tầng Quyết định",
            desc: "Tầng ra quyết định",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "scriptAgent:supervisionAgent",
            name: "Agent Kịch bản: Tầng Giám sát",
            desc: "Tầng kiểm duyệt & giám sát",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "scriptAgent:storySkeletonAgent",
            name: "Agent Kịch bản: Khung Cốt truyện",
            desc: "Tạo khung sườn cốt truyện",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "scriptAgent:adaptationStrategyAgent",
            name: "Agent Kịch bản: Chiến lược Chuyển thể",
            desc: "Tạo chiến lược chuyển thể",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "scriptAgent:scriptAgent",
            name: "Agent Kịch bản: Soạn Kịch bản",
            desc: "Soạn thảo kịch bản chi tiết",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:decisionAgent",
            name: "Agent Sản xuất: Tầng Quyết định",
            desc: "Tầng ra quyết định sản xuất",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:supervisionAgent",
            name: "Agent Sản xuất: Tầng Giám sát",
            desc: "Tầng kiểm duyệt & giám sát sản xuất",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:deriveAssetsAgent",
            name: "Agent Sản xuất: Biến thể Tài nguyên",
            desc: "Trích xuất biến thể trạng thái tài nguyên",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:generateAssetsAgent",
            name: "Agent Sản xuất: Tạo Tài nguyên",
            desc: "Tạo tài nguyên hình ảnh",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:directorPlanAgent",
            name: "Agent Sản xuất: Kế hoạch Đạo diễn",
            desc: "Lập kế hoạch đạo diễn",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:storyboardGenAgent",
            name: "Agent Sản xuất: Tạo Phân cảnh",
            desc: "Tạo danh sách phân cảnh",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:storyboardPanelAgent",
            name: "Agent Sản xuất: Bảng Phân cảnh",
            desc: "Tạo bảng thông tin phân cảnh",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:storyboardTableAgent",
            name: "Agent Sản xuất: Biểu mẫu Phân cảnh",
            desc: "Tạo bảng dữ liệu phân cảnh",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
        ]);
      },
    },
    // bảng cài đặt
    {
      name: "o_setting",
      builder: (table) => {
        table.text("key");
        table.text("value");
        table.primary(["key"]);
        table.unique(["key"]);
      },
      initData: async (knex) => {
        await knex("o_setting").insert([
          {
            key: "tokenKey",
            value: uuid().slice(0, 8),
          },
          {
            key: "messagesPerSummary",
            value: 10,
          },
          {
            key: "shortTermLimit",
            value: 5,
          },
          {
            key: "summaryMaxLength",
            value: 500,
          },
          {
            key: "summaryLimit",
            value: 10,
          },
          {
            key: "ragLimit",
            value: 3,
          },
          {
            key: "deepRetrieveSummaryLimit",
            value: 5,
          },
          {
            key: "modelOnnxFile",
            value: '["all-MiniLM-L6-v2", "onnx", "model_fp16.onnx"]',
          },
          {
            key: "modelDtype",
            value: "fp16",
          },
          {
            key: "switchAiDevTool",
            value: "0",
          },
        ]);
      },
    },
    // bảng trung tâm tác vụ
    {
      name: "o_tasks",
      builder: (table) => {
        table.integer("id").notNullable();
        table.integer("projectId");
        table.string("taskClass");
        table.string("relatedObjects");
        table.string("model");
        table.text("describe");
        table.string("state");
        table.integer("startTime");
        table.text("reason");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {},
    },
    // bảng gợi ý / Prompt
    {
      name: "o_prompt",
      builder: (table) => {
        table.integer("id").notNullable();
        table.string("name");
        table.string("type");
        table.text("data");
        table.text("useData");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {
        await knex("o_prompt").insert([
          {
            name: "Trích xuất sự kiện",
            type: "eventExtraction",
            data: `# Hướng dẫn Trích Xuất Sự Kiện\n\nBạn là trợ lý phân tích văn bản tiểu thuyết. Người dùng sẽ cung cấp nội dung một chương, bạn hãy trích xuất thông tin sự kiện có cấu trúc của chương đó.\n\n## ⚠️ Ràng buộc đầu ra (Ưu tiên cao nhất, vi phạm bất kỳ điều nào đều coi là thất bại)\n\n1. Câu trả lời **hoàn chỉnh** của bạn chỉ gồm ĐÚNG 1 DÒNG, bắt đầu bằng \`|\` và kết thúc bằng \`|\`, chứa đúng 7 trường\n2. Ký tự đầu tiên phải là \`|\`, ký tự cuối cùng phải là \`|\`\n3. Trước \`|\` không được có bất kỳ ký tự nào (không lời mở đầu, không giải thích)\n4. Sau \`|\` không được có bất kỳ ký tự nào (không tóm tắt, không ghi chú)\n5. Không xuất hàng tiêu đề bảng, đường phân cách, tiêu đề Markdown, emoji, hay khối mã\n\n## Định dạng đầu ra\n\n\`\`\`\n| Chương X {Tiêu đề chương} | {Nhân vật liên quan} | {Sự kiện cốt lõi} | {Quan hệ mạch chính} | {Mật độ thông tin} | {Thời lượng ước tính} | {Cường độ cảm xúc} |\n\`\`\`\n\n### Quy chuẩn trường\n\n| Trường | Yêu cầu định dạng | Ví dụ |\n|------|----------|------|\n| Chương | \`Chương X {Tiêu đề chương}\` | \`Chương 1 Khủng hoảng sự nghiệp và điều ước\` |\n| Nhân vật liên quan | Các nhân vật có cảnh diễn thực tế, phân tách bằng dấu phẩy | \`Lâm Dật, Bạch Hữu Dung\` |\n| Sự kiện cốt lõi | 30-60 chữ, phải có hành động + kết quả | \`Lâm Dật vì trào lưu bóc mẽ ảo thuật mà sụp đổ sự nghiệp, trong cơn chán nản đã ước nguyện và kích hoạt hệ thống ma pháp\` |\n| Quan hệ mạch chính | **Bắt buộc** là \`Mạnh/Vừa/Yếu (Lý do 3-8 chữ)\` | \`Mạnh (Xây dựng động cơ + kích hoạt hệ thống)\` |\n| Mật độ thông tin | \`Cao\` / \`Vừa\` / \`Thấp\` | \`Cao\` |\n| Thời lượng ước tính | **Bắt buộc** là \`X giây\`, cấm dùng đơn vị phút, chỉ dùng số giây nguyên | \`50 giây\` |\n| Cường độ cảm xúc | Nhãn chữ, nối bằng \`+\`, cấm dùng sao/số | \`Bước ngoặt+Hồi hộp\` |\n\n**Quy tắc xác định quan hệ mạch chính**: Mạnh = Thúc đẩy trực tiếp vòng cung nhân vật chính; Vừa = Bổ sung thế giới quan/quan hệ nhân vật/cài cắm; Yếu = Chuyển đoạn/không khí.\n\n**Tham khảo thời lượng ước tính**: Mật độ cao + cảm xúc cao → 45-60 giây; Vừa → 35-45 giây; Thấp → 25-35 giây.\n\n**Nhãn cảm xúc có sẵn**: \`Xung đột\`, \`Kinh dị\`, \`Tình cảm\`, \`Bước ngoặt\`, \`Cao trào\`, \`Bình lặng\`, \`Hài hước\`, \`Hồi hộp\`, \`Sụp đổ cảm xúc\`.\n\n## Ví dụ đầu ra\n\n\`\`\`\n| Chương 1 Khủng hoảng sự nghiệp | Lâm Dật | Ảo thuật gia Lâm Dật sụp đổ sự nghiệp do phong trào bóc mẽ, trong tuyệt vọng đã kích hoạt hệ thống ma pháp thần kỳ | Mạnh (Tạo động cơ nhân vật chính + kích hoạt hệ thống) | Cao | 50 giây | Bước ngoặt+Hồi hộp |\n\`\`\`\n\n## Nguyên tắc trích xuất\n\n- Trung thực với nguyên tác, không suy diễn, không tự ý thêm thắt\n- Tên nhân vật dùng cách gọi phổ biến nhất trong truyện\n- Khi có nhiều tuyến sự kiện song song, chọn tuyến có ảnh hưởng lớn nhất đến nhân vật chính`,
          },
          {
            name: "Trích xuất tài nguyên kịch bản",
            type: "scriptAssetExtraction",
            data: `---\nname: universal_agent\ndescription: Trợ lý chuyên trích xuất tài nguyên (nhân vật, bối cảnh, đạo cụ) từ kịch bản và tạo danh sách có cấu trúc.\n---\n\n# Trích Xuất Tài Nguyên Kịch Bản (Script Assets Extract)\n\nBạn là trợ lý phân tích kịch bản chuyên nghiệp, chuyên nhận diện và trích xuất tất cả tài nguyên (nhân vật, bối cảnh, đạo cụ) từ văn bản kịch bản, đồng thời tạo mô tả trực quan và prompt tiếng Anh phục vụ quy trình tạo hình ảnh AI tiếp theo.\n\n## Khi nào sử dụng\n\nNgười dùng cung cấp kịch bản, bạn cần đọc từng đoạn và trích xuất tất cả tài nguyên liên quan (nhân vật, địa điểm/bối cảnh, đồ vật/đạo cụ), xuất thành danh sách tài nguyên có cấu trúc.\n\n## Tương ứng với hệ thống\n\n- Loại tài nguyên:\n  - \`role\` — Nhân vật (tương ứng \`o_assets.type = "role"\`)\n  - \`scene\` — Bối cảnh / Địa điểm (tương ứng \`o_assets.type = "scene"\`)\n  - \`tool\` — Đạo cụ / Đồ vật (tương ứng \`o_assets.type = "tool"\`)\n\n## Yêu cầu đầu ra\n\n**Bắt buộc gọi công cụ \`resultTool\` để trả về kết quả**, nghiêm cấm xuất dưới dạng văn bản thuần, bảng Markdown hoặc khối mã JSON trực tiếp.\n\nMỗi đối tượng tài nguyên bao gồm các trường sau:\n\n| Trường | Kiểu | Bắt buộc | Giải thích |\n| ---- | ---- | ---- | ---- |\n| \`name\` | string | Có | Tên tài nguyên, dùng tên gốc trong kịch bản |\n| \`desc\` | string | Có | Mô tả tài nguyên trực quan bằng tiếng Việt (30-80 chữ), nêu rõ giới tính nếu là nhân vật |\n| \`prompt\` | string | Có | Prompt tạo hình bằng TIẾNG ANH dùng cho mô hình AI Image |\n| \`type\` | enum | Có | Loại tài nguyên: \`role\` / \`scene\` / \`tool\` |\n\n## Quy tắc trích xuất\n\n### Nhân vật (role)\n- Trích xuất tất cả nhân vật có tên tuổi trong kịch bản\n- \`desc\`: Bao gồm giới tính, ngoại hình, trang phục, vóc dáng, thần thái (bắt đầu bằng Nam/Nữ)\n- \`prompt\`: Prompt tiếng Anh mô tả ngoại hình, bắt đầu bằng \`a young man, ...\` hoặc \`a young woman, ...\`\n\n### Bối cảnh (scene)\n- Trích xuất tất cả bối cảnh/địa điểm diễn ra sự việc\n- \`desc\`: Không gian, ánh sáng, vật bài trí chính, tông màu\n- \`prompt\`: Prompt tiếng Anh mô tả tổng quan bối cảnh\n\n### Đạo cụ (tool)\n- Trích xuất các vật phẩm quan trọng có ý nghĩa trong cốt truyện\n- \`desc\`: Hình dáng, chất liệu, kích thước, hiệu ứng đặc biệt\n- \`prompt\`: Prompt tiếng Anh mô tả chi tiết đạo cụ`,
          },
          {
            name: "Tạo Prompt Video",
            type: "videoPromptGeneration",
            data: `# Skill Tạo Prompt Video (Video Prompt Generation)\n\nBạn là **Agent Tạo Prompt Video**, chuyên tiếp nhận thông tin Tài nguyên và danh sách Phân cảnh được truyền vào, chuyển hóa thành video Prompt tối ưu, tương thích với mô hình AI Video được chỉ định (Seedance 2.0, Wan 2.6, KlingOmni, v.v.).\n\n## Định dạng đầu vào\n\n### 1. Tài nguyên\n\nDạng: \`Tài nguyên thông tin: [id, type, name], [id, type, name], ...\`\n\n- \`id\`: mã định danh duy nhất của tài nguyên (ví dụ \`A001\`)\n- \`type\`: loại tài nguyên, nhận giá trị \`role\` (Nhân vật) / \`scene\` (Bối cảnh) / \`tool\` (Đạo cụ)\n- \`name\`: tên tài nguyên\n\n### 2. Phân cảnh\n\nDanh sách thẻ \`<storyboardItem videoDesc='...' prompt='...' duration='...' ...></storyboardItem>\`. Trường \`videoDesc\` chứa 12 thành phần phân tách bằng dấu \`、\` theo đúng thứ tự: Mô tả hình ảnh, Bối cảnh, Tên tài nguyên liên kết, Thời lượng, Cỡ cảnh, Chuyển động máy quay, Hành động nhân vật, Cảm xúc, Ánh sáng & Không khí, Lời thoại, Âm hiệu, Mã ID tài nguyên liên kết.\n\n## Định dạng đầu ra\n\nChỉ xuất ra duy nhất nội dung video Prompt bằng **tiếng Anh**, mô tả rõ ràng: nhân vật/hành động, bối cảnh, cỡ cảnh, chuyển động máy quay, cảm xúc và không khí, ánh sáng, lời thoại (nếu có, kèm ký hiệu loại), âm hiệu. Không thêm tiêu đề, chú giải, phân tích quá trình hay đường phân cách.\n\n## Quy tắc\n\n1. Nội dung Prompt bắt buộc viết bằng tiếng Anh, súc tích, đúng thuật ngữ điện ảnh\n2. Chỉ dựa trên 12 trường trong \`videoDesc\` của từng Phân cảnh, không tự bịa thêm nội dung hay Tài nguyên không có trong dữ liệu đầu vào\n3. Không được bỏ sót Lời thoại; nếu có phải giữ nguyên văn gốc, nếu không có thì ghi rõ \`No dialogue\`\n4. Ký hiệu loại lời thoại: Hội thoại thông thường → \`(dialogue)\`; Độc thoại nội tâm → \`(inner monologue, OS)\`; Lời bình/lời dẫn → \`(voiceover, VO)\`\n5. Không mô tả ngoại hình chi tiết của Nhân vật/Bối cảnh đã có trong Tài nguyên (vì đã có ảnh tham chiếu), chỉ mô tả hành động và trạng thái\n6. Mỗi Phân cảnh tương ứng đúng một đoạn Prompt, không mô tả lặp lại, không gộp nhiều Phân cảnh vào một đoạn`,
          },
          {
            name: "Ghép nối giọng đọc",
            type: "audioBindPrompt",
            data: `Bạn là trợ lý ghép nối giọng đọc lồng tiếng.\nNhiệm vụ của bạn là: Dựa trên tên và mô tả của tài nguyên nhân vật được cung cấp, hãy chọn giọng đọc (voice) phù hợp nhất từ danh sách âm thanh mẫu.\nQuy tắc ghép nối:\n1. Ưu tiên khớp ngữ nghĩa dựa trên giới tính, độ tuổi, tính cách nhân vật với mô tả giọng;\n2. Mỗi nhân vật chỉ ghép nối với đúng 1 giọng đọc;\n3. Nếu không có giọng phù hợp trong danh sách, không cần trả về audioId;`,
          },
        ]);
      },
    },
    // bảng liên kết prompt mô hình
    {
      name: "o_modelPrompt",
      builder: (table) => {
        table.integer("id").notNullable();
        table.string("vendorId");
        table.string("model");
        table.text("fileName");
        table.text("path");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {},
    },
    // bảng nguyên tác tiểu thuyết
    {
      name: "o_novel",
      builder: (table) => {
        table.integer("id").notNullable();
        table.integer("chapterIndex");
        table.text("reel");
        table.text("chapter");
        table.text("chapterData");
        table.integer("projectId");
        table.integer("eventState");
        table.text("event");
        table.text("errorReason");
        table.integer("createTime");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    // bảng sự kiện tiểu thuyết
    {
      name: "o_event",
      builder: (table) => {
        table.integer("id").notNullable();
        table.string("name");
        table.string("detail");
        table.integer("createTime");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    // bảng liên kết sự kiện - chương
    {
      name: "o_eventChapter",
      builder: (table) => {
        table.integer("id").notNullable();
        table.integer("eventId").unsigned().references("id").inTable("o_event");
        table.integer("novelId").unsigned().references("id").inTable("o_novel");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    // bảng kịch bản
    {
      name: "o_script",
      builder: (table) => {
        table.integer("id").notNullable();
        table.text("name");
        table.text("content");
        table.integer("projectId");
        table.integer("extractState");
        table.integer("createTime");
        table.text("errorReason");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    // bảng tài nguyên
    {
      name: "o_assets",
      builder: (table) => {
        table.integer("id").notNullable();
        table.text("name");
        table.text("prompt");
        table.text("remark");
        table.text("type");
        table.text("describe");
        table.integer("scriptId");
        table.integer("imageId").unsigned().references("id").inTable("o_image");
        table.integer("assetsId");
        table.integer("projectId");
        table.integer("flowId");
        table.integer("startTime");
        table.string("promptState");
        table.integer("audioBindState");
        table.text("promptErrorReason");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {},
    },
    // bảng hình ảnh được tạo
    {
      name: "o_image",
      builder: (table) => {
        table.integer("id").notNullable();
        table.text("filePath");
        table.text("type");
        table.integer("assetsId");
        table.text("model");
        table.text("resolution");
        table.text("state");
        table.text("errorReason");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    // bảng phân cảnh
    {
      name: "o_storyboard",
      builder: (table) => {
        table.integer("id").notNullable();
        table.integer("scriptId");
        table.text("prompt");
        table.text("filePath");
        table.text("duration");
        table.text("state");
        table.integer("trackId");
        table.text("reason");
        table.text("track");
        table.text("videoDesc");
        table.integer("shouldGenerateImage");
        table.integer("projectId");
        table.integer("flowId");
        table.integer("index");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    // bảng video (khớp schema thực tế: gắn với track thay vì storyboard)
    {
      name: "o_video",
      builder: (table) => {
        table.integer("id").notNullable();
        table.text("filePath");
        table.text("errorReason");
        table.integer("time");
        table.integer("scriptId");
        table.integer("projectId");
        table.integer("videoTrackId");
        table.text("state");
        table.primary(["id"]);
      },
    },
    // bảng track video (mỗi phân đoạn có thể sinh nhiều video ứng viên)
    {
      name: "o_videoTrack",
      builder: (table) => {
        table.integer("id").notNullable();
        table.integer("videoId");
        table.integer("projectId");
        table.integer("scriptId");
        table.text("state");
        table.text("reason");
        table.text("prompt");
        table.integer("selectVideoId");
        table.integer("duration");
        table.primary(["id"]);
      },
    },
    // bảng cấu hình nhà cung cấp AI
    {
      name: "o_vendorConfig",
      builder: (table) => {
        table.string("id").notNullable();
        table.text("inputValues");
        table.text("models");
        table.integer("enable");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {
        await knex("o_vendorConfig").insert([
          {
            id: "toonflow",
            inputValues: "{}",
            models: "[]",
            enable: 0,
          },
          {
            id: "volcengine",
            inputValues: "{}",
            models: "[]",
            enable: 0,
          },
          {
            id: "openai",
            inputValues: "{}",
            models: "[]",
            enable: 0,
          },
          {
            id: "minimax",
            inputValues: "{}",
            models: "[]",
            enable: 0,
          },
          {
            id: "grsai",
            inputValues: "{}",
            models: "[]",
            enable: 0,
          },
          {
            id: "klingai",
            inputValues: "{}",
            models: "[]",
            enable: 0,
          },
          {
            id: "vidu",
            inputValues: "{}",
            models: "[]",
            enable: 0,
          },
          {
            id: "deepseek",
            inputValues: "{}",
            models: "[]",
            enable: 0,
          },
          {
            id: "atlascloud",
            inputValues: "{}",
            models: "[]",
            enable: 0,
          },
          {
            id: "google",
            inputValues: "{}",
            models: "[]",
            enable: 0,
          },
          {
            id: "anthropic",
            inputValues: "{}",
            models: "[]",
            enable: 0,
          },
        ]);
      },
    },
    // bảng workflow hình ảnh
    {
      name: "o_imageFlow",
      builder: (table) => {
        table.integer("id").notNullable();
        table.text("flowData").notNullable();
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    {
      name: "o_assets2Storyboard",
      builder: (table) => {
        table.integer("storyboardId").notNullable();
        table.integer("assetId").notNullable();
        table.primary(["storyboardId", "assetId"]);
        table.unique(["storyboardId", "assetId"]);
      },
    },
    {
      name: "o_scriptAssets",
      builder: (table) => {
        table.integer("scriptId").notNullable();
        table.integer("assetId").notNullable();
        table.primary(["scriptId", "assetId"]);
        table.unique(["scriptId", "assetId"]);
      },
    },
    {
      name: "o_skillList",
      builder: (table) => {
        table.text("id").notNullable();
        table.text("md5").notNullable();
        table.text("path").notNullable();
        table.text("name").notNullable();
        table.text("description").notNullable();
        table.text("embedding");
        table.text("type").notNullable();
        table.integer("createTime").notNullable();
        table.integer("updateTime").notNullable();
        table.integer("state").notNullable();
        table.primary(["id"]);
      },
      initData: async (knex) => {
        const list = [
          {
            id: "4fb36012e56e395b425569987f5dab0e",
            md5: "fca3c269c5f325a65dafa663c9bb9773",
            path: "production_agent_decision.md",
            name: "production_agent_decision",
            description: "Agent ra quyết định sản xuất: Phân tích nhiệm vụ và điều phối quy trình sản xuất phim.",
            embedding: "",
            type: "main",
            createTime: 1774447310118,
            updateTime: 1774447310118,
            state: 1,
          },
          {
            id: "017b6338d7aa227cd614ec1fb25fd83e",
            md5: "2610b80abe4bd048fe61c73adc7388ac",
            path: "production_agent_execution.md",
            name: "production_agent_execution",
            description: "Agent thực thi sản xuất: Trực tiếp tạo tài nguyên, bảng phân cảnh, prompt video.",
            embedding: "",
            type: "main",
            createTime: 1774447310118,
            updateTime: 1774447310118,
            state: 1,
          },
          {
            id: "f03c8e67b61580de9ea5b9d166521b67",
            md5: "d41d8cd98f00b204e9800998ecf8427e",
            path: "production_agent_supervision.md",
            name: "production_agent_supervision",
            description: "Agent giám sát sản xuất: Kiểm duyệt chất lượng phân cảnh, hình ảnh và video thành phẩm.",
            embedding: "",
            type: "main",
            createTime: 1774447310118,
            updateTime: 1774447310118,
            state: 1,
          },
          {
            id: "50b49d8af5d364665b463c23f6a4d8bb",
            md5: "fbba66e0df2426996277b299710c3033",
            path: "script_agent_decision.md",
            name: "script_agent_decision",
            description: "Agent ra quyết định kịch bản: Lập kế hoạch phân tích nguyên tác và cấu trúc chuyển thể.",
            embedding: "",
            type: "main",
            createTime: 1774447310118,
            updateTime: 1774447310118,
            state: 1,
          },
          {
            id: "427727727e1095c54b6840cd21382d82",
            md5: "7e5911242af7233854d533278c6a8ccb",
            path: "script_agent_execution.md",
            name: "script_agent_execution",
            description: "Agent thực thi kịch bản: Soạn thảo khung cốt truyện, chiến lược chuyển thể và kịch bản phân tập.",
            embedding: "",
            type: "main",
            createTime: 1774447310118,
            updateTime: 1774447310118,
            state: 1,
          },
          {
            id: "02848fb0dd582fd926502c77ecf9679c",
            md5: "7a8b6a311b015cd47bf17cc52b935348",
            path: "script_agent_supervision.md",
            name: "script_agent_supervision",
            description: "Agent giám sát kịch bản: Kiểm duyệt chất lượng kịch bản và sự nhất quán với nguyên tác.",
            embedding: "",
            type: "main",
            createTime: 1774447310118,
            updateTime: 1774447310118,
            state: 1,
          },
          {
            id: "a1e818cc03a0b355b239ac1fb0512969",
            md5: "1fd22029e8047aa30b0dfd703cb837ed",
            path: "universal_agent.md",
            name: "universal_agent",
            description: "AI Đa năng: Hỗ trợ trích xuất sự kiện, tài nguyên và các tác vụ tiện ích.",
            embedding: "",
            type: "main",
            createTime: 1774447310118,
            updateTime: 1774447310118,
            state: 1,
          },
        ];
        await Promise.all(
          list.map(async (item) => {
            const embedding = await getEmbedding(item.description);
            item.embedding = JSON.stringify(embedding);
          }),
        );
        await knex("o_skillList").insert(list);
      },
    },
    {
      name: "o_skillAttribution",
      builder: (table) => {
        table.text("skillId").notNullable().references("id").inTable("o_skillList").onDelete("CASCADE");
        table.text("attribution").notNullable();
        table.primary(["skillId", "attribution"]);
        table.index(["attribution"]);
      },
    },
    // bảng bộ nhớ Agent
    {
      name: "memories",
      builder: (table) => {
        table.text("id").notNullable();
        table.text("isolationKey").notNullable();
        table.text("type").notNullable();
        table.text("role");
        table.text("name");
        table.text("content").notNullable();
        table.text("embedding");
        table.text("relatedMessageIds");
        table.integer("summarized").defaultTo(0);
        table.integer("createTime").notNullable();
        table.primary(["id"]);
        table.index(["isolationKey", "type"]);
        table.index(["isolationKey", "summarized"]);
      },
    },
    {
      name: "o_assetsRole2Audio",
      builder: (table) => {
        table.integer("assetsRoleId").notNullable();
        table.integer("assetsAudioId").notNullable();
        table.primary(["assetsAudioId", "assetsRoleId"]);
        table.unique(["assetsAudioId", "assetsRoleId"]);
      },
    },
  ];

  for (const t of tables) {
    const tableExists = await knex.schema.hasTable(t.name);
    if (!tableExists || forceInit) {
      if (tableExists && forceInit) {
        await knex.schema.dropTable(t.name);
        console.log("[Khởi tạo CSDL] Đã xóa và tạo lại bảng:", t.name);
      } else {
        console.log("[Khởi tạo CSDL] Tạo bảng dữ liệu:", t.name);
      }
      await knex.schema.createTable(t.name, t.builder);
      if (t.initData) {
        await t.initData(knex);
        console.log("[Khởi tạo CSDL] Khởi tạo dữ liệu bảng:", t.name);
      }
    }
  }
};
