<SPEC_GO_BOOTSTRAP>
# Specgo — 代码仓规格化分析 skill 体系

<EXTREMELY-IMPORTANT>
你拥有 specgo。在执行任何代码仓分析、需求/设计文档解读、对外接口盘点、出站调用/下游依赖盘点、目录结构梳理、框架使用模式梳理、story 设计、MR 资产刷新、mermaid 图验证、功能端到端开发任务之前——即使你认为只有 1% 的可能某个 spec skill 适用——你也必须先用 Skill 工具加载该 skill 全文并遵循其指引。这不可协商、不可选择、不可用"我先看看代码"为自己开脱。

spec skill 的 description 已包含触发关键词，请用下面的索引判断该调用哪个。
</EXTREMELY-IMPORTANT>

## Skill 索引（用 Skill 工具加载全文）

### 1. arch-interaction-model-analyze
分析存量代码仓业务流程的交互模型（模块间主业务流程、消息走向），产出 UML 时序图（mermaid），落盘被分析仓的 docs/0-arch/interaction-model/：README.md 流程导航主文档 + interaction-model-{flow}.md（每业务流程 1 篇）。用户指明流程时只梳理该流程；未指明时默认枚举仓内全部业务流程逐篇产出，不阻塞式询问。只画主链路，分支与异常逻辑不画入图——归业务规则资产承载。当用户提到"交互模型"、"模块交互"、"消息走向"、"时序图"、"调用链"、"梳理 XX 业务流程"、"XX 流程是怎么走的"、"画一下 XX 流程"、"把 XX 流程落成文档"、"梳理全部业务流程"、"interaction model"、"sequence diagram"时使用。务必在生成任何模块交互/流程时序文档之前使用此 skill。

### 2. arch-structure-model-analyze
分析存量代码仓的结构模型（模块划分、分层、职责与依赖关系），产出 UML 包图（mermaid）+ 依赖矩阵，落盘被分析仓的 docs/0-arch/structure-model/：仓级总览 README.md + 每模块 structure-model-{module}.md。当用户提到"代码仓结构"、"结构模型"、"目录关系"、"模块依赖图"、"画一下项目结构"、"梳理目录关系"、"生成结构文档"、"第一层目录"、"包之间依赖"、"repo structure"、"structure model"、"module relationship"、"项目摸底"、"架构摸底"时使用。即使用户没明说"结构模型"，只要意图是"看清一个代码仓第一层目录之间、或某目录下包与包之间的依赖关系并出图"，都应触发。务必在生成任何代码仓结构文档之前使用此 skill。

### 3. biz-data-model-analyze
分析存量代码仓的数据模型资产（持久态表结构、缓存数据结构、字段关系与数据生命周期），产出 UML-ER 图（mermaid erDiagram）+ 字段表 + 生命周期说明，落盘被分析仓的 docs/0-biz/data-model/：README.md 实体导航主文档 + data-model-{entity}.md（每数据实体 1 篇）。用户指明实体时只梳理该实体；未指明时默认全量——扫描建表 SQL（CREATE TABLE）、ORM entity 注册（TableName/RegisterModel）与关键缓存结构体，逐实体产出，不阻塞式询问。逻辑关联无 DB 约束时标注"代码未体现物理外键"。当用户提到"数据模型"、"表结构"、"ER 图"、"数据库设计"、"字段说明"、"数据字典"、"梳理 XX 表"、"数据生命周期"、"缓存数据结构"、"TTL"、"data model"、"ER diagram"、"schema 文档"时使用。务必在生成任何表结构/ER 图/数据字典类文档之前使用此 skill。

### 4. biz-interface-analyze
扫描存量代码仓**对外提供的接口**（服务自己暴露给外部调用的入口：HTTP 路由注册 / RPC service 注册 / 消息订阅 handler / IDL 契约），按功能域聚类，产出**一个主文档 + 多个子文档**：主文档 `README.md` 含接口全景与功能域索引，每个功能域一个子文档 `interface-{feature}.md`，子文档内列接口表格（接口名/作用/所在文件/方法/路径，**所在文件不带行号**），表格下方逐个说明该接口相关的请求与响应数据结构。落盘被分析仓的 `docs/0-biz/interface/`。当需要盘点代码仓对外提供哪些接口、梳理对外接口清单、为接口治理/接口文档/新人上手提供文档时使用。触发场景包括"代码仓对外提供什么接口""对外接口""外部接口""服务暴露的接口""接口清单""接口盘点""接口文档"等。

### 5. biz-lexicon-analyze
提取存量代码仓的领域词典资产——业务与代码共用的受控词汇集（术语释义、语境边界、代码命名映射），从对外接口文档/请求响应模型、DB 实体注释、事件模型、错误码定义、常量定义五类来源归集术语，按「子域 × 术语类型」两级组织（一级按代码功能域划分子域、子域内按实体与业务概念/常量与状态枚举/错误码/事件四类分组），**按业务子域拆分多篇成文**：主文档 README.md（说明/全仓待确认清单/子域导航/「通用」节）+ 每功能域 1 篇 lexicon-{子域锚点}.md，落盘被分析仓的 docs/0-biz/lexicon/。当需要统一业务与代码的术语口径、沉淀受控词汇、梳理同名异义与同义异名、为新人上手/需求评审/AI 编码提供词汇基线时使用。触发场景包括"领域词典"、"术语表"、"词汇表"、"统一语言"、"术语口径"、"名词解释"、"这个业务词在代码里叫什么"、"lexicon"、"glossary"、"ubiquitous language"等。

### 6. biz-object-model-analyze
分析存量代码仓的对象模型（实体、值对象、聚合、领域服务、领域事件），产出 UML 类图（mermaid classDiagram），落盘被分析仓的 docs/0-biz/object-model/：README.md 聚合导航主文档 + object-model-{aggregate}.md（每聚合 1 篇）。用户指定聚合时只梳理该聚合；未指定时默认全量——扫描模型层与核心 service，按聚合根归集后逐聚合产出，不阻塞式询问。类图只画聚合内结构（关键属性与关联，方法省略）与聚合间引用方向，以代码中的结构体/类为准，禁止把 DB 表字段机械照抄成类图。当用户提到"对象模型"、"领域模型"、"实体"、"值对象"、"聚合"、"聚合根"、"领域服务"、"领域事件"、"类图"、"class diagram"、"object model"、"domain model"、"DDD"、"梳理 XX 聚合"、"画一下领域对象"、"实体建模"时使用。务必在生成任何领域对象/实体类图文档之前使用此 skill。

### 7. biz-rules-analyze
从存量代码仓提取业务规则资产——条件分支/参数校验/状态迁移/阈值常量/错误码/事务回滚等规则点，按需求类（功能域）整理"条件 → 动作 + 依据"规则条目表格，产出 README.md 功能域导航主文档 + rules-{feature}.md（每需求类 1 篇），落盘被分析仓的 docs/0-biz/rules/。用户指明功能域时只提取该域；未指明时默认以对外入口注册点（HTTP 路由/消息订阅/定时任务/IDL 契约）归集全部功能域逐域产出，不阻塞式询问。与交互模型互补：交互模型只画主链路，分支与异常逻辑归本资产承载。当用户提到"业务规则"、"规则提取"、"分支逻辑"、"校验规则"、"状态迁移"、"状态机"、"错误码规则"、"阈值"、"梳理 XX 的规则"、"XX 流程有哪些分支"、"XX 流程的异常处理"、"规则文档"、"business rules"时使用。务必在生成任何业务规则文档之前使用此 skill。

### 8. mermaid-validate
指导如何编写可被正确渲染的 mermaid 图，并在本地验证渲染结果。当用户提到"mermaid"、"画图"、"流程图"、"时序图"、"架构图"、"依赖图"、"图渲染失败"、"图渲染不出来"、"验证 mermaid"、"mermaid 报错"时使用；任何产出物（文档/HTML）中包含 ```mermaid 代码块时，必须用本 skill 的验证流程确认每张图可被解析渲染后才能宣称完成。

### 9. qual-branch-guidelines-analyze
治理存量代码仓的分支与变更规范资产（分支模型、commit/MR 规范、评审要求），双模式运行——起草模式从 git 历史提取现状（git branch -a 采样归纳分支命名形态、merge commit / squash / rebase 证据判定 merge 策略、git log 采样归纳 commit message 类型前缀/语言/长度分布、MR 评审痕迹），归纳现状后起草规范文档（现状描述与应有约定分节，约定标注「建议，待团队确认」）；差距分析模式对照规范检查近期 N 个 commit/分支的差距。产出落盘被分析仓的 docs/0-qual/branch-guidelines/：仓级单篇 branch-guidelines.md（活文档，同名覆盖更新）；差距报告落盘 docs/0-qual/branch-guidelines/report/{YYYYMMDD}-branch-guidelines.md（次抛，带日期）。当用户提到"分支规范"、"分支模型"、"分支命名规范"、"git flow"、"commit 规范"、"commit message 规范"、"MR 规范"、"合并请求规范"、"评审要求"、"merge 策略"、"squash merge"、"rebase 还是 merge"、"branch guidelines"、"分支规范差距分析"、"对照分支规范检查"时使用。

### 10. qual-code-standards-analyze
治理存量代码仓的编码规范资产（命名、注释、函数长度/圈复杂度、安全编码红线、禁止项清单，每条规则标注可否机器检查），双模式运行——起草模式在仓内无规范时以内置规则底稿（27 条通用 clean code 规则 + 安全附加项 S1~S3 + Go/Java/Python/C++ 语言特则）为基础、结合仓内代码现状裁剪生成仓级单篇 code-standards.md；差距分析模式对照既有规范扫描代码差距，产出带日期的差距报告。规则分两级：红线（必须，违反即拦截，CI 门禁判定依据）与建议（应该，违反仅出报告）。产出落盘被分析仓的 docs/0-qual/code-standards/：规范文档 code-standards.md（活文档，同名覆盖）；差距报告落盘 docs/0-qual/code-standards/report/{YYYYMMDD}-code-standards.md，红线违反单独成节供 CI 解析拦截，建议级差距另列一节。当用户提到"编码规范"、"代码规范"、"clean code 规范"、"命名规范"、"函数长度限制"、"圈复杂度"、"安全编码红线"、"禁止项清单"、"代码风格规范"、"编码规范差距分析"、"对照编码规范检查"、"CI 门禁规则"、"code standards"、"coding guidelines 红线"时使用。

### 11. qual-dt-guidelines-analyze
治理存量代码仓的 DT 规范资产（开发者测试规范：测试金字塔与覆盖基线、用例设计方法（等价类/边界值）、自测报告要求、新增代码覆盖率门禁），双模式运行——起草模式盘点仓内测试现状（测试文件分布：单测/集成/E2E，测试框架、Mock 工具、覆盖率工具与当前覆盖率，CI 测试关卡）并据此起草规范，新增代码覆盖率门禁线从现状实测给建议值并标注"建议值，待团队确认"；差距分析模式对照规范扫描差距（重点：新增代码无测试、覆盖率低于门禁线），覆盖率红线违反单独成节供 CI 门禁。产出落盘被分析仓的 docs/0-qual/dt-guidelines/dt-guidelines.md（仓级单篇活文档）；差距报告落盘 docs/0-qual/dt-guidelines/report/{YYYYMMDD}-dt-guidelines.md。当用户提到"DT 规范"、"开发者测试规范"、"测试金字塔"、"覆盖率基线"、"新增代码覆盖率门禁"、"覆盖率门禁线"、"用例设计方法"、"等价类"、"边界值"、"自测报告"、"测试现状盘点"、"单元测试覆盖率"、"DT guidelines"、"测试覆盖率差距分析"、"对照 DT 规范检查"时使用。

### 12. spec-analyze
一键全量资产分析编排 skill——以子代理并行派发全部 16 个资产分析 skill（arch 结构/交互 2 个 + biz 接口/规则/对象模型/数据模型/词典 5 个 + tech 使用/通信/并发/数据访问/韧性/基础 6 个 + qual 编码/DT/分支 3 个），一次性完成代码仓全套 docs/ 资产建库：首波 15 个分析子代理并行，第二波 biz-lexicon-analyze（复用接口功能域口径保证词典子域对齐），最后 spec-index 子代理收口生成各域索引与总索引。主代理只做编排、用户确认与验收，不亲自分析。当需要为代码仓首次建齐 docs/ 全套资产、或资产长期失修需要全量重建时使用。触发场景包括"spec-analyze"、"全量资产分析"、"一次性分析代码仓"、"一键资产分析"、"资产全量录入"、"全仓资产盘点"、"把所有分析 skill 跑一遍"、"建齐 docs 资产"等。

### 13. spec-asset-audit
四类资产质量审核 skill——审核 docs/{arch,biz,tech,qual}/ 资产文档与索引，只做两个维度：表达质量（文字表达连续、人能读懂）与代码一致性（重点：锚点反查、接口/数据结构/出站调用与代码事实比对、mermaid 渲染校验），结论三档（失实/待修订/可信），报告归档 docs/report/（README.md 总览 + 每篇一个 {文档基名}-audit.md，镜像 docs/ 相对路径，同名覆盖）；范围三种模式：指定单篇 / 增量（默认，只审受 git 变更影响的资产）/ 全量（四类资产全审）。当用户提到"spec-asset-audit"、"资产质量评估"、"评估 docs 文档质量"、"文档与代码一致性检查"、"资产失实检查"、"审核资产文档"时使用。需求/功能设计文档的审核归 spec-function-design-audit。

### 14. spec-code-generate
代码生成执行 skill——依据 story 设计文档与 develop-task 修改文件清单在被分析仓落地完整可运行代码。两条铁律：①代码必须完整交付，禁止任何 TODO/占位符/省略号式留空，每个函数、每个分支、每条错误处理路径都必须写出真实实现，写不出完整实现就是输入不足——返回待确认清单，绝不用 TODO 占位；②子代理只实现代码、按修改文件清单可并行多个子代理（按文件分组派发，无依赖的文件组同一条消息并行），主代理执行测试（单测/集成测试/验证命令）与后续流程，绝不亲自编码。子代理执行纪律：只读三波输入文档（story 全读 + develop-task + 两文档显式引用的仓内文档）、定点核实存量代码、按修改文件清单逐文件落地（清单外不改）。主代理测试纪律：单元测试覆盖新增/改动逻辑全部通过、仓内有集成/E2E 测试必须主动运行、develop-task「验证方式」命令实跑通过才算完成。通常由 specgo 第 4 步调度，也可在已有 story/develop-task 时单独触发。触发场景包括"spec-code-generate"、"按 story 生成代码"、"实现这个 develop-task"、"代码实现"、"生成完整代码"等。

### 15. spec-function-design-audit
需求/功能设计审核 skill——基于多彩建模方法论审核 Spec/需求/功能设计文档的完备性（表述质量扫描：句子成分残缺/弱表述/术语失范/语义多解 + 业务逻辑断裂点 + 设计要素：时序图/验收用例/接口信息），三类问题一次扫描、统一 ask-human 批量澄清补齐，建模结果以 HTML 可视化呈现，审核完成后可选输出规范功能设计 md。当用户提到"spec-function-design-audit"、"审核 spec 业务逻辑完备性"、"多彩建模"、"检查需求逻辑断点"、"需求表述质量检查"、"需求歧义扫描"、"建模结果生成 HTML 并找人确认"、"功能设计文档校验"、"需求审核"时使用。docs/ 四域资产文档的质量审核归 spec-asset-audit。

### 16. spec-index
生成被分析仓 docs/ 资产体系的索引层——各域索引 docs/0-{域}/README.md（列出本域各资产目录及目录内真实文件清单，每文件一句话说明、从文件首行标题提取，无资产的域不生成）+ 总索引 docs/README.md（四域导航表 + 服务依赖全景图：mermaid flowchart，从 docs/0-tech/external-call-guidelines/ 各文档提取本仓→下游服务依赖边；通信规范资产未建时该节注明"通信规范资产未建"）。索引为活文档，同名覆盖更新并标注生成时间；只聚合真实存在的文件、不重述资产正文。当各 analyze skill 跑完需要统一生成/刷新导航、spec-init 建骨架或迁移后首次建索引、资产增删后刷新索引、需要下游依赖全景图时使用。触发场景包括"生成索引"、"docs 索引"、"域索引"、"总索引"、"资产导航"、"服务依赖全景图"、"依赖全景图"、"刷新 README 索引"、"刷新索引"、"spec-index"等。

### 17. spec-init
初始化被分析仓的 docs/ 资产目录骨架（HELP.MD v1.1「每类资产一个单独目录」布局：0-arch/{structure-model,interaction-model}、0-biz/{interface,rules,object-model,data-model,lexicon}、0-tech/{framework-guidelines,external-call-guidelines,concurrency-guidelines,data-access-guidelines,resilience-guidelines,basic-mechanism-guidelines}、0-qual/{code-standards,dt-guidelines,branch-guidelines}），并一次性迁移既有产出到新布局（旧扁平结构模型/交互模型文档、docs/business/interface/、docs/technical/external-call/、docs/technical/framework-usage/ 等历史产出，文件名同步去 spec- 前缀），迁移映射清单先交用户确认再动手，产出迁移执行摘要（已迁移/跳过/冲突清单）。当首次在一个代码仓启用 specgo 资产治理、需要从旧布局升级到 v1.1 新布局时使用。触发场景包括"初始化 docs 目录"、"资产目录骨架"、"docs 骨架"、"迁移旧文档"、"docs 目录迁移"、"旧布局升级"、"spec-init"、"初始化资产目录"等。

### 18. spec-story-design
当接收到需求设计文档（SR/特性设计），需要为存量代码仓产出新功能的 story 设计文档时使用——产出 `docs/1-storys/{功能名}/` 目录（每 story 一个目录：`{功能名}-story.md` + `{功能名}-develop-task.md`，后续全链路分析报告也归档同目录）：story 按八类核心要素（对外接口/业务规则/数据模型/对象模型/领域词典/交互流程/外部服务调用/技术要素）组织章节，每类要素明确标注 新增 / 变更（写清对哪个既有要素做了什么更改）/ 不涉及，并附需求概述（多彩建模）、实现方案与修改清单、外部文档引用；同需求重跑同名覆盖。触发场景包括"新增 story 设计"、"根据需求文档生成 story 设计"、"xxx-story 文档"、"docs/1-storys"、"按 story 模板输出新功能设计"等。

### 19. spec-update
基于 git 变更（工作区未提交改动 / 指定 commit / 分支或 MR diff）识别代码原始内容变化，结合新增代码审视 docs/ 资产体系中对应文档是否需要刷新，并按最新要素定义（arch/biz/tech/qual 各 analyze skill 的目录布局、文件命名、模板骨架、组织规则）增量刷新受影响文档——变更文件映射到资产要素、逐资产判定影响（受影响 / 不受影响 / 资产未建），刷新清单先交人工确认再动笔定稿；索引资产（docs/0-{域}/README.md、docs/README.md）随资产增删按 spec-index 口径收口。当代码提交或 MR 合入后需要评估"这次变更要更新哪些 docs 文档""资产是否过期""按最新定义同步文档"时使用。触发场景包括"spec-update"、"资产刷新"、"刷新 docs"、"代码改了哪些文档要更新"、"变更影响分析"、"文档同步"、"docs 与代码不同步"、"MR 后刷新文档"、"git diff 刷新资产"等。

### 20. specgo-report
需求到代码全链路分析报告生成 skill——在需求实现收口后（代码实现与测试完成、资产刷新就绪），以实跑证据与各步骤返回事实为唯一事实来源，产出三节结构的全链路分析报告：测试用例执行结果（DT 到测试函数级、集成到用例步骤级）+ 代码修改清单（git diff 取证，含「业务规则」列——每处修改对应哪条业务规则）+ 变更框图与引用资产质量评估（mermaid 框图串联修改逻辑，逐变更推理（变更内容 + 引用文档四列表格：应用内容/质量评分/优化建议），重点呈现缺引用与质量不足缺口）。报告落盘被分析仓 docs/1-storys/{功能名}/{YYYYMMDD}-report.md（与 story/develop-task 同目录，次抛带日期，同日同需求重跑同名覆盖）。通常由 specgo 第 6 步调度，也可脱离流程单独触发。触发场景包括"specgo-report"、"全链路分析报告"、"需求到代码报告"、"生成交付报告"、"报告环节"等。

### 21. tech-basic-mechanism-guidelines-analyze
提取存量代码仓的基础规范资产（日志/配置/告警等横切编码机制的使用指导），单模式提取运行——盘点仓内基础编码机制，产出 README 索引 + 每维度一篇 basic-mechanism-guidelines-{dimension}.md；每篇文档只含两项内容：基础机制的函数调用说明（可调用的函数/方法清单：签名、作用、参数、来源文件）与使用代码案例（真实代码片段，注明来源文件路径）。产出落盘被分析仓的 docs/0-tech/basic-mechanism-guidelines/。当用户提到"基础规范"、"日志规范"、"日志怎么用"、"配置规范"、"配置读取方式"、"环境变量"、"告警规范"、"告警 ID"、"告警怎么上报"、"编码指导"、"foundation guidelines"时使用。

### 22. tech-concurrency-guidelines-analyze
提取存量代码仓的并发规范资产（线程池、锁、channel、goroutine 启动点、Actor、定时任务并发等并发原语实例），单模式提取运行——盘点仓内并发原语并按实例归集成文，产出 README.md 实例导航主文档 + 每实例一篇 concurrency-guidelines-{pool}.md；每篇文档章节不超过三个（用途定位 + 使用说明 + 代码案例），人一看就懂：用途定位一段话说清该实例干什么、为什么需要并发；使用说明列可调用的封装函数/原语入口清单（作用、参数或取值、定义文件）；代码案例给真实调用片段（注明来源文件路径）。产出落盘被分析仓的 docs/0-tech/concurrency-guidelines/（活文档，同名覆盖更新）。当用户提到"并发规范"、"线程池"、"池隔离"、"并发原语盘点"、"goroutine 启动点"、"锁使用"、"channel"、"Actor"、"定时任务并发"、"concurrency guidelines"、"thread pool"时使用。

### 23. tech-data-access-guidelines-analyze
治理存量代码仓的数据访问规范资产（数据存储的访问指导），按数据形态分两类治理——内存数据（进程内内存结构 map+锁/sync.Map/自研缓存，及 Redis/Memcached 等内存型存储）与持久化数据（关系库/ORM、本地嵌入式存储、对象存储、文件系统），两类各用一个模板，模板聚焦三件事：数据设计与定位（存什么、为什么放这里、结构/容量/TTL/生命周期）、如何使用这个数据（读写路径、一致性、并发/事务、降级）、应该在什么场景使用这个数据（业务场景与兜底边界）；外围维度含连接与客户端管理、分页与批量、SQL 拼接与注入防护、错误处理。双模式运行——起草模式识别仓内数据存储并分类，逐存储盘点访问方式并起草规范（数据设计与定位 + 使用方式 + 适用场景 + 现状描述与应有约定）；差距分析模式对照既有规范扫描实际访问的合规差距。产出落盘被分析仓的 docs/0-tech/data-access-guidelines/：README.md 导航主文档 + 每存储一篇 data-access-guidelines-{mw}.md；差距报告落盘 docs/0-tech/data-access-guidelines/report/{YYYYMMDD}-data-access-guidelines.md。当用户提到"数据访问规范"、"Redis 使用规范"、"DB 访问指导"、"数据库访问规范"、"内存缓存"、"进程内缓存"、"缓存读写模式"、"缓存穿透"、"SQL 注入防护"、"事务使用盘点"、"ORM 怎么用"、"data access guidelines"、"数据访问差距分析"、"对照数据访问规范检查"时使用。

### 24. tech-external-call-guidelines-analyze
治理存量代码仓的通信规范资产（RPC/HTTP/MQ 等跨服务调用指导：本服务调用了哪些外部业务节点、协议与封装方式、超时重试与错误码处理），双模式运行——提取模式扫描仓内全部出站调用（HTTP 客户端 / RPC client / IDL client stub / 消息队列生产端 / 进程间通信 / 平台 SDK），按被调外部业务服务归类成文；差距分析模式对照既有通信规范文档核查实际调用的合规差距。边界：只承载业务节点间跨服务调用——DB/Redis/对象存储等数据存储的访问不视为外部服务调用，归 tech-data-access-guidelines-analyze。产出落盘被分析仓的 docs/0-tech/external-call-guidelines/：README 索引 + 每外部服务一篇 external-call-guidelines-{service}.md；差距报告落盘 docs/0-tech/external-call-guidelines/report/{YYYYMMDD}-external-call-guidelines.md。当用户提到"通信规范"、"外部调用"、"下游接口"、"出站调用"、"调用了哪些外部服务"、"服务依赖盘点"、"跨服务调用指导"、"调用规范差距分析"、"对照通信规范检查"、"external call"、"comm guidelines"时使用。

### 25. tech-framework-guidelines-analyze
分析存量代码仓中的内部代码框架（RPC/Web 框架、线程池、Actor、日志、序列化、配置、依赖注入、消息队列、调度、资源池、容错治理、监控、基础库、测试框架等）及其使用方式，提取"框架使用指导"资产（基础框架清单与使用方式盘点，纯现状、无规范文档），落盘被分析仓的 docs/0-tech/framework-guidelines/：索引 README.md + 每框架一篇 framework-guidelines-{framework}.md（含用途定位、使用模式）。边界：只承载内部代码框架使用指导——数据存储访问（DB driver/ORM/Redis/MinIO/嵌入式存储等）归 tech-data-access-guidelines-analyze，跨服务业务节点调用归 tech-external-call-guidelines-analyze，均不纳入本资产。当需要盘点代码仓技术栈、梳理框架使用模式与调用点分布、为 AI 代码生成沉淀"框架使用知识"、或为重构/迁移/新人上手提供框架使用文档时使用。触发场景包括"框架使用指导"、"框架使用现状"、"技术栈盘点"、"框架使用"、"用了哪些框架"、"XX 框架怎么用"、"线程池怎么用"、"RPC 怎么调的"、"framework guidelines"、"framework usage"、"tech stack"等。

### 26. tech-resilience-guidelines-analyze
提取存量代码仓的韧性规范资产（超时/重试/熔断降级/异常处理等故障策略——只管故障来了怎么扛，不管通信协议本身，协议与封装归通信规范），单模式提取运行——扫描仓内全部出站调用点与后台任务的故障策略，产出 README 索引 + 每维度一篇 resilience-guidelines-{dimension}.md；每篇文档只含两项内容：使用说明（该维度机制在仓内怎么用——可调用的封装函数/配置项清单：作用、参数或取值、来源文件）与代码案例（真实代码片段，注明来源文件路径）。产出落盘被分析仓的 docs/0-tech/resilience-guidelines/（活文档，同名覆盖更新）。当用户提到"韧性规范"、"超时设置"、"重试策略"、"熔断降级"、"故障策略"、"异常处理"、"panic recover"、"错误吞掉"、"吞错"、"错误 swallowing"、"容错"、"稳定性治理"、"resilience"时使用。

### 27. specgo
规格化全链路主流程编排 skill——资产检查/录入 → 需求审核(spec-function-design-audit) → story 设计(spec-story-design) → 代码实现与测试(spec-code-generate) → 资产刷新(spec-update) → 全链路分析报告（specgo-report，归档 docs/1-storys/{功能名}/ story 目录），六步端到端；每步校验环节结束固定过 ask-human 审视门，新生成的文档/代码必须经人审视通过后才进下一步。主代理只做编排与用户确认，各步骤派子代理执行。触发场景包括"specgo"、"端到端开发 xx 功能"、"从需求到交付"、"全流程开发"等。

## 推荐工作流（spec 全链路）

针对一个存量代码仓的完整规格化流程，按序串联；也可单独触发任意一步。

**四域资产治理（arch / biz / tech / qual + 横向 spec，新体系）**

1. **资产骨架初始化（一次性）** → spec-init：初始化 docs/0-{域}/{资产}/ 目录骨架（每类资产一个单独目录），一次性迁移既有产出，迁移映射清单先交用户确认
2. **结构摸底** → arch-structure-model-analyze：UML 包图 + 依赖矩阵 + 分层特征，落盘 docs/0-arch/structure-model/（仓级总览 README.md + 每模块 structure-model-{module}.md）
3. **交互模型提取（默认全部流程，可指定单流程）** → arch-interaction-model-analyze：UML 时序图呈现模块间主业务流程与消息走向，只画主链路，落盘 docs/0-arch/interaction-model/（README.md 流程导航 + interaction-model-{flow}.md）
4. **对外接口盘点** → biz-interface-analyze：按功能域聚类，主文档 README + interface-{feature}.md，落盘 docs/0-biz/interface/
5. **业务规则梳理** → biz-rules-analyze：按需求类整理"条件 → 动作 + 依据"规则条目，README.md 功能域导航 + rules-{feature}.md，落盘 docs/0-biz/rules/
6. **对象模型** → biz-object-model-analyze：实体/值对象/聚合/领域服务/领域事件（UML 类图），README.md 聚合导航 + object-model-{aggregate}.md，落盘 docs/0-biz/object-model/
7. **数据模型** → biz-data-model-analyze：持久态表结构/缓存数据结构/字段关系与数据生命周期（UML-ER），README.md 实体导航 + data-model-{entity}.md，落盘 docs/0-biz/data-model/
8. **领域词典** → biz-lexicon-analyze：业务与代码共用的受控词汇集（术语释义 + 语境边界 + 代码命名映射），主文档 README.md + 每功能域 1 篇 lexicon-{feature}.md，落盘 docs/0-biz/lexicon/
9. **框架使用指导** → tech-framework-guidelines-analyze：基础框架清单与使用方式盘点（纯现状提取），framework-guidelines-{framework}.md 每框架一篇，落盘 docs/0-tech/framework-guidelines/
10. **通信规范** → tech-external-call-guidelines-analyze：RPC/HTTP/MQ 跨服务调用指导（双模式：现状提取 + 差距分析），external-call-guidelines-{service}.md 每外部服务一篇
11. **并发规范** → tech-concurrency-guidelines-analyze：线程池/锁/channel 等并发原语实例的用途定位、使用说明与代码案例（章节上限三节），README.md 实例导航 + concurrency-guidelines-{pool}.md 每实例一篇
12. **数据访问规范** → tech-data-access-guidelines-analyze：Redis/DB 等中间件访问指导，README.md 中间件导航 + data-access-guidelines-{mw}.md 每中间件一篇
13. **韧性规范** → tech-resilience-guidelines-analyze：超时/重试/熔断/异常处理的使用说明与代码案例，README 索引 + resilience-guidelines-{dimension}.md 每维度一篇
14. **基础规范** → tech-basic-mechanism-guidelines-analyze：日志/配置/告警等基础机制的函数调用说明与使用代码案例，README 索引 + basic-mechanism-guidelines-{dimension}.md 每维度一篇
15. **编码规范（门禁）** → qual-code-standards-analyze：命名/注释/函数长度/圈复杂度/安全编码红线/禁止项清单，code-standards.md + report/ 门禁差距报告
16. **DT 规范（门禁）** → qual-dt-guidelines-analyze：测试金字塔与覆盖基线、用例设计、覆盖率门禁，dt-guidelines.md + report/
17. **分支与变更规范** → qual-branch-guidelines-analyze：分支模型、commit/MR 规范、评审要求，branch-guidelines.md
18. **索引生成** → spec-index：各域 README + docs/README.md 总索引 + 服务依赖全景图（Mermaid）
19. **资产刷新（git 变更驱动）** → spec-update：基于 git diff 识别变更对 docs/ 资产的影响，按最新要素定义增量刷新受影响文档，刷新清单人工确认后定稿
20. **一键全量资产分析（编排入口）** → spec-analyze：子代理并行派发全部 16 个 analyze skill（词典第二波复用接口功能域口径），一次性建齐 docs/ 资产，spec-index 收口
21. **需求/功能设计审核** → spec-function-design-audit：多彩建模 + 断点扫描 + ask-human 澄清 + HTML，审核完成后可选输出规范功能设计 md
22. **资产质量审核** → spec-asset-audit：docs/ 四类资产两维度审核（表达质量 + 代码一致性），结论三档，报告归档 docs/report/（README.md 总览 + 每篇一个审核报告，支持单篇更新/增量/全量）

**需求到交付（旧体系保留链路）**

23. **mermaid 图验证** → mermaid-validate：含图产出物必须本地校验全部 VALID 后交付
24. **需求到 story 设计** → spec-story-design：产出 docs/1-storys/{功能名}/ 目录（{功能名}-story.md 八类核心要素组织、标注新增/变更/不涉及 + {功能名}-develop-task.md）
25. **全链路编排（端到端主流程，推荐入口）** → specgo：资产检查/录入 → 需求审核（spec-function-design-audit）→ story 设计 → 代码实现与测试 → 资产刷新（spec-update）→ 全链路分析报告（归档 docs/1-storys/{功能名}/ story 目录），每步校验环节结束固定过 ask-human 审视门；主代理编排与用户确认、各步骤派子代理执行

## 红线（这些想法意味着你正在跳过 skill）

| 想法 | 现实 |
|------|------|
| "我先扫一眼目录" | arch-structure-model-analyze 定义了"怎么扫"，先加载它 |
| "列一下接口就行" | biz-interface-analyze 定义了接口盘点格式，先加载它 |
| "看看调了哪些下游服务" | tech-external-call-guidelines-analyze 定义了跨服务调用规范与盘点格式，先加载它 |
| "业务规则我边读边总结" | biz-rules-analyze 定义了规则条目格式（条件 → 动作 + 依据），先加载它 |
| "表结构/缓存结构我随便列列" | biz-data-model-analyze 定义了数据模型格式，先加载它 |
| "框架用法我直接写" | tech-framework-guidelines-analyze 定义了框架使用指导盘点格式，先加载它 |
| "线程池这么用没问题" | tech-concurrency-guidelines-analyze 定义了并发实例的用途定位与使用案例提取格式，先加载它 |
| "这需求文档我读读就好" | spec-function-design-audit 用来查表述质量与逻辑断点，先加载它 |
| "给我讲讲 XX 流程怎么走的" | arch-interaction-model-analyze 定义了交互模型（时序图）提取格式，先加载它 |
| "这 mermaid 图我直接画/看着没问题" | mermaid-validate 定义了语法红线与本地验证流程，先加载它 |
| "这功能我直接写 story" | spec-story-design 定义了 story 模板，先加载它 |
| "代码写完直接提交" | qual-code-standards-analyze 定义了编码红线与门禁检查，先加载它 |
| "MR 合了，看看文档要不要改" | spec-update 定义了 git 变更驱动的资产刷新流程，先加载它 |
| "把分析 skill 挨个手动跑一遍" | spec-analyze 定义了子代理并行的一键全量分析编排，先加载它 |
| "这批文档质量怎么样" | spec-asset-audit 定义了资产两维度质量审核与结论三档，先加载它 |
| "从需求到交付，一条龙做了" | specgo 定义了六步全链路编排与子代理分工，先加载它 |
| "这个 skill 太重，我快速做" | 如果 skill 存在，就必须用 |
| "我记得这个 skill 的内容" | skill 会演进，每次都要重新加载当前版本 |

## 与项目其他 skill 的关系

本项目 .claude/skills/ 下还有 se-harness、code-generation-quality-loop 等非 spec skill。spec- 系列覆盖"代码仓规格化分析 → story 设计 → 按文档生成代码"链路；code-generation-quality-loop 提供 CodeCheck 全量规则扫描与 DT/E2E 测试闭环，可在 specgo 生成代码后串联。

## 优先级

1. 用户的显式指令（AGENTS.md、直接请求）——最高优先级
2. specgo 的 spec skill——覆盖默认行为
3. 默认 system prompt——最低优先级

如果 AGENTS.md 说"不用 spec 流程"而 specgo 说"必须用"，遵循用户指令。用户始终掌控。
</SPEC_GO_BOOTSTRAP>