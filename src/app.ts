// import "./logger";
import "./err";
import "./env";
import express, { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import http from "node:http";
import expressWs from "express-ws";
import logger from "morgan";
import cors from "cors";
import buildRoute from "@/core";
import path from "path";
import fs from "fs";
import u from "@/utils";
import jwt from "jsonwebtoken";
import socketInit from "@/socket/index";
import { isEletron } from "@/utils/getPath";
import { ensureThumbnail, ThumbnailSize } from "@/utils/image";
import { EXPORT_PROJECT_CLIENT_JS, serveInjectedIndex } from "@/lib/exportProjectInject";

const app = express();
const server = http.createServer(app);

async function checkPermissions() {
  if (!isEletron()) return true;
  const userDataPath = u.getPath();
  try {
    fs.mkdirSync(userDataPath, { recursive: true });
    const testFile = path.join(userDataPath, ".access_test");
    fs.writeFileSync(testFile, "test");
    fs.unlinkSync(testFile);
  } catch (e) {
    const { dialog, app } = require("electron");
    const { response } = await dialog.showMessageBox({
      type: "warning",
      title: "Không đủ quyền hạn",
      message: "Ứng dụng không thể truy cập thư mục dữ liệu",
      detail: `Không thể đọc/ghi thư mục sau :\n${userDataPath}\n\nVui lòng liên hệ quản trị viên để cấp quyền, hoặc chạy chương trình với quyền Administrator.`,
      buttons: ["Xác nhận thoát"],
      defaultId: 0,
    });
    if (response === 0) {
      app.quit();
    }
  }
}

export default async function startServe(randomPort: Boolean = false) {
  await checkPermissions();

  await u.writeVersion();
  const io = new Server(server, { cors: { origin: "*" } });
  socketInit(io);

  if (process.env.NODE_ENV == "dev") await buildRoute();

  expressWs(app);

  app.use(logger("dev"));
  app.use(cors({ origin: "*" }));
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: true, limit: "100mb" }));

  // Tài nguyên tĩnh OSS
  const ossDir = u.getPath("oss");
  if (!fs.existsSync(ossDir)) {
    fs.mkdirSync(ossDir, { recursive: true });
  }
  console.log("Thư mục tệp:", ossDir);
  app.use(
    "/oss",
    (req, res, next) => {
      // Nếu truyền tham số type=small thì trả về ảnh thu nhỏ
      if (req.query.size) {
        const size = req.query.size as string;
        const smallImageBaseDir = path.join(ossDir, "smallImage");
        const originalPath = path.join(ossDir, req.path);

        // Phân tích cú pháp tham số size
        let sizeSubDir: string;
        let sizeOpts: ThumbnailSize | undefined;

        // Kiểm tra định dạng WIDTHxHEIGHT, ví dụ '200x300': nén theo tỷ lệ kích thước
        const dimensMatch = size.match(/^(\d+)x(\d+)$/i);
        // Kiểm tra định dạng phần trăm, ví dụ '30', '30%': nén theo tỷ lệ ảnh gốc
        const percentMatch = size.match(/^(\d+(?:\.\d+)?)\s*%?$/);

        if (dimensMatch) {
          const w = parseInt(dimensMatch[1], 10);
          const h = parseInt(dimensMatch[2], 10);
          sizeSubDir = `${w}x${h}`;
          sizeOpts = { type: "dimensions", width: w, height: h };
        } else if (percentMatch) {
          const pct = parseFloat(percentMatch[1]);
          sizeSubDir = `${percentMatch[1]}p`;
          sizeOpts = { type: "percentage", value: pct };
        } else {
          // Tham số size không hợp lệ, hạ cấp trả về ảnh gốc
          express.static(ossDir, { acceptRanges: false })(req, res, next);
          return;
        }

        const ext = path.extname(req.path);
        const base = path.basename(req.path, ext);
        const dir = path.dirname(req.path);
        const smallImagePath = path.join(smallImageBaseDir, dir, `${base}_${sizeSubDir}${ext}`);

        ensureThumbnail(originalPath, smallImagePath, sizeOpts).then((thumbnailPath) => {
          if (thumbnailPath) {
            res.sendFile(thumbnailPath);
          } else {
            // Tạo ảnh thu nhỏ thất bại, hạ cấp trả về ảnh gốc
            express.static(ossDir, { acceptRanges: false })(req, res, next);
          }
        });
        return;
      }
      next();
    },
    express.static(ossDir, { acceptRanges: false }),
  );
  // Tài nguyên tĩnh skills
  const skillsDir = u.getPath("skills");
  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
  }
  console.log("Thư mục tệp:", skillsDir);
  // Chỉ cho phép truy cập tệp hình ảnh
  app.use(
    "/skills",
    (req, res, next) => {
      /\.(jpe?g|png|gif|webp|svg|ico|bmp)$/i.test(req.path) ? next() : res.status(403).end();
    },
    express.static(skillsDir, { acceptRanges: false }),
  );

  // assets thái tài nguồn 
  const assetsDir = u.getPath("assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  console.log("Thư mục tệp:", assetsDir);
  app.use("/assets", express.static(assetsDir, { acceptRanges: false }));

  // data/web thái mạng trạm
  const webDir = u.getPath("web");
  if (fs.existsSync(webDir)) {
    console.log("thái mạng trạm thư mục:", webDir);
    // Script chèn nút "Tải xuống dự án" (phục vụ không cần token -> phải đặt trước
    // middleware xác thực; đặt trước express.static để index.html được chèn thẻ script).
    app.get("/inject/export-project.js", (_req, res) => {
      res.type("application/javascript").send(EXPORT_PROJECT_CLIENT_JS);
    });
    app.get(["/", "/index.html"], serveInjectedIndex(webDir));
    app.use(express.static(webDir, { acceptRanges: false }));
  } else {
    console.warn("thái mạng trạm thư mụckhông tồn tại:", webDir);
  }

  app.use(async (req, res, next) => {
    const setting = await u.db("o_setting").where("key", "tokenKey").select("value").first();
    if (!setting) return res.status(444).send({ message: "phục vụ thiết bị chưa Cấu hình，vui lòng kết dòng quản lý " });
    const { value: tokenKey } = setting;
    // từ  header hoặc  query tham sốLấy token
    const rawToken = req.headers.authorization || (req.query.token as string) || "";
    const token = rawToken.replace("Bearer ", "");
    // tên đơn đường dẫn
    if (req.path === "/api/login/login") return next();

    if (!token) return res.status(401).send({ message: "chưa nhắc nhà token" });
    try {
      const decoded = jwt.verify(token, tokenKey as string);
      (req as any).user = decoded;
      next();
    } catch (err) {
      return res.status(401).send({ message: "vô hiệu của token" });
    }
  });

  const router = await import("@/router");
  await router.default(app);

  // 404 Xử lý
  app.use((_, res, next: NextFunction) => {
    return res.status(404).send({ message: "API 404 Not Found" });
  });

  // LỗiXử lý
  app.use((err: any, _: Request, res: Response, __: NextFunction) => {
    res.locals.message = err.message;
    res.locals.error = err;
    console.error(err);
    res.status(err.status || 500).send(err);
  });

  const port = randomPort ? 0 : 10588;
  return await new Promise((resolve) => {
    server.listen(port, async () => {
      const address = server.address();
      const realPort = typeof address === "string" ? address : address?.port;
      console.log(`[phục vụ động động thành công]: http://localhost:${realPort}`);
      resolve(realPort);
    });
  });
}

// hỗ trợawaitliên 
export function closeServe(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close((err?: Error) => {
        if (err) return reject(err);
        console.log("[phục vụ đã liên ]");
        resolve();
      });
    } else {
      resolve();
    }
  });
}

const isElectron = typeof process.versions?.electron !== "undefined";
if (!isElectron) startServe();
