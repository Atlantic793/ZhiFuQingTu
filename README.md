# 智赋青途 · 协作者快速上手

面向第一次参与本仓库的协作者：从克隆到本地改代码、联调、提交流程。读完本文后应能独立启动项目，并知道常见改动改哪里。

仓库地址：https://github.com/Atlantic793/ZhiFuQingTu

---

## 1. 项目是什么

**智赋青途**是一个面向大学生的 AI 职业发展平台。前端为 React，后端已接入 **Supabase**（Auth / Postgres / Storage / Edge Functions）。关键表与流水线已打通，但不少页面内容仍是**占位数据**，待继续补全。

| 模块 | 路由 | 当前状态 |
|------|------|----------|
| 首页 | `/` | 品牌与功能入口 |
| AI Agent | `/agent` | 多轮对话 + 站内检索；「一个科目领域，一个会话」；经 Edge Function 调 GLM-5.2；展示已去掉 Markdown 符号 |
| 课程评分 | `/rating` | 已打通 B 站链接入库流水线；支持收藏与站内评论；部分课程仍为占位 |
| 职业实训 | `/training` | 框架在，大量内容仍为占位 |
| 个人中心 | `/profile` | 可改头像 / 昵称 / 简介等；可看收藏课程；部分学习统计仍为静态 |
| 登录 / 注册 | `/login` `/register` | **真实 Supabase Auth**；测试账号仍保留 |

### 近两日已落地（main 已合并）

1. **注册 / 登录**基本可用，测试账号保留  
2. **Supabase 后端**已验证接入，部分关键表已建；仍有不少占位内容待补  
3. **个人中心**可改头像 / 简介 / 昵称等；登录后可**收藏课程**并**发表评论**  
4. **AI Agent**：修复回复里残留 Markdown 符号；多轮记忆；先检索站内资源；按科目领域分会话；GLM-5.2 输出暂稳  
5. **课程评分流水线**：提供 B 站链接及分类 → 抓取 → AI 总结评论并打分 → 写入数据库并在前端展示  

---

## 2. 技术栈

- **React 18** + **TypeScript** + **Vite 5**
- **React Router 7**（路由）
- **Zustand**（前端登录态，底层接 Supabase Auth）
- **Supabase**（Auth、数据库、Storage、Edge Function `agent-chat`）
- **Tailwind CSS 3**（莫兰迪色系）+ **lucide-react**
- **本地脚本**（`scripts/`）：B 站抓取 / AI 总结 / 批量导入课程

---

## 3. 环境要求

- Node.js **18+**（建议 LTS）
- npm、Git
- 团队共用的 **Supabase 云项目**凭据（向负责人要）

---

## 4. 5 分钟跑起来

```bash
# 1. 克隆 / 更新
git clone https://github.com/Atlantic793/ZhiFuQingTu.git
cd ZhiFuQingTu
# 已有仓库则：git pull origin main

# 2. 安装依赖
npm install

# 3. 配置环境变量
# 复制 .env.example → .env，填入 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY# 将 .env.example 复制为 .env，并填写 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
# 不要用 localhost:54321；不要提交 .env

# 4. 启动
npm run dev
```

浏览器打开终端提示的地址（一般是 `http://localhost:5173`）。

### 常用脚本

| 命令 | 作用 |
|------|------|
| `npm run dev` | 本地开发（热更新） |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | ESLint 检查 |
| `npm run bili:smoke` | 试抓一条 B 站视频信息 |
| `npm run bili:summarize` | 试跑 AI 评论总结 |
| `npm run bili:import` | 按 CSV 批量抓取 → 总结 → 写入 Supabase |

### Supabase 与数据库

1. 使用团队共用云项目（Project URL + anon key）  
2. 复制 `.env.example` 为 `.env` 并填写：  
   - `VITE_SUPABASE_URL`  
   - `VITE_SUPABASE_ANON_KEY`  
3. 在 SQL Editor **按文件名顺序**执行 `supabase/migrations/` 下迁移（至少包括）：  
   - `20260328000000_profiles.sql`  
   - `20260328000001_conversations.sql`  
   - `20260328000002_catalog.sql`  
   - `20260328000003_profile_fields.sql`（个人字段 + 头像 Storage）  
   - `20260328000004_rating_framework.sql`（评分 / 收藏 / 评论框架）  
   - 以及后续 `000005`～`000007`（示例课 / 章节 / 源站摘要等，按需）  
4. Authentication → Providers → Email：本地开发建议关闭 **Confirm email**  

### 登录方式

- 登录页 **一键测试登录**：`test@example.com` / `123456`（首次会自动创建）  
- 或注册页自己注册  

### AI Agent

对话经 Edge Function `agent-chat` 调用智谱；**前端不填 API Key**。

部署 / 更新（需已登录 Supabase CLI）：

```bash
npx supabase login
npx supabase link --project-ref <你们的 project-ref>
npx supabase secrets set GLM_API_KEY=你的智谱Key
# 可选：npx supabase secrets set GLM_MODEL=glm-5.2
npx supabase functions deploy agent-chat
```

也可在 Dashboard → Edge Functions 部署同名函数，Secrets 里设 `GLM_API_KEY`。

行为要点：

- **一个科目领域对应一个会话窗口**；历史在 Supabase，再登录可继续  
- 会先尝试**站内资源检索**，再交给 GLM  
- 前端用 `plainText` 去掉 Markdown 符号再展示  

请勿把 API Key / `.env` / `service_role` 提交进 Git。

### 课程评分入库流水线（B 站）

端到端路径：

1. 在 `scripts/data/` 准备 CSV（可参考 `courses.example.csv`）：填 B 站链接、`topic_id` / 分类等  
2. `.env` 中配置脚本用密钥（见 `.env.example`）：  
   - `GLM_SUMMARY_API_KEY`（可用与 Agent 不同的 Key）  
   - `SUPABASE_SERVICE_ROLE_KEY`（仅脚本写库，**禁止**加 `VITE_` 前缀）  
3. 运行：  
   ```bash
   npm run bili:import
   ```  
4. 前端 `Rating` 页从数据库读课程、源站摘要分与站内评论 / 收藏  

单步调试可用 `bili:smoke`、`bili:summarize`。

---

## 5. 目录结构（改哪里）

```
ZhiFuQingTu/
├── .env.example            # 环境变量模板（复制为 .env）
├── index.html
├── package.json
├── vite.config.ts          # 别名 @ → src
├── tailwind.config.js      # 莫兰迪色、动画
├── scripts/                # B 站抓取 / 总结 / 批量导入
│   ├── data/               # CSV 课单
│   └── lib/                # bilibiliClient、summarizeCourse 等
├── supabase/
│   ├── migrations/         # 数据库迁移（按序执行）
│   └── functions/agent-chat/  # Agent 代理 GLM + 站内检索
└── src/
    ├── App.tsx             # 路由总表
    ├── components/         # Navbar、ProtectedRoute
    ├── pages/              # Home / Agent / Rating / Training / Profile / Login / Register
    ├── data/mockData.ts    # 仍有占位与回退数据
    ├── lib/supabase.ts     # Supabase 客户端
    ├── services/
    │   ├── catalogService.ts
    │   ├── conversationService.ts
    │   ├── glmService.ts
    │   ├── profileService.ts
    │   └── ratingService.ts   # 评论、收藏、平台分
    ├── store/authStore.ts
    ├── types/
    └── utils/              # plainText、subjectIcons、media 等
```

路径别名：`@/...` → `src/...`。相对路径亦可，同一文件内保持一致。

---

## 6. 常见修改速查

### 6.1 改文案 / 首页

→ `src/pages/Home.tsx`

### 6.2 改导航

→ `src/components/Navbar.tsx`，并同步 `src/App.tsx` 路由

### 6.3 新增页面

1. `src/pages/` 新建组件  
2. `App.tsx` 加 `Route`（需登录则包 `ProtectedRoute` + `Navbar`）  
3. `Navbar.tsx` 加入口  

### 6.4 改课程 / 评分 / 收藏 / 评论

- **编目与 B 站课**：Supabase 表 + `catalogService` / `ratingService`；入库用 `scripts/` + `bili:import`  
- **站内评论 / 收藏**：`src/services/ratingService.ts`，UI 在 `Rating.tsx` / `Profile.tsx`  
- **仍占位的部分**：部分专题叶子课、实训测验等仍可能回退或写在 `mockData.ts`——补数据优先写库，少堆前端硬编码  

### 6.5 改登录 / 个人资料

→ `src/store/authStore.ts`、`src/lib/supabase.ts`、`src/services/profileService.ts`  
→ 表结构见 `supabase/migrations/`（profiles、头像 Storage 等）

### 6.6 改 AI 对话

→ `src/pages/Agent.tsx`（会话 UI、「一科一会话」）  
→ `src/services/glmService.ts` / `conversationService.ts`  
→ `supabase/functions/agent-chat/index.ts`（服务端 GLM + 检索）  
→ `src/utils/plainText.ts`（去 Markdown 展示）

### 6.7 改主题色

→ `tailwind.config.js` 的 `morandi.*`；尽量复用现有类名

---

## 7. 协作与提交流程（建议）

```bash
git checkout main
git pull origin main
git checkout -b feature/简短说明
```

改完自测 `npm run dev`，必要时 `npm run build`，再开 PR。提交信息写清「为什么改」。

**请勿提交：** `node_modules/`、`.env`、API Key、`service_role`、无关大范围格式化。

拉取最新进度（非代码同学也可）：

```bash
git pull origin main
```

详见 [`如何从GitHub更新进度.md`](./如何从GitHub更新进度.md)。

---

## 8. 开发时注意点

1. **必须配 `.env`**：无 Supabase URL / anon key 无法正常登录与读库。  
2. **登录态**由 Supabase Auth 持久化；业务页均经 `ProtectedRoute`。  
3. **编目 vs 会话**：`Rating`/`Training` 读编目失败时可能回退 Mock；Agent 会话/消息**必须**走 Supabase，失败会报错——属预期。  
4. **占位很多**：实训、部分课程详情、个人页部分统计仍是占位，改功能前先确认数据是来自库还是 `mockData`。  
5. **`npm run build` 先跑 tsc**，未使用变量会报错（`noUnusedLocals`）。  
6. **学科图标**：`icon` 为 lucide 名字符串，见 `utils/subjectIcons.tsx`；新增学科记得补映射。  
7. **风格**：沿用莫兰迪色与现有圆角卡片，避免另起一套配色。

---
