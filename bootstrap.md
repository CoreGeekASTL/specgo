<SPEC_GO_BOOTSTRAP>
# Specgo — 代码仓规格化分析 skill 体系

<EXTREMELY-IMPORTANT>
你拥有 specgo。在执行任何代码仓分析、需求/设计文档解读与审核、对外接口盘点、出站调用/下游依赖盘点、目录结构梳理、框架使用模式梳理、story 设计、代码生成、总结报告、MR 资产刷新、mermaid 图验证任务之前——即使你认为只有 1% 的可能某个 spec skill 适用——你也必须先用 Skill 工具加载对应 skill 全文并遵循其指引（mermaid 图无独立 skill——画 mermaid 图或产出含 mermaid 代码块时，改为先读 skills/spec-analyze/references/mermaid-guide.md 全文并遵循其语法红线；资产类产出（docs/0-{域}/、docs/report/）另须过 skills/spec-analyze/scripts/validate-mermaid.mjs 全部 VALID 验证）。这不可协商、不可选择、不可用"我先看看代码"为自己开脱。

体系结构：6 个主 skill（下方索引）+ 17 个子流程（spec-analyze 内 references/subflows/*.md，由 spec-analyze 路由表加载，也可用同名 / 命令直接触发）+ 共用参考 skills/spec-analyze/references/mermaid-guide.md（mermaid 编写与本地验证指南，非 skill，需要时直接读文件）。各 skill 独立执行、按需串联，无编排层。skill 的 description 已汇总触发关键词，请用下面的索引判断该加载哪个 skill；命中 spec-analyze 子流程场景时加载 spec-analyze 并按其「子流程路由表」执行具体子流程。

**交互双模式（全部 skill 通用）**：各 skill 内的 ask-human 询问点默认使用 ask-human 工具；若任务开始时用户声明"以报告形式呈现"（或同类意思），则全程不使用 ask-human——所有待澄清/待审视内容以报告形式输出，等用户回复后继续。
</EXTREMELY-IMPORTANT>

## Skill 索引（用 Skill 工具加载全文）

### 1. spec-analyze
资产分析主 skill——承载 17 个子流程（arch 结构/交互 2 个 + biz 接口/规则/对象模型/数据模型/词典 5 个 + tech 框架/通信/并发/数据访问/韧性/基础 6 个 + qual 编码/DT/分支 3 个 + 资产质量审核 1 个）的路由与编排：单个子流程请求按「子流程路由表」读取对应子流程文件执行；全量请求以子代理并行派发 16 个分析子流程（asset-audit 审核类不入全量波次，按需单独触发），一次性建齐代码仓 docs/ 全套资产（首波 15 个分析子代理并行，第二波词典复用接口功能域口径）。主代理只做编排、用户确认与验收，不亲自分析。触发场景包括"spec-analyze"、"全量资产分析"、"一键资产分析"、"建齐 docs 资产"、"asset-audit"、"资产质量评估"、"评估 docs 文档质量"、"文档与代码一致性检查"、"资产失实检查"、"审核资产文档"，以及各单资产场景："梳理代码仓结构/目录关系/模块依赖/包图"、"交互模型/时序图/调用链/梳理业务流程"、"对外接口盘点/接口清单"、"业务规则/规则提取/状态机/错误码规则"、"对象模型/领域模型/聚合/类图/DDD"、"数据模型/表结构/ER 图/数据字典/TTL"、"领域词典/术语表/词汇表/统一语言"、"框架使用指导/技术栈盘点"、"通信规范/出站调用/下游接口/服务依赖"、"并发规范/线程池/锁/goroutine 启动点"、"数据访问规范/Redis 使用/DB 访问/缓存穿透/SQL 注入防护"、"韧性规范/超时/重试/熔断降级/吞错"、"基础规范/日志规范/配置读取/告警"、"编码规范/clean code/安全编码红线/CI 门禁规则"、"DT 规范/测试金字塔/覆盖率门禁/等价类边界值"、"分支规范/commit 规范/MR 规范/git flow"等。

### 2. spec-code-generate
代码生成执行 skill——依据 story 设计文档与 develop-task 施工单（单文档多 Task：任务拆分总览 + 逐 Task 修改文件清单/改动详情/测试清单/验证方式）在被分析仓落地完整可运行代码。两条铁律：①代码必须完整交付，禁止任何 TODO/占位符/省略号式留空，每个函数、每个分支、每条错误处理路径都必须写出真实实现，写不出完整实现就是输入不足——返回待确认清单，绝不用 TODO 占位；②两线一次性派发——**只派两个子代理**：一个测试子代理一次写完全部 Task 的自测用例（以 develop-task 完整契约+行为对照表为唯一依据，不看实现）、一个实现子代理一次实现全部 Task 的代码（不看测试文件），两线全部完成后由主代理全量测试、失败归因（以 develop-task 契约为裁判）并全权修正，全部「验证方式」命令实跑通过才算完成。子代理执行纪律：只读三波输入文档（story 全读 + develop-task + 两文档显式引用的仓内文档）、定点核实存量代码、按修改文件清单落地（清单外不改）。独立执行，需已有 story 设计文档与 develop-task 作为输入。触发场景包括"spec-code-generate"、"按 story 生成代码"、"实现这个 develop-task"、"代码实现"、"生成完整代码"等。

### 3. spec-report
代码生成收口总结报告 skill——在需求实现收口后（代码实现与测试完成），以实跑证据、git diff 与各步骤返回事实为唯一事实来源，产出三节结构的总结报告：一、代码生成的准确性（关联 develop-task 任务拆分总览与修改文件清单，逐 Task/文件核对是否所有任务都正确实现，附测试用例执行结果）+ 二、资产使用情况（本次实现实际使用了哪些资产文档、各自用在何处）+ 三、用户反馈（询问用户当前代码生成的准确率与主要问题，用户回答则写入报告，不回答则不写入该节）。报告落盘被分析仓 docs/1-storys/{功能名}/{YYYYMMDD}-report.md（与 story/develop-task 同目录，次抛带日期，同日同需求重跑同名覆盖）。可脱离流程单独触发。触发场景包括"spec-report"、"总结报告"、"交付报告"、"生成总结"、"代码生成准确性报告"、"资产使用情况统计"、"报告环节"等。

### 4. spec-requirement-audit
需求审核 skill——基于多彩建模方法论审核 Spec/需求/功能设计文档：既看文档也看代码（代码对照：文档描述的既有行为/接口/规则/数据结构与代码事实比对，初步定位注入点/复用点），三类断点扫描（表述质量：句子成分残缺/弱表述/术语失范/语义多解 + 业务逻辑断裂点 + 设计要素：时序图/验收用例/接口信息）合并分级后统一澄清（**先落盘待澄清清单**——源文档同目录 `{功能名}-待澄清清单.md`，每问附候选选项与基于代码事实的推荐做法；随后默认用 ask-human 批量提问，用户声明"以报告形式呈现"则不再询问、等用户审核裁定文档后发新消息作答），澄清闭环后一次成型产出建模 HTML 与规范功能实现设计 md（功能设计规范格式），收尾输出不落盘审核报告（断点逐条 + 代码对照结论 + 产出清单）交用户审视。当用户提到"spec-requirement-audit"、"spec-function-design-audit"、"需求审核"、"审核 spec 业务逻辑完备性"、"多彩建模"、"检查需求逻辑断点"、"需求表述质量检查"、"需求歧义扫描"、"需求与代码对照"、"建模结果生成 HTML 并找人确认"、"功能设计文档校验"时使用。

### 5. spec-story-design
当接收到需求设计文档（SR/特性设计）或 spec-requirement-audit 产出的规范功能实现设计，需要为存量代码仓产出新功能的 story 设计文档时使用——产出 `docs/1-storys/{功能名}/` 目录（每 story 一个目录：`{功能名}-story.md` + `{功能名}-develop-task.md`）：story 按八类核心要素（对外接口/业务规则/数据模型/对象模型/领域词典/交互流程/外部服务调用/技术要素）组织章节，每类要素明确标注 新增 / 变更（写清对哪个既有要素做了什么更改）/ 不涉及，并附需求概述（多彩建模）、实现方案与修改清单、外部文档引用；story 定稿归档后最后输出 develop-task 施工单（单文档、按相对独立功能块分 Task 章，每 Task 含修改文件清单/逐文件改动详情/测试清单/验证方式，编写指令见 references/assets/develop-task-guide.md）；同需求重跑同名覆盖。触发场景包括"新增 story 设计"、"根据需求文档生成 story 设计"、"xxx-story 文档"、"docs/1-storys"、"按 story 模板输出新功能设计"等。

### 6. spec-update
基于 git 变更（工作区未提交改动 / 指定 commit / 分支或 MR diff）识别代码原始内容变化，结合新增代码审视 docs/ 资产体系中对应文档是否需要刷新，并按最新要素定义（arch/biz/tech/qual 各 analyze 子流程的目录布局、文件命名、模板骨架、组织规则）增量刷新受影响文档——变更文件映射到资产要素、逐资产判定影响（受影响 / 不受影响 / 资产未建），刷新清单先交人工确认再动笔定稿。当代码提交或 MR 合入后需要评估"这次变更要更新哪些 docs 文档""资产是否过期""按最新定义同步文档"时使用。触发场景包括"spec-update"、"资产刷新"、"刷新 docs"、"代码改了哪些文档要更新"、"变更影响分析"、"文档同步"、"docs 与代码不同步"、"MR 后刷新文档"、"git diff 刷新资产"等。

## 推荐工作流（spec 全链路）

针对一个存量代码仓的完整规格化流程，按序串联；也可单独触发任意一步。子流程均可用同名 / 命令直接触发（如 /arch-structure-model-analyze），或由 spec-analyze 路由加载；独立 skill 直接加载。

**四域资产治理（arch / biz / tech / qual）**

1. **结构摸底** → arch-structure-model-analyze（spec-analyze 子流程，/arch-structure-model-analyze）：UML 包图 + 依赖矩阵 + 分层特征，落盘 docs/0-arch/structure-model/（仓级总览 README.md + 每模块 structure-model-{module}.md）
2. **交互模型提取（默认全部流程，可指定单流程）** → arch-interaction-model-analyze（spec-analyze 子流程，/arch-interaction-model-analyze）：UML 时序图呈现模块间主业务流程与消息走向，只画主链路，落盘 docs/0-arch/interaction-model/（README.md 流程导航 + interaction-model-{flow}.md）
3. **对外接口盘点** → biz-interface-analyze（spec-analyze 子流程，/biz-interface-analyze）：按功能域聚类，主文档 README + interface-{feature}.md，落盘 docs/0-biz/interface/
4. **业务规则梳理** → biz-rules-analyze（spec-analyze 子流程，/biz-rules-analyze）：按需求类整理"条件 → 动作 + 依据"规则条目，README.md 功能域导航 + rules-{feature}.md，落盘 docs/0-biz/rules/
5. **对象模型** → biz-object-model-analyze（spec-analyze 子流程，/biz-object-model-analyze）：实体/值对象/聚合/领域服务/领域事件（UML 类图），README.md 聚合导航 + object-model-{aggregate}.md，落盘 docs/0-biz/object-model/
6. **数据模型** → biz-data-model-analyze（spec-analyze 子流程，/biz-data-model-analyze）：持久态表结构/缓存数据结构/字段关系与数据生命周期（UML-ER），README.md 实体导航 + data-model-{entity}.md，落盘 docs/0-biz/data-model/
7. **领域词典** → biz-lexicon-analyze（spec-analyze 子流程，/biz-lexicon-analyze）：业务与代码共用的受控词汇集（术语释义 + 语境边界 + 代码命名映射），主文档 README.md + 每功能域 1 篇 lexicon-{feature}.md，落盘 docs/0-biz/lexicon/
8. **框架使用指导** → tech-framework-guidelines-analyze（spec-analyze 子流程，/tech-framework-guidelines-analyze）：基础框架清单与使用方式盘点（纯现状提取），framework-guidelines-{framework}.md 每框架一篇，落盘 docs/0-tech/framework-guidelines/
9. **通信规范** → tech-external-call-guidelines-analyze（spec-analyze 子流程，/tech-external-call-guidelines-analyze）：RPC/HTTP/MQ 跨服务调用指导（双模式：现状提取 + 差距分析），external-call-guidelines-{service}.md 每外部服务一篇
10. **并发规范** → tech-concurrency-guidelines-analyze（spec-analyze 子流程，/tech-concurrency-guidelines-analyze）：线程池/锁/channel 等并发原语实例的用途定位、使用说明与代码案例（章节上限三节），README.md 实例导航 + concurrency-guidelines-{pool}.md 每实例一篇
11. **数据访问规范** → tech-data-access-guidelines-analyze（spec-analyze 子流程，/tech-data-access-guidelines-analyze）：Redis/DB 等中间件访问指导，README.md 中间件导航 + data-access-guidelines-{mw}.md 每中间件一篇
12. **韧性规范** → tech-resilience-guidelines-analyze（spec-analyze 子流程，/tech-resilience-guidelines-analyze）：超时/重试/熔断/异常处理的使用说明与代码案例，README 索引 + resilience-guidelines-{dimension}.md 每维度一篇
13. **基础规范** → tech-basic-mechanism-guidelines-analyze（spec-analyze 子流程，/tech-basic-mechanism-guidelines-analyze）：日志/配置/告警等基础机制的函数调用说明与使用代码案例，README 索引 + basic-mechanism-guidelines-{dimension}.md 每维度一篇
14. **编码规范（门禁）** → qual-code-standards-analyze（spec-analyze 子流程，/qual-code-standards-analyze）：命名/注释/函数长度/圈复杂度/安全编码红线/禁止项清单，code-standards.md + report/ 门禁差距报告
15. **DT 规范（门禁）** → qual-dt-guidelines-analyze（spec-analyze 子流程，/qual-dt-guidelines-analyze）：测试金字塔与覆盖基线、用例设计、覆盖率门禁，dt-guidelines.md + report/
16. **分支与变更规范** → qual-branch-guidelines-analyze（spec-analyze 子流程，/qual-branch-guidelines-analyze）：分支模型、commit/MR 规范、评审要求，branch-guidelines.md
17. **资产质量审核** → asset-audit（spec-analyze 子流程，/asset-audit）：docs/ 四类资产两维度审核（表达质量 + 代码一致性），E/C 打分三档（已基线/待修订/重写），报告归档 docs/report/（README.md 总览 + 每篇一个审核报告，支持单篇/增量/总览/全量四种模式）
18. **资产刷新（git 变更驱动）** → spec-update（独立 skill，/spec-update）：基于 git diff 识别变更对 docs/ 资产的影响，按最新要素定义增量刷新受影响文档，刷新清单人工确认后定稿
19. **一键全量资产分析（编排入口）** → spec-analyze 全量模式：子代理并行派发全部 16 个分析子流程（词典第二波复用接口功能域口径），一次性建齐 docs/ 资产

**需求到交付（4 个独立 skill，按需顺序串联，无编排层）**

20. **需求审核** → spec-requirement-audit（独立 skill，/spec-requirement-audit）：看文档 + 看代码（代码对照：文档描述与代码事实比对、注入点/复用点初步定位），多彩建模 + 断点扫描 + 澄清闭环，产出建模 HTML + 规范功能实现设计 md（源文档同目录），收尾输出不落盘审核报告
21. **story 设计** → spec-story-design（独立 skill，/spec-story-design）：产出 docs/1-storys/{功能名}/ 目录（{功能名}-story.md 八类核心要素组织、标注新增/变更/不涉及 + {功能名}-develop-task.md），收尾输出不落盘设计报告
22. **代码生成** → spec-code-generate（独立 skill，/spec-code-generate）：依据 story/develop-task 落地零 TODO 完整代码，子代理实现、主代理执行单测/集成测试/验证命令
23. **总结报告** → spec-report（独立 skill）：代码生成收口后产出三节总结报告（代码生成的准确性——对照 develop-task 逐任务核对 + 测试实跑证据 / 资产使用情况 / 用户反馈——询问用户准确率与主要问题，不回答则不写入），落盘 docs/1-storys/{功能名}/{YYYYMMDD}-report.md
24. **mermaid 图验证（指南宿于 spec-analyze，非 skill）** → 画 mermaid 图先读 skills/spec-analyze/references/mermaid-guide.md 的「语法红线」；资产类产出（docs/0-{域}/、docs/report/）交付前必须跑 skills/spec-analyze/scripts/validate-mermaid.mjs 全部 VALID，非资产产出只按红线自查

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
| "这需求文档我读读就好" | spec-requirement-audit 用来查表述质量/逻辑断点并做代码对照，先加载它 |
| "给我讲讲 XX 流程怎么走的" | arch-interaction-model-analyze 子流程定义了交互模型（时序图）提取格式，先加载 spec-analyze 路由到它 |
| "这 mermaid 图我直接画/看着没问题" | skills/spec-analyze/references/mermaid-guide.md 定义了语法红线与本地验证流程（skills/spec-analyze/scripts/validate-mermaid.mjs），画图前先读它 |
| "这功能我直接写 story" | spec-story-design 定义了 story 模板，先加载它 |
| "代码写完直接提交" | qual-code-standards-analyze 子流程定义了编码红线与门禁检查，先加载 spec-analyze 路由到它 |
| "MR 合了，看看文档要不要改" | spec-update 定义了 git 变更驱动的资产刷新流程，先加载它 |
| "把分析子流程挨个手动跑一遍" | spec-analyze 全量模式定义了子代理并行的一键全量分析编排，先加载它 |
| "这批文档质量怎么样" | asset-audit 子流程定义了资产两维度质量审核与打分三档，先加载 spec-analyze 路由到它 |
| "代码跑完测试过了直接交付" | spec-report 定义了收口总结报告的取证纪律（任务核对/资产使用/用户反馈），先加载它 |
| "这个 skill 太重，我快速做" | 如果子流程存在，就必须用 |
| "我记得这个子流程的内容" | 子流程会演进，每次都要重新读取当前版本 |
| "子流程用 Skill 工具加载" | 子流程不是独立 skill——由主 skill 路由读取文件，或用同名 / 命令触发 |

## 与项目其他 skill 的关系

本项目 .claude/skills/ 下还有 se-harness、code-generation-quality-loop 等非 spec skill。spec- 系列覆盖"代码仓规格化分析 → 需求审核 → story 设计 → 按文档生成代码 → 收口总结报告"链路；code-generation-quality-loop 提供 CodeCheck 全量规则扫描与 DT/E2E 测试闭环，可在 spec-code-generate 生成代码后串联。

## 优先级

1. 用户的显式指令（AGENTS.md、直接请求）——最高优先级
2. specgo 的 spec skill——覆盖默认行为
3. 默认 system prompt——最低优先级

如果 AGENTS.md 说"不用 spec 流程"而 specgo 说"必须用"，遵循用户指令。用户始终掌控。
</SPEC_GO_BOOTSTRAP>