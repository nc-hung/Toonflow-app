import { app, BrowserWindow, protocol, systemPreferences } from "electron";
import path from "path";
import fs from "fs";
import Module from "module";

// Tăng tốc khởi động Electron: bỏ qua thu thập thông tin GPU, giảm thời gian khởi tạo
app.commandLine.appendSwitch("disable-gpu-shader-disk-cache");
app.commandLine.appendSwitch("disable-features", "CalculateNativeWinOcclusion");

const TARGET_ENTRIES = new Set(["assets", "models", "serve", "skills", "web", "vendor"]);

function copyDir(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.existsSync(d) || fs.copyFileSync(s, d);
  }
}

declare const __APP_VERSION__: string;

function compareVersions(a: string, b: string): number {
  const pa = a
    .split(".")
    .map((n) => Number.parseInt(n, 10))
    .filter((n) => Number.isFinite(n));
  const pb = b
    .split(".")
    .map((n) => Number.parseInt(n, 10))
    .filter((n) => Number.isFinite(n));
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

function initializeData(): void {
  const srcDir = path.join(process.resourcesPath, "data");
  const destDir = path.join(app.getPath("userData"), "data");
  const versionFilePath = path.join(destDir, "version.txt");

  let shouldForceReplace = false;
  if (!fs.existsSync(versionFilePath)) {
    shouldForceReplace = true;
  } else {
    const localVersion = fs.readFileSync(versionFilePath, "utf-8").trim();
    if (compareVersions(localVersion, __APP_VERSION__) < 0) {
      shouldForceReplace = true;
    }
  }

  for (const dir of TARGET_ENTRIES) {
    const targetDir = path.join(destDir, dir);
    if (shouldForceReplace) {
      fs.rmSync(targetDir, { recursive: true, force: true });
      copyDir(path.join(srcDir, dir), targetDir);
      continue;
    }
    if (!fs.existsSync(targetDir)) {
      copyDir(path.join(srcDir, dir), targetDir);
    }
  }

  if (shouldForceReplace) {
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(versionFilePath, `${__APP_VERSION__}\n`, "utf-8");
  }
}

//Lấy toàn bộ đường dẫn phụ thuộc, ưu tiên tải native modules từ unpacked, các module khác tải từ asar
function getNodeModulesPaths(): string[] {
  const paths: string[] = [];
  if (app.isPackaged) {
    // Phụ thuộc external (native modules) nằm trong thư mục unpacked
    const unpackedNodeModules = path.join(process.resourcesPath, "app.asar.unpacked", "node_modules");
    if (fs.existsSync(unpackedNodeModules)) {
      paths.push(unpackedNodeModules);
    }
    // Phụ thuộc thông thường nằm trong asar
    const asarNodeModules = path.join(process.resourcesPath, "app.asar", "node_modules");
    paths.push(asarNodeModules);
  } else {
    paths.push(path.join(process.cwd(), "node_modules"));
  }
  return paths;
}

//Tải động (Dynamic load)
function requireWithCustomPaths(modulePath: string): any {
  const appNodeModulesPaths = getNodeModulesPaths();
  // Lưu phương thức gốc
  const originalNodeModulePaths = (Module as any)._nodeModulePaths;
  // Tạm thời sửa đường dẫn phân giải module
  (Module as any)._nodeModulePaths = function (from: string): string[] {
    const paths = originalNodeModulePaths.call(this, from);
    // Thêm node_modules của chương trình chính lên đầu
    for (let i = appNodeModulesPaths.length - 1; i >= 0; i--) {
      const p = appNodeModulesPaths[i];
      if (!paths.includes(p)) {
        paths.unshift(p);
      }
    }
    return paths;
  };
  try {
    // Xóa bộ nhớ cache để đảm bảo tải bản  mới  nhất
    delete require.cache[require.resolve(modulePath)];
    return require(modulePath);
  } finally {
    // Khôi phục phương thức gốc
    (Module as any)._nodeModulePaths = originalNodeModulePaths;
  }
}

let mainWindow: BrowserWindow | null = null;

function createMainWindow(): Promise<void> {
  return new Promise((resolve) => {
    const win = new BrowserWindow({
      width: 1000,
      height: 700,
      minWidth: 800,
      minHeight: 500,
      frame: false,
      show: false,
      autoHideMenuBar: true,
      resizable: true,
      thickFrame: true,
    });
    mainWindow = win;
    win.setMenuBarVisibility(false);
    win.removeMenu();

    win.on("closed", () => {
      mainWindow = null;
    });

    win.once("ready-to-show", () => {
      win.show();
      resolve();
    });

    const isDev = process.env.NODE_ENV === "dev" || !app.isPackaged;
    if (process.env.VITE_DEV) {
      void win.loadURL("http://localhost:50188");
    } else {
      const htmlPath = isDev
        ? path.join(process.cwd(), "data", "web", "index.html")
        : path.join(app.getPath("userData"), "data", "web", "index.html");
      void win.loadFile(htmlPath);
    }
  });
}

let closeServeFn: (() => Promise<void>) | undefined;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "toonflow",
    privileges: {
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

app.whenReady().then(async () => {
  try {
    let servePath: string;
    if (app.isPackaged) {
      // Môi trường production：để ra tiến trình chính 1 lần ，lưu  loading cửa sổ sau  Tệp
      await new Promise((r) => setTimeout(r, 0));
      initializeData();
      servePath = path.join(app.getPath("userData"), "data", "serve", "app.js");
    } else {
      // Môi trường development：trực tiếp tảimã nguồn （tsx thông qua -r tsx đăng ký  require hook ）
      servePath = path.join(process.cwd(), "src", "app.ts");
    }
    // sử dụng tùy chỉnh đường dẫntảimô 
    const mod = requireWithCustomPaths(servePath);
    closeServeFn = mod.closeServe;
    const port = await mod.default(true);
    process.env.PORT = port;
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
    // đăng ký giao thức Xử lýthiết bị 
    protocol.handle("toonflow", (request) => {
      const url = new URL(request.url);
      const pathname = url.hostname.toLowerCase();
      const handlers: Record<string, () => object> = {
        getappurl: () => ({ url: process.env.URL ?? `http://localhost:${port}/api` }),
        windowminimize: () => {
          mainWindow?.minimize();
          return { ok: true };
        },
        windowmaximize: () => {
          if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
          } else {
            mainWindow?.maximize();
          }
          return { ok: true };
        },
        windowclose: () => {
          app.exit(0);
          return { ok: true };
        },
        apprestart: () => {
          // trì hoãn thực thi，để phản hồi trước  Trả vềcho giao diện frontend 
          setTimeout(() => {
            app.relaunch();
            app.exit(0);
          }, 500);
          return { ok: true, message: "hồi hàm trùng động " };
        },
        windowismaximized: () => ({
          maximized: mainWindow?.isMaximized() ?? false,
        }),
        opendevtool: () => {
          mainWindow?.webContents.openDevTools();
          return { ok: true };
        },
        openurlwithbrowser: () => {
          const search = url.searchParams;
          const targetUrl = search.get("url");
          if (targetUrl) {
            const { shell } = require("electron");
            shell.openExternal(targetUrl);
            return { ok: true };
          } else {
            return { ok: false, error: "Thiếu urltham số" };
          }
        },
        getlocallanguage: () => {
          // Lấyhồi hàm khu vực Thiết lập

          // macOSdòng thống nối phương thức 
          if (process.platform === "darwin") {
            const systemLocale = systemPreferences.getUserDefault("AppleLocale", "string");
            return { ok: true, local: systemLocale };
          }
          const appLocale = app.getLocale();
          return { ok: true, local: appLocale };
        },
      };

      const handler = handlers[pathname];

      const responseData = handler ? handler() : { error: "chưa báo cổng kết nối (endpoint) " };
      return new Response(JSON.stringify(responseData), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    });

    // phục vụ động động thành công，sáng tạo chính cửa sổ （chính cửa sổ  ready-to-show tự động liên loading）
    await createMainWindow();
  } catch (err) {
    console.error("[phục vụ động động thất bại]:", err);
    await createMainWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("before-quit", async (event) => {
  if (closeServeFn) await closeServeFn();
});
