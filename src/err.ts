import { serializeError } from "serialize-error";

// Xử lý Promise Rejection chưa được  bắt
process.on("unhandledRejection", (reason, promise) => {
  console.error("[Promise Rejection chưa được  xử lý]");
  if (reason instanceof Error) {
    console.error("Tên lỗi:", reason.name);
    console.error("Thông báo lỗi:", reason.message);
    console.error("Thông tin Stack trace:", reason.stack);
    console.error("Chi tiết tuần tự hóa:", JSON.stringify(serializeError(reason), null, 2));
  } else {
    console.error("Nguyên nhân:", reason);
    console.error("Kiểu dữ liệu:", typeof reason);
    try {
      console.error("JSON:", JSON.stringify(reason, null, 2));
    } catch {
      console.error("(Không thể tuần tự hóa)");
    }
  }
  console.error("Promise:", promise);
});

// Xử lý ngoại lệ Uncaught Exception
process.on("uncaughtException", (error) => {
  console.error("[Ngoại lệ chưa được  bắt]");
  console.error("Tên lỗi:", error.name);
  console.error("Thông báo lỗi:", error.message);
  console.error("Thông tin Stack trace:", error.stack);
  console.error("Chi tiết tuần tự hóa:", JSON.stringify(serializeError(error), null, 2));
});
