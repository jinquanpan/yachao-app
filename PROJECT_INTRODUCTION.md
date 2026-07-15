# 山海灵感便利店 · 项目介绍文档

> 项目名称：**Shan Hai Jing Store（山海灵感便利店）**
> 文档版本：v1.0 · 最后更新：2026-06-30

---

## 一、项目概览

**山海灵感便利店** 是一款以《山海经》神话为世界观的新零售电商 App，定位"未来感移动便利店"，手机端优先的移动 UI 体验。品牌以"灵感即刻发生"为口号，将传统神兽 IP（青龙、白泽、九尾、麒麟、夔牛等）融入饮品、零食、潮玩盲盒等商品命名与故事，构建差异化品牌叙事。

项目已接入独立服务端业务 API，目标运行容器为 **uni-app H5+**，桌面浏览器以手机外壳居中展示。

### 核心特征

- **品牌定位**：山海神话 × 未来零售 × 设计师潮玩
- **视觉风格**：电光蓝（`#075cff`）主色 + 白色内容面 + 紧凑卡片 + Lucide 细线图标 + 圆角手机界面
- **设计基准**：`390 × 844` 移动视口优先，桌面端以手机外壳居中展示
- **运行模式**：H5+ 静态 SPA（Hash History），不依赖后端 SSR 服务上线

---

## 二、技术栈

| 类别 | 选型 | 备注 |
|------|------|------|
| 框架 | TanStack Start (React 19) | 非 Next.js，禁用 Next.js 专属 API |
| 路由 | TanStack Router | 文件系统路由，路由树自动生成于 `routeTree.gen.ts` |
| 构建 | Vite 8 + Nitro | 通过 `@lovable.dev/vite-tanstack-config` 统一配置 |
| 样式 | Tailwind CSS v4 + shadcn/ui (new-york) | UI 基础组件位于 `src/components/ui/` |
| 状态管理 | TanStack Query | 服务端状态由查询缓存管理 |
| 表单 | React Hook Form + Zod | |
| 图标 | lucide-react | 统一 1.5–1.8 线宽，禁用 emoji 代替功能图标 |
| 图表 | recharts + embla-carousel | |
| 包管理 | pnpm / bun | 同时存在两份锁文件 |
| 平台能力 | uni / H5+ API | 通过 `src/utils/` 隔离平台差异 |

### TypeScript 配置

- strict 模式开启
- 目标 ES2022，Bundler 模式
- 路径别名 `@/` → `./src/`
- JSX 使用 `react-jsx` 模式（无需手动 `import React`）

---

## 三、目录结构

```
yachao-app/
├── src/
│   ├── assets/              # 静态资源（商品图、吉祥物图）
│   ├── components/
│   │   ├── ui/             # shadcn/ui 基础组件（40+ 个）
│   │   └── phone-shell.tsx # 手机外壳容器 + 顶/底导航
│   ├── hooks/
│   │   ├── use-mobile.tsx  # 移动端断点判断
│   │   └── use-paged-items.tsx  # 分页加载 + 触底加载
│   ├── lib/
│   │   ├── api.ts          # API 客户端、会话与领域类型
│   │   ├── utils.ts        # cn() 类名合并工具
│   │   ├── error-capture.ts        # 全局错误捕获
│   │   ├── error-page.ts           # 纯 HTML 错误页生成
│   │   └── lovable-error-reporting.ts  # Lovable 平台错误上报
│   ├── routes/             # 文件路由（页面入口）
│   ├── utils/
│   │   ├── uniapp.ts       # uni/H5+ 安全区/缓存 API 适配
│   │   ├── permission.ts   # 权限聚合入口（业务唯一入口）
│   │   ├── android.ts      # Android H5+ 权限实现
│   │   ├── ios.ts          # iOS H5+ 权限实现
│   │   └── pc.ts          # PC 浏览器空实现适配
│   ├── routeTree.gen.ts    # 路由树（自动生成，禁手改）
│   ├── router.tsx          # Router 创建 + Hash History
│   ├── server.ts           # SSR 错误兜底包装
│   ├── start.ts            # TanStack Start + 错误中间件
│   └── styles.css          # 全局样式 + 设计变量
├── scripts/fix-h5-build.mjs  # 构建后修正 H5+ 资源相对路径
├── vite.config.ts
├── tsconfig.json
├── components.json         # shadcn/ui 配置
└── package.json
```

---

## 四、核心架构

### 启动与请求链路

```
用户请求
  → server.ts (SSR 错误包装 + h3 吞错恢复)
  → start.ts (TanStack Start + 错误中间件)
  → router.tsx (TanStack Router + QueryClient + Hash History)
  → __root.tsx (根布局: HTML shell + QueryClientProvider + Outlet)
  → 各页面路由 (phone-shell 包裹)
```

- **`src/server.ts`**：将 TanStack Start 默认 server 入口替换为自定义入口，识别 h3 吞掉的 500 错误（`{"unhandled":true,"message":"HTTPError"}`），用自定义错误页替换返回
- **`src/start.ts`**：注册请求中间件，捕获非 HTTP 错误并返回错误页
- **`src/router.tsx`**：创建 `QueryClient` 与 Router，浏览器端使用 `createHashHistory` 适配 H5+ 本地容器
- **`src/routes/__root.tsx`**：根布局，注入全局 CSS、字体、SEO meta，包裹 `QueryClientProvider` 与 `<Outlet />`，并提供 `errorComponent` / `notFoundComponent` 兜底

### H5+ 静态构建策略

- `vite.config.ts` 中 `base: "./"`，资源使用相对路径，避免容器加载 `/assets/*` 失败
- `nitro: false` 关闭 SSR 部署依赖，目标为纯 SPA
- TanStack Start SPA 模式预渲染输出 `dist/client/index.html`
- `npm run build` 自动执行 `scripts/fix-h5-build.mjs`，将 shell 中的 `/./assets/*` 修正为 `./assets/*`
- 客户端统一 Hash History，页面路径形如 `#/home`
- **交付目录**：`dist/client/`

---

## 五、页面路由模块

所有页面通过文件系统路由定义在 `src/routes/`，使用 `createFileRoute` 声明。

| 路由 | 文件 | 功能说明 | 底部导航 |
|------|------|----------|----------|
| `/` | `index.tsx` | 登录/品牌页：暗色背景、神兽模型、手机号登录入口 | 无 |
| `/home` | `home.tsx` | 主页：Banner、5 个快捷分类、灵感推荐横滑、神兽新品分页网格（20 项/页） | 有 |
| `/category` | `category.tsx` | 分类页：左侧分类栏 + 右侧商品列表 + 搜索框 | 有 |
| `/discover` | `discover.tsx` | 发现页：双列商品瀑布流 + 悬浮扫描按钮（48×48） | 有 |
| `/product/$id` | `product.$id.tsx` | 商品详情：大图、规格、山海故事、加购/购买双按钮 | 无 |
| `/cart` | `cart.tsx` | 购物车：商品编辑、数量调整、底部合计/结算（去结算 36px） | 有 |
| `/checkout` | `checkout.tsx` | 结算：地址 + 配送 + 金额明细 + 提交订单 | 无 |
| `/address` | `address.tsx` | 地址管理：选择/默认/新增 | 无 |
| `/profile` | `profile.tsx` | 个人中心：用户信息 + 数值统计 + 订单入口 + 功能列表 | 有 |
| `/membership` | `membership.tsx` | 会员中心：等级体系 + 权益 + 升级 | 无 |
| `/favorites` | `favorites.tsx` | 收藏列表：取消收藏 / 加入购物车 | 无 |
| `/orders/$status` | `orders.$status.tsx` | 订单列表：按状态筛选 | 无 |
| `/order/$id` | `order.$id.tsx` | 订单详情：付款 / 确认收货 / 状态联动 | 无 |
| `/settings` | `settings.tsx` | 设置：版本号、清除缓存、退出登录确认 | 无 |
| `/scan-entry` | `scan-entry.tsx` | 扫描录入：条码 + 名称 + 价格 + 分类 + 图片，录入新商品 | 无 |

### 关键业务流程

- **加购飞入动画**：首页加购按钮触发 `flyToCart`，生成商品缩略图抛物线飞向底部购物车 Tab，落点图标 `cart-bump` 弹性反馈，购物车数量立即 +1
- **订单流程贯通**：个人中心按状态进入订单列表 → 订单详情 → 结算提交生成新订单 → 详情页付款/收货更新全局状态
- **收藏流程贯通**：商品详情切换收藏 → 个人中心显示真实收藏数 → 收藏页可取消或加购
- **扫描录入**：先上传商品图片，再提交待审核扫码商品记录

---

## 六、核心组件与状态

### PhoneShell（`src/components/phone-shell.tsx`）

所有移动页面统一容器，承载状态栏、手机宽度与底部导航。

| 导出 | 作用 |
|------|------|
| `PhoneShell` | 主容器。Props: `showNav`(默认 true) / `dark`(暗色，登录/会员用) / `noPad`(去底部 padding) |
| `TopBar` | 顶部导航栏。Props: `title` / `back`(默认 `history.back()`) / `right` / `dark` |
| `BottomNav` | 底部 5 Tab（首页 / 分类 / 发现 / 购物车 / 我的），自动高亮当前路由，购物车角标读取服务端购物车数量 |
| `Brand` | 品牌标志，支持 `compact` 与 `light` 两种状态 |

底部导航图标固定：`House` / `LayoutGrid` / `CircleCheckBig` / `ShoppingCart` / `UserRound`。
状态栏模拟 iOS（9:41 + 信号 + 电池），桌面端最大宽 `390px`、最大高接近 `844px`。

### 数据与状态（`src/lib/api.ts`）

#### API 数据

- **服务地址**：通过 `VITE_API_BASE_URL` 配置，默认 `http://120.53.21.92:30997/api/v1`
- **数据源**：商品、分类、购物车、收藏、地址、订单和用户资料均来自服务端
- **缓存**：TanStack Query 管理服务端状态，写操作成功后按业务域刷新查询
- **会话**：用户 Token 保存在本地存储，请求自动附加 Bearer Token
- **金额**：沿用服务端十进制字符串，避免前端浮点误差
- **图片**：服务端图片 URL 优先，本地素材仅作缺图回退
- `cn(...inputs)` — `clsx` + `tailwind-merge` 合并类名（`src/lib/utils.ts`）

---

## 七、平台能力隔离层（`src/utils/`）

目标运行容器为 uni-app H5+，安全区、缓存、权限等能力必须通过 `uni` / `plus` API 实现，并按平台隔离。

| 文件 | 职责 |
|------|------|
| `uniapp.ts` | 安全区（`getSafeAreaInsets`，优先 `uni.getWindowInfo` 回退 `getSystemInfoSync`）、缓存（`getUniCacheSize` / `clearUniCache`）、`formatBytes` |
| `permission.ts` | **业务唯一权限入口**，根据 `uni.getSystemInfoSync().platform` 分发到对应平台实现 |
| `android.ts` | Android H5+ 运行时权限请求（`plus.android.requestPermissions`） |
| `ios.ts` | iOS 权限查询（`plus.navigator.checkPermission`）+ 打开系统设置（`plus.runtime.openURL`） |
| `pc.ts` | PC 浏览器 Permissions API 查询；App 接口（清缓存等）提供同签名空实现 |

**核心约束**：业务页面不直接散落平台判断，必须从 `permission.ts` 聚合调用；PC 端安全区为 0 时不得出现全局顶部留白；SSR/浏览器预览中需先判断运行时 API 是否存在，避免顶层访问 `uni`/`plus` 导致崩溃。

---

## 八、错误处理体系（三层防护）

1. **`error-capture.ts`** — 全局监听 `error` / `unhandledrejection`，存到 `lastCapturedError`（5s TTL），供 SSR 层恢复原始堆栈
2. **`error-page.ts`** — `renderErrorPage()` 生成纯 HTML 错误页（不依赖 React），兜底展示
3. **`lovable-error-reporting.ts`** — 上报到 Lovable 平台的 `window.__lovableEvents.captureException`
4. **`server.ts`** — SSR 层检测 h3 吞掉的 500 错误（`"unhandled":true`），替换为自定义错误页
5. **`start.ts`** — 请求中间件 catch 非 HTTP 错误，返回错误页
6. **`__root.tsx`** — `errorComponent` + `notFoundComponent`，React 层兜底

---

## 九、设计系统

### 颜色（CSS 变量，`src/styles.css`）

| 变量 | 用途 |
|------|------|
| `--blue: #075cff` | 主色（按钮 / 高亮 / 价格） |
| `--blue2: #003ec8` | 深色辅助色 |
| `--ink: #101522` | 文字色 |
| `--muted: #7c8494` | 弱化文字 |
| `--line: #e9edf4` | 分隔线 |
| `--paper: #f5f7fb` | 页面底色（手机内部浅色面） |
| `--nav: 72px` | 底部导航高度 |

外部画布使用深蓝径向渐变背景，手机内部使用浅色 `--paper`，深色展示画布与白色页面层级严格分离。

### 字体

- 正文：`Noto Sans SC` / `PingFang SC`
- 英文标题（登录页等）：`Orbitron` / `Inter`
- 通过 Google Fonts 引入

### 关键 CSS 工具类

- `.app-stage` / `.phone` / `.phone-dark` — 手机外壳与暗色变体
- `.phone-content.with-nav` — 底部留 `82px + safe-area-bottom`，避免导航遮挡
- `.card` / `.price`（自动加 `¥` 前缀）/ `.section-head`
- `.primary-button` / `.login-primary`（独立样式，蓝色文字，规避全局 `a{color:inherit}` 覆盖）
- `.cart-flyer` / `.cart-bump` — 加购飞入动画
- `.icon-button` / `.bottom-nav` / `.top-bar` / `.brand`
- `.load-footer` / `.load-spinner` — 分页加载底部
- `.success-toast` — 录入成功提示

---

## 十、shadcn/ui 组件库

`src/components/ui/` 下集成 shadcn/ui（new-york 风格，baseColor slate），共 40+ 个基础组件，包括 accordion、alert-dialog、avatar、badge、button、calendar、card、carousel、chart、checkbox、command、dialog、drawer、dropdown-menu、form、input、input-otp、menubar、navigation-menu、pagination、popover、progress、radio-group、scroll-area、select、separator、sheet、sidebar、skeleton、slider、sonner、switch、table、tabs、textarea、toggle、tooltip 等。

配置见 `components.json`，图标库统一 `lucide`。

---

## 十一、自定义 Hooks

| Hook | 文件 | 功能 |
|------|------|------|
| `useIsMobile` | `use-mobile.tsx` | 768px 断点判断 |
| `usePagedItems` | `use-paged-items.tsx` | 分页加载（默认 20/页），IntersectionObserver 触底加载，420ms 模拟延迟，返回 `visibleItems / status / sentinelRef / loadMore` |
| `LoadFooter` | `use-paged-items.tsx` | 加载状态 UI（loading / more / done） |

---

## 十二、构建与开发命令

```bash
# 开发
pnpm dev          # 或 npm run dev，启动 Vite dev server

# 生产构建（H5+ 交付，必须执行此命令而非裸 vite build）
pnpm build        # vite build && node scripts/fix-h5-build.mjs
pnpm run build:dev # 开发模式构建

# 预览
pnpm preview

# 代码质量
pnpm lint         # eslint .
pnpm format       # prettier --write .
```

### TypeScript 检查

```bash
npx tsc --noEmit
```

> **注意**：直接 `pnpm run build` 可能触发依赖目录重建并中断，可改用：
> `node node_modules/vite/bin/vite.js build` 与 `node node_modules/typescript/bin/tsc --noEmit`

---

## 十三、开发约定

### 代码规范

- TypeScript strict 模式，ESLint + Prettier 已配置
- 组件导出使用 `export function` 或 `export default function`
- 禁止导入 `server-only`（Next.js 专属），TanStack Start 用 `*.server.ts` 或 `@tanstack/react-start/server-only`
- 不要手动修改 `src/routeTree.gen.ts`（自动生成）
- 不要在 `vite.config.ts` 手动添加 `tanstackStart` / `viteReact` / `tailwindcss` / `tsConfigPaths`（已由 `@lovable.dev/vite-tanstack-config` 包含，重复添加会导致构建失败）

### 视觉一致性

- 主色统一 `#075cff`，深色辅助 `#003ec8`
- 卡片圆角 12–16px，Banner 18–22px，避免全屏超大圆角
- 阴影要轻，不制造悬浮玻璃效果
- 商品价格默认深色或主蓝（不沿用旧版朱红色）
- 信息密度：标题 15–16px，商品名 11–12px，辅助文字 8–10px
- 功能图标必须使用 `lucide-react`，禁用 emoji / `+` `✓` `♡` 等字符
- 商品素材优先复用 `src/assets/`，不用网络占位图

### 路由与返回行为

- 通用 `TopBar` 返回按钮使用 `history.back()`
- 仅业务明确要求时才使用固定 `Link` 返回

### Lovable 集成

- 项目关联 Lovable，**禁止 force push / rebase / amend / squash 已推送提交**
- 保持分支处于可工作状态，提交会同步回 Lovable 编辑器

---

## 十四、关联文档

- [`PROJECT_KNOWLEDGE.md`](./PROJECT_KNOWLEDGE.md) — 项目原则、架构详情、报错记录模板
- [`UI_IMPLEMENTATION_MEMORY.md`](./UI_IMPLEMENTATION_MEMORY.md) — UI 还原规范、视觉基准、验收清单（**界面修改前必读**）
- [`AGENTS.md`](./AGENTS.md) — Lovable 集成约束
- [`src/routes/README.md`](./src/routes/README.md) — TanStack Router 文件路由约定

---

## 十五、模块清单总览

| 模块 | 路径 | 核心职责 |
|------|------|----------|
| 入口与启动 | `src/{server,start,router}.ts` + `__root.tsx` | SSR 包装、错误中间件、Router 与根布局 |
| 路由层 | `src/routes/*.tsx` | 15 个页面，文件系统路由 |
| 容器组件 | `src/components/phone-shell.tsx` | 手机外壳、状态栏、顶/底导航、品牌 |
| UI 基础组件 | `src/components/ui/` | shadcn/ui 40+ 组件 |
| 状态与数据 | `src/lib/api.ts` | API 客户端、会话、领域类型和错误处理 |
| 工具函数 | `src/lib/utils.ts` | `cn()` 类名合并 |
| 错误处理 | `src/lib/{error-capture,error-page,lovable-error-reporting}.ts` | 三层错误防护 |
| 自定义 Hooks | `src/hooks/` | 移动端判断 + 分页加载 |
| 平台能力 | `src/utils/{uniapp,permission,android,ios,pc}.ts` | H5+ 平台隔离层 |
| 静态资源 | `src/assets/` | 商品图、吉祥物图 |
| 全局样式 | `src/styles.css` | 设计变量、组件样式、动画 |
| 构建脚本 | `scripts/fix-h5-build.mjs` | H5+ 资源路径修正 |
| 配置 | `vite.config.ts` / `tsconfig.json` / `components.json` / `eslint.config.js` | 构建、TS、UI、Lint 配置 |
