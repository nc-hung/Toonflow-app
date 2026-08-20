import * as fs from "fs";
import * as path from "path";
import checker from "license-checker";

const excludeNames = ["toonflow-serve"];
// const strictWhiteList = ["MIT", "BSD-2-Clause", "BSD-3-Clause", "BSD", "0BSD"];
const strictWhiteList: string[] = [];

// Kiểm tra xem có nằm trong danh sách giấy phép cho phép không
function isStrictWhiteLicense(license: string): boolean {
  const normalized = license.replace(/[\(\)]/g, "").trim();
  const parts = normalized.split(/\s*(OR|AND|\/)\s*/i).map((part) => part.trim());
  return parts.every((part) => strictWhiteList.some((wl) => part === wl || part.replace(/ with .*/i, "") === wl));
}

// Đọc danh sách phụ thuộc trực tiếp trong package.json
function getDirectDependencyNames(): string[] {
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"));
  const deps = Object.keys(pkg.dependencies ?? {});
  const devDeps = Object.keys(pkg.devDependencies ?? {});
  return [...deps, ...devDeps];
}

// Thực thi logic chính
checker.init({ start: process.cwd() }, (err: Error, packages: Record<string, any>) => {
  if (err) {
    console.error("Lỗi license-checker: ", err);
    process.exit(1);
  }
  const directNames = getDirectDependencyNames();

  interface PackageInfo {
    name: string;
    version: string;
    licenses: string | string[];
    repository: string | undefined;
  }

  const needDeclare: PackageInfo[] = [];
  for (const fullName in packages) {
    // fullName thườngdạng như  [@scope/]pkg@version, nhưng  license-checker sẽ kèm đường dẫn，như  @scope/name@1.0.0@./node_modules/@scope/name
    // Sử dụng regex để chỉ giữ lại phần name@version
    // nameMatch[1] là tên package, nameMatch[2] là phiên bản 
    const nameMatch = fullName.match(/^((?:@[^\/]+\/)?[^@]+)@([^@]+)$/);
    if (!nameMatch) continue;
    const name = nameMatch[1];
    // Chỉ theo dõi phụ thuộc trực tiếp
    if (!directNames.includes(name!)) continue;

    const info = packages[fullName];
    const licenseArr: string[] = Array.isArray(info.licenses) ? info.licenses : [info.licenses];
    if (!licenseArr.every(isStrictWhiteLicense)) {
      needDeclare.push({
        name: name!,
        version: info.version,
        licenses: licenseArr,
        repository: info.repository,
      });
    }
  }

  // Lọc danh sách loại trừ
  const filteredDeclare = needDeclare.filter((pkg) => pkg.name && !excludeNames.some((exName) => pkg.name.startsWith(exName)));

  // khử trùng lặp ：cùng  name@version chỉ lưu lưu 1 mục ，hợp nhất  licenses
  const dedupedDeclare = Array.from(
    filteredDeclare
      .reduce((acc, pkg) => {
        const key = `${pkg.name}@${pkg.version}`;
        const licenseList = Array.isArray(pkg.licenses) ? pkg.licenses : [pkg.licenses];
        const existing = acc.get(key);

        if (!existing) {
          acc.set(key, {
            ...pkg,
            licenses: [...new Set(licenseList.filter(Boolean))],
          });
          return acc;
        }

        const existingLicenses = Array.isArray(existing.licenses) ? existing.licenses : [existing.licenses];
        existing.licenses = [...new Set([...existingLicenses, ...licenseList].filter(Boolean))];
        if (!existing.repository && pkg.repository) {
          existing.repository = pkg.repository;
        }
        return acc;
      }, new Map<string, PackageInfo>())
      .values()
  );

  const content = dedupedDeclare
    .map(
      (pkg) =>
        `Name: ${pkg.name}\nLicense: ${Array.isArray(pkg.licenses) ? pkg.licenses.join(", ") : pkg.licenses}\nRepository: ${pkg.repository ?? "N/A"}`
    )
    .join("\n\n-----------------------------\n\n");
  fs.writeFileSync(path.resolve(process.cwd(), "NOTICES.txt"), content, "utf-8");
  console.log("đã tạophụ thuộc thông báo  NOTICES.txt");
});
