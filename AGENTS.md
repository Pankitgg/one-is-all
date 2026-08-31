# AGENTS.md

> 本文件是 `one-is-all`（OIA / 咿呀）项目的 **Agent 编程宪法**。
>
> 目标不是教人类如何使用项目，而是让 AI Agent 在不了解整个代码库的情况下，也能稳定地理解项目结构、选择正确的文件、遵守 Fresh/Deno 的边界，并以可持续扩展的方式完成大型全栈项目开发。
>
> **核心原则：前后一体、约定优于配置、最小依赖、服务端优先、交互局部化、安全默认开启、测试跟随代码。**

---

## 0. Agent 必须遵守的最高优先级规则

在修改任何代码之前，Agent 必须：

1. 阅读本文件。
2. 阅读 `README.md`。
3. 阅读 `deno.json`。
4. 根据任务定位最相关的目录和现有实现，不允许凭空创建第二套架构。
5. 优先复用已有组件、类型、工具函数、服务和数据访问代码。
6. 修改前先理解调用链：`route -> service/use-case -> repository/integration -> storage/external service`。
7. 修改后至少运行与变更范围对应的格式化、lint、类型检查和测试。
8. 不因为“只是一个小功能”而跳过安全、类型和错误处理。
9. 不把 Node.js/Next.js/Express/Nest/React SPA 的习惯直接套进 Fresh。
10. 除非现有架构明确要求，不新增框架层、状态管理库、HTTP client、ORM 或 build system。

### 禁止事项

- 不直接在页面组件中访问数据库。
- 不直接在 Island 中读取服务端密钥、环境变量、数据库连接或文件系统。
- 不把大量业务逻辑写入 `routes/*.tsx`。
- 不把所有组件都做成 Island。
- 不为了一个简单 API 引入新的后端框架。
- 不使用 `npm` / `pnpm` / `yarn` 管理本项目依赖，除非项目未来明确切换依赖管理策略。
- 不无理由修改 `vite.config.ts`、`deno.json` 或 Fresh 核心配置。
- 不提交 `.env`、token、API key、私钥、数据库密码或真实生产数据。
- 不用 `any` 绕过 TypeScript 类型错误。
- 不通过复制代码解决重复问题；应抽取稳定的共用模块。
- 不为了满足测试而修改业务行为。

---

# 1. 项目定位

`one-is-all` 是一个面向 **AI Agent / AI-assisted software development** 的全栈框架探索项目。

项目希望成为：

> **一个便于大模型理解、修改、运行完整程序的脚手架层。**

因此架构设计与普通“人类开发者优先”的 Web 项目不同：

- 文件结构必须高度可预测。
- 相同类型的问题尽量使用相同的解决方案。
- 每层职责必须清晰。
- 业务逻辑不能隐藏在过深或过于魔法化的抽象中。
- Agent 应能够通过目录结构理解系统边界。
- 前后端应保持在同一个仓库中，以减少 Agent 处理跨项目上下文的成本。
- 技术选型优先考虑运行时能力和标准 Web API，而不是依赖大量第三方抽象。

当前项目以 **Deno + Fresh 2 + Preact** 为基础。

仓库当前已经存在：

```text
assets/
components/
islands/
routes/
static/
client.ts
main.ts
utils.ts
vite.config.ts
deno.json
deno.lock
README.md
```

当前仓库使用 Fresh 2，`deno.json` 中的核心依赖包括 Fresh、Preact、Preact Signals、Fresh Vite plugin 和 Vite。

---

# 2. 总体技术架构

大型项目必须保持单仓库、前后端一体，但在逻辑上明确分层。

推荐总体架构：

```text
                             Browser
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
             SSR HTML                    Interactive Islands
                 │                             │
                 └──────────────┬──────────────┘
                                │
                         Fresh Application
                                │
              ┌─────────────────┼──────────────────┐
              │                 │                  │
           Web Pages         API Routes       Middleware
              │                 │                  │
              └─────────────────┼──────────────────┘
                                │
                         Application Layer
                         (use-cases/services)
                                │
                    ┌───────────┼───────────┐
                    │           │           │
               Repository   Domain      Integrations
                    │
                    ├──────── Database
                    ├──────── Cache
                    ├──────── Queue
                    └──────── External APIs
```

## 核心分层

### Presentation Layer

负责：

- Fresh pages
- API routes
- layouts
- islands
- reusable UI components
- form presentation
- HTTP request/response

不能负责：

- 数据库查询
- 复杂业务规则
- 第三方 API orchestration
- 长事务
- 密钥处理

### Application Layer

负责：

- 用例（use cases）
- 业务流程编排
- 权限后的业务操作
- 多个 repository / integration 的组合
- transaction orchestration
- AI workflow orchestration

例如：

```text
CreateProject
UpdateProject
RunAgent
CreateConversation
SendMessage
GenerateArtifact
PublishDocument
```

### Domain Layer

负责：

- 核心业务实体
- value objects
- domain rules
- domain errors
- 业务不变量

Domain 尽量不依赖 Fresh、Preact、Deno HTTP API。

### Infrastructure Layer

负责：

- database
- cache
- queue
- filesystem
- object storage
- external API
- model provider
- telemetry

基础设施代码只应通过明确接口被 Application Layer 使用。

---

# 3. 大型项目推荐目录结构

当前项目是 Fresh 起始模板，随着项目增长，应逐渐演进为下面的结构。

**不要一次性创建全部目录。只有真正需要时才创建。**

```text
one-is-all/
│
├── AGENTS.md
├── README.md
├── deno.json
├── deno.lock
├── vite.config.ts
├── main.ts
├── client.ts
├── utils.ts
│
├── routes/
│   ├── _middleware.ts
│   ├── _app.tsx
│   │
│   ├── index.tsx
│   │
│   ├── login.tsx
│   ├── signup.tsx
│   │
│   ├── dashboard/
│   │   ├── index.tsx
│   │   ├── projects/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   └── settings.tsx
│   │
│   └── api/
│       ├── health.ts
│       ├── auth/
│       │   ├── login.ts
│       │   └── logout.ts
│       ├── users/
│       │   ├── index.ts
│       │   └── [id].ts
│       └── projects/
│           ├── index.ts
│           └── [id].ts
│
├── islands/
│   ├── navigation/
│   ├── forms/
│   ├── editor/
│   ├── chat/
│   ├── agent/
│   └── data/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── data-display/
│   └── feedback/
│
├── layouts/
│   ├── AppLayout.tsx
│   ├── DashboardLayout.tsx
│   └── AuthLayout.tsx
│
├── lib/
│   ├── http/
│   ├── validation/
│   ├── serialization/
│   ├── errors/
│   ├── logging/
│   ├── telemetry/
│   └── utils/
│
├── features/
│   ├── auth/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── schemas/
│   │
│   ├── users/
│   ├── projects/
│   ├── conversations/
│   ├── agents/
│   ├── artifacts/
│   └── billing/
│
├── server/
│   ├── auth/
│   ├── db/
│   │   ├── client.ts
│   │   ├── schema.ts
│   │   ├── migrations/
│   │   └── repositories/
│   ├── cache/
│   ├── queue/
│   ├── storage/
│   ├── integrations/
│   │   ├── llm/
│   │   ├── github/
│   │   ├── search/
│   │   └── payment/
│   └── runtime/
│
├── jobs/
│   ├── index.ts
│   ├── agent-runner.ts
│   ├── cleanup.ts
│   └── scheduled/
│
├── shared/
│   ├── types/
│   ├── constants/
│   ├── schemas/
│   └── contracts/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── routes/
│   ├── islands/
│   └── fixtures/
│
├── scripts/
│   ├── db/
│   ├── migration/
│   └── dev/
│
├── assets/
│   ├── icons/
│   ├── images/
│   └── fonts/
│
└── static/
    ├── favicon.ico
    ├── robots.txt
    └── public/
```

---

# 4. 路径职责表

| 路径 | 职责 | 可以依赖 | 禁止放入 |
|---|---|---|---|
| `routes/` | 页面与 HTTP API | application、shared、components、layouts | 大量业务逻辑 |
| `routes/api/` | REST/HTTP API | application、schemas | DB 细节、业务编排 |
| `islands/` | 浏览器交互 | components、shared | server secret、DB |
| `components/` | 纯展示组件 | shared | browser-only state、server IO |
| `layouts/` | 页面布局 | components | 业务服务 |
| `features/*/domain` | 核心业务规则 | 极少外部依赖 | Fresh/DOM |
| `features/*/application` | 用例编排 | domain、repositories/interfaces | HTTP rendering |
| `features/*/infrastructure` | feature-specific infrastructure | server | UI |
| `server/db` | 数据库访问 | database driver | UI / route |
| `server/integrations` | 外部系统 | Web APIs / SDK | 页面 |
| `shared/` | 前后端共享协议 | TypeScript/Web APIs | DB client / secrets |
| `jobs/` | 异步任务 | application、server | 页面逻辑 |
| `tests/` | 测试代码 | 被测模块 | 业务代码 |

---

# 5. Fresh 开发规范

## 5.1 必须遵循文件路由

Fresh 使用基于文件系统的路由。

例如：

```text
routes/index.tsx             -> /
routes/about.tsx             -> /about
routes/projects/index.tsx    -> /projects
routes/projects/[id].tsx     -> /projects/:id
routes/api/users.ts          -> /api/users
routes/api/users/[id].ts     -> /api/users/:id
```

动态参数使用：

```text
[id]
[slug]
[...rest]
```

Agent 不应使用手写 router 代替 Fresh 的文件路由。

---

## 5.2 Page Route 与 API Route 分离

页面：

```text
routes/projects/[id].tsx
```

API：

```text
routes/api/projects/[id].ts
```

不要在一个 route 文件里把 HTML 页面、API JSON、复杂业务逻辑全部混合。

---

## 5.3 Page Route 必须保持薄

推荐：

```ts
export const handler = define.handlers({
  async GET(ctx) {
    const project = await getProject.execute({
      id: ctx.params.id,
    });

    return page({ project });
  },
});
```

不推荐：

```ts
export const handler = define.handlers({
  async GET(ctx) {
    const project = await db.query(...);
    const user = await db.query(...);
    const permissions = await db.query(...);
    // 300 行业务逻辑
    return page(...);
  },
});
```

Route 的职责是：

```text
HTTP
  ↓
validation
  ↓
authentication / authorization
  ↓
application use-case
  ↓
response
```

---

# 6. Fresh Data Fetching 规范

Fresh 的数据获取应优先发生在服务端。

推荐：

```ts
export const handler = define.handlers({
  async GET(ctx) {
    const project = await projectService.getById(ctx.params.id);

    return page({
      project,
    });
  },
});
```

然后：

```tsx
export default define.page<typeof handler>(({ data }) => {
  return <ProjectView project={data.project} />;
});
```

### 原则

- 首屏需要的数据优先 SSR。
- 不要为了获取首屏数据，把服务端数据转成客户端 `fetch()`。
- 浏览器只请求它确实需要动态更新的数据。
- 密钥、数据库访问、内部服务地址必须留在服务器。
- 不把 server-only object 当作 Island props 传递。

---

# 7. Islands 架构规范

Fresh 的 Islands 是本项目前端最重要的设计原则之一。

## 7.1 默认组件是 Server-rendered Component

优先：

```text
components/
```

只有真正需要浏览器交互时才进入：

```text
islands/
```

例如：

### 应该使用普通 Component

- Button（无状态）
- Card
- Table
- Badge
- Typography
- Layout
- Server-rendered Markdown

### 应该使用 Island

- Counter
- Chat input
- Live search
- Drag and drop
- Rich text editor
- Browser storage
- WebSocket/SSE client
- Interactive chart
- File uploader

---

## 7.2 不要把页面整体 Island 化

错误：

```tsx
<EntireDashboardIsland />
```

正确：

```tsx
<Dashboard>
  <ProjectTable />
  <ProjectFiltersIsland />
  <ActivityChartIsland />
</Dashboard>
```

目标：

> **把 JavaScript 限制在真正需要交互的边界。**

---

## 7.3 Island Props 必须可序列化

Fresh 会把 Island props 从服务端传到客户端。

因此不要传：

```tsx
<MyIsland
  onSubmit={handler}
/>
```

函数不能作为 Island props 传递。

应该传：

```tsx
<MyIsland
  projectId={project.id}
  initialData={project}
/>
```

然后由 Island 在客户端处理交互。

---

## 7.4 Browser-only API

需要：

```text
window
document
navigator
EventSource
WebSocket
localStorage
MediaDevices
```

时必须明确 browser/server 边界。

必要时：

```ts
import { IS_BROWSER } from "fresh/runtime";
```

不要让 SSR 阶段执行 browser-only API。

---

# 8. Preact 规范

当前 Fresh 生态使用 Preact。

推荐：

```ts
import { useSignal } from "@preact/signals";
```

对于 Island 内的局部交互状态，优先使用 Signals。

状态分为：

### Local UI State

放 Island 内：

```text
islands/
```

### Server State

来源：

```text
routes/
application/
API
database
```

### Shared Client State

只有确实存在跨 Island 状态需求时才引入共享机制。

不要默认安装 Redux、Zustand 等状态管理器。

---

# 9. API 设计规范

## 9.1 API 命名

优先资源导向：

```text
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

动作型 API 只在确实存在命令语义时使用：

```text
POST /api/agents/:id/run
POST /api/projects/:id/publish
POST /api/conversations/:id/messages
```

---

## 9.2 HTTP Method

使用明确 HTTP 方法：

```text
GET
POST
PUT
PATCH
DELETE
```

不要所有请求都使用 `POST`。

---

## 9.3 输入验证

API 的输入必须在边界层验证。

```text
Request
  ↓
Parse
  ↓
Validate
  ↓
Authorize
  ↓
Use Case
```

验证失败应该返回稳定、可预测的错误结构。

---

# 10. Error Handling

错误分为三类：

## Domain Error

例如：

```text
ProjectNotFound
InsufficientPermission
InvalidProjectState
```

## Application Error

例如：

```text
UseCaseFailed
DependencyUnavailable
OperationTimeout
```

## HTTP Error

例如：

```text
400
401
403
404
409
422
429
500
503
```

不要把数据库异常原样返回给浏览器。

错误响应应包含稳定结构，例如：

```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found"
  }
}
```

不要返回：

```json
{
  "error": "PostgresError: ..."
}
```

生产环境禁止泄漏：

- SQL
- stack trace
- API key
- filesystem path
- internal hostname
- provider credential

---

# 11. Authentication / Authorization

认证和授权必须分开。

```text
Authentication
= 你是谁？

Authorization
= 你能做什么？
```

推荐：

```text
routes/_middleware.ts
        ↓
session
        ↓
user
        ↓
route
        ↓
application use-case
        ↓
permission check
```

不要把权限判断散落在大量组件中。

不要仅依赖前端隐藏按钮来实现权限控制。

真正的授权必须发生在服务端。

---

# 12. Database 规范

页面和 Island 禁止直接访问 DB。

推荐：

```text
Route
 ↓
Use Case
 ↓
Repository
 ↓
Database
```

例如：

```text
routes/api/projects/[id].ts
       ↓
features/projects/application/get-project.ts
       ↓
features/projects/infrastructure/project-repository.ts
       ↓
server/db/client.ts
```

### DB 访问规则

- 查询集中在 repository。
- 不在组件里写 SQL。
- transaction 边界由 application/use-case 管理。
- migration 必须独立且可重复部署。
- 不修改线上 schema 而不提供 migration。
- 大查询必须考虑分页。
- 所有用户输入都必须参数化。
- 不拼接 SQL 字符串。

---

# 13. Server / Browser 边界

以下代码默认视为 **server-only**：

```text
server/
features/*/infrastructure/
database client
API secrets
filesystem
private keys
service credentials
```

以下代码可以进入浏览器：

```text
components/
islands/
client.ts
shared/
```

如果一个模块同时包含 server-only 与 client-only 内容，应拆开。

例如不要：

```text
lib/config.ts
```

同时导出：

```ts
PUBLIC_API_URL
DATABASE_URL
OPENAI_API_KEY
```

应拆成：

```text
lib/public-config.ts
server/config.ts
```

---

# 14. Deno 开发规范

## 14.1 使用 Deno 原生工具链

优先：

```bash
deno task dev
deno task build
deno task start
deno task test
deno lint
deno fmt
deno check
```

不要默认引入：

```text
eslint
prettier
ts-node
nodemon
tsx
npm-run-all
```

除非项目确有明确需求。

---

## 14.2 依赖管理

优先级：

```text
Deno Web APIs
   ↓
JSR
   ↓
npm compatibility
   ↓
自研
```

优先使用：

```ts
import { ... } from "jsr:@std/..."
```

或在 `deno.json` 中统一定义 imports。

推荐：

```json
{
  "imports": {
    "@/": "./",
    "@std/assert": "jsr:@std/assert@..."
  }
}
```

不要在代码中到处写深层相对路径：

```ts
../../../../../../utils.ts
```

优先使用：

```ts
import { define } from "@/utils.ts";
```

---

# 15. Deno Permission Model

Deno 默认不允许代码无限访问系统能力。

不要为了省事把所有运行任务永久设计成：

```bash
-A
```

在生产运行时优先采用最小权限原则。

需要什么权限只开放什么：

```text
--allow-net
--allow-env
--allow-read
--allow-write
--allow-run
```

大型项目可以在 `deno.json` 中定义命名 permission sets。

例如：

```json
{
  "permissions": {
    "dev": {
      "read": true,
      "write": true,
      "net": true,
      "env": true
    },
    "web": {
      "read": ["./static", "./assets"],
      "net": true,
      "env": ["DATABASE_URL"]
    }
  }
}
```

权限应根据部署环境持续收紧。

---

# 16. 环境变量

环境变量分类：

### Public

可以进入浏览器：

```text
PUBLIC_*
```

### Server Only

只能在服务器：

```text
DATABASE_URL
AUTH_SECRET
MODEL_API_KEY
INTERNAL_API_KEY
```

Agent 不得把 server-only env 直接传给 Island。

推荐集中读取：

```text
server/config.ts
```

例如：

```ts
export const config = {
  databaseUrl: Deno.env.get("DATABASE_URL"),
};
```

不要在全项目散落：

```ts
Deno.env.get("DATABASE_URL")
```

---

# 17. TypeScript 规范

## 必须

- 使用显式类型。
- 使用 discriminated unions 表达状态。
- 优先 `unknown` 而非 `any`。
- API input/output 使用明确 schema/type。
- 公共函数标明输入输出。
- 不使用无意义的泛型。
- 不使用类型断言掩盖问题。

### 禁止

```ts
const data: any = ...
```

除非与第三方不完整类型库交互且已封装在边界模块中。

优先：

```ts
const data: unknown = ...
```

再通过 schema/parser narrowing。

---

# 18. Shared Contract

前后端共享的数据结构放到：

```text
shared/
├── types/
├── schemas/
└── contracts/
```

例如：

```text
shared/contracts/projects.ts
```

定义：

```ts
Project
CreateProjectInput
UpdateProjectInput
ProjectListResponse
```

不要让：

```text
routes/
```

和：

```text
islands/
```

各自复制一份 interface。

---

# 19. Feature-based Architecture

大型项目推荐以 feature 为核心组织业务。

例如：

```text
features/projects/
├── domain/
│   ├── project.ts
│   └── project-errors.ts
│
├── application/
│   ├── create-project.ts
│   ├── update-project.ts
│   ├── get-project.ts
│   └── list-projects.ts
│
├── infrastructure/
│   └── project-repository.ts
│
└── schemas/
    └── project.ts
```

好处：

- Agent 容易定位相关代码。
- 业务边界清楚。
- 避免出现超大的 `services/`。
- 减少跨 feature 修改。
- 更容易独立测试。

---

# 20. 页面与 Feature 的关系

页面不是业务边界。

例如：

```text
routes/projects/[id].tsx
```

可以使用：

```text
features/projects/application/get-project.ts
features/projects/application/update-project.ts
features/projects/domain/project.ts
components/project/ProjectHeader.tsx
islands/project/ProjectEditor.tsx
```

但不要把整个项目业务都塞到：

```text
routes/projects/[id].tsx
```

---

# 21. Components 规范

推荐组件层次：

```text
components/
├── ui/
├── layout/
├── forms/
└── data-display/
```

### `ui/`

通用视觉组件：

```text
Button
Input
Dialog
Badge
Card
Tabs
```

### `layout/`

布局：

```text
Header
Sidebar
Container
PageShell
```

### `forms/`

表单外观与通用交互。

### Domain Components

如果组件只服务一个业务域，可以放：

```text
features/projects/presentation/
```

而不是强行塞进全局 `components/`。

---

# 22. Islands 组织规范

大型项目不要让：

```text
islands/
```

无限膨胀成垃圾场。

推荐按功能组织：

```text
islands/
├── navigation/
├── chat/
├── editor/
├── agent/
├── project/
└── common/
```

如果一个 Island 已经超过约 250~300 行，并且包含多个独立状态，应考虑拆分。

---

# 23. HTTP / Service / Repository 三层边界

推荐严格遵守：

```text
HTTP Layer
  routes/
       │
       ▼
Application Layer
  features/*/application/
       │
       ▼
Infrastructure
  server/
  features/*/infrastructure/
```

### HTTP Layer

知道：

```text
Request
Response
URL
headers
cookies
session
HTTP status
```

### Application Layer

知道：

```text
business operation
use case
domain
repository interfaces
```

### Repository

知道：

```text
database
cache
external persistence
```

Repository 不应该知道：

```text
HTTP
JSX
Preact
browser
cookies
```

---

# 24. AI / Agent 特殊架构规范

本项目未来明显会包含 AI/Agent 能力，因此 AI 模块必须避免直接散落在 route 中。

推荐：

```text
features/agents/
├── domain/
│   ├── agent.ts
│   ├── run.ts
│   └── agent-errors.ts
│
├── application/
│   ├── create-agent.ts
│   ├── run-agent.ts
│   ├── stop-agent.ts
│   └── get-agent-run.ts
│
├── infrastructure/
│   ├── agent-repository.ts
│   ├── model-provider.ts
│   └── tool-runtime.ts
│
└── schemas/
    └── agent.ts
```

对于模型调用：

```text
Application
   ↓
Model Provider Interface
   ↓
Provider Adapter
   ├── OpenAI
   ├── Anthropic
   ├── Qwen
   ├── Gemini
   └── Local Model
```

业务代码不能直接写：

```ts
fetch("https://api.openai.com/...")
```

而应该：

```ts
modelProvider.generate(...)
```

这样 Agent 才能更容易替换模型。

---

# 25. Agent Runtime 与 Web Request 分离

如果 Agent 执行可能持续较长时间：

```text
HTTP Request
```

不要直接承担：

```text
几十秒
几分钟
长连接
大量工具调用
```

应该逐步演进成：

```text
HTTP API
   ↓
Create Run
   ↓
Queue / Job
   ↓
Agent Runtime
   ↓
Event Stream
   ↓
Browser Island
```

前端可以使用：

```text
SSE
WebSocket
polling
```

具体选择根据交互要求决定。

---

# 26. AI Tool 调用边界

Agent/tool/runtime 代码必须明确：

```text
Tool Definition
Tool Validation
Tool Execution
Tool Result
```

不要把工具定义、数据库访问、模型 prompt、HTTP handler 全写进同一个文件。

推荐：

```text
server/runtime/tools/
├── definition.ts
├── registry.ts
└── implementations/
```

工具执行时应该有：

- timeout
- permission boundary
- structured input
- structured output
- error normalization
- logging
- tracing

---

# 27. Observability

大型项目必须预留：

```text
logging
metrics
tracing
```

推荐：

```text
lib/logging/
lib/telemetry/
```

Fresh 当前生态提供 OpenTelemetry 支持，应优先使用框架和 Web 标准能力，而不是自建一套复杂 telemetry 系统。

每个重要 request / job 至少应该能够追踪：

```text
request id
trace id
user id（存在时）
operation
duration
result
error
```

AI Agent 额外考虑：

```text
run id
model
model latency
token usage
tool name
tool latency
tool result status
```

---

# 28. Caching

缓存必须明确：

```text
Cache key
TTL
Invalidation
Consistency model
```

禁止“随手加缓存”。

优先级：

```text
HTTP Cache
   ↓
Application Cache
   ↓
Distributed Cache
   ↓
Database
```

只有实际性能瓶颈证明必要时才增加缓存层。

---

# 29. Async Jobs

大型项目中长耗时工作应该进入：

```text
jobs/
```

例如：

```text
jobs/agent-runner.ts
jobs/document-indexer.ts
jobs/image-processor.ts
jobs/cleanup.ts
```

Job 必须考虑：

- idempotency
- retry
- timeout
- dead-letter
- observability
- cancellation

不要通过无限 `setTimeout` 模拟生产级任务系统。

---

# 30. Testing

Fresh 官方使用 Deno 的测试能力。

默认：

```bash
deno test
```

大型项目推荐：

```text
tests/
├── unit/
├── integration/
├── routes/
├── islands/
└── fixtures/
```

也允许在靠近源代码的地方放：

```text
project.test.ts
project.integration.test.ts
```

## 最低测试标准

### Domain

必须测试：

```text
核心规则
状态转换
非法输入
边界条件
```

### Application

测试：

```text
成功路径
失败路径
权限
依赖失败
```

### Route

测试：

```text
HTTP status
request parsing
validation
response contract
authorization
```

### Island

测试：

```text
SSR rendering
client interaction
critical state transitions
```

---

# 31. 测试优先级

不要为了追求数字而大量写无价值 snapshot。

优先：

```text
Domain invariants
Business behavior
API contract
Critical UI behavior
```

低价值：

```text
纯 JSX 快照
简单 getter
第三方库行为
```

---

# 32. Formatting / Lint / Type Check

提交代码前至少运行：

```bash
deno fmt --check
deno lint
deno check main.ts
deno test
```

项目存在对应 task 时：

```bash
deno task test
deno task build
```

优先使用项目已经存在的 task。

不要擅自创建一套新的 CLI 流程。

---

# 33. Git 修改规范

Agent 修改代码时：

### 小步提交

一个 change 尽量解决一个问题。

例如：

```text
feat(projects): add project creation API
fix(auth): reject expired session
refactor(agent): split model provider
test(projects): add repository integration tests
```

不要一个提交同时：

```text
升级依赖
重构 30 个文件
改 UI
增加 API
修改数据库
```

---

# 34. Agent 修改流程

执行任务时严格使用：

```text
1. Understand
2. Locate
3. Inspect
4. Design
5. Implement
6. Test
7. Verify
8. Summarize
```

## Understand

确认：

- 用户需要什么
- 修改哪个 feature
- 修改属于哪一层

## Locate

优先查找：

```text
routes
features
components
islands
server
tests
```

## Inspect

阅读：

```text
目标文件
依赖文件
调用方
测试
类型定义
```

## Design

先确定：

```text
新增文件
修改文件
数据流
边界
测试方式
```

再写代码。

---

# 35. Agent 自主决策规则

当存在多个技术方案时，优先级：

```text
现有实现
    >
Fresh/Deno 原生能力
    >
已有项目依赖
    >
JSR
    >
npm package
    >
新增基础设施
```

换句话说：

> **能复用，不新建；能原生，不引库；能简单，不抽象；能局部，不全局。**

---

# 36. 什么时候应该创建新文件

创建新文件需要满足至少一个条件：

- 有明确的新职责。
- 现有文件已经承担多个不相关职责。
- 新模块在测试中需要独立隔离。
- 该模块是稳定的领域边界。
- 复用价值明显。

不要因为“文件多一点更干净”就无脑拆分。

---

# 37. 什么时候不要抽象

以下情况不要提前抽象：

```text
一次性函数
只有一个调用方且不会复用
简单 5~10 行逻辑
不稳定的业务逻辑
尚未确定的 API
```

Agent 不得为了“架构感”制造：

```text
BaseService
BaseRepository
AbstractController
GenericManager
UniversalFactory
```

本项目拒绝无意义 enterprise abstraction。

---

# 38. 命名规范

文件：

```text
kebab-case.ts
kebab-case.tsx
```

React/Preact Component：

```text
PascalCase
```

变量：

```text
camelCase
```

类型：

```text
PascalCase
```

常量：

```text
UPPER_SNAKE_CASE
```

路由参数：

```text
[id]
[slug]
[...rest]
```

Use case：

```text
create-project.ts
get-project.ts
run-agent.ts
```

Repository：

```text
project-repository.ts
```

---

# 39. Import 规范

优先：

```ts
import { define } from "@/utils.ts";
import ProjectCard from "@/components/project/ProjectCard.tsx";
```

避免：

```ts
import ProjectCard from "../../../../components/project/ProjectCard.tsx";
```

Import 顺序推荐：

```text
1. external
2. internal alias
3. relative
```

示例：

```ts
import { page } from "fresh";
import { z } from "zod";

import { createProject } from "@/features/projects/application/create-project.ts";
import { ProjectForm } from "@/components/project/ProjectForm.tsx";

import { mapProject } from "./mapper.ts";
```

---

# 40. Server-only Import 防止越界

如果一个模块属于：

```text
server/
```

或者使用：

```text
Deno.env
Deno.readFile
database
secret
```

不得被：

```text
islands/
```

依赖。

如果 TypeScript 类型需要共享，拆出：

```text
shared/types/
```

只共享类型，不共享 server implementation。

---

# 41. API Response 标准化

推荐统一：

```text
success
error
pagination
metadata
```

例如：

```json
{
  "data": {
    "items": []
  },
  "meta": {
    "nextCursor": null
  }
}
```

错误：

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid project name"
  }
}
```

全项目不要出现：

```text
{ error: "..."}
{ message: "..."}
{ errors: [...]}
{ status: false }
```

多套互不兼容的错误格式。

---

# 42. Pagination

默认不要一次查询整个大型集合。

优先：

```text
cursor pagination
```

例如：

```text
GET /api/projects?cursor=abc&limit=50
```

只有明确要求时才使用：

```text
page=1&pageSize=20
```

大规模数据优先 cursor。

---

# 43. Security

Agent 必须默认考虑：

### Input

- validation
- size limit
- type validation

### Authentication

- session
- token expiry
- logout
- CSRF

### Authorization

- resource ownership
- role
- permission

### Output

- serialization
- escaping
- no secret leakage

### Network

- timeout
- retry
- SSRF protection
- allowed origin

### File

- path traversal
- upload size
- content type
- generated filename

### AI

- prompt injection
- tool authorization
- secret isolation
- untrusted tool input
- output validation

---

# 44. CSRF / CORS / CSP

涉及 Cookie / Session 的写操作必须考虑 CSRF。

跨域 API 必须明确 CORS 策略。

生产环境应优先配置 CSP。

Fresh 当前提供相关 middleware/plugin 能力。

不要通过：

```text
Access-Control-Allow-Origin: *
```

解决所有问题。

---

# 45. AI Prompt 安全

来自：

```text
user
document
web page
tool result
external API
```

的内容都视为 **untrusted input**。

不要把外部内容直接拼进：

```text
system instruction
tool permission
developer instruction
```

尤其是 Agent 执行工具时必须区分：

```text
Instruction
Data
Tool Result
User Content
```

---

# 46. 性能原则

默认优先：

```text
SSR
+
small JS
+
progressive enhancement
+
streaming when useful
```

不要把 Fresh 当传统 SPA 使用。

如果一个页面几乎全部依赖：

```text
client state
client routing
client fetching
```

需要重新评估 Fresh 是否被错误使用。

---

# 47. SSR 优先原则

服务器应该尽可能完成：

```text
data loading
permission checks
initial rendering
SEO metadata
content rendering
```

客户端负责：

```text
interaction
animation
local state
live updates
browser APIs
```

---

# 48. Static Assets

公共静态文件：

```text
static/
```

源码相关素材：

```text
assets/
```

不要将：

```text
database backups
generated secrets
user private files
temporary files
```

放入 `static/`。

---

# 49. Generated Files

Fresh/Vite 生成物：

```text
_fresh/
```

属于构建输出，不应手工修改。

Agent 如果发现：

```text
_fresh/*
```

中的代码需要调整，应找到其源码来源，而不是直接编辑构建产物。

---

# 50. `main.ts` 与 `client.ts`

## `main.ts`

负责：

- 初始化 Fresh App
- 注册 middleware
- 配置 application
- 启动 server

不负责：

- 业务代码
- 数据库查询
- 复杂 controller
- AI workflow

## `client.ts`

负责：

- browser entry
- client bootstrap

避免把大量业务逻辑写入 `client.ts`。

---

# 51. `utils.ts`

`utils.ts` 当前用于建立 Fresh `define` 和 `State` 类型。

大型项目中如果继续增长，不要让 `utils.ts` 成为“万能文件”。

当工具性质明显不同，应拆分：

```text
lib/http/
lib/errors/
lib/logging/
lib/validation/
```

并让 `utils.ts` 只保留 Fresh application-level helpers。

---

# 52. Middleware

Middleware 用于横切关注点：

```text
authentication
authorization bootstrap
logging
request id
security headers
timing
locale
tracing
```

不应用于隐藏大量业务流程。

推荐：

```text
routes/_middleware.ts
```

全局逻辑。

局部业务中间件可以放：

```text
routes/admin/_middleware.ts
routes/api/_middleware.ts
```

或随着项目规模增长迁移到明确的 middleware module。

---

# 53. Fresh Route Handler 推荐模板

页面：

```tsx
import { define, page } from "@/utils.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const data = await service.execute({
      id: ctx.params.id,
    });

    return page({ data });
  },
});

export default define.page<typeof handler>(({ data }) => {
  return (
    <main>
      {/* Server rendered UI */}
    </main>
  );
});
```

API：

```ts
import { define } from "@/utils.ts";

export const handlers = define.handlers({
  async GET(ctx) {
    const result = await service.execute(...);

    return Response.json({
      data: result,
    });
  },

  async POST(ctx) {
    // parse
    // validate
    // authorize
    // execute
    // respond
  },
});
```

具体写法以当前仓库实际 Fresh 版本 API 为准。

---

# 54. Fresh Version Awareness

本仓库目前以 Fresh 2 为目标。

Agent 在引入 Fresh API 时：

1. 先检查 `deno.json` 中的版本。
2. 以当前依赖实际 API 为准。
3. 优先参考当前 Fresh 官方文档。
4. 不把 Fresh 1.x 教程代码直接复制到 Fresh 2。
5. 如果发现现有代码是旧 API，应最小化迁移，不在非必要情况下做全仓库升级。

特别注意：

```text
Fresh 1.x:
Handlers
PageProps
ctx.render(...)
```

与：

```text
Fresh 2:
define.handlers(...)
define.page(...)
page(...)
```

存在 API 差异。

不要混用两个版本的范式。

---

# 55. Agent 对依赖升级的规则

依赖升级属于高风险操作。

除非任务明确要求，否则：

- 不升级 Fresh。
- 不升级 Deno 版本。
- 不升级 Preact。
- 不升级 Vite。
- 不批量升级全部依赖。

需要升级时：

```text
1. 查看当前版本
2. 阅读 changelog / migration
3. 检查 breaking changes
4. 修改
5. 运行完整测试
6. 验证 build
```

---

# 56. Build / Deploy

开发：

```bash
deno task dev
```

生产构建：

```bash
deno task build
```

运行：

```bash
deno task start
```

部署目标可以包括：

```text
Deno Deploy
Docker
Cloud provider
Self-hosted
```

业务代码不得假设“永远运行在某一个云厂商”。

---

# 57. Web Standards First

由于 Fresh 与 Deno 都强调 Web Standards，优先使用：

```text
Request
Response
URL
URLPattern
Headers
FormData
URLSearchParams
ReadableStream
WebSocket
AbortController
crypto
```

而不是不必要地引入 Node 风格 wrapper。

例如：

优先：

```ts
fetch()
```

而不是额外封装一个 HTTP client library，除非存在明确的跨模块价值。

---

# 58. Abort / Timeout

所有外部网络请求，尤其：

```text
LLM
GitHub
Search
Payments
Storage
```

都应考虑：

```text
timeout
AbortSignal
retry
backoff
```

不要允许一个上游请求无限挂起。

---

# 59. External Integrations

所有第三方 API 应该有 Adapter。

例如：

```text
server/integrations/github/
server/integrations/llm/
server/integrations/search/
```

Application layer 依赖接口。

例如：

```ts
interface ModelProvider {
  generate(input: GenerateInput): Promise<GenerateOutput>;
}
```

Provider：

```text
OpenAIProvider
AnthropicProvider
QwenProvider
GeminiProvider
```

---

# 60. Documentation

每个复杂模块至少需要：

```text
README.md
```

或：

```text
docs/
```

文档重点解释：

```text
Why
Boundary
Data flow
Failure mode
Extension point
```

不要只写 API 参数列表。

---

# 61. Spec-driven Development

项目明确鼓励使用：

```text
skills/
specs/
```

约束 Agent。

未来如果新增规范，推荐：

```text
specs/
├── architecture/
├── api/
├── security/
├── ai/
└── ui/
```

以及：

```text
skills/
├── fresh/
├── backend/
├── frontend/
├── testing/
└── agent/
```

Skill 应描述：

```text
When to use
Inputs
Constraints
Workflow
Validation
Examples
```

---

# 62. Agent 执行任务的检查清单

完成一个 feature 后：

```text
[ ] 是否复用了已有架构？
[ ] 是否选择了正确目录？
[ ] Route 是否保持足够薄？
[ ] 是否把业务逻辑放进 Application Layer？
[ ] 是否误把 server code 放进 Island？
[ ] 是否引入了不必要依赖？
[ ] 是否存在 any？
[ ] 是否验证输入？
[ ] 是否检查权限？
[ ] 是否处理错误？
[ ] 是否有 timeout？
[ ] 是否有测试？
[ ] deno fmt 是否通过？
[ ] deno lint 是否通过？
[ ] deno check 是否通过？
[ ] deno test 是否通过？
[ ] build 是否通过？
[ ] 是否修改了不相关代码？
[ ] 是否生成或泄漏了敏感信息？
```

---

# 63. Agent 输出规范

完成任务后，Agent 应用简洁结构总结：

```text
## Changed

- path/to/file.ts — what changed
- path/to/file.tsx — what changed

## Architecture

- Route -> Use Case -> Repository
- SSR + Island boundary
- API contract

## Validation

- deno fmt
- deno lint
- deno check
- deno test
- deno task build

## Risks

- remaining limitation
- migration needed
- external dependency
```

不要写一大段无法验证的“已经完全正确”。

---

# 64. 当前项目参考文档

### Fresh 官方文档

主文档：

https://usefresh.dev/docs/

Introduction：

https://usefresh.dev/docs/introduction

Getting Started：

https://usefresh.dev/docs/getting-started

Architecture：

https://usefresh.dev/docs/concepts/architecture

Routing：

https://usefresh.dev/docs/concepts/routing

File Routing：

https://usefresh.dev/docs/concepts/file-routing

Data Fetching：

https://usefresh.dev/docs/concepts/data-fetching

Islands：

https://usefresh.dev/docs/concepts/islands

Middlewares：

https://usefresh.dev/docs/concepts/middleware

Context：

https://usefresh.dev/docs/concepts/context

Signals：

https://usefresh.dev/docs/concepts/signals

Layouts：

https://usefresh.dev/docs/concepts/layouts

Forms：

https://usefresh.dev/docs/advanced/forms

Serialization：

https://usefresh.dev/docs/advanced/serialization

WebSockets：

https://usefresh.dev/docs/advanced/websockets

OpenTelemetry：

https://usefresh.dev/docs/advanced/opentelemetry

Testing：

https://usefresh.dev/docs/testing

Deployment：

https://usefresh.dev/docs/deployment/

---

# 65. Deno 官方文档

Deno Documentation：

https://docs.deno.com/

Configuration：

https://docs.deno.com/runtime/reference/deno_json/

Configuration Concepts：

https://docs.deno.com/runtime/fundamentals/configuration/

Permissions：

https://docs.deno.com/runtime/reference/permissions/

Lint / Format：

https://docs.deno.com/runtime/lint_and_format/

Testing：

https://docs.deno.com/runtime/fundamentals/testing/

TypeScript：

https://docs.deno.com/runtime/fundamentals/typescript/

Security：

https://docs.deno.com/runtime/fundamentals/security/

JSR：

https://jsr.io/

---

# 66. 本项目的重要设计信条

最终所有 Agent 应围绕下面这些原则工作：

### 一即是全

前端、后端、任务、AI、数据访问都可以存在一个仓库中。

### 少即是多

减少框架和依赖，让 Agent 更容易理解。

### 服务器优先

能在 server 做的事情，不要无意义地搬到 browser。

### 交互局部化

只把必须交互的区域做成 Island。

### 业务显式化

用 feature / domain / application 明确表达业务。

### 依赖单向化

```text
UI
 ↓
Application
 ↓
Domain / Infrastructure
```

不要循环依赖。

### 安全默认开启

权限、认证、输入验证、超时和 secrets isolation 都不是“以后再做”。

### 测试跟随代码

新增行为，就新增测试。

### 约定优于魔法

Agent 应当通过目录、文件名和类型快速理解系统，而不是猜测。

---

# 67. 最重要的一条

> **这个项目不是为了让人类写出最多代码，而是为了让 Agent 用最少上下文写出正确代码。**

因此：

```text
Predictability > Cleverness
Explicitness > Magic
Reuse > Duplication
Native APIs > Unnecessary Dependencies
Server Rendering > Client Rendering
Local State > Global State
Small Modules > God Objects
Stable Contracts > Hidden Coupling
Tests > Assumptions
Security > Convenience
```

当一个实现看起来“更工程化”，但会让 Agent 更难理解、需要更多隐含上下文、产生更多跨目录依赖时，应优先选择更简单、更显式的方案。

---

# 68. 最终决策规则

当本文件与实际代码产生冲突时：

```text
实际可运行代码
    >
当前 deno.json / lockfile
    >
当前 Fresh 官方文档
    >
本 AGENTS.md 中的通用建议
    >
Agent 自己的假设
```

Agent 必须优先尊重真实代码和当前版本事实，并在发现架构偏离本文件时，最小化修改范围。

**不要为了“符合文档”而进行无关的大规模重构。**
