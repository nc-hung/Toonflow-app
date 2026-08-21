import path from "path";
import isPathInside from "is-path-inside";

export default (fileName?: string[] | string) => {
  let basePath: string;
  if (typeof process.versions?.electron !== "undefined") {
    try {
      const { app } = require("electron");
      if (app && app.isPackaged) {
        const userDataDir: string = app.getPath("userData");
        basePath = path.join(userDataDir, "data");
      } else {
        basePath = path.join(process.cwd(), "data");
      }
    } catch {
      basePath = path.join(process.cwd(), "data");
    }
  } else {
    basePath = path.join(process.cwd(), "data");
  }
  if (fileName) {
    let dbPath: string;
    if (Array.isArray(fileName)) {
      dbPath = path.resolve(basePath, ...fileName);
    } else {
      dbPath = path.resolve(basePath, fileName);
    }
    if (!isPathInside(dbPath, basePath) && dbPath !== basePath) {
      throw new Error("Lỗi thoát đường dẫn，Đường dẫn phải nằm trong thư mục dữ liệu");
    }
    return dbPath;
  }
  return basePath;
};

export function isEletron() {
  if (typeof process.versions?.electron !== "undefined") {
    const { app } = require("electron");
    return true;
  } else {
    return false;
  }
}
