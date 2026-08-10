# Specgo

面向存量代码仓的四分类资产治理 skill 体系（arch 结构 / biz 业务 / tech 技术 / qual 工程四域 + all 横向共 20 个治理 skill，另保留 3 个旧体系 spec-* skill 与 code-generate 编排 skill 支撑需求到交付链路）。内置一段 bootstrap 注入指令，让 coding agent 在做代码仓分析类任务前，先加载对应 skill、按 HELP.MD  taxonomy 与统一格式产出文档资产到 `docs/{域}/{资产}/` 下；并能依据 story 设计文档直接生成代码。

## 组成

```
specgo/
├── opencode.js              # OpenCode 插件入口（package.json 的 main）
├── bootstrap.md             # 注入指令（由 scripts/generate-bootstrap.mjs 生成，勿手改）
├── skills/                  # 24 个 skill（每个一个目录，内含 SKILL.md）
├── hooks/                   # Claude Code SessionStart hook
│   ├── hooks.json           # hook 注册（SessionStart → run-hook.cmd session-start）
│   ├── run-hook.cmd         # 跨平台 wrapper（Windows 走 Git Bash，Unix 直接 exec）
│   └── session-start        # 读 bootstrap.md，输出 additionalContext JSON
├── scripts/
│   └── generate-bootstrap.mjs  # 从 skills/*/SKILL.md frontmatter 重新生成 bootstrap.md
├── plugin.json              # OpenCode 插件清单
└── .claude-plugin/          # Claude Code 插件与 marketplace 清单
    ├── plugin.json
    └── marketplace.json
```

## 工作原理

两个平台都只做两件事：**让 agent 发现 skills/ 下的 skill**、**会话启动时注入 bootstrap.md**（内容是一段"做分析任务前必须先加载对应 skill"的指令 + 24 个 skill 的索引）。

- **OpenCode**：`opencode.js` 的 `config` hook 把 `skills/` 注册进 `config.skills.paths`；`experimental.chat.messages.transform` hook 把 bootstrap 注入第一条 user message（注入 user message 而非 system message，避免每轮重复消耗 token）。
- **Claude Code**：`hooks/hooks.json` 在 SessionStart 执行 `session-start` 脚本，把 bootstrap 作为 `additionalContext` 输出；`skills/` 目录由 Claude Code 插件机制自动发现。

bootstrap.md 是预生成文件，由 `scripts/generate-bootstrap.mjs` 从各 skill 的 frontmatter description 生成。改了任何 skill 后必须重跑该脚本，否则注入的索引是旧的。

## 安装到 OpenCode

在 `opencode.json`（全局 `~/.config/opencode/opencode.json` 或项目根 `./opencode.json`）的 `plugin` 数组中加入**本插件的包目录路径**：

```json
{
  "plugin": ["/绝对路径/specgo"]
}
```

注意：

- 路径必须是**包目录**（含 `package.json` 的目录），不是 `opencode.js` 文件路径。OpenCode 读 `package.json` 的 `main` 字段定位入口。
- 用全局配置时建议写绝对路径；项目级配置可用相对配置文件的路径。
- 配置在启动时加载一次，**保存后需退出并重启 OpenCode**生效。

## 安装到 Claude Code

两步：注册本地 marketplace，再安装插件。

```
/plugin marketplace add /绝对路径/specgo
/plugin install specgo@specgo
```

注意：

- SessionStart hook 依赖 bash。Windows 上需要安装 Git Bash（`hooks/run-hook.cmd` 会自动查找 `C:\Program Files\Git\bin\bash.exe` 或 PATH 中的 bash）。
- 安装后重启 Claude Code 生效。

## 验证安装

重启后确认两点：

1. skill 列表中出现 20 个新体系治理 skill（`arch-`/`biz-`/`tech-`/`qual-`/`all-` 开头）与 4 个需求到交付链路 skill（3 个 `spec-` 开头 + `code-generate` 编排），共 24 个（OpenCode 中可查看可用 skill；Claude Code 中 `/plugin` 查看已装插件）
2. 会话启动时 bootstrap 已注入：直接问 agent "你有哪些 spec skill"，应能列出下表全部 skill

## 内含 skill

skill 清单按 HELP.MD「四分类资产模型」taxonomy 组织：四域（arch / biz / tech / qual）+ 横向（all）共 20 个治理 skill；另有 3 个旧体系 spec-* skill 与 code-generate 编排 skill 保留支撑需求到交付链路。命名公式 `{域}-{资产}-{形态}-analyze`，输出统一落盘 `docs/{域}/{资产}/`（每类资产一个单独目录）。

### 架构要素（arch）—— 定结构：代码往哪放

| Skill | 作用 | 产出 |
|-------|------|------|
| arch-structure-model-analyze | 结构模型：模块划分、分层、职责与依赖关系（UML 包图 + 依赖矩阵），提取型 | `docs/arch/structure-model/`：structure-model.md 仓级总览 + structure-model-{module}.md 每模块一篇 |
| arch-interaction-model-analyze | 交互模型：模块间主业务流程、消息走向（UML 时序图），只画主链路，分支逻辑归业务规则；未指明流程时默认全量逐篇产出 | `docs/arch/interaction-model/`：interaction-model-{flow}.md 每业务流程一篇 |

### 业务要素（biz）—— 定业务：对象怎么建、数据存什么

| Skill | 作用 | 产出 |
|-------|------|------|
| biz-interface-analyze | 接口：服务对外接口清单（HTTP 路由/RPC/消息订阅/IDL），按功能域聚类 | `docs/biz/interface/`：README 全景主文档 + interface-{feature}.md 每功能域一篇 |
| biz-rules-analyze | 业务规则：条件分支/参数校验/状态迁移/阈值/错误码等规则点，按需求类整理"条件 → 动作 + 依据"规则条目 | `docs/biz/rules/`：rules-{feature}.md 每需求类一篇 |
| biz-object-model-analyze | 对象模型：实体、值对象、聚合、领域服务、领域事件（UML 类图），只画聚合内结构与聚合间引用方向 | `docs/biz/object-model/`：object-model-{aggregate}.md 每聚合一篇 |
| biz-data-model-analyze | 数据模型：持久态表结构、缓存数据结构、字段关系与数据生命周期（UML-ER） | `docs/biz/data-model/`：data-model-{entity}.md 每数据实体一篇 |
| biz-lexicon-analyze | 领域词典：业务与代码共用的受控词汇集（术语释义、语境边界、代码命名映射），按功能域拆分子域文档 | `docs/biz/lexicon/`：主文档 lexicon.md（说明/待确认清单/子域导航/通用节）+ lexicon-{feature}.md 每功能域一篇 |

### 技术要素（tech）—— 定用法：机制怎么用、调用怎么跑

| Skill | 作用 | 产出 |
|-------|------|------|
| tech-usage-analyze | 框架使用现状：基础框架清单与使用方式盘点（纯现状提取，无规范文档） | `docs/tech/usage/`：README 索引 + usage-{framework}.md 每框架一篇 |
| tech-comm-guidelines-analyze | 通信规范：RPC/HTTP/MQ 跨服务调用指导（协议与封装归此，故障策略归韧性）；双模式：提取 + 差距分析 | `docs/tech/comm-guidelines/`：README + comm-guidelines-{service}.md 每外部服务一篇；差距报告 report/{YYYYMMDD}-comm-guidelines.md |
| tech-concurrency-guidelines-analyze | 并发规范：线程池选型、池间隔离、容量/队列配置、拒绝策略；双模式 | `docs/tech/concurrency-guidelines/`：concurrency-guidelines-{pool}.md 每线程池/原语一篇 + report/ |
| tech-data-access-guidelines-analyze | 数据访问规范：Redis/DB 等中间件访问指导（连接管理、事务、分页批量、SQL 注入防护、缓存读写模式）；双模式 | `docs/tech/data-access-guidelines/`：data-access-guidelines-{mw}.md 每中间件一篇 + report/ |
| tech-resilience-guidelines-analyze | 韧性规范：超时/重试/熔断降级/异常处理等故障策略；双模式 | `docs/tech/resilience-guidelines/`：resilience-guidelines.md 仓级单篇 + report/ |
| tech-foundation-guidelines-analyze | 基础规范：日志/配置/告警等横切编码机制的编码指导；双模式 | `docs/tech/foundation-guidelines/`：foundation-guidelines.md 仓级单篇 + report/ |

### 工程要素（qual）—— 定规矩：写到什么程度才算合格

| Skill | 作用 | 产出 |
|-------|------|------|
| qual-code-standards-analyze | 编码规范：命名、注释、函数长度/圈复杂度、安全编码红线、禁止项清单（规则分红线/建议两级，红线供 CI 门禁）；双模式 + 门禁 | `docs/qual/code-standards/`：code-standards.md 仓级单篇 + report/ 门禁差距报告 |
| qual-dt-guidelines-analyze | DT 规范：测试金字塔与覆盖基线、用例设计方法、自测报告要求、新增代码覆盖率门禁；双模式 + 门禁 | `docs/qual/dt-guidelines/`：dt-guidelines.md 仓级单篇 + report/ |
| qual-branch-guidelines-analyze | 分支与变更规范：分支模型、commit/MR 规范、评审要求；双模式 | `docs/qual/branch-guidelines/`：branch-guidelines.md 仓级单篇 + report/ |

### 横向能力（all）

| Skill | 作用 | 产出 |
|-------|------|------|
| all-init | 初始化仓级 `docs/` 资产目录骨架（每类资产一个单独目录），一次性迁移既有产出到新布局（迁移映射清单先交用户确认） | 目录骨架 + 迁移执行摘要 |
| all-index | 生成各域索引 README + 总索引 + 服务依赖全景图（Mermaid flowchart，从通信规范资产提取依赖边）；只聚合真实存在的文件 | `docs/README.md` 总索引 + 各域 `docs/{域}/README.md` |
| all-update | 基于 git 变更（工作区 diff / commit / MR diff）识别代码变化对 docs/ 资产的影响，按最新要素定义增量刷新受影响文档（刷新清单人工确认后定稿） | 受影响 docs/ 文档就地刷新（同名覆盖） |
| all-analyze | 一键全量资产分析编排：子代理并行派发全部 16 个 analyze skill（词典第二波复用接口功能域口径），all-index 收口索引；主代理只编排、确认与验收 | `docs/` 全套资产 + 各域索引与总索引 |

### 需求到交付链路（旧体系 spec-* + 编排）

以下 3 个 spec-* skill 与 code-generate 编排 skill 保留，支撑"需求审核 → story 设计 → 代码生成"的需求到交付链路；其中旧的接口/出站调用/框架使用三个盘点 skill 已删除，分别由 biz-interface-analyze、tech-comm-guidelines-analyze、tech-usage-analyze 取代；spec-code-check 与 spec-asset-refresh 已删除，资产刷新职责由 all-update 按最新要素定义承接；spec-feature-analyze、spec-key-class-analyze、spec-data-structure-analyze 已删除（docs/business/ 旧资产仅作引用素材，不再回灌录入）；spec-logic-audit 已并入 spec-audit（成为其场景 1）。

| Skill | 作用 | 产出 |
|-------|------|------|
| spec-mermaid-diagram | mermaid 语法红线 + 本地渲染验证 | 含图产出物跑 validate-mermaid.mjs 全部 VALID |
| spec-story-design | 需求文档 → story 设计文档（`docs/storys/{功能名}-story.md`，八类核心要素组织，标注新增/变更/不涉及） | `docs/storys/` + `docs/develop-task/`（抛弃式编码辅助文档） |
| spec-audit | 文档质量审核与评估：场景 1 需求/功能设计审核（多彩建模 + 断点扫描 + ask-human 澄清 + HTML，可选输出规范功能设计 md）；场景 2 资产质量评估（A 轨澄清未清零不出分；B 轨 Linter 零容忍+专项 0-5 分），支持单篇更新/通篇全量 | 建模 HTML（`docs/audit/{需求名}/`）；评估报告（`docs/report/`：README.MD 整体评估 + 每篇一个打分报告）；功能设计 md（`docs/storys/`） |
| code-generate | 全链路编排：资产检查/录入 → 需求审核 → story 设计 → 代码实现与测试 → 资产刷新（all-update），五步端到端；主代理编排与用户确认，各步骤派子代理执行 | 从需求到交付的全部产出物 |

推荐全链路顺序：all-init（一次性建骨架/迁移）→ arch-structure-model-analyze → arch-interaction-model-analyze → biz 五件（interface → rules → object-model → data-model → lexicon）→ tech 六件（usage → comm/concurrency/data-access/resilience/foundation-guidelines）→ qual 三件（code-standards / dt-guidelines / branch-guidelines）→ all-index（索引与依赖全景）；全量资产也可直接加载 all-analyze 一键编排（子代理并行执行全部分析 + all-index 收口）；（有需求时）spec-audit 场景 1（需求审核）→ spec-mermaid-diagram → spec-story-design → 代码实现 →（git 变更后）all-update（资产刷新收口）；资产质量评估走 spec-audit 场景 2。每步也可单独触发；或直接加载 code-generate 走五步端到端编排主流程（自动串联上述各步，子代理执行）。

## 修改 skill 后如何更新

skill 内容在 `skills/<名称>/SKILL.md`。任一 skill 的 frontmatter description 变更后，重新生成 bootstrap 并重启 agent：

```bash
cd /路径/specgo
bun scripts/generate-bootstrap.mjs    # 或 node scripts/generate-bootstrap.mjs
```

只改 SKILL.md 正文（frontmatter 没变）时 bootstrap 无需重新生成，但 Claude Code 需重装或重启才能读到新 skill 内容。

## 卸载

- OpenCode：从 `opencode.json` 的 `plugin` 数组移除条目，重启
- Claude Code：`/plugin uninstall specgo@specgo`
