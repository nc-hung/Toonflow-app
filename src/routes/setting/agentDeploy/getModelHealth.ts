import express from "express";
import { success, error } from "@/lib/responseFormat";
import u from "@/utils";
import aiHealth from "@/utils/aiHealth";
const router = express.Router();

// Báo cáo tình trạng tổng thể các mô hình văn bản (đã dùng gần đây + sẵn có) để user nắm bắt tình hình
export default router.post("/", async (req, res) => {
  try {
    const healthMap = new Map(aiHealth.getHealthSnapshot().map((r) => [r.modelName, r]));
    const vendors: any[] = await u.db("o_vendorConfig").where("enable", 1);

    const result = [];
    for (const v of vendors) {
      let vendorName = v.id;
      try {
        vendorName = u.vendor.getVendor(v.id)?.name || v.id;
      } catch {}
      const models = await u.vendor.getModelList(v.id);
      const textModels = models.filter((m: any) => m.type === "text");
      result.push({
        vendorId: v.id,
        vendorName,
        models: textModels.map((m: any) => {
          const modelName = `${v.id}:${m.modelName}`;
          const rec = healthMap.get(modelName);
          return {
            modelName,
            label: m.name || m.modelName,
            status: rec?.status ?? "unknown",
            consecutiveFailures: rec?.consecutiveFailures ?? 0,
            lastErrorKind: rec?.lastErrorKind ?? null,
            lastError: rec?.lastError ?? null,
            lastSuccessAt: rec?.lastSuccessAt ?? null,
            lastFailureAt: rec?.lastFailureAt ?? null,
          };
        }),
      });
    }

    res.status(200).send(success(result));
  } catch (e) {
    res.status(500).send(error(u.error(e).message));
  }
});
