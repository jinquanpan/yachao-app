# PROJECT_KNOWLEDGE.md

> 项目原则 & 报错记录 —— 踩过的坑不再踩第二次。

> UI 还原、图标、编码与视觉验收规范见 [`UI_IMPLEMENTATION_MEMORY.md`](./UI_IMPLEMENTATION_MEMORY.md)。后续界面修改前必须先阅读。

---

## 一、项目概览

**山海灵感便利店 (Shan Hai Jing Store)** — 以《山海经》神话为世界观的新零售电商 App，手机端优先的移动 UI。

### 核心架构

```
用户请求 → server.ts (SSR 错误包装)
         → start.ts (TanStack Start + 错误中间件)
         → router.tsx (TanStack Router + QueryClient)
         → __root.tsx (根布局: HTML shell + QueryClientProvider + Outlet)
         → 各页面路由 (phone-shell 包裹)
```

### 页面路由树

| 路由 | 文件 | 说明 |
|------|------|------|
| `/` | `index.tsx` | 登录/品牌页（暗色背景，无底部导航） |
| `/home` | `home.tsx` | 主页：Banner + 快捷分类 + 推荐 + 新品列表 |
| `/category` | `category.tsx` | 分类页：左侧分类栏 + 右侧商品列表 |
| `/discover` | `discover.tsx` | 发现页：双列商品瀑布流 |
| `/product/$id` | `product.$id.tsx` | 商品详情：大图 + 规格 + 故事 + 加购/购买 |
| `/cart` | `cart.tsx` | 购物车：编辑/删除/数量调整 + 底部结算栏 |
| `/checkout` | `checkout.tsx` | 结算：地址 + 商品摘要 + 配送 + 支付 |
| `/address` | `address.tsx` | 地址管理：选择/设为默认/新增 |
| `/profile` | `profile.tsx` | 个人中心：订单 + 收藏 + 地址 + 设置 |
| `/membership` | `membership.tsx` | 会员中心：等级体系 + 权益 + 升级 |

---

## 二、数据层

### 服务端数据 (`src/lib/api.ts`)

- API 基础地址由 `VITE_API_BASE_URL` 配置。
- 商品、分类、购物车、收藏、地址、订单和用户资料使用真实领域接口。
- TanStack Query 管理服务端状态与缓存失效；不再维护本地业务 mock。
- 会话 Token 持久化到本地存储，请求自动附加 Bearer Token。

### 辅助函数

- `apiRequest(path, init)` — 统一请求、认证与错误解析
- `cn(...inputs)` — clsx + tailwind-merge 合并类名

---

## 三、设计系统

### 颜色体系 (CSS 变量)

| 变量 | 用途 |
|------|------|
| `--background` | 页面底色（深色展示画布） |
| `--surface / --surface-2` | App "手机" 表面色（浅色） |
| `--ink / --ink-2` | 文字色（深色） |
| `--primary` | 主色（蓝紫渐变） |
| `--cyan / --cyan-glow` | 青色发光（品牌点缀） |
| `--gold` | 金色（VIP/会员） |
| `--vermilion` | 朱红色（价格） |

### 渐变预设

- `--gradient-hero`：深蓝紫 → 暗色（登录页/暗色背景）
- `--gradient-primary`：蓝 → 青（按钮/高亮）
- `--gradient-card`：白 → 浅灰（卡片）
- `--gradient-stage`：径向渐变（商品详情舞台背景）

### 自定义 Tailwind Utilities

- `text-gradient` — 渐变文字
- `bg-hero / bg-stage` — 预设背景
- `shadow-glow / shadow-phone / shadow-card-soft` — 预设阴影
- `scrollbar-hide` — 隐藏滚动条
- `animate-float / animate-pulse-glow / animate-pop-in / animate-slide-up` — 预设动画

### 字体

- `--font-display`: Orbitron（英文标题）
- `--font-sans`: Inter + PingFang SC（正文）

---

## 四、核心组件

### PhoneShell (`src/components/phone-shell.tsx`)

手机外壳容器，所有页面共用。

**Props：**
- `showNav` — 是否显示底部导航栏（默认 true）
- `dark` — 暗色模式（登录页/会员页使用）
- `noPad` — 去除底部 padding（登录页使用）

**内部结构：**
- `StatusBar` — 模拟 iOS 状态栏（9:41 + 信号 + 电池）
- `BottomNav` — 5 个 Tab（首页/分类/发现/购物车/我的），购物车角标
- `TopBar` — 导出组件，支持 title / back / right / dark

### 其他导出

- `TopBar` — 顶部导航栏（标题 + 返回 + 右侧操作）
- `BottomNav` — 底部 Tab 栏（自动高亮当前路由）

---

## 五、错误处理体系

三层错误防护：

1. **`error-capture.ts`** — 全局 error/unhandledrejection 监听，捕获后存到 `lastCapturedError`（5s TTL）
2. **`error-page.ts`** — `renderErrorPage()` 生成纯 HTML 错误页（不依赖 React）
3. **`lovable-error-reporting.ts`** — 上报到 Lovable 平台的 `__lovableEvents`
4. **`server.ts`** — SSR 层：检测 h3 吞掉的 500 错误（`"unhandled":true`），替换为自定义错误页
5. **`start.ts`** — 请求中间件：catch 非 HTTP 错误，返回错误页
6. **`__root.tsx`** — `errorComponent` + `notFoundComponent`（React 层兜底）

---

## 六、技术栈约定

> 目标运行容器为 uni-app H5+。当前界面代码采用 React/TanStack 实现，但涉及安全区、缓存、权限等容器能力时，统一调用 `uni` / H5+ API，并由 `src/utils/` 隔离平台差异。

| 类别 | 选型 | 备注 |
|------|------|------|
| 框架 | TanStack Start (React 19) | 非 Next.js，不要用 Next.js 特有 API |
| 路由 | TanStack Router | 文件系统路由，路由树自动生成于 `routeTree.gen.ts` |
| 构建 | Vite 8 + Nitro | 通过 `@lovable.dev/vite-tanstack-config` 统一配置 |
| 样式 | Tailwind CSS v4 + shadcn/ui | 组件在 `src/components/ui/` |
| 状态管理 | TanStack Query | API 客户端在 `src/lib/api.ts` |
| 表单 | React Hook Form + Zod | |
| 包管理 | pnpm / bun | 锁文件同时存在 `pnpm-lock.yaml` 和 `bun.lock` |

### 目录结构约定

- 页面路由 → `src/routes/`，文件名即路由路径
- 动态路由 → `product.$id.tsx` 格式
- 根布局 → `src/routes/__root.tsx`
- 通用组件 → `src/components/`
- UI 基础组件 → `src/components/ui/`（shadcn/ui）
- 自定义 Hook → `src/hooks/`
- 工具/状态/错误处理 → `src/lib/`
- 平台能力工具 → `src/utils/`；权限只从 `permission.ts` 聚合，对应平台实现放在 `android.ts` / `ios.ts` / `pc.ts`，PC 不支持的 App 能力提供空方法适配
- 静态资源 → `src/assets/`
- 路径别名 `@/` → `src/`

### 代码规范

- TypeScript strict 模式开启
- ESLint + Prettier 已配置
- 禁止导入 `server-only`（Next.js 专属），TanStack Start 用 `*.server.ts` 或 `@tanstack/react-start/server-only`
- 不要手动在 `vite.config.ts` 中添加 `tanstackStart`、`viteReact`、`tailwindcss`、`tsConfigPaths` 等插件（已由 `@lovable.dev/vite-tanstack-config` 包含，重复添加会导致构建失败）
- JSX 使用 `react-jsx` 模式（无需手动 `import React`）
- 组件导出使用 `export function` 或 `export default function`

### Lovable 集成

- 项目关联 Lovable，**禁止 force push / rebase / squash 已推送的提交**
- 保持分支处于可工作状态

### H5+ 静态构建

- H5+ 上线使用 TanStack Start SPA 模式，不依赖 SSR 服务。
- Vite 资源基础路径固定为相对路径 `./`，避免本地容器加载 `/assets/*` 失败。
- SPA shell 固定输出为 `dist/client/index.html`，发布或交付目录为 `dist/client/`。
- H5+ 客户端使用 Hash History；`npm run build` 会自动将 SPA shell 中的绝对入口资源路径修正为相对路径。
- `nitro` 在 H5+ 静态构建中关闭；如果未来恢复 SSR 部署，必须单独建立对应部署配置，不能混用产物。

---

## 七、报错记录

> 格式：日期 | 错误现象 | 原因 | 解决方案

### 模板

```
### YYYY-MM-DD | 错误简述

**现象：** 描述报错信息

**原因：** 根因分析

**解决：** 具体修复步骤

**教训：** 一句话总结，避免再犯
```

---

<!-- 在此追加新的报错记录 -->
