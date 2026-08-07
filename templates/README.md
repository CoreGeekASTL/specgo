# specgo Skill 输出模板索引

本目录汇总 specgo 插件各 skill 使用的全部输出模板，模板文件名改为中文，方便人工查阅。
每个模板文件只含模板本身（说明性文字与撰写规则保留在各 skill 原文件中）；含 README 索引 + 详情双模板的已拆分为两个文件，README 模板在文件名中标注。
模板内容为只读参考副本；各 skill 运行时仍读取自身 `references/`（或 SKILL.md 内嵌）的原文件，改动模板请以原文件为准并同步本目录。

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| 代码仓结构文档模板.md | spec-structure-analyze | SKILL.md 内嵌（已提取） | 代码仓结构文档骨架（概览 + mermaid 依赖图 + 模块说明表） |
| 接口盘点README文档模板.md | spec-interface-analyze | skills/spec-interface-analyze/references/report-template.md | docs/interface/ 主文档 README（接口全景 + 功能域索引） |
| 接口盘点子文档模板.md | spec-interface-analyze | 同上 | spec-interface-<功能名>.md 子文档 |
| 外部接口调用README文档模板.md | spec-external-call-analyze | SKILL.md 内嵌（已提取） | docs/external-call/ 主文档 README（外部服务全景 + 服务清单） |
| 外部接口调用服务文档模板.md | spec-external-call-analyze | 同上 | external-call-<服务名>.md 子文档 |
| 功能域README文档模板.md | spec-feature-analyze | skills/spec-feature-analyze/references/report-template.md | docs/story/ 索引 README（功能全景 + 接口统计） |
| 功能域详情文档模板.md | spec-feature-analyze | 同上 | feature-<功能名>.md 七节结构（L1 多彩建模 / L2 结构地图 / L3 AI 编码指南） |
| 框架使用README文档模板.md | spec-framework-usage-analyze | skills/spec-framework-usage-analyze/references/report-template.md | docs/framework-usage/ 索引 README（框架全景清单 + 风险汇总） |
| 框架使用指导文档模板.md | spec-framework-usage-analyze | 同上 | <类别缩写>-<框架名>.md 每框架一篇使用指导 |
| 数据结构盘点README文档模板.md | spec-data-structure-analyze | skills/spec-data-structure-analyze/references/report-template.md | docs/data-structure/ 主文档 README（数据结构全景 + 类型索引） |
| 数据结构盘点子文档模板.md | spec-data-structure-analyze | 同上 | spec-data-structure-<类型名>.md 子文档 |
| 代码检查报告模板.md | spec-code-check | skills/spec-code-check/references/report-template.md | 代码检查报告章节结构 |
| 业务流程README文档模板.md | spec-business-flow-analyze | skills/spec-business-flow-analyze/references/business-flow-template.md | docs/business-flow/ 索引 README |
| 业务流程详情文档模板.md | spec-business-flow-analyze | 同上 | <流程名>.md 业务流程七节结构 |
| Story设计README文档模板.md | spec-story-design | skills/spec-story-design/references/story-template.md | docs/story/ 索引 README（story 设计版） |
| Story设计详情文档模板.md | spec-story-design | 同上 | feature-<功能名>.md story 设计文档七节结构 |
| DevelopTask文档模板.md | spec-story-design | skills/spec-story-design/references/develop-task-template.md | develop-task 抛弃式文档（修改文件清单 + 澄清问题列表） |
| 功能设计规范模板.md | spec-logic-audit | skills/spec-logic-audit/references/functional-design-template.md | 功能设计规范 md（含多彩建模章节，审核完成后的可选输出） |
| 建模结果HTML模板.html | spec-logic-audit | skills/spec-logic-audit/assets/model-template.html | 多彩建模结果 HTML（四色卡片 + 断点高亮 + 人工裁定区） |

## 无独立模板的 skill

- **spec-key-class-analyze**：输出结构简单（单一 README 清单表），模板内嵌于 SKILL.md 输出规范章节。
- **spec-asset-refresh**：无新模板，逐类增量刷新上表各 skill 已产出的文档。
- **specgo**：按 docs/story/ 下 story 设计文档编码，无文档输出模板。
- **spec-mermaid-diagram**：画图指导 skill，无文档输出模板。
