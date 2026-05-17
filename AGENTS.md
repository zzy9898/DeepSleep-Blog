# AGENTS.md

## 交流

- 请使用中文与用户交流。

## 项目概况

- 这是 DeepSleep Blog 的前端项目，技术栈为 React 19 + Vite 6 + TypeScript + Tailwind CSS v4。
- 项目是前后端分离架构，前端不保留 Firebase、Gemini 或本地 mock server 作为业务依赖。
- 后端接口契约以 `docs/frontend-api-guide.md` 为准；不确定的后端能力先记录到 `docs/TODO.md`，不要在前端假装已完成。

## API 接入约定

- API base URL 通过 `.env.local` 的 `VITE_API_BASE_URL` 配置；未配置时 `src/api/client.ts` 默认使用 `/api`。
- 所有 HTTP 请求应通过 `src/api/client.ts` 的 `apiClient` 发起，并用 `unwrapData` 解析统一响应。
- 认证 token 统一通过 `src/api/tokenStore.ts` 读写；不要在业务代码里直接操作 `localStorage` 中的 token。
- 后端 DTO 与前端 UI 类型之间必须经过 `src/api/mappers.ts` 映射。例如用户的 `nickname`、数字角色 `0/1` 不应直接泄漏到页面组件。
- 用户资料接口返回的 `backgroundImageUrl` 在前端 UI 类型中映射为 `UserProfile.bannerUrl`，Profile 背景图和工作台预览都应使用该字段。
- 更新用户昵称应通过 `PUT /users/me/profile` 提交 `nickname`，前端 UI 的 `displayName` 只作为映射后的展示字段使用。
- 新接口优先拆到 `src/api/*.ts`，并在 `src/services/dataService.ts` 只做 facade 聚合，不把请求逻辑重新塞回 `dataService`。
- 更新用户头像和背景图分别使用 `PUT /users/me/avatar` 与 `PUT /users/me/background-image`，请求体为 `multipart/form-data`，字段名分别是 `avatar` 和 `backgroundImage`。
- 分类必须从 `GET /categories` 接入；不要在页面里硬编码分类 ID、名称映射。
- 评论接口集中在 `src/api/comments.ts`：一级评论 `POST /articles/{articleId}/comments`，回复 `POST /comments/{commentId}`，查询评论和回复使用游标分页且默认 `size=10`，删除评论走 `DELETE /comments/{commentId}`。
- 文章点赞和取消点赞接口集中在 `src/api/articles.ts`，分别调用 `POST /articles/{articleId}/like` 与 `DELETE /articles/{articleId}/like`。
- 当前用户已点赞文章列表通过 `GET /users/me/liked-articles` 获取，前端映射为 `Article[]` 后用于工作台“我的喜欢”。
- 管理员接口集中在 `src/api/admin.ts`，例如管理概览、管理员用户分页、封禁和解封用户；不要混入普通用户资料接口。
- 后端数字枚举集中维护在 `src/api/enums.ts`，业务码集中维护在 `src/api/businessCodes.ts`；新增或微调业务码时同步更新前端兜底错误文案。

## 前端结构约定

- 路由守卫放在 `src/routes`，布局组件放在 `src/components/layout`，页面组件尽量只处理页面业务展示。
- 文章相关的请求状态、编辑状态和常量优先放在 `src/features/articles`。
- 管理员是普通用户能力的超集：管理员也应能发布文章、编辑自己的文章、维护个人资料和访问个人空间。
- 管理员不能任意编辑他人文章；管理员治理他人文章应通过封禁、删除等管理接口实现，未开放接口前记录到 `docs/TODO.md`。
- 个人工作台和全站管理系统必须分离：`/dashboard` 只放当前用户自己的内容、资料和喜欢；`/admin` 只放管理员可访问的全站概览、用户管理、内容治理和系统配置。
- 管理员专属页面使用 `src/routes/AdminRoute.tsx` 之类的管理员路由守卫；不要用“禁止管理员访问普通功能”的 `forbidAdmin` 模式。
- 管理员端状态和组件优先放在 `src/features/admin` 与 `src/pages/AdminConsole.tsx`，不要塞回个人工作台。
- 暂未开放的能力使用 `src/features/unavailable.ts` 中的提示方式，不要做“只提示成功但没有真实 API 调用”的交互。
- 当前用户资料更新后应调用 `useAuth` 暴露的 `refreshProfile()` 刷新全局用户状态，避免头像、背景图等资料在页面间不一致。
- 评论查询返回的 `deletable` 字段应作为删除按钮展示依据；不要在页面中仅靠当前用户 ID 或管理员身份自行推断评论删除权限。
- Profile 主题配置等暂缓事项记录在 `docs/TODO.md`，实现前先确认后端是否已有对应字段或接口。

## 类型与验证

- `tsconfig.json` 已开启 `noUnusedLocals` 和 `noUnusedParameters`，提交前清理未使用代码。
- 常用验证命令：
  - `npm.cmd run lint`
  - `npm.cmd run build`
- 本地开发命令：
  - `npm install`
  - `npm.cmd run dev`
