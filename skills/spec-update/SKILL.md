---
name: spec-update
description: >-
  基于 git 变更（工作区未提交改动 / 指定 commit / 分支或 MR diff）识别代码原始内容变化，结合新增代码审视 docs/ 资产体系中对应文档是否需要刷新，并按最新要素定义（arch/biz/tech/qual 各 analyze 子流程的目录布局、文件命名、模板骨架、组织规则）增量刷新受影响文档——变更文件映射到资产要素、逐资产判定影响（受影响 / 不受影响 / 资产未建），刷新清单先交人工确认再动笔定稿。当代码提交或 MR 合入后需要评估"这次变更要更新哪些 docs 文档""资产是否过期""按最新定义同步文档"时使用。触发场景包括"spec-update"、"资产刷新"、"刷新 docs"、"代码改了哪些文档要更新"、"变更影响分析"、"文档同步"、"docs 与代码不同步"、"MR 后刷新文档"、"git diff 刷新资产"等。
---

# 资产刷新（spec-update）——git 变更驱动的 docs 资产同步

**交互双模式（全局条款）**：本 skill 所有询问点（含第 3 步刷新清单确认门）**默认使用 ask-human 工具**；若任务开始时用户声明"以报告形式呈现"（或同类意思），则全程**不使用 ask-human**——刷新清单等待确认内容以报告形式输出，等用户回复后继续。

## 目的

代码随 commit / MR 演进，docs/ 资产不同步就会变成误导。本 skill 以 git 对比为输入，回答两个问题：

1. 这次代码变更波及 docs/ 下哪些资产文档？
2. 每篇受影响文档按**最新要素定义**应刷成什么样？

产出：受影响的 docs/ 文档就地刷新（同名覆盖），未波及文档一字不动。

**定位**：各 analyze skill 负责"从零生成 / 全量重刷"某一类资产；spec-update 负责"变更驱动的增量同步"——以各 analyze skill 的**最新要素定义**（目录布局、文件命名、模板骨架、组织规则）为刷新口径，不沿旧版式、不自造格式。

**自包含原则**：本 skill 无 references 附件——刷新口径直接引用各 analyze skill 的当前版本，不复制其模板内容（避免双写漂移）。

## 何时触发

- 需求代码提交后 / MR 合入前后，评估并同步 docs 资产。
- 工作区积累一批未提交改动，需要知道哪些文档要更新。
- 怀疑 docs/ 与代码已脱节，需要按变更定点同步。
- 典型触发语："spec-update""资产刷新""刷新 docs""这次变更要更新哪些文档""变更影响分析""文档同步""docs 与代码不同步"。

## 工作流程

按下述步骤顺序执行。分析与刷新基于**实际读到的 diff 与代码**，不得臆测。

### 第 1 步：确定对比基线与变更清单

- **对比基线优先级**：用户指定（commit hash / range / `base...head` / MR 编号）→ 工作区未提交改动（`git status` + `git diff HEAD`）。无法确定基线时向用户确认，禁止臆造对比范围。
- 用 `git diff --name-status <基线>` 取变更文件清单（新增/修改/删除），关键文件看 `git diff` 函数级片段；新增文件全量读取。
- **排除噪声**：`vendor/`、`third_party/`、生成代码、stub、纯格式化与纯注释改动不触发资产判定。
- `docs/` 自身变更不触发刷新，但记录"哪些文档已被人工同步"，作为第 3 步判定输入。
- 非 git 仓库或 diff 为空 → 明确告知"无变更可刷新"，结束。

### 第 2 步：变更映射到资产要素

按变更文件归属与 diff 内容，逐项判定下列资产要素是否受影响。每类资产的**要素定义来源**是对应 analyze skill 的当前版本：

| 资产要素 | 目录 | 要素定义来源 | 典型触发信号 |
| --- | --- | --- | --- |
| 结构模型 | `docs/0-arch/structure-model/` | arch-structure-model-analyze | 新增/删除包或目录、模块依赖方向变化、分层调整 |
| 交互模型 | `docs/0-arch/interaction-model/` | arch-interaction-model-analyze | 主业务流程链路增删环节、消息走向/调用顺序变化、新流程入口 |
| 对外接口 | `docs/0-biz/interface/` | biz-interface-analyze | 路由注册/IDL 契约/消息订阅增删改；请求响应结构变化；功能域归属变化 |
| 业务规则 | `docs/0-biz/rules/` | biz-rules-analyze | 条件分支/参数校验/状态迁移/阈值/错误码使用逻辑变化 |
| 对象模型 | `docs/0-biz/object-model/` | biz-object-model-analyze | 领域实体/聚合结构、关联关系变化 |
| 数据模型 | `docs/0-biz/data-model/` | biz-data-model-analyze | 表结构/索引/缓存数据结构/TTL/数据生命周期变化，建表 SQL 变化 |
| 领域词典 | `docs/0-biz/lexicon/` | biz-lexicon-analyze | 五类来源（请求响应模型、DB 实体、事件模型、错误码、常量）任一变化；功能域增删 |
| 框架使用 | `docs/0-tech/framework-guidelines/` | tech-framework-guidelines-analyze | 引入/移除框架或基础库（依赖清单变化）、框架用法模式变化 |
| 通信规范 | `docs/0-tech/external-call-guidelines/` | tech-external-call-guidelines-analyze | 出站调用点增删、被调外部服务变化、协议/封装方式变化 |
| 并发规范 | `docs/0-tech/concurrency-guidelines/` | tech-concurrency-guidelines-analyze | 线程池/goroutine/锁/channel/定时任务等并发原语增改 |
| 数据访问规范 | `docs/0-tech/data-access-guidelines/` | tech-data-access-guidelines-analyze | 数据访问中间件增改、事务/批量/缓存读写模式变化 |
| 韧性规范 | `docs/0-tech/resilience-guidelines/` | tech-resilience-guidelines-analyze | 超时/重试/熔断降级/panic recover/吞错点变化 |
| 基础规范 | `docs/0-tech/basic-mechanism-guidelines/` | tech-basic-mechanism-guidelines-analyze | 日志/配置/告警等横切机制使用方式变化 |
| 编码规范 | `docs/0-qual/code-standards/` | qual-code-standards-analyze | 通常不随单次代码变更刷新；编码约定本身变化时刷新 |
| DT 规范 | `docs/0-qual/dt-guidelines/` | qual-dt-guidelines-analyze | 测试体系/覆盖率门禁约定变化时刷新 |
| 分支规范 | `docs/0-qual/branch-guidelines/` | qual-branch-guidelines-analyze | 分支/commit/MR 约定变化时刷新 |

一个变更文件可命中多个要素（如新增 DB 实体同时波及数据模型、对象模型、领域词典）；一个要素被命中至少一次即进入第 3 步判定。

### 第 3 步：影响判定与刷新清单（强制人工确认）

- 对第 2 步每个要素给出三态判定：
  - **受影响**：列出文档路径 + 变化点 + diff 依据（哪个文件的什么变化导致）。
  - **不受影响**：给一句话依据（如"仅测试文件变更，不波及对外契约"），禁止静默跳过。
  - **资产未建**：对应目录无文档——询问用户按对应 analyze skill 补建，还是本次跳过。
- 汇总**刷新清单**（资产要素 / 文档路径 / 变化点 / 依据）交用户确认，用户可勾选子集；**未经确认禁止动笔改文档**。

### 第 4 步：按最新要素定义执行刷新

- 逐篇刷新：以代码现状为最终依据，只更新受影响的章节/表格行/图；格式严格对齐对应 analyze skill 的当前模板与组织规则（文件命名、小节顺序、锚点口径、证据不带行号等）。
- **增量优先**：不重写整篇——除非该资产的要素定义本身就是全量重推导覆盖（如仓级单篇规范类文档）；刷新后文档须独立成立，无"新旧混杂"的矛盾表述。
- 特殊口径：
  - **通用**：多文件资产目录的实例文档增删/标题变化时，同步刷新该目录 `README.md` 主文档导航（约定：每多文件资产目录必有 README.md 主文档）；目录缺 README.md 的按对应 analyze skill 口径补建。
  - `0-biz/lexicon`：主文档 + 子域文档拆分口径；功能域增删 → 增删 `lexicon-{子域锚点}.md` 并同步主文档子域导航表；待确认清单始终全仓汇总于主文档。
  - `0-biz/interface`：主文档 README 全景与各功能域子文档同步刷新。
  - 含 mermaid 的文档刷新后必须本地验证全部 VALID（见第 5 步）。
- **只改 `docs/`**；本次变更未波及的文档一字不动；禁止借刷新顺手"改进"无关内容。

### 第 5 步：自检与交付

1. **映射反查**：抽样 grep 核实刷新后文档引用的代码标识符/文件路径真实存在（不带行号）。
2. **链接闭环**：导航表/README 与目录内文件一一对应，无游离文件、无死链。
3. **mermaid 验证**：`node <specgo插件目录>/skills/mermaid-validate/scripts/validate-mermaid.mjs <刷新文档路径>`，全部 VALID 才算完成；INVALID 按报错修复后重验。
4. **口径一致**：刷新篇目与对应 analyze skill 模板比对（小节顺序、命名、组织规则一致）。
5. **交付摘要三清单**：已刷新（文档 + 变化点）/ 未受影响（依据）/ 资产未建（处理结果）。

## 关键约束

- **基线明确**：diff 范围来自用户指定或工作区实际状态，禁止臆造；变更清单以 git 命令实际输出为准。
- **代码为最终依据**：文档与代码冲突时以代码为准刷新；代码未体现的业务含义不脑补（词典类沿用"代码未体现，待确认"并汇总主文档待确认清单的口径）。
- **最新要素定义**：每类资产的格式以对应 analyze skill 的当前版本为准，不沿旧版式、不自造格式。
- **人工确认门**：刷新清单未经用户确认不动笔；用户勾选子集则只刷新子集。
- **只读代码、只改 docs**：不改动被分析代码仓的任何代码文件（`docs/` 下文档除外）。
- **活文档覆盖更新**：同名覆盖，不留历史副本、不加日期后缀；本 skill 不产出报告类文件（判定与依据在交付摘要中呈现，不落盘）。
- **文档语言**：输出文档用中文，技术术语与代码标识符保留英文。

## 与其它 skill 的关系

- **spec-analyze 各 analyze 子流程**：要素定义来源——spec-update 不定义任何资产格式，只引用它们的当前定义做增量刷新。
- **mermaid-validate**：含 mermaid 的刷新文档按其语法红线绘制，并过其验证脚本。
