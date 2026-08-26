<SPEC_GO_BOOTSTRAP>
# Specgo — 代码仓规格化分析 skill 体系

<EXTREMELY-IMPORTANT>
你拥有 specgo。在执行任何代码仓分析、需求/设计文档解读、对外接口盘点、出站调用/下游依赖盘点、目录结构梳理、框架使用模式梳理、story 设计、MR 资产刷新、mermaid 图验证、功能端到端开发任务之前——即使你认为只有 1% 的可能某个 spec skill 适用——你也必须先用 Skill 工具加载对应主 skill 全文并遵循其指引。这不可协商、不可选择、不可用"我先看看代码"为自己开脱。

体系结构：5 个主 skill（下方索引）+ 23 个子流程（主 skill 内 references/subflows/*.md，由主 skill 路由表加载，也可用同名 / 命令直接触发）。主 skill 的 description 已汇总全部子流程触发关键词，请用下面的索引判断该加载哪个主 skill；加载后按其「子流程路由表」执行具体子流程。
</EXTREMELY-IMPORTANT>

## Skill 索引（用 Skill 工具加载全文）

### 1. mermaid-validate
指导如何编写可被正确渲染的 mermaid 图，并在本地验证渲染结果。当用户提到"mermaid"、"画图"、"流程图"、"时序图"、"架构图"、"依赖图"、"图渲染失败"、"图渲染不出来"、"验证 mermaid"、"mermaid 报错"时使用；任何产出物（文档/HTML）中包含 ```mermaid 代码块时，必须用本 skill 的验证流程确认每张图可被解析渲染后才能宣称完成。

### 2. spec-admin
docs/ 资产体系管理主 skill——承载两个低频管理子流程的路由：spec-init（初始化 docs/ 资产目录骨架：0-arch/0-biz/0-tech/0-qual 四域布局，一次性迁移旧布局历史产出，迁移映射清单先交用户确认）与 spec-index（生成/刷新各域索引 docs/0-{域}/README.md 与总索引 docs/README.md，含服务依赖全景图 mermaid）。用户请求"初始化 docs 目录/资产目录骨架/迁移旧文档/旧布局升级/spec-init"或"生成索引/docs 索引/域索引/总索引/资产导航/服务依赖全景图/刷新索引/spec-index"时使用；资产增删后刷新索引也走本 skill 的 spec-index 子流程。

### 3. spec-analyze
资产分析主 skill——承载 16 个资产分析子流程（arch 结构/交互 2 个 + biz 接口/规则/对象模型/数据模型/词典 5 个 + tech 框架/通信/并发/数据访问/韧性/基础 6 个 + qual 编码/DT/分支 3 个）的路由与编排：单个资产请求按「子流程路由表」读取对应子流程文件执行；全量请求以子代理并行派发全部子流程，一次性建齐代码仓 docs/ 全套资产（首波 15 个分析子代理并行，第二波词典复用接口功能域口径，最后索引收口）。主代理只做编排、用户确认与验收，不亲自分析。触发场景包括"spec-analyze"、"全量资产分析"、"一键资产分析"、"建齐 docs 资产"，以及各单资产场景："梳理代码仓结构/目录关系/模块依赖/包图"、"交互模型/时序图/调用链/梳理业务流程"、"对外接口盘点/接口清单"、"业务规则/规则提取/状态机/错误码规则"、"对象模型/领域模型/聚合/类图/DDD"、"数据模型/表结构/ER 图/数据字典/TTL"、"领域词典/术语表/词汇表/统一语言"、"框架使用指导/技术栈盘点"、"通信规范/出站调用/下游接口/服务依赖"、"并发规范/线程池/锁/goroutine 启动点"、"数据访问规范/Redis 使用/DB 访问/缓存穿透/SQL 注入防护"、"韧性规范/超时/重试/熔断降级/吞错"、"基础规范/日志规范/配置读取/告警"、"编码规范/clean code/安全编码红线/CI 门禁规则"、"DT 规范/测试金字塔/覆盖率门禁/等价类边界值"、"分支规范/commit 规范/MR 规范/git flow"等。

### 4. spec-asset-audit
四类资产质量审核 skill——审核 docs/{arch,biz,tech,qual}/ 资产文档与索引，只做两个维度：表达质量（文字表达连续、人能读懂）与代码一致性（重点：锚点反查、接口/数据结构/出站调用与代码事实比对、mermaid 渲染校验），按 E/C 规则扣分打分（通用分/专项分/总分，0.4/0.6 加权，分级：≥95 已基线 / 80-95 待修订 / <80 重写），报告归档 docs/report/（README.md 打分总览 + 每篇一个 {文档基名}-audit.md，镜像 docs/ 相对路径，同名覆盖）；范围四种模式：指定单篇 / 增量（已实现代码、有 git 变更时默认，只审受影响资产）/ 总览（首次建资产后推荐，全量审核打分但只落盘 README.md，问题清单写在 README 第 3 节）/ 全量（逐篇报告 + README 全量重建，总览的备选）。当用户提到"spec-asset-audit"、"资产质量评估"、"评估 docs 文档质量"、"文档与代码一致性检查"、"资产失实检查"、"审核资产文档"时使用。需求/功能设计文档的审核归 spec-function-design-audit。

### 5. specgo
规格化全链路主流程编排 skill——资产检查/录入 → 需求审核 → story 设计 → 代码实现与测试 → 资产刷新 → 全链路分析报告（归档 docs/1-storys/{功能名}/ story 目录），六步端到端；每步校验环节结束固定过 ask-human 审视门，新生成的文档/代码必须经人审视通过后才进下一步。主代理只做编排与用户确认，各步骤派子代理执行。同时承载 5 个链路子流程的路由：需求/功能设计审核（spec-function-design-audit）、story 设计（spec-story-design）、代码生成（spec-code-generate）、资产刷新（spec-update）、全链路报告（specgo-report）——用户单独请求其中一环时按「子流程路由表」读取对应文件执行。触发场景包括"specgo"、"端到端开发 xx 功能"、"从需求到交付"、"全流程开发"，以及单环节场景："审核 spec 业务逻辑完备性/需求歧义扫描/多彩建模"、"新增 story 设计/按需求文档生成 story"、"按 story 生成代码/实现 develop-task/零 TODO 代码实现"、"资产刷新/变更影响分析/MR 后刷新文档"、"全链路分析报告/生成交付报告"等。

## 推荐工作流（spec 全链路）

针对一个存量代码仓的完整规格化流程，按序串联；也可单独触发任意一步。子流程均可用同名 / 命令直接触发（如 /arch-structure-model-analyze），或由主 skill 路由加载。

**四域资产治理（arch / biz / tech / qual + 横向 spec，新体系）**

1. **资产骨架初始化（一次性）** → spec-init（spec-admin 子流程，/spec-init）：初始化 docs/0-{域}/{资产}/ 目录骨架（每类资产一个单独目录），一次性迁移既有产出，迁移映射清单先交用户确认
2. **结构摸底** → arch-structure-model-analyze（spec-analyze 子流程，/arch-structure-model-analyze）：UML 包图 + 依赖矩阵 + 分层特征，落盘 docs/0-arch/structure-model/（仓级总览 README.md + 每模块 structure-model-{module}.md）
3. **交互模型提取（默认全部流程，可指定单流程）** → arch-interaction-model-analyze（spec-analyze 子流程，/arch-interaction-model-analyze）：UML 时序图呈现模块间主业务流程与消息走向，只画主链路，落盘 docs/0-arch/interaction-model/（README.md 流程导航 + interaction-model-{flow}.md）
4. **对外接口盘点** → biz-interface-analyze（spec-analyze 子流程，/biz-interface-analyze）：按功能域聚类，主文档 README + interface-{feature}.md，落盘 docs/0-biz/interface/
5. **业务规则梳理** → biz-rules-analyze（spec-analyze 子流程，/biz-rules-analyze）：按需求类整理"条件 → 动作 + 依据"规则条目，README.md 功能域导航 + rules-{feature}.md，落盘 docs/0-biz/rules/
6. **对象模型** → biz-object-model-analyze（spec-analyze 子流程，/biz-object-model-analyze）：实体/值对象/聚合/领域服务/领域事件（UML 类图），README.md 聚合导航 + object-model-{aggregate}.md，落盘 docs/0-biz/object-model/
7. **数据模型** → biz-data-model-analyze（spec-analyze 子流程，/biz-data-model-analyze）：持久态表结构/缓存数据结构/字段关系与数据生命周期（UML-ER），README.md 实体导航 + data-model-{entity}.md，落盘 docs/0-biz/data-model/
8. **领域词典** → biz-lexicon-analyze（spec-analyze 子流程，/biz-lexicon-analyze）：业务与代码共用的受控词汇集（术语释义 + 语境边界 + 代码命名映射），主文档 README.md + 每功能域 1 篇 lexicon-{feature}.md，落盘 docs/0-biz/lexicon/
9. **框架使用指导** → tech-framework-guidelines-analyze（spec-analyze 子流程，/tech-framework-guidelines-analyze）：基础框架清单与使用方式盘点（纯现状提取），framework-guidelines-{framework}.md 每框架一篇，落盘 docs/0-tech/framework-guidelines/
10. **通信规范** → tech-external-call-guidelines-analyze（spec-analyze 子流程，/tech-external-call-guidelines-analyze）：RPC/HTTP/MQ 跨服务调用指导（双模式：现状提取 + 差距分析），external-call-guidelines-{service}.md 每外部服务一篇
11. **并发规范** → tech-concurrency-guidelines-analyze（spec-analyze 子流程，/tech-concurrency-guidelines-analyze）：线程池/锁/channel 等并发原语实例的用途定位、使用说明与代码案例（章节上限三节），README.md 实例导航 + concurrency-guidelines-{pool}.md 每实例一篇
12. **数据访问规范** → tech-data-access-guidelines-analyze（spec-analyze 子流程，/tech-data-access-guidelines-analyze）：Redis/DB 等中间件访问指导，README.md 中间件导航 + data-access-guidelines-{mw}.md 每中间件一篇
13. **韧性规范** → tech-resilience-guidelines-analyze（spec-analyze 子流程，/tech-resilience-guidelines-analyze）：超时/重试/熔断/异常处理的使用说明与代码案例，README 索引 + resilience-guidelines-{dimension}.md 每维度一篇
14. **基础规范** → tech-basic-mechanism-guidelines-analyze（spec-analyze 子流程，/tech-basic-mechanism-guidelines-analyze）：日志/配置/告警等基础机制的函数调用说明与使用代码案例，README 索引 + basic-mechanism-guidelines-{dimension}.md 每维度一篇
15. **编码规范（门禁）** → qual-code-standards-analyze（spec-analyze 子流程，/qual-code-standards-analyze）：命名/注释/函数长度/圈复杂度/安全编码红线/禁止项清单，code-standards.md + report/ 门禁差距报告
16. **DT 规范（门禁）** → qual-dt-guidelines-analyze（spec-analyze 子流程，/qual-dt-guidelines-analyze）：测试金字塔与覆盖基线、用例设计、覆盖率门禁，dt-guidelines.md + report/
17. **分支与变更规范** → qual-branch-guidelines-analyze（spec-analyze 子流程，/qual-branch-guidelines-analyze）：分支模型、commit/MR 规范、评审要求，branch-guidelines.md
18. **索引生成** → spec-index（spec-admin 子流程，/spec-index）：各域 README + docs/README.md 总索引 + 服务依赖全景图（Mermaid）
19. **资产刷新（git 变更驱动）** → spec-update（specgo 子流程，/spec-update）：基于 git diff 识别变更对 docs/ 资产的影响，按最新要素定义增量刷新受影响文档，刷新清单人工确认后定稿
20. **一键全量资产分析（编排入口）** → spec-analyze 主 skill 全量模式：子代理并行派发全部 16 个分析子流程（词典第二波复用接口功能域口径），一次性建齐 docs/ 资产，spec-index 收口
21. **需求/功能设计审核** → spec-function-design-audit（specgo 子流程，/spec-function-design-audit）：多彩建模 + 断点扫描 + ask-human 澄清 + HTML，审核完成后可选输出规范功能设计 md
22. **资产质量审核** → spec-asset-audit 主 skill：docs/ 四类资产两维度审核（表达质量 + 代码一致性），结论三档，报告归档 docs/report/（README.md 总览 + 每篇一个审核报告，支持单篇更新/增量/全量）

**需求到交付（旧体系保留链路）**

23. **mermaid 图验证** → mermaid-validate 主 skill：含图产出物必须本地校验全部 VALID 后交付
24. **需求到 story 设计** → spec-story-design（specgo 子流程，/spec-story-design）：产出 docs/1-storys/{功能名}/ 目录（{功能名}-story.md 八类核心要素组织、标注新增/变更/不涉及 + {功能名}-develop-task.md）
25. **全链路编排（端到端主流程，推荐入口）** → specgo 主 skill：资产检查/录入 → 需求审核 → story 设计 → 代码实现与测试 → 资产刷新 → 全链路分析报告（归档 docs/1-storys/{功能名}/ story 目录），每步校验环节结束固定过 ask-human 审视门；主代理编排与用户确认、各步骤派子代理执行

## 红线（这些想法意味着你正在跳过 skill）

| 想法 | 现实 |
|------|------|
| "我先扫一眼目录" | arch-structure-model-analyze 子流程定义了"怎么扫"，先加载 spec-analyze 路由到它 |
| "列一下接口就行" | biz-interface-analyze 子流程定义了接口盘点格式，先加载 spec-analyze 路由到它 |
| "看看调了哪些下游服务" | tech-external-call-guidelines-analyze 子流程定义了跨服务调用规范与盘点格式，先加载 spec-analyze 路由到它 |
| "业务规则我边读边总结" | biz-rules-analyze 子流程定义了规则条目格式（条件 → 动作 + 依据），先加载 spec-analyze 路由到它 |
| "表结构/缓存结构我随便列列" | biz-data-model-analyze 子流程定义了数据模型格式，先加载 spec-analyze 路由到它 |
| "框架用法我直接写" | tech-framework-guidelines-analyze 子流程定义了框架使用指导盘点格式，先加载 spec-analyze 路由到它 |
| "线程池这么用没问题" | tech-concurrency-guidelines-analyze 子流程定义了并发实例的用途定位与使用案例提取格式，先加载 spec-analyze 路由到它 |
| "这需求文档我读读就好" | spec-function-design-audit 子流程用来查表述质量与逻辑断点，先加载 specgo 路由到它 |
| "给我讲讲 XX 流程怎么走的" | arch-interaction-model-analyze 子流程定义了交互模型（时序图）提取格式，先加载 spec-analyze 路由到它 |
| "这 mermaid 图我直接画/看着没问题" | mermaid-validate 定义了语法红线与本地验证流程，先加载它 |
| "这功能我直接写 story" | spec-story-design 子流程定义了 story 模板，先加载 specgo 路由到它 |
| "代码写完直接提交" | qual-code-standards-analyze 子流程定义了编码红线与门禁检查，先加载 spec-analyze 路由到它 |
| "MR 合了，看看文档要不要改" | spec-update 子流程定义了 git 变更驱动的资产刷新流程，先加载 specgo 路由到它 |
| "把分析子流程挨个手动跑一遍" | spec-analyze 全量模式定义了子代理并行的一键全量分析编排，先加载它 |
| "这批文档质量怎么样" | spec-asset-audit 定义了资产两维度质量审核与结论三档，先加载它 |
| "从需求到交付，一条龙做了" | specgo 定义了六步全链路编排与子代理分工，先加载它 |
| "这个 skill 太重，我快速做" | 如果子流程存在，就必须用 |
| "我记得这个子流程的内容" | 子流程会演进，每次都要重新读取当前版本 |
| "子流程用 Skill 工具加载" | 子流程不是独立 skill——由主 skill 路由读取文件，或用同名 / 命令触发 |

## 与项目其他 skill 的关系

本项目 .claude/skills/ 下还有 se-harness、code-generation-quality-loop 等非 spec skill。spec- 系列覆盖"代码仓规格化分析 → story 设计 → 按文档生成代码"链路；code-generation-quality-loop 提供 CodeCheck 全量规则扫描与 DT/E2E 测试闭环，可在 specgo 生成代码后串联。

## 优先级

1. 用户的显式指令（AGENTS.md、直接请求）——最高优先级
2. specgo 的 spec skill——覆盖默认行为
3. 默认 system prompt——最低优先级

如果 AGENTS.md 说"不用 spec 流程"而 specgo 说"必须用"，遵循用户指令。用户始终掌控。
</SPEC_GO_BOOTSTRAP>