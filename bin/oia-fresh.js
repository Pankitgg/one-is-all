#!/usr/bin/env node
/**
 * oia-fresh CLI：初始化 oia 框架项目
 * 用法：npx @oia-ai/oia-fresh init <项目名>
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

// 包安装后的根目录（bin/ 的上一级）
const PKG_ROOT = path.join(__dirname, "..");

// 从包根目录拷贝到新建项目的模板内容
const COPY_DIRS = ["routes", "islands", "components", "assets", "static"];
const COPY_FILES = ["deno.json", "deno.lock", "main.ts", "client.ts", "utils.ts", "vite.config.ts"];

// npm 打包不会携带 .gitignore，这里在初始化时直接生成
const GITIGNORE = `# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# Fresh build directory
_fresh/
# npm + other dependencies
node_modules/
vendor/
`;

function fail(msg) {
  console.error("[oia-fresh] " + msg);
  process.exit(1);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function main() {
  const [cmd, name] = process.argv.slice(2);
  if (cmd !== "init" || !name) {
    fail("用法：oia-fresh init <项目名>");
  }
  if (!/^[a-z0-9-_]+$/i.test(name)) {
    fail("项目名只能包含字母、数字、- 和 _");
  }

  const target = path.resolve(process.cwd(), name);
  if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    fail(`目录 "${name}" 已存在且非空，请换个项目名或先清空该目录`);
  }
  fs.mkdirSync(target, { recursive: true });

  for (const dir of COPY_DIRS) {
    const src = path.join(PKG_ROOT, dir);
    if (fs.existsSync(src)) copyDir(src, path.join(target, dir));
  }
  for (const file of COPY_FILES) {
    const src = path.join(PKG_ROOT, file);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(target, file));
  }
  fs.writeFileSync(path.join(target, ".gitignore"), GITIGNORE);
  fs.writeFileSync(
    path.join(target, "README.md"),
    `# ${name}\n\n基于 oia 框架（oia-fresh，Deno + Fresh 2 + Vite）的 Web 项目。\n\n## 快速启动\n\n\`\`\`bash\ndeno task dev\n\`\`\`\n\n打开 http://127.0.0.1:5173/\n`,
  );

  console.log("");
  console.log(" 项目初始化完成！");
  console.log("");
  console.log("接下来：");
  console.log(`  cd ${name}`);
  console.log("  deno task dev     # 启动开发服务器（http://127.0.0.1:5173/）");
  console.log("");
}

main();
