import u from "@/utils";
import path from "path";
import fs from "fs";
import { Knex } from "knex";
import db from "@/utils/db";
import { transform } from "sucrase";
import rawVendorData from "./vendor.json";

const vendorData = rawVendorData as Record<string, string>;

export default async (knex: Knex): Promise<void> => {
  const addColumn = async (table: string, column: string, type: string) => {
    if (!(await knex.schema.hasTable(table))) return;

  // Đồng bộ hóa tên và mô tả tiếng Việt cho tất cả Agent đã tạo trước  đó
  const agentTranslations: Record<string, { name: string; desc: string }> = {
    "scriptAgent": { name: "Agent Kịch bản ", desc: "Dùng để đọc nguyên tác tạo khung cốt truyện, chiến lược chuyển thể; khuyến nghị dùng mô hình có khả năng hiểu và tạo văn bản  mạnh mẽ" },
    "productionAgent": { name: "Agent Sản xuất", desc: "Điều phối và quản lý quy trình sản xuất; khuyến nghị dùng mô hình có tư duy logic và quản lý tác vụ tốt" },
    "universalAi": { name: "AI Đa năng", desc: "Dùng cho trích xuất sự kiện tiểu thuyết, sinh gợi ý tài nguyên, trích xuất thoại; khuyến nghị dùng mô hình xử lý văn bản  tốt" },
    "ttsDubbing": { name: "Lồng tiếng TTS", desc: "Tạo giọng lồng tiếng nhân vật dựa trên nội dung kịch bản , hỗ trợ nhiều phong cách giọng và cảm xúc" },
    "scriptAgent:decisionAgent": { name: "Agent Kịch bản : Tầng Quyết định", desc: "Tầng ra quyết định" },
    "scriptAgent:supervisionAgent": { name: "Agent Kịch bản : Tầng Giám sát", desc: "Tầng kiểm duyệt & giám sát" },
    "scriptAgent:storySkeletonAgent": { name: "Agent Kịch bản : Khung Cốt truyện", desc: "Tạo khung sườn cốt truyện" },
    "scriptAgent:adaptationStrategyAgent": { name: "Agent Kịch bản : Chiến lược Chuyển thể", desc: "Tạo chiến lược chuyển thể" },
    "scriptAgent:scriptAgent": { name: "Agent Kịch bản : Soạn Kịch bản ", desc: "Soạn thảo kịch bản  chi tiết" },
    "productionAgent:decisionAgent": { name: "Agent Sản xuất: Tầng Quyết định", desc: "Tầng ra quyết định sản xuất" },
    "productionAgent:supervisionAgent": { name: "Agent Sản xuất: Tầng Giám sát", desc: "Tầng kiểm duyệt & giám sát sản xuất" },
    "productionAgent:deriveAssetsAgent": { name: "Agent Sản xuất: Biến thể Tài nguyên", desc: "Trích xuất biến thể trạng thái tài nguyên" },
    "productionAgent:generateAssetsAgent": { name: "Agent Sản xuất: Tạo Tài nguyên", desc: "Tạo tài nguyên hình ảnh" },
    "productionAgent:directorPlanAgent": { name: "Agent Sản xuất: Kế hoạch Đạo diễn", desc: "Lập kế hoạch đạo diễn" },
    "productionAgent:storyboardGenAgent": { name: "Agent Sản xuất: Tạo Phân cảnh", desc: "Tạo danh sách phân cảnh" },
    "productionAgent:storyboardPanelAgent": { name: "Agent Sản xuất: bản g Phân cảnh", desc: "Tạo bản g thông tin phân cảnh" },
    "productionAgent:storyboardTableAgent": { name: "Agent Sản xuất: Biểu mẫu Phân cảnh", desc: "Tạo bản g dữ liệu phân cảnh" },
  };
  for (const [key, val] of Object.entries(agentTranslations)) {
    await db("o_agentDeploy").where("key", key).update({ name: val.name, desc: val.desc });
  }

  // Đồng bộ hóa tên prompt mặc định
  await db("o_prompt").where("type", "eventExtraction").update({ name: "Trích xuất sự kiện" });
  await db("o_prompt").where("type", "scriptAssetExtraction").update({ name: "Trích xuất tài nguyên kịch bản " });
  await db("o_prompt").where("type", "videoPromptGeneration").update({ name: "Tạo Prompt Video" });
  await db("o_prompt").where("type", "audioBindPrompt").update({ name: "Ghép nối giọng đọc" });

    if (!(await knex.schema.hasColumn(table, column))) {
      await knex.schema.alterTable(table, (t) => (t as any)[type](column));
    }
  };

  const dropColumn = async (table: string, column: string) => {
    if (!(await knex.schema.hasTable(table))) return;
    if (await knex.schema.hasColumn(table, column)) {
      await knex.schema.alterTable(table, (t) => t.dropColumn(column));
    }
  };

  const alterColumnType = async (table: string, column: string, type: string) => {
    if (!(await knex.schema.hasTable(table))) return;
    if (await knex.schema.hasColumn(table, column)) {
      await knex.schema.alterTable(table, (t) => {
        (t as any)[type](column).alter();
      });
    }
  };
  // Sửa trạng thái không nhất quán do đóng ứng dụng bất thường
  await db("o_novel").where("eventState", 0).update({
    eventState: -1,
    errorReason: "Thất bại do phần mềm thoát",
  });
  await db("o_script").where("extractState", 0).update({
    extractState: -1,
    errorReason: "Thất bại do phần mềm thoát",
  });
  await db("o_assets").where("promptState", "Đang tạo").orWhere("promptState", "Đang tạo").update({
    promptState: "Tạo thất bại",
    promptErrorReason: "Thất bại do phần mềm thoát",
  });
  await db("o_image").where("state", "Đang tạo").orWhere("state", "Đang tạo").update({
    state: "Tạo thất bại",
    errorReason: "Thất bại do phần mềm thoát",
  });
  await db("o_storyboard").where("state", "Đang tạo").orWhere("state", "Đang tạo").update({
    state: "Tạo thất bại",
    reason: "Thất bại do phần mềm thoát",
  });
  await db("o_video").where("state", "Đang tạo").orWhere("state", "Đang tạo").update({
    state: "Tạo thất bại",
    errorReason: "Thất bại do phần mềm thoát",
  });

  // Thêm các trường mới 
  await addColumn("o_prompt", "useData", "text");
  await addColumn("o_agentDeploy", "type", "string");
  await addColumn("o_agentDeploy", "temperature", "integer");
  await addColumn("o_agentDeploy", "maxOutputTokens", "integer");
  await addColumn("o_assets", "audioBindState", "integer");
  await addColumn("o_modelPrompt", "fileName", "string");
  await addColumn("o_modelPrompt", "path", "string");
  const allDefaultVendors = [
    "toonflow",
    "volcengine",
    "openai",
    "minimax",
    "grsai",
    "klingai",
    "volcengineSd2",
    "vidu",
    "null",
    "deepseek",
    "atlascloud",
  ];
  for (const vId of allDefaultVendors) {
    const exists = await u.db("o_vendorConfig").where("id", vId).first();
    if (!exists) {
      await u.db("o_vendorConfig").insert({
        id: vId,
        inputValues: "{}",
        models: "[]",
        enable: vId === "deepseek" ? 1 : 0,
      });
    }
  }
  // Kiểm tra prompt ghép nối âm thanh
  const existAudioPrompt = await db("o_prompt").where("type", "audioBindPrompt").first();
  if (!existAudioPrompt)
    await db("o_prompt").insert({
      name: "Ghép nối giọng đọc",
      type: "audioBindPrompt",
      data: `Bạn là trợ lý ghép nối giọng đọc lồng tiếng.\nNhiệm vụ của bạn là: Dựa trên tên và mô tả của tài nguyên nhân vật được  cung cấp, hãy chọn giọng đọc (voice) phù hợp nhất từ danh sách âm thanh mẫu.\nQuy tắc ghép nối:\n1. Ưu tiên khớp ngữ nghĩa dựa trên giới tính, độ tuổi, tính cách nhân vật với mô tả giọng;\n2. Mỗi nhân vật chỉ ghép nối với đúng 1 giọng đọc;\n3. Nếu không có giọng phù hợp trong danh sách, không cần  trả về audioId;`,
    });
  // Kiểm tra agentUseMode trong o_setting
  const agentUserMode = await u.db("o_setting").where("key", "agentUseMode").first();
  if (!agentUserMode) {
    const allDeployData = await u
      .db("o_agentDeploy")
      .leftJoin("o_vendorConfig", "o_vendorConfig.id", "o_agentDeploy.vendorId")
      .select("o_agentDeploy.*");
    const advancedData = allDeployData.filter((item: any) => item.key?.includes(":"));
    const notValModelData = advancedData.filter((item) => !item.modelName);

    await u.db("o_setting").insert({
      key: "agentUseMode",
      value: notValModelData.length ? "0" : "1",
    });
  }
  // Cấu hình nâng cao cho Agent
  const advancedAgentList = [
    { key: "scriptAgent:decisionAgent", name: "Agent Kịch bản : Tầng Quyết định", desc: "Tầng ra quyết định" },
    { key: "scriptAgent:supervisionAgent", name: "Agent Kịch bản : Tầng Giám sát", desc: "Tầng kiểm duyệt & giám sát" },
    { key: "scriptAgent:storySkeletonAgent", name: "Agent Kịch bản : Khung Cốt truyện", desc: "Tạo khung sườn cốt truyện" },
    { key: "scriptAgent:adaptationStrategyAgent", name: "Agent Kịch bản : Chiến lược Chuyển thể", desc: "Tạo chiến lược chuyển thể" },
    { key: "scriptAgent:scriptAgent", name: "Agent Kịch bản : Soạn Kịch bản ", desc: "Soạn thảo kịch bản  chi tiết" },
    { key: "productionAgent:decisionAgent", name: "Agent Sản xuất: Tầng Quyết định", desc: "Tầng ra quyết định sản xuất" },
    { key: "productionAgent:supervisionAgent", name: "Agent Sản xuất: Tầng Giám sát", desc: "Tầng kiểm duyệt & giám sát sản xuất" },
    { key: "productionAgent:deriveAssetsAgent", name: "Agent Sản xuất: Biến thể Tài nguyên", desc: "Trích xuất biến thể trạng thái tài nguyên" },
    { key: "productionAgent:generateAssetsAgent", name: "Agent Sản xuất: Tạo Tài nguyên", desc: "Tạo tài nguyên hình ảnh" },
    { key: "productionAgent:directorPlanAgent", name: "Agent Sản xuất: Kế hoạch Đạo diễn", desc: "Lập kế hoạch đạo diễn" },
    { key: "productionAgent:storyboardGenAgent", name: "Agent Sản xuất: Tạo Phân cảnh", desc: "Tạo danh sách phân cảnh" },
    { key: "productionAgent:storyboardPanelAgent", name: "Agent Sản xuất: bản g Phân cảnh", desc: "Tạo bản g thông tin phân cảnh" },
    { key: "productionAgent:storyboardTableAgent", name: "Agent Sản xuất: Biểu mẫu Phân cảnh", desc: "Tạo bản g dữ liệu phân cảnh" },
  ];
  for (const agent of advancedAgentList) {
    const exists = await db("o_agentDeploy").where("key", agent.key).select("*").first();
    if (!exists) {
      await db("o_agentDeploy").insert({
        model: "",
        modelName: "",
        vendorId: null,
        key: agent.key,
        name: agent.name,
        desc: agent.desc,
        temperature: 1,
        maxOutputTokens: 0,
        disabled: false,
      });
    }
  }
};
