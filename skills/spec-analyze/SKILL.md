---
name: spec-analyze
description: >-
  全量资产分析编排 skill——以子代理并行派发 14 个资产分析 skill（arch 结构/交互 2 个 + biz 接口/对象模型/数据模型 3 个 + tech 框架/通信/并发/数据访问/韧性/基础 6 个 + qual 编码/DT/分支 3 个），一次性完成代码仓 docs/ 资产建库。每个子代理按其 skill 的「交付前自检」判定落盘位置：自检不过的整篇写入 docs/_review/，通过的直接落正式目录。主代理只做编排、用户确认与验收，不亲自分析。当需要为代码仓首次建齐 docs/ 资产、或资产长期失修需要全量重建时使用。触发场景包括"spec-analyze"、"全量资产分析"、"一次性分析代码仓"、"一键资产分析"、"资产全量录入"、"全仓资产盘点"、"把所有分析 skill 跑一遍"、"建齐 docs 资产"等。
---

# 全量资产分析编排（spec-analyze）

对存量代码仓**一次性建齐 docs/ 资产**的编排入口。主代理不亲自分析——只做流程推进、用户确认、子代理派发与验收；每个 analyze skill 由一个独立子代理加载全文后执行。

**定位**：本 skill 是纯编排层，不定义任何资产格式——分析方法、产出格式与**待审判定**归各 analyze skill；变更驱动的增量刷新归 spec-update。

## 何时触发 / 何时不触发

- **触发**：首次为代码仓建立 docs/ 资产；资产体系长期失修需要全量重建；用户明确要求"全量/一键/跑一遍所有分析"。
- **不触发**：单个资产的分析（直接加载对应 analyze skill）；代码变更后的增量同步（加载 spec-update）。

## 第 0 步：前置检查与用户确认

1. 确认被分析仓路径与主语言；检查 `docs/` 现状：
   - `docs/` 不存在 → 先按下方目录树建骨架（连同 `docs/_review/`），再继续。
   - 存在旧布局历史产出（`docs/business/`、`docs/technical/`、扁平 arch 文档等）→ 提示用户先手工迁移或归档，再继续本流程。
   - 已存在资产 → 告知各 analyze skill 为**同名覆盖的活文档口径**，确认后继续；仅需增量同步时改走 spec-update。
2. 确认分析范围：**默认全部 14 个 analyze skill**；用户勾选子集时按子集执行。
3. 子代理一律**不阻塞式询问**：按各 skill 默认全量口径执行；某类资产在仓内无法建立时，在返回中注明原因，不中断流程。

目录骨架（`docs/` 不存在时按此建）：

```
docs/
├── _review/            # 自检未通过、待人确认的资产（镜像 0-{域}/{资产}）
├── 0-arch/{structure-model,interaction-model}/
├── 0-biz/{interface,object-model,data-model,knowledge}/
├── 0-tech/{framework-guidelines,external-call-guidelines,concurrency-guidelines,data-access-guidelines,resilience-guidelines,basic-mechanism-guidelines}/
├── 0-qual/{code-standards,dt-guidelines,branch-guidelines}/
└── 1-storys/
```

## 第 1 步：并行派发（14 个分析子代理）

同一条消息**并行**派发（平台并发受限时按表顺序分批，每批不超过 8 个）：

| # | 子代理 | 加载 skill | 正式落盘 | 可进待审 |
| --- | --- | --- | --- | --- |
| 1 | 结构模型 | arch-structure-model-analyze | `docs/0-arch/structure-model/` | ✅ |
| 2 | 交互模型 | arch-interaction-model-analyze | `docs/0-arch/interaction-model/` | ✅ |
| 3 | 对外接口 | biz-interface-analyze | `docs/0-biz/interface/` | ✅ |
| 4 | 对象模型 | biz-object-model-analyze | `docs/0-biz/object-model/` | ✅ |
| 5 | 数据模型 | biz-data-model-analyze | `docs/0-biz/data-model/` | — |
| 6 | 框架使用 | tech-framework-guidelines-analyze | `docs/0-tech/framework-guidelines/` | — |
| 7 | 通信规范 | tech-external-call-guidelines-analyze | `docs/0-tech/external-call-guidelines/` | — |
| 8 | 并发规范 | tech-concurrency-guidelines-analyze | `docs/0-tech/concurrency-guidelines/` | — |
| 9 | 数据访问规范 | tech-data-access-guidelines-analyze | `docs/0-tech/data-access-guidelines/` | — |
| 10 | 韧性规范 | tech-resilience-guidelines-analyze | `docs/0-tech/resilience-guidelines/` | — |
| 11 | 基础规范 | tech-basic-mechanism-guidelines-analyze | `docs/0-tech/basic-mechanism-guidelines/` | — |
| 12 | 编码规范 | qual-code-standards-analyze | `docs/0-qual/code-standards/` | ✅ |
| 13 | DT 规范 | qual-dt-guidelines-analyze | `docs/0-qual/dt-guidelines/` | ✅ |
| 14 | 分支规范 | qual-branch-guidelines-analyze | `docs/0-qual/branch-guidelines/` | ✅ |

**子代理 prompt 五要素**：①用 Skill 工具加载哪个 skill 全文 ②被分析仓路径 ③正式落盘路径 ④**落盘规则：skill 的「交付前自检」不过则整篇写 `docs/_review/{同路径}`** ⑤返回内容（正式/待审文件清单 + 关键结论 + 未建/异常说明 + 含 mermaid 文档清单）。

## 第 2 步：验收

1. **产出完整性**：对照勾选清单逐目录核对——正式目录与 `_review/` 下文件存在且非空；未建资产须附子代理返回的原因。
2. **落盘正确性**：抽查 `_review/` 内文档是否确有未通过项（文末有「待人工确认」条目）、正式目录文档是否无未决项；错位打回子代理重判。
3. **mermaid 验证**：含图文档（structure-model / interaction-model / object-model / data-model）全部过验证脚本，INVALID 打回对应子代理修复后重验：

```bash
node <specgo插件目录>/skills/mermaid-validate/scripts/validate-mermaid.mjs <文档路径>
```

4. **待审率**：统计 `_review/` 与正式目录的文档数，计算待审比例并写入摘要。低于 10% 提示判据可能过松，高于 50% 提示过严或该类本质需人，供后续调整 skill 判据——**只统计不阻断**。
5. **口径抽查**：每域抽 1 篇对照其 analyze skill 模板——小节结构、文件命名、证据不带行号一致；不符打回整改。

## 第 3 步：交付摘要

- **已建资产**：各资产文件数（正式 / 待审分开计）。
- **待审清单**：`_review/` 下文件路径 + 文末待确认条目数。
- **待审比例**：待审 / 全部，附一句判据松紧提示。
- **未建资产**：目录 + 原因。
- **验证结果**：mermaid 通过情况、打回记录。

## 子代理派发通用规则

- prompt 五要素齐全，缺一不派。
- 无依赖的子代理同一条消息并行派发。
- 子代理需要用户输入时不脑补——返回待确认清单结束本轮，主代理问用户后以 task_id 续会话回传同一子代理。
- 验收不过关打回整改，主代理不亲自代写。

## 红线

| 想法 | 现实 |
| --- | --- |
| "我自己扫一遍更快" | 分析一律派子代理，主代理只编排、确认与验收 |
| "14 个太多，挑几个跑" | 默认全量；只有用户明确勾选子集才裁剪 |
| "待审的也写正式目录，省得人找不到" | 自检不过必须落 `_review/`，落错即打回 |
| "mermaid 看着没问题" | 含图文档必须过 validate-mermaid.mjs 全部 VALID |
| "某篇不合格我顺手改改" | 打回子代理整改，主代理不代写 |

## 与其它 skill 的关系

- **14 个 analyze skill**：被编排对象与要素定义来源——本 skill 不复制它们的模板与判据。
- **spec-update**：增量刷新场景入口；全量建库/重建走本 skill。
- **specgo**：需求到交付全链路编排；其第 1 步的资产录入可改用本 skill 完成。
- **mermaid-validate**：含图资产的收尾校验工具。
