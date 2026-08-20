import express from "express";
import { success, error } from "@/lib/responseFormat";
import { db } from "@/utils/db";
import initDB from "@/lib/initDB";

const router = express.Router();

export default router.get("/", async (req, res) => {
  try {
    // Lấy danh sách tất cả tên bản g
    const tables: { name: string }[] = await db.raw(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'knex_%'`,
    );

    // Tắt ràng buộc khóa ngoại, xóa lần lượt từng bản g
    await db.raw("PRAGMA foreign_keys = OFF");
    for (const table of tables) {
      await db.schema.dropTableIfExists(table.name);
    }
    await db.raw("PRAGMA foreign_keys = ON");

    // Khởi tạo lại cơ sở dữ liệu
    await initDB(db as any);

    res.status(200).send(success("Cơ sở dữ liệu đã được  xóa sạch và khởi tạo lại thành công"));
  } catch (err: any) {
    res.status(500).send(error(err?.message || "Xóa dữ liệu thất bại"));
  }
});
