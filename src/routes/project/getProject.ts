import express from "express";
import u from "@/utils";
import { success } from "@/lib/responseFormat";
const router = express.Router();

// Lấy thông tin dự án
export default router.post("/", async (req, res) => {
  const data = await u.db("o_project").select("*");
  res.status(200).send(success(data));
});
