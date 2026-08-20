import express from "express";
import u from "@/utils";
import jwt from "jsonwebtoken";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { z } from "zod";
const router = express.Router();

export function setToken(payload: string | object, expiresIn: string | number, secret: string): string {
  if (!payload || typeof secret !== "string" || !secret) {
    throw new Error("Tham số không hợp lệ");
  }
  return (jwt.sign as any)(payload, secret, { expiresIn });
}

// Đăng nhập
export default router.post(
  "/",
  validateFields({
    username: z.string(),
    password: z.string(),
  }),
  async (req, res) => {
    const { username, password } = req.body;

    const data = await u.db("o_user").where("name", "=", username).first();
    if (!data) return res.status(400).send(error("Đăng nhập thất bại"));

    if (data!.password == password && data!.name == username) {
      const tokenData = await u.db("o_setting").where("key", "tokenKey").first();
      if (!tokenData) return res.status(400).send(error("Không tìm thấy tokenKey"));
      const token = setToken(
        {
          id: data!.id,
          name: data!.name,
        },
        "180Days",
        tokenData?.value as string,
      );

      return res.status(200).send(success({ token: "Bearer " + token, name: data!.name, id: data!.id }, "Đăng nhập thành công"));
    } else {
      return res.status(400).send(error("Tên đăng nhập hoặc mật khẩu không chính xác"));
    }
  },
);
