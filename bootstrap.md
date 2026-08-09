<SPEC_GO_BOOTSTRAP>
# Specgo — 代码仓规格化分析 skill 体系

<EXTREMELY-IMPORTANT>
你拥有 specgo。在执行任何代码仓分析、需求/设计文档解读、对外接口盘点、出站调用/下游依赖盘点、目录结构梳理、框架使用模式梳理、story 设计、MR 资产刷新、mermaid 图验证、功能端到端开发任务之前——即使你认为只有 1% 的可能某个 spec skill 适用——你也必须先用 Skill 工具加载该 skill 全文并遵循其指引。这不可协商、不可选择、不可用"我先看看代码"为自己开脱。

spec skill 的 description 已包含触发关键词，请用下面的索引判断该调用哪个。
</EXTREMELY-IMPORTANT>

## Skill 索引（用 Skill 工具加载全文）

### 1. all-index
生成被分析仓 docs/ 资产体系的索引层——各域索引 docs/{域}/README.md（列出本域各资产目录及目录内真实文件清单，每文件一句话说明、从文件首行标题提取，无资产的域不生成）+ 总索引 docs/README.md（四域导航表 + 服务依赖全景图：mermaid flowchart，从 docs/tech/comm-guidelines/ 各文档提取本仓→下游服务依赖边；通信规范资产未建时该节注明"通信规范资产未建"）。索引为活文档，同名覆盖更新并标注生成时间；只聚合真实存在的文件、不重述资产正文。当各 analyze skill 跑完需要统一生成/刷新导航、all-init 建骨架或迁移后首次建索引、资产增删后刷新索引、需要下游依赖全景图时使用。触发场景包括"生成索引"、"docs 索引"、"域索引"、"总索引"、"资产导航"、"服务依赖全景图"、"依赖全景图"、"刷新 README 索引"、"刷新索引"、"all-index"等。

### 2. all-init
初始化被分析仓的 docs/ 资产目录骨架（HELP.MD v1.1「每类资产一个单独目录」布局：arch/{structure-model,interaction-model}、biz/{interface,rules,object-model,data-model,lexicon}、tech/{usage,comm-guidelines,concurrency-guidelines,data-access-guidelines,resilience-guidelines,foundation-guidelines}、qual/{code-standards,dt-guidelines,branch-guidelines}），并一次性迁移既有产出到新布局（旧扁平结构模型/交互模型文档、docs/business/interface/、docs/technical/external-call/、docs/technical/framework-usage/ 等历史产出，文件名同步去 spec- 前缀），迁移映射清单先交用户确认再动手，产出迁移执行摘要（已迁移/跳过/冲突清单）。当首次在一个代码仓启用 specgo 资产治理、需要从旧布局升级到 v1.1 新布局时使用。触发场景包括"初始化 docs 目录"、"资产目录骨架"、"docs 骨架"、"迁移旧文档"、"docs 目录迁移"、"旧布局升级"、"all-init"、"初始化资产目录"等。

### 3. arch-interaction-model-analyze
分析存量代码仓业务流程的交互模型（模块间主业务流程、消息走向），产出 UML 时序图（mermaid），落盘被分析仓的 docs/arch/interaction-model/interaction-model-{flow}.md（每业务流程 1 篇）。用户指明流程时只梳理该流程；未指明时默认枚举仓内全部业务流程逐篇产出，不阻塞式询问。只画主链路，分支与异常逻辑不画入图——归业务规则资产承载。当用户提到"交互模型"、"模块交互"、"消息走向"、"时序图"、"调用链"、"梳理 XX 业务流程"、"XX 流程是怎么走的"、"画一下 XX 流程"、"把 XX 流程落成文档"、"梳理全部业务流程"、"interaction model"、"sequence diagram"时使用。务必在生成任何模块交互/流程时序文档之前使用此 skill。

### 4. arch-structure-model-analyze
分析存量代码仓的结构模型（模块划分、分层、职责与依赖关系），产出 UML 包图（mermaid）+ 依赖矩阵，落盘被分析仓的 docs/arch/structure-model/：仓级总览 structure-model.md + 每模块 structure-model-{module}.md。当用户提到"代码仓结构"、"结构模型"、"目录关系"、"模块依赖图"、"画一下项目结构"、"梳理目录关系"、"生成结构文档"、"第一层目录"、"包之间依赖"、"repo structure"、"structure model"、"module relationship"、"项目摸底"、"架构摸底"时使用。即使用户没明说"结构模型"，只要意图是"看清一个代码仓第一层目录之间、或某目录下包与包之间的依赖关系并出图"，都应触发。务必在生成任何代码仓结构文档之前使用此 skill。

### 5. biz-data-model-analyze
分析存量代码仓的数据模型资产（持久态表结构、缓存数据结构、字段关系与数据生命周期），产出 UML-ER 图（mermaid erDiagram）+ 字段表 + 生命周期说明，落盘被分析仓的 docs/biz/data-model/data-model-{entity}.md（每数据实体 1 篇）。用户指明实体时只梳理该实体；未指明时默认全量——扫描建表 SQL（CREATE TABLE）、ORM entity 注册（TableName/RegisterModel）与关键缓存结构体，逐实体产出，不阻塞式询问。逻辑关联无 DB 约束时标注"代码未体现物理外键"。当用户提到"数据模型"、"表结构"、"ER 图"、"数据库设计"、"字段说明"、"数据字典"、"梳理 XX 表"、"数据生命周期"、"缓存数据结构"、"TTL"、"data model"、"ER diagram"、"schema 文档"时使用。务必在生成任何表结构/ER 图/数据字典类文档之前使用此 skill。

### 6. biz-interface-analyze
扫描存量代码仓**对外提供的接口**（服务自己暴露给外部调用的入口：HTTP 路由注册 / RPC service 注册 / 消息订阅 handler / IDL 契约），按功能域聚类，产出**一个主文档 + 多个子文档**：主文档 `README.md` 含接口全景与功能域索引，每个功能域一个子文档 `interface-{feature}.md`，子文档内列接口表格（接口名/作用/所在文件/方法/路径，**所在文件不带行号**），表格下方逐个说明该接口相关的请求与响应数据结构。落盘被分析仓的 `docs/biz/interface/`。当需要盘点代码仓对外提供哪些接口、梳理对外接口清单、为接口治理/接口文档/新人上手提供文档时使用。触发场景包括"代码仓对外提供什么接口""对外接口""外部接口""服务暴露的接口""接口清单""接口盘点""接口文档"等。

### 7. biz-lexicon-analyze
提取存量代码仓的领域词典资产——业务与代码共用的受控词汇集（术语释义、语境边界、代码命名映射），从对外接口文档/请求响应模型、DB 实体注释、事件模型、错误码定义、常量定义五类来源归集术语，按代码功能域划分子域、按业务子域拆分多篇成文：主文档 lexicon.md（说明/全仓待确认清单/子域导航/「通用」节）+ 每功能域 1 篇 lexicon-{子域锚点}.md，落盘被分析仓的 docs/biz/lexicon/。当需要统一业务与代码的术语口径、沉淀受控词汇、梳理同名异义与同义异名、为新人上手/需求评审/AI 编码提供词汇基线时使用。触发场景包括"领域词典"、"术语表"、"词汇表"、"统一语言"、"术语口径"、"名词解释"、"这个业务词在代码里叫什么"、"lexicon"、"glossary"、"ubiquitous language"等。

### 8. biz-object-model-analyze
分析存量代码仓的对象模型（实体、值对象、聚合、领域服务、领域事件），产出 UML 类图（mermaid classDiagram），落盘被分析仓的 docs/biz/object-model/object-model-{aggregate}.md（每聚合 1 篇）。用户指定聚合时只梳理该聚合；未指定时默认全量——扫描模型层与核心 service，按聚合根归集后逐聚合产出，不阻塞式询问。类图只画聚合内结构（关键属性与关联，方法省略）与聚合间引用方向，以代码中的结构体/类为准，禁止把 DB 表字段机械照抄成类图。当用户提到"对象模型"、"领域模型"、"实体"、"值对象"、"聚合"、"聚合根"、"领域服务"、"领域事件"、"类图"、"class diagram"、"object model"、"domain model"、"DDD"、"梳理 XX 聚合"、"画一下领域对象"、"实体建模"时使用。务必在生成任何领域对象/实体类图文档之前使用此 skill。

### 9. biz-rules-analyze
从存量代码仓提取业务规则资产——条件分支/参数校验/状态迁移/阈值常量/错误码/事务回滚等规则点，按需求类（功能域）整理"条件 → 动作 + 依据"规则条目表格，产出 rules-{feature}.md（每需求类 1 篇），落盘被分析仓的 docs/biz/rules/。用户指明功能域时只提取该域；未指明时默认以对外入口注册点（HTTP 路由/消息订阅/定时任务/IDL 契约）归集全部功能域逐域产出，不阻塞式询问。与交互模型互补：交互模型只画主链路，分支与异常逻辑归本资产承载。当用户提到"业务规则"、"规则提取"、"分支逻辑"、"校验规则"、"状态迁移"、"状态机"、"错误码规则"、"阈值"、"梳理 XX 的规则"、"XX 流程有哪些分支"、"XX 流程的异常处理"、"规则文档"、"business rules"时使用。务必在生成任何业务规则文档之前使用此 skill。

### 10. qual-branch-guidelines-analyze
治理存量代码仓的分支与变更规范资产（分支模型、commit/MR 规范、评审要求），双模式运行——起草模式从 git 历史提取现状（git branch -a 采样归纳分支命名形态、merge commit / squash / rebase 证据判定 merge 策略、git log 采样归纳 commit message 类型前缀/语言/长度分布、MR 评审痕迹），归纳现状后起草规范文档（现状描述与应有约定分节，约定标注「建议，待团队确认」）；差距分析模式对照规范检查近期 N 个 commit/分支的差距。产出落盘被分析仓的 docs/qual/branch-guidelines/：仓级单篇 branch-guidelines.md（活文档，同名覆盖更新）；差距报告落盘 docs/qual/branch-guidelines/report/{YYYYMMDD}-branch-guidelines.md（次抛，带日期）。当用户提到"分支规范"、"分支模型"、"分支命名规范"、"git flow"、"commit 规范"、"commit message 规范"、"MR 规范"、"合并请求规范"、"评审要求"、"merge 策略"、"squash merge"、"rebase 还是 merge"、"branch guidelines"、"分支规范差距分析"、"对照分支规范检查"时使用。

### 11. qual-code-standards-analyze
治理存量代码仓的编码规范资产（命名、注释、函数长度/圈复杂度、安全编码红线、禁止项清单，每条规则标注可否机器检查），双模式运行——起草模式在仓内无规范时以内置规则底稿（27 条通用 clean code 规则 + 安全附加项 S1~S3 + Go/Java/Python/C++ 语言特则）为基础、结合仓内代码现状裁剪生成仓级单篇 code-standards.md；差距分析模式对照既有规范扫描代码差距，产出带日期的差距报告。规则分两级：红线（必须，违反即拦截，CI 门禁判定依据）与建议（应该，违反仅出报告）。产出落盘被分析仓的 docs/qual/code-standards/：规范文档 code-standards.md（活文档，同名覆盖）；差距报告落盘 docs/qual/code-standards/report/{YYYYMMDD}-code-standards.md，红线违反单独成节供 CI 解析拦截，建议级差距另列一节。当用户提到"编码规范"、"代码规范"、"clean code 规范"、"命名规范"、"函数长度限制"、"圈复杂度"、"安全编码红线"、"禁止项清单"、"代码风格规范"、"编码规范差距分析"、"对照编码规范检查"、"CI 门禁规则"、"code standards"、"coding guidelines 红线"时使用。

### 12. qual-dt-guidelines-analyze
治理存量代码仓的 DT 规范资产（开发者测试规范：测试金字塔与覆盖基线、用例设计方法（等价类/边界值）、自测报告要求、新增代码覆盖率门禁），双模式运行——起草模式盘点仓内测试现状（测试文件分布：单测/集成/E2E，测试框架、Mock 工具、覆盖率工具与当前覆盖率，CI 测试关卡）并据此起草规范，新增代码覆盖率门禁线从现状实测给建议值并标注"建议值，待团队确认"；差距分析模式对照规范扫描差距（重点：新增代码无测试、覆盖率低于门禁线），覆盖率红线违反单独成节供 CI 门禁。产出落盘被分析仓的 docs/qual/dt-guidelines/dt-guidelines.md（仓级单篇活文档）；差距报告落盘 docs/qual/dt-guidelines/report/{YYYYMMDD}-dt-guidelines.md。当用户提到"DT 规范"、"开发者测试规范"、"测试金字塔"、"覆盖率基线"、"新增代码覆盖率门禁"、"覆盖率门禁线"、"用例设计方法"、"等价类"、"边界值"、"自测报告"、"测试现状盘点"、"单元测试覆盖率"、"DT guidelines"、"测试覆盖率差距分析"、"对照 DT 规范检查"时使用。

### 13. spec-asset-refresh
基于 MR（merge request / 分支 diff）识别当前需求给代码仓规格化资产带来的变化，并增量刷新七类资产文档——接口（docs/biz/interface/）、框架使用（docs/tech/usage/）、外部接口调用（docs/tech/comm-guidelines/）、结构模型（docs/arch/structure-model/）、关键类（docs/business/key-class/）、关键数据结构（docs/business/data-structure/）、feature 文档（docs/business/story/），刷新内容逐类列出交人工审核确认后定稿。当 MR 合入前后需要评估"这个需求改了哪些文档资产""刷新 docs/ 下哪些文档""MR 影响分析""资产同步"时使用。触发场景包括"基于 MR 刷新资产""需求带来哪些资产变化""MR 改了哪些文档""资产文档同步""刷新接口/框架/feature 文档"等。

### 14. spec-code-check
在需求代码实现完成后、资产刷新（spec-asset-refresh）前，基于需求 commit 对新增/修改代码做 clean code 逐项检查（内置 27 条通用规则 + Go/Java/Python/C++ 语言特则，用户给定外部规范文档时以用户文档为准），并同步分析本次需求引入的架构变更（新增组件/既有织入/依赖/数据表/资产同步状态），产出**一篇代码检查文档**归档到 `docs/engineering/code-check/{需求名}代码检查.md`——章节固定为：一、架构变更检查（含颜色区分新增/织入组件的 mermaid 图）→ 二、Clean Code 逐项检查（合规项/提示豁免项/修改文件专项检查）→ 三、结论与验证。当需要"检查这个需求的代码整洁""clean code 检查""代码检查文档""需求代码评审""架构变更说明""这个 commit 改了哪些架构"时使用。触发场景包括"按规范检查代码""输出代码检查文档""检查新代码 clean code""需求实现后架构变了什么""资产刷新前先做代码检查"等。

### 15. spec-data-structure-analyze
分析存量代码仓中的关键数据结构（缓存、注册表、会话池、任务队列、连接池、自定义容器等），按**用途**分组，产出**一个主文档 + 多个子文档**：主文档 `README.md` 含用途索引导航表，每个用途一个子文档 `spec-data-structure-<用途名>.md`，说明该用途数据结构的核心作用、关键实例表（实例名/作用/定义位置）、实例详解与使用模式，归档到 `docs/business/data-structure/`。当需要盘点代码仓用了哪些关键数据结构、梳理数据结构的作用与定位、识别自定义容器/缓存/队列等核心数据载体、为重构/迁移/新人上手/AI 编码沉淀数据结构资产时使用。触发场景包括"关键数据结构""数据结构盘点""用了哪些容器""缓存结构""自定义数据结构""队列/链表/集合"等。

### 16. spec-feature-analyze
基于存量代码仓对外提供的接口（HTTP 路由 / RPC service / 消息订阅 handler / IDL 契约）做业务功能分析，将同一业务的多个接口归纳为一个功能域，按 docs/business/story/ 既有功能文档格式（功能故事多彩建模 + 实现方案 + 接口清单 + 关键数据结构 + 调用关系 + 外部文档引用，共六节）每个功能域产出一篇 feature-<功能名>.md。支持指定接口类型只分析某一类接口（IDL 契约 / 框架路由 / 消息订阅定时），默认全代码仓全类型分析。当需要盘点代码仓对外提供哪些接口、按业务功能归纳接口、为接口治理/新人上手/AI 编码沉淀功能文档时使用。触发场景包括"代码仓对外提供什么接口""对外接口盘点""接口按业务功能分组""只分析 HTTP 接口""生成 story 功能文档"等。

### 17. spec-key-class-analyze
分析存量代码仓中的关键类（核心领域模型、入口 handler、核心服务/编排类、状态机、高被引用类），产出单一 README 清单（仅一个表：类名/类的职责，职责 38 字内描述清楚），归档到代码仓 docs/business/key-class/README.md。当需要盘点代码仓核心类、梳理关键类清单、理解核心实现、为新人上手/AI 编码沉淀关键类资产时使用。触发场景包括"关键类""核心类""重要类有哪些""类盘点""核心实现类""关键类定位""key class""core class"等。

### 18. spec-logic-audit
基于多彩建模方法论审核 Spec/需求/功能设计文档的完备性——表述质量扫描（句子成分残缺/弱表述/术语失范/语义多解）+ 业务逻辑断裂点（多彩建模）+ 设计要素（时序图呈现、功能验收用例、外部接口与跨服务调用接口信息），三类问题一次扫描、统一 ask-human 澄清补齐，建模结果以 HTML 可视化呈现，审核完成后可按功能设计模板输出规范 md。当用户需要解读一篇 Spec/需求/设计文档、检查业务逻辑断点或设计要素是否 ready、校验功能设计文档是否规范时使用。触发场景包括："审核 spec 业务逻辑完备性"、"多彩建模"、"检查需求逻辑断点"、"需求表述质量检查"、"需求歧义扫描"、"建模结果生成 HTML 并找人确认"、"功能设计文档校验"、"校验时序图/验收用例/接口是否齐全"等。

### 19. spec-mermaid-diagram
指导如何编写可被正确渲染的 mermaid 图，并在本地验证渲染结果。当用户提到"mermaid"、"画图"、"流程图"、"时序图"、"架构图"、"依赖图"、"图渲染失败"、"图渲染不出来"、"验证 mermaid"、"mermaid 报错"时使用；任何产出物（文档/HTML）中包含 ```mermaid 代码块时，必须用本 skill 的验证流程确认每张图可被解析渲染后才能宣称完成。

### 20. spec-story-design
当接收到需求设计文档（SR/特性设计），需要为存量代码仓产出新功能的 story 设计文档，且产出格式须与该仓 docs/business/story/ 下既有功能文档（功能故事多彩建模 + 实现方案 + 接口清单 + 关键数据结构 + 调用关系 + 外部文档引用，共六节）保持一致时使用。触发场景包括"新增 story 设计"、"根据需求文档生成 story 设计"、"按 story 模板输出新功能设计"等。

### 21. tech-comm-guidelines-analyze
治理存量代码仓的通信规范资产（RPC/HTTP/MQ 等跨服务调用指导：本服务调用了哪些外部服务、协议与封装方式、超时重试与错误码处理），双模式运行——提取模式扫描仓内全部出站调用（HTTP 客户端 / RPC client / IDL client stub / 消息队列生产端 / 进程间通信 / 平台 SDK），按被调外部服务归类成文；差距分析模式对照既有通信规范文档核查实际调用的合规差距。产出落盘被分析仓的 docs/tech/comm-guidelines/：README 索引 + 每外部服务一篇 comm-guidelines-{service}.md；差距报告落盘 docs/tech/comm-guidelines/report/{YYYYMMDD}-comm-guidelines.md。当用户提到"通信规范"、"外部调用"、"下游接口"、"出站调用"、"调用了哪些外部服务"、"服务依赖盘点"、"跨服务调用指导"、"调用规范差距分析"、"对照通信规范检查"、"external call"、"comm guidelines"时使用。

### 22. tech-concurrency-guidelines-analyze
治理存量代码仓的并发规范资产（线程池选型、池间隔离、容量/队列配置、拒绝策略——仓内有哪些线程池与并发原语、每个池怎么用、是否符合既定并发规范），双模式运行——起草模式（仓内无规范时）盘点仓内并发原语（线程池/ExecutorService、goroutine 启动点、锁 Mutex/RWMutex、channel、Actor 模型、定时任务并发），按池/原语实例归集成文，每篇含用途定位、容量/队列/拒绝策略现状、线程模型图（可选 mermaid）与应有约定建议（严格区分"建议"与"代码现状"）；差距分析模式（仓内已有规范或用户给定规范文档时）对照规范逐项核查实际并发用法的合规差距。产出落盘被分析仓的 docs/tech/concurrency-guidelines/：每线程池/原语实例一篇 concurrency-guidelines-{pool}.md；差距报告落盘 docs/tech/concurrency-guidelines/report/{YYYYMMDD}-concurrency-guidelines.md。当用户提到"并发规范"、"线程池"、"线程池选型"、"池隔离"、"拒绝策略"、"并发原语盘点"、"goroutine 启动点"、"锁使用"、"channel"、"Actor"、"定时任务并发"、"concurrency guidelines"、"thread pool"时使用。

### 23. tech-data-access-guidelines-analyze
治理存量代码仓的数据访问规范资产（Redis/DB 等数据访问中间件的访问指导：连接与客户端管理、事务使用、分页与批量、SQL 拼接与注入防护、缓存读写模式、错误处理），双模式运行——起草模式识别仓内数据访问中间件（关系库/ORM、Redis、本地嵌入式存储、对象存储、文件系统等），逐中间件盘点访问方式并起草规范（用途定位 + 访问点分布表 + 现状描述与应有约定）；差距分析模式对照既有规范扫描实际访问的合规差距。产出落盘被分析仓的 docs/tech/data-access-guidelines/：每中间件一篇 data-access-guidelines-{mw}.md；差距报告落盘 docs/tech/data-access-guidelines/report/{YYYYMMDD}-data-access-guidelines.md。当用户提到"数据访问规范"、"Redis 使用规范"、"DB 访问指导"、"数据库访问规范"、"缓存读写模式"、"缓存穿透"、"SQL 注入防护"、"事务使用盘点"、"ORM 怎么用"、"data access guidelines"、"数据访问差距分析"、"对照数据访问规范检查"时使用。

### 24. tech-foundation-guidelines-analyze
治理存量代码仓的基础规范资产（日志/配置/告警等横切编码机制的编码指导：日志级别使用/敏感信息脱敏/审计日志、配置读取方式/默认值处理/环境变量、告警 ID 使用/上报与恢复配对），双模式运行——起草模式盘点仓内基础编码机制使用现状，每机制一节（使用模式、调用点分布、应有约定建议）产出仓级单篇 foundation-guidelines.md；差距分析模式对照既有基础规范逐机制逐条目核查合规差距。产出落盘被分析仓的 docs/tech/foundation-guidelines/foundation-guidelines.md；差距报告落盘 docs/tech/foundation-guidelines/report/{YYYYMMDD}-foundation-guidelines.md。当用户提到"基础规范"、"日志规范"、"日志级别使用"、"敏感信息脱敏"、"审计日志"、"配置规范"、"配置读取方式"、"默认值处理"、"环境变量"、"告警规范"、"告警 ID"、"告警上报与恢复配对"、"对照基础规范检查"、"编码指导"、"foundation guidelines"时使用。

### 25. tech-resilience-guidelines-analyze
治理存量代码仓的韧性规范资产（超时/重试/熔断降级/异常处理等故障策略——只管故障来了怎么扛，不管通信协议本身，协议与封装归通信规范），双模式运行——起草模式扫描仓内全部出站调用点与后台任务的故障策略现状（超时值与位置、重试次数/间隔/退避、熔断降级、panic/recover、错误 swallowing），按策略分节汇总成规范文档（每策略一节：现状调用点分布表 + 证据文件路径 + 应有约定建议）；差距分析模式对照既有韧性规范逐项核查差距。产出落盘被分析仓的 docs/tech/resilience-guidelines/：仓级单篇 resilience-guidelines.md（活文档，同名覆盖更新）；差距报告落盘 docs/tech/resilience-guidelines/report/{YYYYMMDD}-resilience-guidelines.md（次抛，带日期）。当用户提到"韧性规范"、"超时设置"、"重试策略"、"熔断降级"、"故障策略"、"异常处理规范"、"panic recover"、"错误吞掉"、"吞错"、"错误 swallowing"、"错误被忽略"、"容错"、"稳定性治理"、"韧性差距分析"、"对照韧性规范检查"、"resilience"时使用。

### 26. tech-usage-analyze
分析存量代码仓中的基础框架（RPC、线程池、Actor、日志、序列化、配置、依赖注入、存储/ORM、消息队列、调度、资源池、容错治理、监控、基础库、测试框架等）及其使用方式，提取"框架使用现状"资产（基础框架清单与使用方式盘点，纯现状、无规范文档），落盘被分析仓的 docs/tech/usage/：索引 README.md + 每框架一篇 usage-{framework}.md（含用途定位、使用模式）。当需要盘点代码仓技术栈、梳理框架使用模式与调用点分布、为 AI 代码生成沉淀"框架使用知识"、或为重构/迁移/新人上手提供框架使用文档时使用。触发场景包括"框架使用现状"、"技术栈盘点"、"框架使用"、"用了哪些框架"、"XX 框架怎么用"、"线程池怎么用"、"RPC 怎么调的"、"framework usage"、"tech stack"等。

### 27. specgo
规格化全链路主流程编排 skill——资产检查/录入 → 需求审核(spec-logic-audit) → story 设计(spec-story-design) → 代码实现与测试 → 代码检查(spec-code-check) → 资产维护(spec-asset-refresh)，六步端到端。主代理只做编排与用户确认，各步骤派子代理执行。触发场景包括"specgo"、"端到端开发 xx 功能"、"从需求到交付"、"全流程开发"等。

## 推荐工作流（spec 全链路）

针对一个存量代码仓的完整规格化流程，按序串联；也可单独触发任意一步。

**四域资产治理（arch / biz / tech / qual + 横向 all，新体系）**

1. **资产骨架初始化（一次性）** → all-init：初始化 docs/{域}/{资产}/ 目录骨架（每类资产一个单独目录），一次性迁移既有产出，迁移映射清单先交用户确认
2. **结构摸底** → arch-structure-model-analyze：UML 包图 + 依赖矩阵 + 分层特征，落盘 docs/arch/structure-model/（仓级总览 structure-model.md + 每模块 structure-model-{module}.md）
3. **交互模型提取（默认全部流程，可指定单流程）** → arch-interaction-model-analyze：UML 时序图呈现模块间主业务流程与消息走向，只画主链路，落盘 docs/arch/interaction-model/interaction-model-{flow}.md
4. **对外接口盘点** → biz-interface-analyze：按功能域聚类，主文档 README + interface-{feature}.md，落盘 docs/biz/interface/
5. **业务规则梳理** → biz-rules-analyze：按需求类整理"条件 → 动作 + 依据"规则条目，rules-{feature}.md，落盘 docs/biz/rules/
6. **对象模型** → biz-object-model-analyze：实体/值对象/聚合/领域服务/领域事件（UML 类图），object-model-{aggregate}.md，落盘 docs/biz/object-model/
7. **数据模型** → biz-data-model-analyze：持久态表结构/缓存数据结构/字段关系与数据生命周期（UML-ER），data-model-{entity}.md，落盘 docs/biz/data-model/
8. **领域词典** → biz-lexicon-analyze：业务与代码共用的受控词汇集（术语释义 + 语境边界 + 代码命名映射），lexicon.md 全仓一篇，落盘 docs/biz/lexicon/
9. **框架使用现状** → tech-usage-analyze：基础框架清单与使用方式盘点（纯现状提取），usage-{framework}.md 每框架一篇，落盘 docs/tech/usage/
10. **通信规范** → tech-comm-guidelines-analyze：RPC/HTTP/MQ 跨服务调用指导（双模式：现状提取 + 差距分析），comm-guidelines-{service}.md 每外部服务一篇
11. **并发规范** → tech-concurrency-guidelines-analyze：线程池选型/隔离/拒绝策略，concurrency-guidelines-{pool}.md 每线程池一篇
12. **数据访问规范** → tech-data-access-guidelines-analyze：Redis/DB 等中间件访问指导，data-access-guidelines-{mw}.md 每中间件一篇
13. **韧性规范** → tech-resilience-guidelines-analyze：超时/重试/熔断/异常处理，resilience-guidelines.md 仓级单篇
14. **基础规范** → tech-foundation-guidelines-analyze：日志/配置/告警等编码指导，foundation-guidelines.md 仓级单篇
15. **编码规范（门禁）** → qual-code-standards-analyze：命名/注释/函数长度/圈复杂度/安全编码红线/禁止项清单，code-standards.md + report/ 门禁差距报告
16. **DT 规范（门禁）** → qual-dt-guidelines-analyze：测试金字塔与覆盖基线、用例设计、覆盖率门禁，dt-guidelines.md + report/
17. **分支与变更规范** → qual-branch-guidelines-analyze：分支模型、commit/MR 规范、评审要求，branch-guidelines.md
18. **索引生成** → all-index：各域 README + docs/README.md 总索引 + 服务依赖全景图（Mermaid）

**需求到交付（旧体系保留链路）**

19. **需求文档逻辑审核** → spec-logic-audit：表述质量扫描 + 多彩建模 + HTML 可视化 + ask-human 补逻辑断点
20. **mermaid 图验证** → spec-mermaid-diagram：含图产出物必须本地校验全部 VALID 后交付
21. **需求到 story 设计** → spec-story-design：产出与 docs/business/story/ 同构的新功能设计文档
22. **代码检查（资产刷新前质量闸门）** → spec-code-check：需求 commit 增量 clean code 检查（内置 27 条+语言特则）+ 架构变更分析，报告问题并询问是否修复，产出 docs/engineering/code-check/ 检查文档
23. **MR 后资产刷新** → spec-asset-refresh：基于 MR diff 识别资产变化，增量刷新 + 人工审核
24. **全链路编排（端到端主流程，推荐入口）** → specgo：资产检查/录入 → 需求审核 → story 设计 → 代码实现与测试 → 代码检查 → 资产维护，主代理编排与用户确认、各步骤派子代理执行

## 红线（这些想法意味着你正在跳过 skill）

| 想法 | 现实 |
|------|------|
| "我先扫一眼目录" | arch-structure-model-analyze 定义了"怎么扫"，先加载它 |
| "列一下接口就行" | biz-interface-analyze 定义了接口盘点格式，先加载它 |
| "看看调了哪些下游服务" | tech-comm-guidelines-analyze 定义了跨服务调用规范与盘点格式，先加载它 |
| "业务规则我边读边总结" | biz-rules-analyze 定义了规则条目格式（条件 → 动作 + 依据），先加载它 |
| "表结构/缓存结构我随便列列" | biz-data-model-analyze 定义了数据模型格式，先加载它 |
| "框架用法我直接写" | tech-usage-analyze 定义了框架使用现状盘点格式，先加载它 |
| "线程池这么用没问题" | tech-concurrency-guidelines-analyze 定义了并发规范差距分析，先加载它 |
| "核心类我挑几个讲讲" | spec-key-class-analyze 定义了关键类识别与清单格式，先加载它 |
| "这需求文档我读读就好" | spec-logic-audit 用来查表述质量与逻辑断点，先加载它 |
| "给我讲讲 XX 流程怎么走的" | arch-interaction-model-analyze 定义了交互模型（时序图）提取格式，先加载它 |
| "这 mermaid 图我直接画/看着没问题" | spec-mermaid-diagram 定义了语法红线与本地验证流程，先加载它 |
| "这功能我直接写 story" | spec-story-design 定义了 story 模板，先加载它 |
| "代码写完直接提交" | qual-code-standards-analyze 定义了编码红线与门禁检查，先加载它 |
| "MR 合了，看看文档要不要改" | spec-asset-refresh 定义了 MR 驱动的资产刷新流程，先加载它 |
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