import express from "express";
import { success, error } from "@/lib/responseFormat";
import u from "@/utils";
import { z } from "zod";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

export default router.post(
  "/",
  validateFields({
    key: z.string().optional(),
  }),
  async (req, res) => {
    const { key } = req.body;
    const vendorConfigData = await u.db("o_vendorConfig").where("id", "toonflow").first();
    if (!vendorConfigData) return res.status(500).send(error("Không tìm thấy cấu hình nhà cung cấp này"));
    if (!vendorConfigData.inputValues) return res.status(500).send(error("Không tìm thấy mô hìnhCấu hìnhDữ liệu"));
    const inputValue = JSON.parse(vendorConfigData.inputValues!);
    inputValue.apiKey = key;
    await u
      .db("o_vendorConfig")
      .where("id", "toonflow")
      .update({
        inputValues: JSON.stringify(inputValue),
      });
    try {
      const resText = await u.Ai.Text(`toonflow:claude-haiku-4-5-20251001`).invoke({
        prompt: "1+1với mấy ？,vui lòng trực tiếp trả 2，không cần  giải ",
      });
      if (resText.text) {
        await u.db("o_agentDeploy").where("key", "scriptAgent").update({
          model: "claude-sonnet-4-6",
          modelName: "toonflow:claude-sonnet-4-6",
          vendorId: "toonflow",
        });
        await u.db("o_agentDeploy").where("key", "productionAgent").update({
          model: "claude-sonnet-4-6",
          modelName: "toonflow:claude-sonnet-4-6",
          vendorId: "toonflow",
        });
        await u.db("o_agentDeploy").where("key", "universalAi").update({
          model: "claude-haiku-4-5",
          modelName: "toonflow:claude-haiku-4-5-20251001",
          vendorId: "toonflow",
        });
        res.status(200).send(success("Tự động điền thành công"));
      }
    } catch (err) {
      console.error(err);
      inputValue.apiKey = "";
      await u
        .db("o_vendorConfig")
        .where("id", "toonflow")
        .update({ inputValues: JSON.stringify(inputValue) });
      res.status(400).send(error("Khóa API không hợp lệ, vui lòng nhập lại"));
    }
  },
);
