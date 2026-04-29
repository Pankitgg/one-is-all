# 项目理解（供模型快速上手）

## 项目是什么

- 这是一个基于 Deno 的 Fresh v2 全栈项目，并使用 @fresh/plugin-vite
  作为开发/构建工具链
- 运行时与构建产物都在 Deno 生态内完成：路由/中间件由 Fresh 提供，客户端交互由
  Preact Islands 提供

## 技术栈

- Runtime：Deno 2.x
- Framework：Fresh v2（文件系统路由 + 中间件 + Islands）
- UI：Preact + @preact/signals
- Dev/Build：Vite（通过 `deno run -A npm:vite` 调用）
- Database：SQLite（通过 `node:sqlite`）

## 常用命令

- 开发模式（热更新）：`deno task dev`
  - 默认：http://127.0.0.1:5173/
- 生产构建：`deno task build`
  - 产物目录：`_fresh/`
- 生产运行：`deno task start`
  - 默认端口：8000（可传 `--port` / `--hostname`）
- 数据库迁移（可选）：`deno task db:migrate`
- 质量检查：`deno task check`

## 关键约定/坑位

- `deno task dev`/`build` 通过 Deno 调用 Vite，而不是直接依赖系统里存在 `vite`
  可执行文件
- `deno.json` 的 `nodeModulesDir` 需要为 `auto`，否则 Vite SSR 可能无法解析
  `preact/debug`

## 入口与运行流程

- 应用入口：`main.ts`
  - 创建 `new App<State>()`
  - 注册静态文件中间件 `staticFiles()`
  - 初始化 SQLite 并注入 `ctx.state.db`
  - 通过 `app.fsRoutes()` 挂载文件系统路由
- 共享状态类型：`utils.ts`
  - `export interface State { db: SqliteDb }`
  - `export const define = createDefine<State>()` 用于类型化
    page/handler/middleware

## 数据库（SQLite）

- 连接与迁移：`db/sqlite.ts`
  - 连接是进程级单例（避免 dev/SSR 下重复打开）
  - 默认库文件：`./data/app.sqlite`，可通过环境变量 `SQLITE_PATH` 覆盖
  - 启动时自动执行内置迁移（`_migrations` 表记录已应用版本）
  - 在 `sqlite.ts` 中的 `migrations` 数组内添加你需要执行的 SQL
    语句以完成数据表创建。

## 路由结构（Fresh 文件路由）

- 页面路由放在 `routes/`
  - `routes/_app.tsx`：全局 HTML 外壳（包裹所有页面的基础结构）
  - `routes/index.tsx`：首页
- API 路由放在 `routes/api/`

## Islands（客户端交互组件）

- Islands 放在 `islands/`
  - 此处放置需要在浏览器端产生交互（使用 preact hooks/signals）的组件。
- 组件放在 `components/`
  - 纯展示型组件（无状态）通常放置于此。

## 静态资源与样式

- `static/`：静态资源（favicon、logo 等）
- `client.ts`：引入 `assets/styles.css` 以支持 HMR 下的样式更新
- `assets/styles.css`：项目样式入口（默认是 Fresh 模板样式）

## 构建产物说明

- `deno task build` 会生成 `_fresh/`
  - `_fresh/client/`：浏览器端资源与 manifest
  - `_fresh/server/`：SSR 端产物与 manifest
  - `_fresh/server.js`：生产启动入口（由 `deno task start` 使用）

## 新增功能的推荐落点

- 新页面：新增 `routes/<name>.tsx` 或 `routes/<dir>/index.tsx`
- 新 API：新增 `routes/api/<name>.tsx`（使用 `define.handlers`）
- 全局中间件/鉴权：在 `main.ts` 里 `app.use(...)` 添加
- 共享上下文 state：扩展 `utils.ts` 的 `State`，在中间件里写入 `ctx.state`
