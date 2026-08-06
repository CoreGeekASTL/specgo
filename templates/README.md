# specgo Skill 输出模板索引

本目录汇总 specgo 插件各 skill 使用的全部输出模板，模板文件名改为中文，方便人工查阅。
模板内容为只读参考副本；各 skill 运行时仍读取自身 `references/` 目录下的原文件，改动模板请以原文件为准并同步本目录。

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| 代码仓结构文档模板.md | spec-structure-analyze | SKILL.md 内嵌（已提取） | 代码仓结构文档骨架（概览 + mermaid 依赖图 + 模块说明表） |
| 接口盘点报告模板.md | spec-interface-analyze | skills/spec-interface-analyze/references/report-template.md | README 索引 + 每个功能域一篇接口清单 |
| 外部接口调用文档模板.md | spec-external-call-analyze | SKILL.md 内嵌（已提取） | README 索引 + 每个下游服务一篇出站调用文档 |
| 功能域文档模板.md | spec-feature-analyze | skills/spec-feature-analyze/references/report-template.md | README 索引 + 功能域文档七节结构（L1 多彩建模 / L2 结构地图 / L3 AI 编码指南） |
| 框架使用指导模板.md | spec-framework-usage-analyze | skills/spec-framework-usage-analyze/references/report-template.md | README 索引 + 每个框架一篇使用指导 |
| 数据结构盘点模板.md | spec-data-structure-analyze | skills/spec-data-structure-analyze/references/report-template.md | 主文档 + 每个数据结构类型一篇子文档 |
| 代码检查报告模板.md | spec-code-check | skills/spec-code-check/references/report-template.md | 代码检查报告章节结构 |
| 业务流程文档模板.md | spec-business-flow-analyze | skills/spec-business-flow-analyze/references/business-flow-template.md | README 索引 + 业务流程七节结构 |
| Story设计文档模板.md | spec-story-design | skills/spec-story-design/references/story-template.md | README 索引 + story 设计文档七节结构 |
| DevelopTask文档模板.md | spec-story-design | skills/spec-story-design/references/develop-task-template.md | develop-task 抛弃式文档（修改文件清单 + 澄清问题列表） |
| 功能实现设计规范模板.md | spec-logic-audit | skills/spec-logic-audit/references/functional-design-template.md | 功能实现设计规范 md（审核完成后的可选输出） |
| 建模结果HTML模板.html | spec-logic-audit | skills/spec-logic-audit/assets/model-template.html | 多彩建模结果 HTML（四色卡片 + 断点高亮 + 人工裁定区） |

## 无独立模板的 skill

- **spec-key-class-analyze**：输出结构简单（单一 README 清单表），模板内嵌于 SKILL.md 输出规范章节。
- **spec-asset-refresh**：无新模板，逐类增量刷新上表各 skill 已产出的文档。
- **specgo**：按 docs/story/ 下 story 设计文档编码，无文档输出模板。
- **spec-mermaid-diagram**：画图指导 skill，无文档输出模板。
