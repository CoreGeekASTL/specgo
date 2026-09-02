---
name: spec-analyze
description: >-
  资产分析主 skill——承载 17 个子流程（arch 结构/交互 2 个 + biz 接口/规则/对象模型/数据模型/词典 5 个 + tech 框架/通信/并发/数据访问/韧性/基础 6 个 + qual 编码/DT/分支 3 个 + 资产质量审核 1 个）的路由与编排：单个子流程请求按「子流程路由表」读取对应子流程文件执行；全量请求以子代理并行派发 16 个分析子流程（asset-audit 审核类不入全量波次，按需单独触发），一次性建齐代码仓 docs/ 全套资产（首波 15 个分析子代理并行，第二波词典复用接口功能域口径）。主代理只做编排、用户确认与验收，不亲自分析。触发场景包括"spec-analyze"、"全量资产分析"、"一键资产分析"、"建齐 docs 资产"、"asset-audit"、"资产质量评估"、"评估 docs 文档质量"、"文档与代码一致性检查"、"资产失实检查"、"审核资产文档"，以及各单资产场景："梳理代码仓结构/目录关系/模块依赖/包图"、"交互模型/时序图/调用链/梳理业务流程"、"对外接口盘点/接口清单"、"业务规则/规则提取/状态机/错误码规则"、"对象模型/领域模型/聚合/类图/DDD"、"数据模型/表结构/ER 图/数据字典/TTL"、"领域词典/术语表/词汇表/统一语言"、"框架使用指导/技术栈盘点"、"通信规范/出站调用/下游接口/服务依赖"、"并发规范/线程池/锁/goroutine 启动点"、"数据访问规范/Redis 使用/DB 访问/缓存穿透/SQL 注入防护"、"韧性规范/超时/重试/熔断降级/吞错"、"基础规范/日志规范/配置读取/告警"、"编码规范/clean code/安全编码红线/CI 门禁规则"、"DT 规范/测试金字塔/覆盖率门禁/等价类边界值"、"分支规范/commit 规范/MR 规范/git flow"等。
---

# 资产分析主 skill（spec-analyze）

代码仓**资产分析的唯一入口**，两种工作模式：

- **单资产模式**：用户只要求某类资产分析时，按下方「子流程路由表」定位子流程文件，**读取该文件全文并严格按其执行**（其依赖文件在同级 `references/assets/`，文件名带资产短名前缀）。
- **全量编排模式**：用户要求全量/一键建库时，以子代理并行派发全部子流程，见「全量编排」节。

**定位**：本 skill 是路由 + 编排层，不定义任何资产格式——分析方法与产出格式归各子流程文件（最新要素定义来源）；变更驱动的增量刷新归独立 skill spec-update；需求审核归独立 skill spec-requirement-audit。

**交互双模式（全局条款）**：本 skill 所有询问点（含全量模式第 0 步确认）**默认使用 ask-human 工具**；若任务开始时用户声明"以报告形式呈现"（或同类意思），则全程**不使用 ask-human**——待确认/待审视内容以报告形式输出，等用户回复后继续。

**路径锚定**：本文件中所有相对路径均以本 SKILL.md 所在目录为锚；派子代理时必须先把子流程文件解析成**绝对路径**写进 prompt，子代理不猜路径。

## 子流程路由表

| 子流程 | 触发意图 | 子流程文件（references/subflows/） | 产出落盘 |
| --- | --- | --- | --- |
| arch-structure-model-analyze | 结构模型/包图/模块依赖/目录关系/架构摸底 | `arch-structure-model-analyze.md` | `docs/0-arch/structure-model/` |
| arch-interaction-model-analyze | 交互模型/时序图/调用链/梳理业务流程 | `arch-interaction-model-analyze.md` | `docs/0-arch/interaction-model/` |
| biz-interface-analyze | 对外接口盘点/接口清单 | `biz-interface-analyze.md` | `docs/0-biz/interface/` |
| biz-rules-analyze | 业务规则/分支逻辑/校验规则/状态机/错误码 | `biz-rules-analyze.md` | `docs/0-biz/rules/` |
| biz-object-model-analyze | 对象模型/领域模型/聚合/类图/DDD | `biz-object-model-analyze.md` | `docs/0-biz/object-model/` |
| biz-data-model-analyze | 数据模型/表结构/ER 图/数据字典/生命周期 | `biz-data-model-analyze.md` | `docs/0-biz/data-model/` |
| biz-lexicon-analyze | 领域词典/术语表/词汇表/统一语言 | `biz-lexicon-analyze.md` | `docs/0-biz/lexicon/` |
| tech-framework-guidelines-analyze | 框架使用指导/技术栈盘点 | `tech-framework-guidelines-analyze.md` | `docs/0-tech/framework-guidelines/` |
| tech-external-call-guidelines-analyze | 通信规范/出站调用/下游接口/服务依赖 | `tech-external-call-guidelines-analyze.md` | `docs/0-tech/external-call-guidelines/` |
| tech-concurrency-guidelines-analyze | 并发规范/线程池/锁/goroutine 启动点 | `tech-concurrency-guidelines-analyze.md` | `docs/0-tech/concurrency-guidelines/` |
| tech-data-access-guidelines-analyze | 数据访问规范/Redis/DB 访问/缓存/SQL 注入防护 | `tech-data-access-guidelines-analyze.md` | `docs/0-tech/data-access-guidelines/` |
| tech-resilience-guidelines-analyze | 韧性规范/超时/重试/熔断降级/吞错 | `tech-resilience-guidelines-analyze.md` | `docs/0-tech/resilience-guidelines/` |
| tech-basic-mechanism-guidelines-analyze | 基础规范/日志/配置/告警 | `tech-basic-mechanism-guidelines-analyze.md` | `docs/0-tech/basic-mechanism-guidelines/` |
| qual-code-standards-analyze | 编码规范/clean code/安全红线/CI 门禁 | `qual-code-standards-analyze.md` | `docs/0-qual/code-standards/` |
| qual-dt-guidelines-analyze | DT 规范/测试金字塔/覆盖率门禁 | `qual-dt-guidelines-analyze.md` | `docs/0-qual/dt-guidelines/` |
| qual-branch-guidelines-analyze | 分支规范/commit 规范/MR 规范/git flow | `qual-branch-guidelines-analyze.md` | `docs/0-qual/branch-guidelines/` |
| asset-audit（审核类，不入全量波次，按需单独触发） | 资产质量评估/文档与代码一致性检查/资产失实检查 | `asset-audit.md` | `docs/report/` |

## 单资产模式执行规则

1. 按用户意图命中路由表一行（多个意图命中多行时逐个执行或询问用户优先级）。
2. 读取对应子流程文件全文，严格按其步骤、模板与产出约定执行；子流程引用的模板/脚本在 `references/assets/`（`<资产短名>--<文件名>`）。
3. 产出含 mermaid 时，必须过 mermaid 验证脚本全部 VALID 才交付。

## 全量编排模式

对存量代码仓**一次性建齐 docs/ 全套资产**。主代理不亲自分析——只做流程推进、用户确认、子代理派发与验收；每个子流程由一个独立子代理读取全文后执行。

### 何时触发 / 何时不触发

- **触发**：首次为代码仓建立全套 docs/ 资产；资产体系长期失修需要全量重建；用户明确要求"全量/一键/跑一遍所有分析"。
- **不触发**：单个资产分析或资产质量审核（走单资产模式路由）；代码变更后的增量同步（走独立 skill spec-update）。

### 第 0 步：前置检查与用户确认

1. 确认被分析仓路径与主语言；检查 `docs/` 现状：
   - 存在旧布局历史产出（`docs/business/`、`docs/technical/`、扁平 arch 文档等）→ 提示用户手工整理或忽略旧布局目录，再继续本流程。
   - 已存在 v1.1 资产 → 告知用户各子流程均为**同名覆盖的活文档口径**（全量重刷），确认后继续；仅需增量同步时建议改走独立 skill spec-update。
2. 确认分析范围：**默认全部 16 个子流程**；用户明确勾选子集时按子集执行（后续波次同步裁剪）。
3. 子代理一律**不阻塞式询问**：各子流程按其默认全量口径执行；某类资产在仓内无法建立（如无 MQ 则通信规范无 MQ 篇目）时，子代理在返回中注明原因，不中断流程。

### 第 1 步：首波并行派发（15 个分析子代理）

同一条消息**并行**派发路由表中除 biz-lexicon-analyze 外的 15 个子流程（平台并发受限时按路由表顺序分批，每批不超过 8 个），产出落盘与模式以各子流程文件约定为准。

**子代理 prompt 四要素**：①子流程文件的**绝对路径**（必须先读全文再开工）②被分析仓路径 ③产出落盘路径与模式（见路由表与子流程文件）④返回内容（产出文件清单 + 关键结论 + 未建/异常说明 + 含 mermaid 文档清单）。

### 第 2 步：第二波——领域词典（biz-lexicon-analyze）

- **待对外接口子代理返回后**再派发：词典子域划分优先复用 `docs/0-biz/interface/` 的功能域归类口径（其子流程第 2 步），保证词典子域与接口功能域一一对应、子域锚点与 interface 子文档一致。
- 若接口分析失败或被用户裁剪 → 词典子代理按其子流程口径自行从代码归纳功能域，并在返回中注明。
- 产出：`docs/0-biz/lexicon/`（主文档 lexicon.md + 每功能域 1 篇 lexicon-{子域锚点}.md）。

### 第 3 步：验收

1. **产出完整性**：对照勾选清单逐目录核对——产出文件存在且非空；未建资产须附子代理返回的原因（仓内无此机制属正常，空目录须说明）。
2. **mermaid 验证**：含图文档（structure-model / interaction-model / object-model / data-model）全部过验证脚本，INVALID 打回对应子代理（task_id 续会话）修复后重验：

```bash
node <specgo插件目录>/scripts/mermaid-validate/validate-mermaid.mjs <文档路径>
```

3. **口径抽查**：每域抽 1 篇对照其子流程模板——小节结构、文件命名、证据不带行号等组织规则一致；不符打回整改，主代理不亲自代写。

### 第 4 步：交付摘要

按 arch / biz / tech / qual 分节汇总交付：

- **已建资产**：每类资产的文件清单与规模（篇数/词条数/接口数等关键数字）。
- **未建资产**：目录与原因（子代理返回原话）。
- **验证结果**：mermaid 验证通过情况；打回整改记录。

交付摘要呈现后按交互双模式完成用户审视（默认 ask-human，报告模式仅输出摘要）。

## 子代理派发通用规则

- prompt 四要素齐全（子流程文件绝对路径 / 仓路径 / 产出路径与模式 / 返回内容），缺一不派。
- 无依赖的子代理同一条消息并行派发；有依赖严格按波次（接口 → 词典）。
- 子代理执行中需要用户输入时不脑补——返回待确认清单结束本轮，主代理问用户后以 task_id 续会话回传**同一子代理**。
- 验收不过关打回整改，主代理不亲自代写。

## 红线

| 想法 | 现实 |
| --- | --- |
| "我自己扫一遍更快" | 全量模式分析一律派子代理，主代理只编排、确认与验收 |
| "16 个太多，挑几个跑" | 全量模式默认全量；只有用户明确勾选子集才裁剪 |
| "词典和接口一起发" | 词典依赖接口功能域口径，必须在第二波 |
| "mermaid 看着没问题" | 含图文档必须过 validate-mermaid.mjs 全部 VALID |
| "某篇不合格我顺手改改" | 打回子代理整改，主代理不代写 |
| "子流程让子代理用 Skill 工具加载" | 子流程不是独立 skill，必须把文件绝对路径写进 prompt 让子代理读取 |

## 与其它 skill 的关系

- **spec-update**：变更驱动的 docs 资产增量刷新，独立 skill。
- **spec-requirement-audit / spec-story-design / spec-code-generate / spec-report**：需求到交付链路的独立 skill，与本 skill 无调用关系（story 设计可读本体系产出的资产作为输入）。
- **mermaid 验证**：共用参考 `<specgo插件目录>/references/mermaid-guide.md`（语法红线 + 验证流程），验证脚本 `<specgo插件目录>/scripts/mermaid-validate/validate-mermaid.mjs`，各步贯穿使用。
