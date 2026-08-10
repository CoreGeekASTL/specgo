# specgo Skill 输出模板索引

本目录汇总 specgo 插件各 skill 使用的全部输出模板，按 architecture/business/technical/engineering 四类组织，每个要素类型一个子目录。
每个模板文件只含模板本身；**撰写硬性规则**（命名约定、表格列域、状态取值、证据格式等）保留在各 skill 原文件中，使用模板前须先读对应原文件；**各模板中的具体业务内容**（功能名、文件路径、接口名、表名等）**均为格式示例**，产出时须替换为目标仓实际内容。
含 README 索引 + 详情双模板的已拆分为两个文件，README 模板在文件名中标注。
模板内容为只读参考副本；各 skill 运行时仍读取自身 `references/`（或 SKILL.md 内嵌）的原文件，改动模板请以原文件为准并同步本目录。

## architecture 架构要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| architecture/structure-model/结构模型总览文档模板.md | arch-structure-model-analyze | skills/arch-structure-model-analyze/references/structure-model-template.md | 结构模型总览骨架（概览 + UML 包图 + 依赖矩阵 + 分层特征） |
| architecture/structure-model/结构模型模块文档模板.md | 同上 | skills/arch-structure-model-analyze/references/structure-model-module-template.md | structure-model-{module}.md 每模块文档骨架（职责 + 目录构成 + 对外依赖/被依赖证据表） |
| architecture/interaction-model/交互模型文档模板.md | arch-interaction-model-analyze | skills/arch-interaction-model-analyze/references/interaction-model-template.md | interaction-model-{flow}.md 交互模型骨架（概述 + 主链路时序图 + 参与方说明 + 补充说明；只画主链路，分支逻辑归业务规则资产） |

## business 业务要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| business/story/Story设计README文档模板.md | spec-story-design | skills/spec-story-design/references/story-readme-template.md | 旧版索引归档；现行 docs/storys/README.md 索引模板以 skill references 为准 |
| business/story/Story设计详情文档模板.md | 同上 | skills/spec-story-design/references/story-template.md | 旧六节版归档；现行 {功能名}-story.md 八类核心要素模板以 skill references 为准 |
| business/story/DevelopTask文档模板.md | spec-story-design | skills/spec-story-design/references/develop-task-template.md | develop-task 抛弃式文档（修改文件清单 + 澄清问题列表） |
| business/story/功能设计规范模板.md | spec-audit | skills/spec-audit/references/functional-design-template.md | 功能设计规范 md（含多彩建模章节，场景 1 审核完成后的可选输出） |
| business/story/建模结果HTML模板.html | spec-audit | skills/spec-audit/assets/model-template.html | 多彩建模结果 HTML（四色卡片 + 断点高亮 + 人工裁定区） |
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
| engineering/build-deploy/ | 暂无 | 暂无 | 待补 |

## 无独立模板的 skill

- **all-update**：无新模板，按各 analyze skill 的最新要素定义增量刷新既有文档。
- **all-analyze**：纯编排 skill（子代理派发各 analyze skill），无文档输出模板。
- **code-generate**：全链路编排 skill（按 docs/storys/ 下 story 设计文档编码），无文档输出模板。
- **spec-mermaid-diagram**：画图指导 skill，无文档输出模板。
- **spec-audit**：评估报告（docs/report/ 打分报告与 README.MD）结构内嵌于 SKILL.md 场景 2 第 6 步，无独立模板文件。
