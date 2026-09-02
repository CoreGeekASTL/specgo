# specgo Skill 输出模板索引

本目录汇总 specgo 插件各 skill 使用的全部输出模板，按 arch/biz/tech/qual/spec 五类分子目录组织，每个模板一个文件。

- 模板文件只含模板骨架（`{...}` / `<...>` 占位符形式），不含描述性散文。
- **撰写硬性规则**（命名约定、表格列域、状态取值、证据格式等）保留在各 skill 原文件中，使用模板前须先读对应 skill；**模板中的具体业务内容**（功能名、文件路径、接口名、表名等）**均为格式示例**，产出时须替换为目标仓实际内容。
- 模板为只读参考副本；各 skill 运行时读取自身 `references/`（或 `references/assets/`）的原文件，改动以原文件为准并同步本目录。arch/biz/tech/qual 四域子流程的模板原件统一在 `skills/spec-analyze/references/assets/`（`<资产短名>--<文件名>`）。

## arch 架构要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| arch/结构模型总览模板.md | arch-structure-model-analyze | skills/spec-analyze/references/assets/structure-model--structure-model-template.md | 结构模型总览骨架（概览 + UML 包图 + 依赖矩阵 + 分层特征） |
| arch/结构模型模块模板.md | 同上 | skills/spec-analyze/references/assets/structure-model--structure-model-module-template.md | structure-model-{module}.md 每模块文档骨架（职责 + 目录构成 + 依赖/被依赖证据表） |
| arch/交互模型模板.md | arch-interaction-model-analyze | skills/spec-analyze/references/assets/interaction-model--interaction-model-template.md | interaction-model-{flow}.md 骨架（概述 + 主链路时序图 + 参与方说明；只画主链路） |

## biz 业务要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| biz/对外接口README模板.md | biz-interface-analyze | skills/spec-analyze/references/assets/interface--readme-template.md | 接口全景导航主文档 README |
| biz/对外接口子文档模板.md | 同上 | skills/spec-analyze/references/assets/interface--subdoc-template.md | interface-{feature}.md 每功能域子文档 |
| biz/业务规则模板.md | biz-rules-analyze | skills/spec-analyze/references/assets/rules--rules-template.md | rules-{feature}.md 规则条目骨架 |
| biz/对象模型模板.md | biz-object-model-analyze | skills/spec-analyze/references/assets/object-model--object-model-template.md | object-model-{aggregate}.md 类图骨架 |
| biz/数据模型模板.md | biz-data-model-analyze | skills/spec-analyze/references/assets/data-model--data-model-template.md | data-model-{entity}.md ER 图 + 字段表骨架 |
| biz/领域词典README模板.md | biz-lexicon-analyze | skills/spec-analyze/references/assets/lexicon--lexicon-template.md | 词典主文档 README |
| biz/领域词典子域模板.md | 同上 | skills/spec-analyze/references/assets/lexicon--lexicon-subdomain-template.md | lexicon-{子域}.md 每子域词典文档 |

## tech 技术要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| tech/框架使用README模板.md | tech-framework-guidelines-analyze | skills/spec-analyze/references/assets/framework-guidelines--readme-template.md | 框架全景索引 README |
| tech/框架使用指导模板.md | 同上 | skills/spec-analyze/references/assets/framework-guidelines--framework-guidelines-template.md | framework-guidelines-{framework}.md 每框架使用指导骨架 |
| tech/通信规范README模板.md | tech-external-call-guidelines-analyze | skills/spec-analyze/references/assets/external-call-guidelines--readme-template.md | 外部服务清单导航 README |
| tech/通信规范服务模板.md | 同上 | skills/spec-analyze/references/assets/external-call-guidelines--service-template.md | external-call-guidelines-{service}.md 每服务子文档 |
| tech/通信规范差距报告模板.md | 同上 | skills/spec-analyze/references/assets/external-call-guidelines--gap-report-template.md | 通信规范差距报告 |
| tech/并发规范模板.md | tech-concurrency-guidelines-analyze | skills/spec-analyze/references/assets/concurrency-guidelines--concurrency-guidelines-template.md | concurrency-guidelines-{pool}.md 实例骨架 |
| tech/数据访问-内存数据模板.md | tech-data-access-guidelines-analyze | skills/spec-analyze/references/assets/data-access-guidelines--memory-data-template.md | 内存数据存储访问规范骨架 |
| tech/数据访问-持久化数据模板.md | 同上 | skills/spec-analyze/references/assets/data-access-guidelines--persistent-data-template.md | 持久化数据存储访问规范骨架 |
| tech/数据访问差距报告模板.md | 同上 | skills/spec-analyze/references/assets/data-access-guidelines--gap-report-template.md | 数据访问差距报告 |
| tech/韧性规范README模板.md | tech-resilience-guidelines-analyze | skills/spec-analyze/references/assets/resilience-guidelines--readme-template.md | 韧性规范索引 README |
| tech/韧性规范维度模板.md | 同上 | skills/spec-analyze/references/assets/resilience-guidelines--dimension-template.md | resilience-guidelines-{dimension}.md 维度骨架 |
| tech/基础规范README模板.md | tech-basic-mechanism-guidelines-analyze | skills/spec-analyze/references/assets/basic-mechanism-guidelines--readme-template.md | 基础规范索引 README |
| tech/基础规范维度模板.md | 同上 | skills/spec-analyze/references/assets/basic-mechanism-guidelines--dimension-template.md | basic-mechanism-guidelines-{dimension}.md 维度骨架 |

## qual 工程质量要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| qual/编码规范模板.md | qual-code-standards-analyze | skills/spec-analyze/references/assets/code-standards--code-standards-template.md | code-standards.md 规范文档骨架 |
| qual/编码规范差距报告模板.md | 同上 | skills/spec-analyze/references/assets/code-standards--gap-report-template.md | 编码规范差距报告 |
| qual/DT规范模板.md | qual-dt-guidelines-analyze | skills/spec-analyze/references/assets/dt-guidelines--dt-guidelines-template.md | dt-guidelines.md 测试规范骨架 |
| qual/DT规范差距报告模板.md | 同上 | skills/spec-analyze/references/assets/dt-guidelines--gap-report-template.md | DT 规范差距报告 |
| qual/分支规范模板.md | qual-branch-guidelines-analyze | skills/spec-analyze/references/assets/branch-guidelines--branch-guidelines-template.md | branch-guidelines.md 分支规范骨架 |
| qual/分支规范差距报告模板.md | 同上 | skills/spec-analyze/references/assets/branch-guidelines--gap-report-template.md | 分支规范差距报告 |

## spec 横向要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| spec/story设计README模板.md | spec-story-design | skills/spec-story-design/references/assets/story-readme-template.md | story 索引 README |
| spec/story设计详情模板.md | 同上 | skills/spec-story-design/references/assets/story-template.md | {功能名}-story.md 八类核心要素骨架 |
| spec/develop-task模板.md | 同上 | skills/spec-story-design/references/assets/develop-task-template.md | {功能名}-develop-task.md 修改清单 + 澄清清单 |
| spec/功能设计规范模板.md | spec-requirement-audit | skills/spec-requirement-audit/references/assets/functional-design-template.md | 规范功能实现设计 md |
| spec/建模结果HTML模板.html | 同上 | skills/spec-requirement-audit/references/assets/model-template.html | 多彩建模结果 HTML |
| spec/资产审核总览README模板.md | asset-audit（spec-analyze 子流程） | skills/spec-analyze/references/assets/asset-audit--overview-readme-template.md | docs/report/README.md 评估总览骨架 |
| spec/总结报告模板.md | spec-report | skills/spec-report/references/report-template.md | {YYYYMMDD}-report.md 三节总结报告骨架（代码生成准确性 + 资产使用情况 + 用户反馈） |

## 无独立模板的 skill

- **spec-analyze**：路由 + 编排 skill（子代理派发各 analyze 子流程），无文档输出模板。
- **spec-update**：按各 analyze 子流程的最新要素定义增量刷新既有文档，无独立模板。

## 不收录的非模板参考文档

下列文件为分类目录、规则底稿、方法论或检查清单（非输出文档骨架），不收录到本目录，使用时直接读对应 skill：

- spec-analyze/references/assets/interface--interface-catalog.md
- spec-analyze/references/assets/code-standards--rules-catalog.md
- spec-analyze/references/assets/framework-guidelines--{framework-catalog,analysis-dimensions}.md
- spec-story-design/references/assets/{color-modeling,orthogonality-principles}.md
- spec-requirement-audit/references/assets/{color-modeling,gap-checklist,requirement-quality-checklist,code-crosscheck-guide}.md
- spec-analyze/references/assets/asset-audit--{asset-expression-rules,code-consistency-rules}.md
- skills/spec-analyze/references/mermaid-guide.md（mermaid 编写与本地验证指南，宿于 spec-analyze、全部 skill 共用的参考文档，非模板、非 skill；配套验证脚本在 skills/spec-analyze/scripts/）
