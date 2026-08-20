// Kiểm tralà không mở gói sau   của  Electron 
const isElectron = typeof process.versions?.electron !== "undefined";
let isPackaged = false;
if (isElectron) {
  const { app } = require("electron");
  isPackaged = app.isPackaged;
}

//tảilượng （mở gói Mặc địnhsử dụng  prod）
const env = process.env.NODE_ENV;
if (!env) {
  if (isElectron) process.env.NODE_ENV = "prod";
  else process.env.NODE_ENV = "dev";
  console.log(`[lượng ：${process.env.NODE_ENV}]`);
}
