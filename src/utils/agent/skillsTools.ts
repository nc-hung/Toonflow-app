import { z } from "zod";
import { tool, jsonSchema } from "ai";
import path from "path";
import isPathInside from "is-path-inside";
import getPath from "@/utils/getPath";
import * as fs from "fs";
import fg from "fast-glob";

type SkillAttribution =
  //Agent Kịch bản 
  | "script_agent_decision" //quyết định
  | "script_execution_skeleton" //Khung cốt truyện
  | "script_execution_adaptation" //sửa 
  | "script_execution_script" //Soạn kịch bản 
  | "script_agent_supervision" //
  //Agent Sản xuất
  | "production_agent_decision"
  | "production_agent_execution"
  | "production_agent_supervision";

interface SkillInput {
  mainSkill: SkillAttribution[];
  workspace?: string[];
  attachedSkills?: string[];
}

interface SkillPaths {
  mainSkill: { path: string; name: string; description: string }[];
  secondarySkills: string[];
  tertiarySkills: string[];
}

function toUnixPath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

function ensureNonEmptyBody(body: string, fallback: string): string {
  const trimmed = body.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

// ==================== giải tích  SKILL.md ====================

export function parseFrontmatter(content: string): { name: string; description: string } {
  const match = content.match(/^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!match?.[1]) {
    throw new Error(`thể TệpThiếu hợp lệ của  frontmatter，lưu  --- gói nhất gói  name  và  description chữ đoạn 。${content}`);
  }

  const result: Record<string, string> = {};
  const lines = match[1].split(/\r?\n/);

  for (let i = 0; i < lines.length; ) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      i++;
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!keyMatch) {
      i++;
      continue;
    }

    const key = keyMatch[1].trim();
    const rawValue = (keyMatch[2] ?? "").trim();
    i++;

    if (!key) continue;

    if (/^[>|][+-]?[0-9]*$/.test(rawValue)) {
      const isFolded = rawValue.startsWith(">");
      const blockLines: string[] = [];
      let blockIndent: number | null = null;

      while (i < lines.length) {
        const current = lines[i];
        const currentTrimmed = current.trim();

        if (currentTrimmed === "") {
          if (blockIndent !== null) blockLines.push("");
          i++;
          continue;
        }

        const currentIndent = current.match(/^\s*/)?.[0].length ?? 0;
        if (blockIndent === null) {
          blockIndent = currentIndent;
        }

        if (currentIndent < blockIndent) break;

        blockLines.push(current.slice(blockIndent));
        i++;
      }

      result[key] = isFolded
        ? blockLines
            .join("\n")
            .replace(/\n{2,}/g, "\n\n")
            .replace(/([^\n])\n([^\n])/g, "$1 $2")
            .trim()
        : blockLines.join("\n").trim();
      continue;
    }

    const unquoted = rawValue.replace(/^(['"])([\s\S]*)\1$/, "$2");
    result[key] = unquoted;
  }

  if (!result.name || !result.description) {
    throw new Error(`thể TệpThiếu bắt cần  chữ đoạn : name hoặc  description，lưu  frontmatter gói này2mục chữ đoạn 。${content}`);
  }

  return { name: result.name, description: result.description };
}

export async function useSkill(input: SkillInput) {
  const { mainSkill, workspace = [], attachedSkills = [] } = input;
  const rootDir = getPath("skills");
  const normalizedRootDir = path.resolve(rootDir);

  const mainSkills: { path: string; name: string; description: string }[] = [];
  for (const skill of mainSkill) {
    const skillPath = path.join(rootDir, skill + ".md");
    if (!fs.existsSync(skillPath)) throw new Error(`chính thể Tệp không tồn tại: ${skillPath}`);
    if (!isPathInside(skillPath, normalizedRootDir)) throw new Error(`thể tênvô hiệu：kiểm kiểm đến đường dẫn。${skillPath}`);
    const content = await fs.promises.readFile(skillPath, "utf-8");
    const parsed = parseFrontmatter(content);
    mainSkills.push({ path: skillPath, ...parsed });
  }

  const resolveSafeSkillDir = (dir: string): string | null => {
    const resolvedDir = path.resolve(normalizedRootDir, dir);
    const isSafeDir = resolvedDir === normalizedRootDir || isPathInside(resolvedDir, normalizedRootDir);
    return isSafeDir ? resolvedDir : null;
  };

  const getMdFiles = (dir: string, recursive = false): string[] => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && entry.name.endsWith(".md")) return [fullPath];
      return entry.isDirectory() && recursive ? getMdFiles(fullPath, true) : [];
    });
  };
  const collectMdFiles = (dirs: string[], recursive: boolean) =>
    dirs.flatMap((dir) => {
      const safeDir = resolveSafeSkillDir(dir);
      if (!safeDir) return [];
      return getMdFiles(safeDir, recursive).map((file) => toUnixPath(path.relative(normalizedRootDir, file)));
    });

  const skillPaths: SkillPaths = {
    mainSkill: mainSkills,
    secondarySkills: collectMdFiles(workspace, false),
    tertiarySkills: collectMdFiles(attachedSkills, true),
  };

  return { prompt: buildSkillPrompt(mainSkills), tools: createSkillTools(mainSkills, skillPaths), skillPaths };
}

export function buildSkillPrompt(skills: { name: string; description: string }[]): string {
  const skillEntries = skills
    .map((s) => `  <skill>\n    <name>${s.name}</name>\n    <description>${s.description}</description>\n  </skill>`)
    .join("\n");
  return `## Skills
dưới thể nhắc nhà riêng tác vụ  của riêng hàm 。
khi tác vụ mục thể  của mô tảkhớp，gọi hàm  activate_skill cụ nhất truyền vào thể têntảichỉnh 。
tảisau  thể thực thitác vụ ，Cần gọi hàm  read_skill_file xuất tài nguồn Tệpnội dung。

<available_skills>
${skillEntries}
</available_skills>`;
}

export function createSkillTools(skills: { name: string; description: string }[], skillPaths: SkillPaths, rootDir: string = getPath("skills")) {
  const activated = new Set<string>(); // đã kích hoạt thể tập hợp ，trùng lời tải
  const skillsRootDir = path.resolve(rootDir);
  const skillNames = skills.map((s) => s.name);
  const skillMap = new Map(skillPaths.mainSkill.map((s) => [s.name, s]));
  return {
    activate_skill: tool({
      description: `kích hoạt một thể ，tảichỉnh  và ghép tài nguồn danh sáchđến trên dưới tài 。hàm thể ：${skillNames.join(", ")}`,
      inputSchema: jsonSchema<{ name: string }>(
        z
          .object({
            name: z.enum(skillNames as [string, ...string[]]).describe("cần  kích hoạt  của thể tên"),
          })
          .toJSONSchema(),
      ),
      execute: async ({ name }) => {
        if (activated.has(name)) {
          console.log(`⚡[chính thể ] ℹ️ thể  "${name}" đã kích hoạt ，trùng lời tâm vào `);
          return { alreadyActive: true, message: `thể  "${name}" đã kích hoạt ，không cần trùng lời tải` };
        }
        const matched = skillMap.get(name);
        if (!matched) return { error: `không tìm thấythể  "${name}"` };
        let raw = "";
        try {
          raw = await fs.promises.readFile(matched.path, "utf-8");
          console.log(`⚡[chính thể ] ✓ đã xuất chính thể Tệp： ${matched.path}（${raw.length} chữ ）`);
        } catch (error) {
          console.log(`⚡[chính thể ] ✗ xuất thất bại：không tìm thấyTệp "${matched.path}"`);
        }
        activated.add(name);
        console.log(`⚡[chính thể ] ✓ thể  "${name}" đã kích hoạt `);
        const body = ensureNonEmptyBody(raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ""), "thể Tệpkhông chính tài nội dung。");
        let content = "";
        content = `<skill_content name="${name}">\n`;
        content += body + "\n\n";
        content += "sử dụng  read_skill_file cụ xuất tài nguồn Tệp。\n";
        if (skillPaths.secondarySkills.length > 0) {
          content += "\n<skill_resources>\n";
          for (const path of skillPaths.secondarySkills) {
            content += `  <file>${path}</file>\n`;
          }
          content += "</skill_resources>\n";
        }
        content += "</skill_content>";
        return { content };
      },
    }),
    read_skill_file: tool({
      description: "xuất đã kích hoạt thể thư mụcdưới  của tài nguồn Tệp。truyền vào  activate_skill Trả về của  skill_resources giữa  của Tệpđường dẫn。",
      inputSchema: jsonSchema<{ filePath: string }>(
        z
          .object({
            filePath: z.string().describe("tài nguồn Tệp của đúng đường dẫn，tự  activate_skill Trả về của  skill_resources"),
          })
          .toJSONSchema(),
      ),
      execute: async ({ filePath }) => {
        const normalizedInputPath = toUnixPath(filePath).trim();
        if (!normalizedInputPath) {
          console.log(`📖[thức Tệp] ✗ filePath không thể rỗng `);
          return { error: "filePath không thể rỗng " };
        }

        const fullPath = path.resolve(path.join(skillsRootDir, normalizedInputPath));
        if (!(fullPath === skillsRootDir || isPathInside(fullPath, skillsRootDir))) {
          console.log(`📖[thức Tệp] ✗ đường dẫngiới đã cắt ："${filePath}" vượt ra thể thư mụckhí `);
          return { error: "Access denied: path is outside skill directory" };
        }
        let body = "";
        try {
          body = await fs.promises.readFile(fullPath, "utf-8");
          console.log(`📖[thức Tệp] ✓ đã xuất Tệp： ${filePath}（${body.length} chữ ）`);
        } catch {
          console.log(`📖[thức Tệp] ✗ xuất thất bại：không tìm thấyTệp "${filePath}"`);
          return { error: `File not found: ${filePath}` };
        }
        const safeBody = ensureNonEmptyBody(body, "tài nguồn Tệprỗng 。");
        let content = "";
        content = `<skill_content>\n`;
        content += safeBody + "\n\n";
        content += "sử dụng  read_skill_file cụ xuất tài nguồn Tệp。\n";
        if (skillPaths.tertiarySkills.length > 0) {
          content += "\n<skill_resources>\n";
          for (const path of skillPaths.tertiarySkills) {
            content += `  <file>${path}</file>\n`;
          }
          content += "</skill_resources>\n";
        }
        content += "</skill_content>";
        return { content };
      },
    }),
  };
}

export async function scanSkills(folderPath: string) {
  const unixPath = toUnixPath(folderPath);
  const entries = await fg(unixPath, {
    onlyFiles: true,
    absolute: true,
  });
  return entries;
}
