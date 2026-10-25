# QianyiClaw → movo 移植清单（企业化改造）

> 日期：2026-10-23
> 目标：以 movo 私有化版本为基座，把 QianyiClaw（千翼云爪）中体验更好、更贴合“企业级 AI DevOps 智能开发平台”定位的能力移植进来，并统一产品名与配色为 QianyiClaw。

## 一、基线

- 仓库：`C:\projects\movo`（apps/user-web、apps/admin-web、services/chat-api、services/admin-api、services/document-api、services/document-worker、services/dsh-runtime-host）
- 本地入口：`http://localhost:3000`（movo gateway）；`https://localhost:8443`（Caddy 常驻网关，独立前端快照）
- 账号：user01 / Qianyi@2026!（乾易科技·演示员工）；admin / Qianyi@2026!（平台超级管理员）

## 二、移植决策（保留 / 移植 / 放弃）

| # | QianyiClaw 能力 | movo 现状 | 决策 | 落地位置 |
|---|---|---|---|---|
| 1 | 品牌名与配色（青绿主色、浅色企业风） | movo 默认品牌 + 蓝紫配色 | ✅ 已移植 | `apps/*/src/styles.css`、`theme/*`、`locales/messages.ts`、logo/favicon |
| 2 | 首次上手引导（onboarding 步骤 + 推荐任务） | 无引导，首屏空白不知从何下手 | ✅ 已移植 | `ChatWindow.vue`、`ChatComposer.vue`、onboarding 步骤组件 |
| 3 | 会话工作区 + 变更侧栏（分支/变更 diff） | 仅有普通聊天 | ✅ 已移植（会话内带仓库时展示变更侧栏） | `ChatWindow.vue` + 变更侧栏组件 |
| 4 | Skills 目录（写作规范/工作流/自定义工具） | 无 | ✅ 已移植为演示数据 | `/skills` |
| 5 | Plugins（企业插件安装/启用） | 有 DSH 插件框架但空 | ✅ 已企业化：2 个企业插件已启用 | `/plugins`、`/admin/` DSH 插件目录 |
| 6 | Tools（工具目录 + MCP 服务） | 无 | ✅ 已移植演示数据 | `/tools` |
| 7 | 知识库（文档解析 + 内网知识问答） | 有框架，个人问答缺模型绑定、embedding 易失败 | ✅ 已修复并落地 | `/knowledge`、`document-parser` |
| 8 | 定时任务（如每周发布周报） | 无 | ✅ 已移植演示数据 | `/scheduled-tasks` |
| 9 | Usage（Token 使用记录） | DSH 轮次查不到（kernel session id 不匹配） | ✅ 已修复 | `/usage`、`token_usage_service.py` |
| 10 | Projects / Worktrees / CodeGraph | movo 无对应页面 | ⏸ 暂缓（定位重叠，先以会话工作区承载） | — |
| 11 | DevOps / Ops / Security 专页 | movo 无 | ⏸ 暂缓（后续按需移植） | — |
| 12 | Devices 受管设备 | movo 无 | ⏸ 暂缓 | — |
| 13 | Market / Integrations / Teams / Spaces | movo 无 | ⏸ 暂缓 | — |

## 三、本次已落地的代码改动（源码与镜像一致）

1. `services/chat-api/app/services/rag_service/internal_knowledge_qa_service.py`
   - 个人知识问答在能力运行时之外调用时，绑定租户默认 chat 模型，避免回退到环境默认模型导致失败。
2. `services/document-parser/app/services/embedding_provider.py`
   - 增加稳定 User-Agent，并对 403/429/5xx 等瞬时状态重试，避免单次抖动导致整批索引失败。
3. `services/chat-api/app/services/token_usage_service.py`
   - 将 DSH kernel session id 映射回 chat 会话，使 DSH 轮次的 token 日志能在 Usage 页面展示。

### 3.1 品牌去 MOVO 化（源码 29 个文件 + 3 个镜像重建）

- **AI 人设**：`services/chat-api/dsh/runtime-host/src/runtime-persona.mjs` 首行 `You are QianyiClaw, an enterprise AI assistant powered by the DeepSeek Harness runtime.`（容器内 `QianyiClaw` 计数 5、`MOVO` 计数 0）。
- **预设**：`config/agent-presets/askai-enterprise/preset.yml` → `name: QianyiClaw 企业助手`；`agent.cordis.yml` 同步。
- **服务端品牌常量**：`services/chat-api/app/core/config.py` `PROJECT_NAME = "QianyiClaw"`；`services/admin-api/app/core/config.py` `bootstrap_admin_org_name = "QianyiClaw 平台"`；`product_edition.py`、`setup.py`、`system.py`、`main.py` 及 `enterprise_capabilities/*` 中对外可见的品牌串统一改为 QianyiClaw。
- **镜像重建**：因继承镜像构建链在 `apt-get` 阶段失败，采用 thin Dockerfile（`FROM <svc>:prebrand-20261026` + `COPY` 变更目录）重建 `movo-chat-api`、`movo-admin-api`、`movo-dsh-runtime-host` 并 `--force-recreate`，容器内已核对生效；thin Dockerfile 属临时构建产物，未入库。

### 3.2 questions 轮询 404 修复

- **现象**：网关 access log 每 8 秒出现 `GET /askai-api/api/dsh/conversations/{id}/questions 404`。
- **根因**：`services/chat-api/app/api/endpoints/user_questions.py::_owning_binding` 对「无 `active_run`」的会话直接抛 404，而前端 `useUserQuestions` 会持续后台轮询。
- **修复**：`_owning_binding` 增加 `require_active_run` 参数；GET `/{conversation_id}/questions` 以 `require_active_run=False` 调用，无在途运行时返回 `{"questions": []}`；POST 回答仍保留严格校验。重建 chat-api 后网关日志由 `404 35` 变为 `200 16`。

## 四、验收方式

- 全部使用真实 headed Chrome（`channel: 'chrome'`，`headless: false`）逐页目视检查并截图，不以脚本/无头结果替代。
- 覆盖页面：`/`、`/skills`、`/plugins`、`/tools`、`/knowledge`、`/scheduled-tasks`、`/usage`、`/admin` 后台。
- 判定：页面非空、无横向溢出（overflowX=0）、无 console 报错、无 HTTP ≥400。
- **本轮验收记录（2026-10-23）**：
  - **提交与备份**：品牌去 MOVO 化 + questions 轮询 404 修复已提交为 `a683ff2`（29 files changed, 77 insertions(+), 63 deletions(-)），工作区 clean；源码备份 `C:/projects/movo-backups/movo-src-20261026-043305-a683ff2.tar.gz`（7,886,035 bytes）。
  - **服务在线实测**：gateway `http://localhost:3000` = 200、Caddy `https://localhost:8443` = 200；14 个容器全部 Up，chat-api / admin-api / dsh-runtime-host 均 healthy。
  - **8 个页面 headed Chrome 回归全部通过**：`/`、`/skills`、`/plugins`、`/tools`、`/knowledge`、`/scheduled-tasks`、`/usage`、`/admin`，title 正确（前台为「QianyiClaw 企业级 AI DevOps 智能开发平台」，后台为「QianyiClaw 管理后台」）、`overflowX=0`、页面内无可见 `MOVO` 文案（`movoVisible=false`）、`errors=[]`，截图 `reg-*.png`。
  - **AI 助手自述**：「我是 QianyiClaw，一个企业级 AI 助手，能够帮你处理文档、分析数据、调研信息并生成各类办公成果。」；历史会话重开渲染正确，截图 `brand-03-reopen.png`、`fix-01-history.png`。
  - **questions 轮询 404 复验**：重开历史会话观察 12s，无 ≥400 请求（`BAD=[]`），网关日志 404→200，截图 `fix-01-history.png`。
  - **管理后台**「QianyiClaw 智能体控制台」深色侧栏，无 MOVO，截图 `reg-admin.png`。

## 五、边界与说明

- **变更侧栏仅桌面版可用**：web 模式固定 `codeInspector:false`、`localWorkspacePicker:false`、`localDshRuntime:false`，浏览器版（3000 / 8443）不会渲染 `ProjectWorkspacePanel`，属设计预期，非缺陷。
- **内部标识保留**：`mode: 'movo' | 'external'`、`movo.desktop-tool-panel-width`、`movo:install-skill-zip`、`extensionId: 'movo.community'`、`MOVO_*` 环境变量等均为内部实现标识，用户不可见，暂不修改以免破坏兼容。
- **未引用的 `apps/*/public/movo-logo.png`** 可后续清理。

## 六、待办

- [ ] 逐步评估 #10–#13 的移植优先级（需产品确认范围）。
- [ ] 8443 独立前端快照在前端发布后需同步核对。
- [ ] `git push origin main` 返回 403（`Permission to himovo/movo.git denied to meetcsworld`），需确认推送凭据 / fork 归属后再推送。
