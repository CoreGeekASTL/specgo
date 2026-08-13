---
name: spec-analyze
description: >-
  一键全量资产分析编排 skill——以子代理并行派发全部 16 个资产分析 skill（arch 结构/交互 2 个 + biz 接口/规则/对象模型/数据模型/词典 5 个 + tech 使用/通信/并发/数据访问/韧性/基础 6 个 + qual 编码/DT/分支 3 个），一次性完成代码仓全套 docs/ 资产建库：首波 15 个分析子代理并行，第二波 biz-lexicon-analyze（复用接口功能域口径保证词典子域对齐），最后 spec-index 子代理收口生成各域索引与总索引。主代理只做编排、用户确认与验收，不亲自分析。当需要为代码仓首次建齐 docs/ 全套资产、或资产长期失修需要全量重建时使用。触发场景包括"spec-analyze"、"全量资产分析"、"一次性分析代码仓"、"一键资产分析"、"资产全量录入"、"全仓资产盘点"、"把所有分析 skill 跑一遍"、"建齐 docs 资产"等。
---

# 全量资产分析编排（spec-analyze）

对存量代码仓**一次性建齐 docs/ 全套资产**的编排入口。主代理不亲自分析——只做流程推进、用户确认、子代理派发与验收；每个 analyze skill 由一个独立子代理加载全文后执行。

**定位**：本 skill 是纯编排层，不定义任何资产格式——分析方法与产出格式归各 analyze skill（最新要素定义来源）；索引归 spec-index；旧布局迁移归 spec-init；变更驱动的增量刷新归 spec-update（全量分析不走本 skill 的反向）。

## 何时触发 / 何时不触发

- **触发**：首次为代码仓建立全套 docs/ 资产；资产体系长期失修需要全量重建；用户明确要求"全量/一键/跑一遍所有分析"。
- **不触发**：单个资产的分析（直接加载对应 analyze skill）；代码变更后的增量同步（加载 spec-update）；旧布局迁移（先加载 spec-init）。

## 第 0 步：前置检查与用户确认

1. 确认被分析仓路径与主语言；检查 `docs/` 现状：
   - 存在旧布局历史产出（`docs/business/`、`docs/technical/`、扁平 arch 文档等）→ 提示用户先运行 spec-init 迁移，再继续本流程。
   - 已存在 v1.1 资产 → 告知用户各 analyze skill 均为**同名覆盖的活文档口径**（全量重刷），确认后继续；仅需增量同步时建议改走 spec-update。
2. 确认分析范围：**默认全部 16 个 analyze skill**；用户明确勾选子集时按子集执行（后续波次同步裁剪）。
3. 子代理一律**不阻塞式询问**：各 analyze skill 按其默认全量口径执行；某类资产在仓内无法建立（如无 MQ 则通信规范无 MQ 篇目）时，子代理在返回中注明原因，不中断流程。

## 第 1 步：首波并行派发（15 个分析子代理）

同一条消息**并行**派发下列子代理（平台并发受限时按表中顺序分批，每批不超过 8 个）：

| # | 子代理 | 加载 skill | 产出落盘 | 模式备注 |
| --- | --- | --- | --- | --- |
| 1 | 结构模型 | arch-structure-model-analyze | `docs/arch/structure-model/` | 仓级总览 + 每模块 |
| 2 | 交互模型 | arch-interaction-model-analyze | `docs/arch/interaction-model/` | 默认枚举全部业务流程 |
| 3 | 对外接口 | biz-interface-analyze | `docs/biz/interface/` | 主文档 + 功能域子文档 |
| 4 | 业务规则 | biz-rules-analyze | `docs/biz/rules/` | 默认全功能域 |
| 5 | 对象模型 | biz-object-model-analyze | `docs/biz/object-model/` | 默认全聚合 |
| 6 | 数据模型 | biz-data-model-analyze | `docs/biz/data-model/` | 默认全实体 |
| 7 | 框架使用 | tech-usage-analyze | `docs/tech/usage/` | 现状提取 |
| 8 | 通信规范 | tech-comm-guidelines-analyze | `docs/tech/comm-guidelines/` | 提取模式 |
| 9 | 并发规范 | tech-concurrency-guidelines-analyze | `docs/tech/concurrency-guidelines/` | 起草模式 |
| 10 | 数据访问规范 | tech-data-access-guidelines-analyze | `docs/tech/data-access-guidelines/` | 起草模式 |
| 11 | 韧性规范 | tech-resilience-guidelines-analyze | `docs/tech/resilience-guidelines/` | 起草模式 |
| 12 | 基础规范 | tech-foundation-guidelines-analyze | `docs/tech/foundation-guidelines/` | 起草模式 |
| 13 | 编码规范 | qual-code-standards-analyze | `docs/qual/code-standards/` | 起草模式 |
| 14 | DT 规范 | qual-dt-guidelines-analyze | `docs/qual/dt-guidelines/` | 起草模式 |
| 15 | 分支规范 | qual-branch-guidelines-analyze | `docs/qual/branch-guidelines/` | 起草模式 |

**子代理 prompt 四要素**：①用 Skill 工具加载哪个 skill 全文（必须先加载再开工）②被分析仓路径 ③产出落盘路径与模式（见上表）④返回内容（产出文件清单 + 关键结论 + 未建/异常说明 + 含 mermaid 文档清单）。

## 第 2 步：第二波——领域词典（biz-lexicon-analyze）

- **待对外接口子代理（#3）返回后**再派发：词典子域划分优先复用 `docs/biz/interface/` 的功能域归类口径（其 skill 第 2 步），保证词典子域与接口功能域一一对应、子域锚点与 interface 子文档一致。
- 若接口分析失败或被用户裁剪 → 词典子代理按其 skill 口径自行从代码归纳功能域，并在返回中注明。
- 产出：`docs/biz/lexicon/`（主文档 lexicon.md + 每功能域 1 篇 lexicon-{子域锚点}.md）。

## 第 3 步：验收

1. **产出完整性**：对照勾选清单逐目录核对——产出文件存在且非空；未建资产须附子代理返回的原因（仓内无此机制属正常，空目录须说明）。
2. **mermaid 验证**：含图文档（structure-model / interaction-model / object-model / data-model）全部过验证脚本，INVALID 打回对应子代理（task_id 续会话）修复后重验：

```bash
node <specgo插件目录>/skills/mermaid-validate/scripts/validate-mermaid.mjs <文档路径>
```

3. **口径抽查**：每域抽 1 篇对照其 analyze skill 模板——小节结构、文件命名、证据不带行号等组织规则一致；不符打回整改，主代理不亲自代写。

## 第 4 步：索引收口（spec-index）

- 全部资产验收通过后，派**索引子代理**加载 spec-index 全文：生成/刷新各域索引 `docs/{域}/README.md` 与总索引 `docs/README.md`（含服务依赖全景图）；全景图 mermaid 同样过验证脚本。

## 第 5 步：交付摘要

按 arch / biz / tech / qual / 索引分节汇总交付：

- **已建资产**：每类资产的文件清单与规模（篇数/词条数/接口数等关键数字）。
- **未建资产**：目录与原因（子代理返回原话）。
- **验证结果**：mermaid 验证通过情况；打回整改记录。
- **索引落位**：各域 README 与总索引路径。

## 子代理派发通用规则

- prompt 四要素齐全（加载哪个 skill / 仓路径 / 产出路径与模式 / 返回内容），缺一不派。
- 无依赖的子代理同一条消息并行派发；有依赖严格按波次（接口 → 词典；全部资产 → 索引）。
- 子代理执行中需要用户输入时不脑补——返回待确认清单结束本轮，主代理问用户后以 task_id 续会话回传**同一子代理**。
- 验收不过关打回整改，主代理不亲自代写。

## 红线

| 想法 | 现实 |
| --- | --- |
| "我自己扫一遍更快" | 分析一律派子代理，主代理只编排、确认与验收 |
| "16 个太多，挑几个跑" | 默认全量；只有用户明确勾选子集才裁剪 |
| "词典和接口一起发" | 词典依赖接口功能域口径，必须在第二波 |
| "索引最后顺手写一下" | 索引由 spec-index 子代理按其 skill 口径生成 |
| "mermaid 看着没问题" | 含图文档必须过 validate-mermaid.mjs 全部 VALID |
| "某篇不合格我顺手改改" | 打回子代理整改，主代理不代写 |

## 与其它 skill 的关系

- **16 个 analyze skill**：被编排对象与要素定义来源——本 skill 不复制它们的模板与规则，只负责派发与验收。
- **spec-index**：第 4 步索引收口由其实现。
- **spec-init**：旧布局迁移的前置（第 0 步检测并提示），本 skill 不代做迁移。
- **spec-update**：增量刷新场景入口；全量建库/重建走本 skill。
- **specgo**：需求到交付全链路编排；其第 1 步的全量资产录入可改用本 skill 完成。
