<SPEC_GO_BOOTSTRAP>
# Specgo — 代码仓规格化分析 skill 体系

<EXTREMELY-IMPORTANT>
你拥有 specgo。在执行任何代码仓分析、需求/设计文档解读、对外接口盘点、出站调用/下游依赖盘点、目录结构梳理、框架使用模式梳理、story 设计、MR 资产刷新、mermaid 图验证、按 story 设计文档生成代码任务之前——即使你认为只有 1% 的可能某个 spec skill 适用——你也必须先用 Skill 工具加载该 skill 全文并遵循其指引。这不可协商、不可选择、不可用"我先看看代码"为自己开脱。

spec skill 的 description 已包含触发关键词，请用下面的索引判断该调用哪个。
</EXTREMELY-IMPORTANT>

## Skill 索引（用 Skill 工具加载全文）

### 1. spec-structure-analyze
分析任意代码仓或指定目录的结构并生成结构文档（mermaid 依赖图 + 模块说明表）。当用户提到"代码仓结构"、"目录关系"、"模块依赖图"、"画一下项目结构"、"梳理目录关系"、"生成结构文档"、"第一层目录"、"包之间依赖"、"repo structure"、"module relationship"、"项目摸底"时使用。即使用户没明说"结构文档"，只要意图是"看清一个代码仓第一层目录之间、或某目录下包与包之间的依赖关系并出图"，都应触发。务必在生成任何代码仓结构文档之前使用此 skill。

### 2. spec-interface-analyze
扫描存量代码仓**对外提供的接口**（服务自己暴露给外部调用的入口：HTTP 路由注册 / RPC service 注册 / 消息订阅 handler / IDL 契约），按功能分组，产出**一个主文档 + 多个子文档**：主文档 `README.md` 含接口全景图与功能域索引，每个功能域一个子文档 `spec-interface-<功能名>.md`，子文档下列接口表格（接口名/作用/所在文件/方法/路径，**所在文件不带行号**），表格下方逐个说明该接口相关的请求与响应数据结构。归档到 `docs/interface/`。当需要盘点代码仓对外提供哪些接口、梳理对外接口清单、为接口治理/接口文档/新人上手提供文档时使用。触发场景包括"代码仓对外提供什么接口""对外接口""外部接口""服务暴露的接口""接口清单""接口盘点""接口文档"等。

### 3. spec-external-call-analyze
扫描存量代码仓对外部服务的全部出站调用（HTTP 客户端 / RPC client / IDL client stub / 消息队列生产端 / 进程间通信 / 平台 SDK），按被调用的外部服务维度归类，产出 README 索引 + 每个外部服务一个子文档 external-call-<服务名>.md，每个外部调用接口一个章节（业务场景、接口功能、调用位置、协议信息），归档到代码仓 docs/external-call/ 目录。当需要盘点代码仓依赖哪些下游服务、梳理出站调用清单、做依赖治理/影响分析/新人上手时使用。触发场景包括"外部调用""下游接口""出站调用""调用了哪些外部服务""服务依赖盘点""external call""进程间通信"等。

### 4. spec-feature-analyze
基于存量代码仓对外提供的接口（HTTP 路由 / RPC service / 消息订阅 handler / IDL 契约）做业务功能分析，将同一业务的多个接口归纳为一个功能域，按 docs/story/ 既有功能文档格式（L1 多彩建模 + L2 结构地图 + L3 AI 编码指南 + 外部文档引用章节）每个功能域产出一篇 feature-<功能名>.md。支持指定接口类型只分析某一类接口（IDL 契约 / 框架路由 / 消息订阅定时），默认全代码仓全类型分析。当需要盘点代码仓对外提供哪些接口、按业务功能归纳接口、为接口治理/新人上手/AI 编码沉淀功能文档时使用。触发场景包括"代码仓对外提供什么接口""对外接口盘点""接口按业务功能分组""只分析 HTTP 接口""生成 story 功能文档"等。

### 5. spec-key-class-analyze
分析存量代码仓中的关键类（核心领域模型、入口 handler、核心服务/编排类、状态机、高被引用类），产出单一 README 清单（仅一个表：类名/类的职责，职责 38 字内描述清楚），归档到代码仓 docs/key-class/README.md。当需要盘点代码仓核心类、梳理关键类清单、理解核心实现、为新人上手/AI 编码沉淀关键类资产时使用。触发场景包括"关键类""核心类""重要类有哪些""类盘点""核心实现类""关键类定位""key class""core class"等。

### 6. spec-data-structure-analyze
分析存量代码仓中的关键数据结构（数组、列表/切片、map、集合、链表、队列、栈、树、环形缓冲、自定义容器等），按数据结构类型分组，产出**一个主文档 + 多个子文档**：主文档 `README.md` 含数据结构全景图与类型索引，每个类型一个子文档 `spec-data-structure-<类型名>.md`，说明该类型在仓内的作用与定位、关键实例表（实例名/作用/定义位置）、使用模式与 AI 编码指南，归档到 `docs/data-structure/`。当需要盘点代码仓用了哪些关键数据结构、梳理数据结构的作用与定位、识别自定义容器/缓存/队列等核心数据载体、为重构/迁移/新人上手/AI 编码沉淀数据结构资产时使用。触发场景包括"关键数据结构""数据结构盘点""用了哪些容器""map 用法""自定义数据结构""缓存结构""队列/链表/集合"等。

### 7. spec-framework-usage-analyze
分析存量代码仓中的基础框架（RPC、线程池、Actor、日志、序列化、配置、依赖注入、存储/ORM、消息队列、调度、资源池、容错治理、监控、基础库、测试框架等）及其使用方式，按部件维度产出框架使用指导——每个框架一篇 md（含初始化与配置、典型使用模式、封装层与扩展点、约定规范、AI 编码指南），统一归档到代码仓 docs/framework-usage/ 目录并附索引 README。当需要盘点代码仓技术栈、梳理框架使用模式与调用点分布、为 AI 代码生成沉淀"框架使用知识"、或为重构/迁移/新人上手提供框架使用文档时使用。

### 8. spec-logic-audit
基于多彩建模方法论审核 Spec/需求/功能设计文档的完备性——业务逻辑断裂点（多彩建模）+ 设计要素（时序图呈现、功能验收用例、外部接口与跨服务调用接口信息），针对缺口 ask-human 补齐，建模结果以 HTML 可视化呈现，审核完成后可按功能实现设计模板输出规范 md。当用户需要解读一篇 Spec/需求/设计文档、检查业务逻辑断点或设计要素是否 ready、校验功能设计文档是否规范时使用。触发场景包括："审核 spec 业务逻辑完备性"、"多彩建模"、"检查需求逻辑断点"、"建模结果生成 HTML 并找人确认"、"功能设计文档校验"、"校验时序图/验收用例/接口是否齐全"等。

### 9. spec-mermaid-diagram
指导如何编写可被正确渲染的 mermaid 图，并在本地验证渲染结果。当用户提到"mermaid"、"画图"、"流程图"、"时序图"、"架构图"、"依赖图"、"图渲染失败"、"图渲染不出来"、"验证 mermaid"、"mermaid 报错"时使用；任何产出物（文档/HTML）中包含 ```mermaid 代码块时，必须用本 skill 的验证流程确认每张图可被解析渲染后才能宣称完成。

### 10. spec-story-design
当接收到需求设计文档（SR/特性设计），需要为存量代码仓产出新功能的 story 设计文档，且产出格式须与该仓 docs/story/ 下既有功能文档（L1 多彩建模 + L2 结构地图 + L3 AI 编码指南 + 外部文档引用章节）保持一致时使用。触发场景包括"新增 story 设计"、"根据需求文档生成 story 设计"、"按 story 模板输出新功能设计"等。

### 11. spec-asset-refresh
基于 MR（merge request / 分支 diff）识别当前需求给代码仓规格化资产带来的变化，并增量刷新七类资产文档——接口（docs/interface/）、框架使用（docs/framework-usage/）、外部接口调用（docs/external-call/）、包的架构关系（docs/structure/）、关键类（docs/key-class/）、关键数据结构（docs/data-structure/）、feature 文档（docs/story/），刷新内容逐类列出交人工审核确认后定稿。当 MR 合入前后需要评估"这个需求改了哪些文档资产""刷新 docs/ 下哪些文档""MR 影响分析""资产同步"时使用。触发场景包括"基于 MR 刷新资产""需求带来哪些资产变化""MR 改了哪些文档""资产文档同步""刷新接口/框架/feature 文档"等。

### 12. specgo
当需要依据 docs/story/ 下的 story 设计文档（feature-<功能名>.md）为代码仓生成实现代码时使用。触发场景包括"specgo"、"按 story 设计文档生成代码"、"根据 feature-xxx 生成代码"、"按设计文档实现 xx 功能"、"生成 xx 功能的代码"、"照文档编码"等。

## 推荐工作流（spec 全链路）

针对一个存量代码仓的完整规格化流程，按序串联；也可单独触发任意一步。

1. **结构摸底** → spec-structure-analyze：mermaid 依赖图 + 模块说明表
2. **对外接口盘点** → spec-interface-analyze：主文档 README + 功能域子文档
3. **出站调用盘点** → spec-external-call-analyze：README 索引 + external-call-*.md（按下游服务归类）
4. **接口归纳为功能域** → spec-feature-analyze：feature-*.md（L1 多彩建模 + L2 结构地图 + L3 AI 编码指南 + 外部文档引用）
5. **关键类剖析** → spec-key-class-analyze：docs/key-class/README.md 单文件单表（类名/类的职责，职责 38 字内）
6. **关键数据结构** → spec-data-structure-analyze：README + 按类型分篇，归档 docs/data-structure/
7. **框架使用模式** → spec-framework-usage-analyze：每框架一篇使用指导，归档 docs/framework-usage/
8. **需求文档逻辑审核** → spec-logic-audit：多彩建模 + HTML 可视化 + ask-human 补逻辑断点
9. **mermaid 图验证** → spec-mermaid-diagram：含图产出物必须本地校验全部 VALID 后交付
10. **需求到 story 设计** → spec-story-design：产出与 docs/story/ 同构的新功能设计文档
11. **MR 后资产刷新** → spec-asset-refresh：基于 MR diff 识别七类资产变化，增量刷新 + 人工审核
12. **文档到代码** → specgo：只读 story 设计文档 + 关联 develop-task 任务文档 + 被引用文档，直接生成代码

## 红线（这些想法意味着你正在跳过 skill）

| 想法 | 现实 |
|------|------|
| "我先扫一眼目录" | spec-structure-analyze 定义了"怎么扫"，先加载它 |
| "列一下接口就行" | spec-interface-analyze 定义了接口盘点格式，先加载它 |
| "看看调了哪些下游服务" | spec-external-call-analyze 定义了出站调用盘点格式，先加载它 |
| "核心类我挑几个讲讲" | spec-key-class-analyze 定义了关键类识别与清单格式，先加载它 |
| "数据结构我随便列列" | spec-data-structure-analyze 定义了关键数据结构识别与分组格式，先加载它 |
| "这需求文档我读读就好" | spec-logic-audit 用来查逻辑断点，先加载它 |
| "这 mermaid 图我直接画/看着没问题" | spec-mermaid-diagram 定义了语法红线与本地验证流程，先加载它 |
| "这功能我直接写 story" | spec-story-design 定义了 story 模板，先加载它 |
| "MR 合了，看看文档要不要改" | spec-asset-refresh 定义了 MR 驱动的资产刷新流程，先加载它 |
| "设计文档有了，我直接写代码" | specgo 定义了按 story + develop-task 文档生成代码的加载与编码纪律，先加载它 |
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