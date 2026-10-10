# specgo Skill 输出模板索引

本目录汇总 specgo 插件各 skill 使用的全部输出模板，按 arch/biz/tech/qual/spec 五类分子目录组织，每个模板一个文件。

- 模板文件只含模板骨架（`{...}` / `<...>` 占位符形式），不含描述性散文。
- **撰写硬性规则**（命名约定、表格列域、状态取值、证据格式等）保留在各 skill 原文件中，使用模板前须先读对应 skill；**模板中的具体业务内容**（功能名、文件路径、接口名、表名等）**均为格式示例**，产出时须替换为目标仓实际内容。
- 模板为只读参考副本；各 skill 运行时读取自身 `references/`（或 `assets/`）的原文件，改动以原文件为准并同步本目录。

## arch 架构要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| arch/结构模型总览模板.md | arch-structure-model-analyze | skills/arch-structure-model-analyze/references/structure-model-template.md | 结构模型总览骨架（概览 + UML 包图 + 依赖矩阵 + 分层特征） |
| arch/结构模型模块模板.md | 同上 | skills/arch-structure-model-analyze/references/structure-model-module-template.md | structure-model-{module}.md 每模块文档骨架（职责 + 目录构成 + 依赖/被依赖证据表） |
| arch/交互模型模板.md | arch-interaction-model-analyze | skills/arch-interaction-model-analyze/references/interaction-model-template.md | interaction-model-{flow}.md 骨架（概述 + 主链路时序图 + 参与方说明；只画主链路） |

## biz 业务要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| biz/对外接口README模板.md | biz-interface-analyze | skills/biz-interface-analyze/references/readme-template.md | 接口全景导航主文档 README |
| biz/对外接口子文档模板.md | 同上 | skills/biz-interface-analyze/references/subdoc-template.md | interface-{feature}.md 每功能域子文档 |
| biz/业务规则模板.md | biz-rules-analyze | skills/biz-rules-analyze/references/rules-template.md | rules-{feature}.md 规则条目骨架 |
| biz/对象模型模板.md | biz-object-model-analyze | skills/biz-object-model-analyze/references/object-model-template.md | object-model-{aggregate}.md 类图骨架 |
| biz/数据模型模板.md | biz-data-model-analyze | skills/biz-data-model-analyze/references/data-model-template.md | data-model-{entity}.md ER 图 + 字段表骨架 |
| biz/领域词典README模板.md | biz-lexicon-analyze | skills/biz-lexicon-analyze/references/lexicon-template.md | 词典主文档 README |
| biz/领域词典子域模板.md | 同上 | skills/biz-lexicon-analyze/references/lexicon-subdomain-template.md | lexicon-{子域}.md 每子域词典文档 |

## tech 技术要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| tech/框架使用README模板.md | tech-framework-guidelines-analyze | skills/tech-framework-guidelines-analyze/references/readme-template.md | 框架全景索引 README |
| tech/框架使用指导模板.md | 同上 | skills/tech-framework-guidelines-analyze/references/framework-guidelines-template.md | framework-guidelines-{framework}.md 每框架使用指导骨架 |
| tech/通信规范README模板.md | tech-external-call-guidelines-analyze | skills/tech-external-call-guidelines-analyze/references/readme-template.md | 外部服务清单导航 README |
| tech/通信规范服务模板.md | 同上 | skills/tech-external-call-guidelines-analyze/references/service-template.md | external-call-guidelines-{service}.md 每服务子文档 |
| tech/通信规范差距报告模板.md | 同上 | skills/tech-external-call-guidelines-analyze/references/gap-report-template.md | 通信规范差距报告 |
| tech/并发规范模板.md | tech-concurrency-guidelines-analyze | skills/tech-concurrency-guidelines-analyze/references/concurrency-guidelines-template.md | concurrency-guidelines-{pool}.md 实例骨架 |
| tech/数据访问-内存数据模板.md | tech-data-access-guidelines-analyze | skills/tech-data-access-guidelines-analyze/references/memory-data-template.md | 内存数据存储访问规范骨架 |
| tech/数据访问-持久化数据模板.md | 同上 | skills/tech-data-access-guidelines-analyze/references/persistent-data-template.md | 持久化数据存储访问规范骨架 |
| tech/数据访问差距报告模板.md | 同上 | skills/tech-data-access-guidelines-analyze/references/gap-report-template.md | 数据访问差距报告 |
| tech/韧性规范README模板.md | tech-resilience-guidelines-analyze | skills/tech-resilience-guidelines-analyze/references/readme-template.md | 韧性规范索引 README |
| tech/韧性规范维度模板.md | 同上 | skills/tech-resilience-guidelines-analyze/references/dimension-template.md | resilience-guidelines-{dimension}.md 维度骨架 |
| tech/基础规范README模板.md | tech-basic-mechanism-guidelines-analyze | skills/tech-basic-mechanism-guidelines-analyze/references/readme-template.md | 基础规范索引 README |
| tech/基础规范维度模板.md | 同上 | skills/tech-basic-mechanism-guidelines-analyze/references/dimension-template.md | basic-mechanism-guidelines-{dimension}.md 维度骨架 |

## qual 工程质量要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| qual/编码规范模板.md | qual-code-standards-analyze | skills/qual-code-standards-analyze/references/code-standards-template.md | code-standards.md 规范文档骨架 |
| qual/编码规范差距报告模板.md | 同上 | skills/qual-code-standards-analyze/references/gap-report-template.md | 编码规范差距报告 |
| qual/DT规范模板.md | qual-dt-guidelines-analyze | skills/qual-dt-guidelines-analyze/references/dt-guidelines-template.md | dt-guidelines.md 测试规范骨架 |
| qual/DT规范差距报告模板.md | 同上 | skills/qual-dt-guidelines-analyze/references/gap-report-template.md | DT 规范差距报告 |
| qual/分支规范模板.md | qual-branch-guidelines-analyze | skills/qual-branch-guidelines-analyze/references/branch-guidelines-template.md | branch-guidelines.md 分支规范骨架 |
| qual/分支规范差距报告模板.md | 同上 | skills/qual-branch-guidelines-analyze/references/gap-report-template.md | 分支规范差距报告 |

## spec 横向编排要素

| 模板文件 | 来源 Skill | 原文件路径 | 用途 |
| --- | --- | --- | --- |
| spec/story设计README模板.md | spec-story-design | skills/spec-story-design/references/story-readme-template.md | story 索引 README |
| spec/story设计详情模板.md | 同上 | skills/spec-story-design/references/story-template.md | {功能名}-story.md 八类核心要素骨架 |
| spec/develop-task模板.md | 同上 | skills/spec-story-design/references/develop-task-template.md | {功能名}-develop-task.md 修改清单 + 澄清清单 |
| spec/功能设计规范模板.md | spec-function-design-audit | skills/spec-function-design-audit/references/functional-design-template.md | 功能设计规范 md（场景 1 审核后可选输出） |
| spec/建模结果HTML模板.html | 同上 | skills/spec-function-design-audit/assets/model-template.html | 多彩建模结果 HTML |
| spec/资产审核总览README模板.md | spec-asset-audit | skills/spec-asset-audit/references/overview-readme-template.md | docs/report/README.md 评估总览骨架 |
| spec/docs域README索引模板.md | spec-index | skills/spec-index/references/domain-readme-template.md | 各域 README 索引骨架 |
| spec/docs总README索引模板.md | 同上 | skills/spec-index/references/root-readme-template.md | docs/README.md 总索引 + 依赖全景图骨架 |
| spec/全链路分析报告模板.md | specgo-report | skills/specgo-report/references/report-template.md | {YYYYMMDD}-report.md 全链路报告骨架 |

## 无独立模板的 skill

- **specgo**：全链路编排 skill（按 docs/1-storys/ 下 story 设计文档编码），无文档输出模板。
- **spec-analyze**：纯编排 skill（子代理派发各 analyze skill），无文档输出模板。
- **spec-init**：初始化 docs/ 目录骨架，无文档输出模板。
- **spec-update**：按各 analyze skill 的最新要素定义增量刷新既有文档，无独立模板。
- **mermaid-validate**：画图指导 skill，无文档输出模板。

## 不收录的非模板参考文档

下列文件为分类目录、规则底稿、方法论或检查清单（非输出文档骨架），不收录到本目录，使用时直接读对应 skill：

- biz-interface-analyze/references/interface-catalog.md
- qual-code-standards-analyze/references/rules-catalog.md
- tech-framework-guidelines-analyze/references/{framework-catalog,analysis-dimensions}.md
- spec-story-design/references/{color-modeling,orthogonality-principles}.md
- spec-function-design-audit/references/{color-modeling,gap-checklist,requirement-quality-checklist}.md
- spec-asset-audit/references/{asset-expression-rules,code-consistency-rules}.md
