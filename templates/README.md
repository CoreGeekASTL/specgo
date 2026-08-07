# specgo Skill 输出模板索引

本目录汇总 specgo 插件各 skill 使用的全部输出模板，按 architecture/business/technical/engineering 四类组织，每个要素类型一个子目录。
每个模板文件只含模板本身；**撰写硬性规则**（命名约定、表格列域、状态取值、证据格式等）保留在各 skill 原文件中，使用模板前须先读对应原文件；**各模板中的具体业务内容**（功能名、文件路径、接口名、表名等）**均为格式示例**，产出时须替换为目标仓实际内容。
含 README 索引 + 详情双模板的已拆分为两个文件，README 模板在文件名中标注。
模板内容为只读参考副本；各 skill 运行时仍读取自身 `references/`（或 SKILL.md 内嵌）的原文件，改动模板请以原文件为准并同步本目录。

## architecture 架构要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| architecture/module-structure/代码仓结构文档模板.md | spec-structure-analyze | skills/spec-structure-analyze/references/structure-template.md | 代码仓结构文档骨架（概览 + mermaid 依赖图 + 模块说明表） |
| architecture/business-flow/业务流程README文档模板.md | spec-business-flow-analyze | skills/spec-business-flow-analyze/references/readme-template.md | docs/architecture/business-flow/ 索引 README |
| architecture/business-flow/业务流程详情文档模板.md | 同上 | skills/spec-business-flow-analyze/references/business-flow-template.md | <流程名>.md 业务流程精简结构（概述 + 主流程图） |

## business 业务要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| business/story/Story设计README文档模板.md | spec-story-design / spec-feature-analyze | skills/spec-story-design/references/story-readme-template.md + story-template.md | docs/business/story/ 索引 README（两 skill 共用：feature-analyze 建索引、story-design 增量维护） |
| business/story/Story设计详情文档模板.md | 同上 | 同上 | feature-<功能名>.md 六节结构（功能故事 / 实现方案 / 接口清单 / 关键数据结构 / 调用关系 / 外部文档引用），feature-analyze 与 story-design 共用同一模板 |
| business/story/DevelopTask文档模板.md | spec-story-design | skills/spec-story-design/references/develop-task-template.md | develop-task 抛弃式文档（修改文件清单 + 澄清问题列表） |
| business/story/功能设计规范模板.md | spec-logic-audit | skills/spec-logic-audit/references/functional-design-template.md | 功能设计规范 md（含多彩建模章节，审核完成后的可选输出） |
| business/story/建模结果HTML模板.html | spec-logic-audit | skills/spec-logic-audit/assets/model-template.html | 多彩建模结果 HTML（四色卡片 + 断点高亮 + 人工裁定区） |
| business/key-class/ | spec-key-class-analyze | skills/spec-key-class-analyze/references/key-class-template.md | 单一 README 清单表（类名/职责），templates 下不单独放副本 |
| business/data-structure/数据结构盘点README文档模板.md | spec-data-structure-analyze | skills/spec-data-structure-analyze/references/readme-template.md + subdoc-template.md | docs/business/data-structure/ 主文档 README（数据结构全景 + 用途索引） |
| business/data-structure/数据结构盘点子文档模板.md | 同上 | 同上 | spec-data-structure-<用途名>.md 子文档（一个用途一篇，含核心作用说明） |
| business/interface/接口盘点README文档模板.md | spec-interface-analyze | skills/spec-interface-analyze/references/readme-template.md + subdoc-template.md | docs/business/interface/ 主文档 README（接口全景导航表） |
| business/interface/接口盘点子文档模板.md | 同上 | 同上 | spec-interface-<功能名>.md 子文档 |

## technical 技术要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| technical/external-call/外部接口调用README文档模板.md | spec-external-call-analyze | skills/spec-external-call-analyze/references/report-template.md + service-template.md | docs/technical/external-call/ 主文档 README（外部服务清单导航表） |
| technical/external-call/外部接口调用服务文档模板.md | 同上 | 同上 | external-call-<服务名>.md 子文档 |
| technical/framework-usage/框架使用README文档模板.md | spec-framework-usage-analyze | skills/spec-framework-usage-analyze/references/readme-template.md + usage-template.md | docs/technical/framework-usage/ 索引 README（框架全景清单） |
| technical/framework-usage/框架使用指导文档模板.md | 同上 | 同上 | <类别缩写>-<框架名>.md 每框架一篇使用指导（用途定位 + 使用模式） |

## engineering 工程要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| engineering/code-check/代码检查报告模板.md | spec-code-check | skills/spec-code-check/references/report-template.md | 代码检查报告章节结构 |
| engineering/build-deploy/ | 暂无 | 暂无 | 待补 |

## 无独立模板的 skill

- **spec-asset-refresh**：无新模板，逐类增量刷新上表各 skill 已产出的文档。
- **specgo**：按 docs/business/story/ 下 story 设计文档编码，无文档输出模板。
- **spec-mermaid-diagram**：画图指导 skill，无文档输出模板。
