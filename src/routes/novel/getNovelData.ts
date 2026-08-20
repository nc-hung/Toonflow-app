import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

// Lấy dữ liệu nguyên tác
export default router.post(
  "/",
  validateFields({
    projectId: z.number(),
  }),
  async (req, res) => {
    const { projectId } = req.body;
    const data = await u.db("o_novel").where("projectId", projectId).select("*");
    res.status(200).send(success(data));
  },
);
