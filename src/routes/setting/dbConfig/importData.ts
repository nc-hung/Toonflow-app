import express from "express";
import { success, error } from "@/lib/responseFormat";
import { db } from "@/utils/db";
import initDB from "@/lib/initDB";

const router = express.Router();

export default router.post("/", async (req, res) => {
  try {
    const { tables: importTables } = req.body;
    if (!importTables || typeof importTables !== "object") {
      return res.status(400).send(error("Định dạng dữ liệu nhập không hợp lệ"));
    }

    // Xóa tất cả các bản g hiện có
    const existingTables: { name: string }[] = await db.raw(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'knex_%'`,
    );

    await db.raw("PRAGMA foreign_keys = OFF");
    for (const table of existingTables) {
      await db.schema.dropTableIfExists(table.name);
    }
    await db.raw("PRAGMA foreign_keys = ON");

    // Khởi tạo lại cấu trúc bản g
    await initDB(db as any);

    // Nhập dữ liệu
    await db.raw("PRAGMA foreign_keys = OFF");
    for (const [tableName, rows] of Object.entries(importTables)) {
      if (!Array.isArray(rows) || rows.length === 0) continue;

      // Xác thực tính hợp lệ của tên bản g (chống SQL Injection)
      const tableExists = await db.raw(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
        [tableName],
      );
      if (tableExists.length === 0) continue;

      // Xóa sạch dữ liệu bản g trước  khi chèn dữ liệu nhập
      await db.raw(`DELETE FROM "${tableName}"`);
      // Chèn theo từng đợt, mỗi đợt 100 dòng
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        await db(tableName).insert(batch);
      }
    }
    await db.raw("PRAGMA foreign_keys = ON");

    res.status(200).send(success("Nhập cơ sở dữ liệu thành công"));
  } catch (err: any) {
    res.status(500).send(error(err?.message || "Nhập thất bại"));
  }
});
