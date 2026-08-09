---
name: tech-concurrency-guidelines-analyze
description: 治理存量代码仓的并发规范资产（线程池选型、池间隔离、容量/队列配置、拒绝策略——仓内有哪些线程池与并发原语、每个池怎么用、是否符合既定并发规范），双模式运行——起草模式（仓内无规范时）盘点仓内并发原语（线程池/ExecutorService、goroutine 启动点、锁 Mutex/RWMutex、channel、Actor 模型、定时任务并发），按池/原语实例归集成文，每篇含用途定位、容量/队列/拒绝策略现状、线程模型图（可选 mermaid）与应有约定建议（严格区分"建议"与"代码现状"）；差距分析模式（仓内已有规范或用户给定规范文档时）对照规范逐项核查实际并发用法的合规差距。产出落盘被分析仓的 docs/tech/concurrency-guidelines/：每线程池/原语实例一篇 concurrency-guidelines-{pool}.md；差距报告落盘 docs/tech/concurrency-guidelines/report/{YYYYMMDD}-concurrency-guidelines.md。当用户提到"并发规范"、"线程池"、"线程池选型"、"池隔离"、"拒绝策略"、"并发原语盘点"、"goroutine 启动点"、"锁使用"、"channel"、"Actor"、"定时任务并发"、"concurrency guidelines"、"thread pool"时使用。
---

# 并发规范分析（tech-concurrency-guidelines-analyze）

## 目的

输入一个代码仓路径，治理该仓的**并发规范**资产——回答三个问题：

1. 仓内有哪些并发原语实例（线程池/Executor、裸 goroutine/裸线程启动点、锁、channel、Actor、定时任务并发）？
2. 每个池/原语实例的用途定位、容量/队列/拒绝策略现状是什么（代码证据）？
3. 实际并发用法与既定并发规范之间有没有差距（池选型/隔离/拒绝策略是否遵守规范）？

与 tech-usage-analyze（框架使用现状：盘点"用了哪些并发框架、怎么用"的事实清单，纯现状、无规范）互补，本 skill 承载"并发应该怎么用"的**指导性规范**：池选型、隔离边界、容量/队列基线、拒绝策略。产出粒度对齐存量代码资产治理规范 v1.1：

| 模式 | 产出 | 落盘 |
| --- | --- | --- |
| 起草模式 | 每线程池/原语实例 1 篇 `concurrency-guidelines-{pool}.md` | 被分析仓 `docs/tech/concurrency-guidelines/` |
| 差距分析模式 | 差距报告 1 篇 `{YYYYMMDD}-concurrency-guidelines.md` | 被分析仓 `docs/tech/concurrency-guidelines/report/` |

`{pool}` 实例 slug 一律从代码标识符派生（线程池变量名/类型名/配置 key 转 kebab-case；goroutine 池以用途命名处派生），禁止 AI 自由起名——保证重跑产出同名文件、资产不断代。

本 skill 通用，不预设被分析仓的语言与框架，执行时基于实际探测结果走。

## 何时触发

- 用户要盘点仓内并发用法：有哪些线程池、goroutine 都在哪启动、锁和 channel 怎么用的、定时任务是否并发安全。
- 用户要建立或刷新"并发规范"文档：为每个池/原语实例沉淀用途定位、容量/队列/拒绝策略现状与应有约定（新代码照着怎么写）。
- 用户给出一份并发规范文档（或仓内 `docs/tech/concurrency-guidelines/` 下已有规范），要求对照规范检查实际并发用法是否遵守、输出差距报告。
- 出现并发类事故（池打满/任务丢失/死锁/协程泄漏）后，需要以规范形式固化池容量、隔离与拒绝策略基线。

## 运行模式

### 起草模式（默认）

仓内无既有并发规范、用户也未提供规范文档时走本模式。全仓盘点并发原语，按池/原语实例归集，产出每实例一篇 `concurrency-guidelines-{pool}.md`——既记录代码现状（逐条附证据），又给出应有约定建议（明确标注"建议"，与"代码现状"严格区分），作为并发规范的初稿（活文档，同名覆盖更新）。

### 差距分析模式

仓内已存在并发规范文档（`docs/tech/concurrency-guidelines/` 下既有 guidelines 文档），或用户显式提供规范文件时走本模式。以规范为基准，对照扫描实际并发用法：池选型、容量/队列、拒绝策略、隔离边界、锁与共享状态是否遵守规范，产出差距报告 `docs/tech/concurrency-guidelines/report/{YYYYMMDD}-concurrency-guidelines.md`（逐实例一节：合规项 / 差距项 / 规范未覆盖 / 规范条目无实现，各项附证据文件路径）。差距报告为次抛件，带日期、不覆盖。

guidelines 形态语义：并发规范是**指导性规范**（"应该"遵守），违反出报告提示改进，不做 CI 拦截——拦截是 standards 形态资产的语义。

### 模式缺省回退

用户要求差距分析、但未提供规范文档且 `docs/tech/concurrency-guidelines/` 下也无既有规范时，默认回退起草模式，并在每篇产出文档末尾注明「规范未建，本次为现状起草」。

## 工作流程

按下述步骤顺序执行。每一步都要留下可追溯依据（文件路径、配置 key），分析基于**实际读到的代码与配置**，不得臆测。

### 第 1 步：判定运行模式

- 用户显式提供规范文件 → 差距分析模式，规范来源记为该文件路径。
- 否则检查被分析仓 `docs/tech/concurrency-guidelines/` 下是否已有 `concurrency-guidelines-*.md` 规范文档 → 有则询问或直接按差距分析模式执行（用户意图是"检查 / 对照 / 差距"时直接执行），规范来源记为该目录下文档。
- 都没有 → 起草模式；若用户本意是差距分析，在每篇文档末尾注明「规范未建，本次为现状起草」。

### 第 2 步：全仓扫描，盘点并发原语

按以下模式全仓搜索（语言无关，按仓内实际技术栈取舍）：

- **线程池 / Executor**：ThreadPoolExecutor / Executors / @Async executor、Go 池化库（ants 等）与自研 goroutine pool、C++ 自研 thread pool、Python ThreadPoolExecutor / ProcessPoolExecutor、.NET Task/ThreadPool 配置、自研任务执行框架
- **裸并发启动点**：`go func` / `go xxx()`、`new Thread` / `std::thread` / `thread::spawn`、`asyncio.create_task` / `threading.Thread` 等未经池化的直接启动点
- **锁**：sync.Mutex / sync.RWMutex、ReentrantLock / synchronized、std::mutex / std::shared_mutex、threading.Lock 等；分布式锁只记并发语义，访问规范细节归 tech-data-access-guidelines-analyze
- **channel / 任务缓冲**：Go channel（buffer 大小）、BlockingQueue / Disruptor、生产-消费队列封装
- **Actor 模型**：Akka / Orleans / protoactor / 自研 Actor 框架的 actor 定义与消息投递点
- **定时任务并发**：cron / @Scheduled / time.Ticker / 调度框架任务的并发语义（是否允许重入、任务体内是否再开并发）
- **配置辅助定位**：yaml / properties / 配置中心中的池大小、队列容量、线程名前缀等参数 key

每个原语实例记录：类型（池 / 裸并发 / 锁 / channel / Actor / 定时任务）、代码标识符（变量名 / 类型名 / 配置 key）、定义位置（文件路径，**不带行号**）、使用点（任务提交 / 加锁 / 消息投递位置）、容量与队列配置、拒绝/阻塞策略、关闭与等待方式。读不到显式配置就记「未设置」或「框架默认」，禁止臆造取值。

差距分析模式下，每个实例还需额外记录五项核查事实：**池选型**（池化还是裸并发、独占还是共用）、**容量**（核心/最大线程数与取值来源）、**队列**（有界/无界、容量）、**拒绝策略**（显式策略还是默认）、**隔离**（与哪些业务共用同一池）——读不到就记「未设置」。

### 第 3 步：实例归集与 slug 派生

- 按**池/原语实例**归集：同一池变量的多处任务提交点归并为一个实例；锁按被保护的共享资源归集；channel 按生产者-消费者链路归集；同一定时任务归为一个实例。
- `{pool}` slug 从代码标识符派生转 kebab-case：线程池变量名/类型名/配置 key（`authTaskExecutor` → `auth-task-executor`）；goroutine 池以用途命名处派生（定义处注释、封装函数名）；锁实例以被保护资源名派生。
- 无法判定用途的实例归入「未命名」分组，slug 取代码标识符本身并标注「待人工确认」——**不臆造名称**。
- 仓内存在大量裸 goroutine/裸线程启动点、无池化封装时，按用途函数归集为"裸并发"实例，文档中明确标注「无池化」现状——这是后续差距分析的重要输入。

### 第 4 步（起草模式）：生成并发规范文档

输出到被分析仓 `docs/tech/concurrency-guidelines/` 目录：每个池/原语实例一篇 `concurrency-guidelines-{pool}.md`，按 references/concurrency-guidelines-template.md 填充。

规则：

- **现状与建议分区**：「容量/队列/拒绝策略现状」节只写代码事实、逐条附证据文件路径；「应有约定建议」节是规范初稿，必须标注为建议、给出理由，禁止把建议写成现状。
- **用途定位不得臆造**：从定义处注释/提交点所在函数/模块推断；推断不出标「待确认」。
- 线程模型图为可选 mermaid（任务提交方 → 队列 → 工作线程 → 下游），仅当有助于理解时画；label 一律加引号。
- 锁、定时任务等非池实例按模板中的实例类型变体行填写（锁：锁类型/粒度/临界区；定时任务：调度并发语义），不适用维度写「未设置」，不删除行。
- 同名文件已存在**直接覆盖更新**——规范文档是活文档，固定名、覆盖更新，git diff 即演进史。

### 第 5 步（差距分析模式）：对照规范核查并生成差距报告

以第 1 步确定的规范文档为基准，逐实例、逐规范条目核查第 2 步采集的并发事实：

- 核查维度固定六项：**池选型**（该池化的是否池化、有无裸开线程/goroutine）、**容量**（核心/最大线程数是否符合规范基线）、**队列**（是否按规范要求有界、容量是否合规）、**拒绝策略**（是否有显式拒绝/降级路径、是否符合规范，含规范禁止丢弃而实际丢弃的情形）、**隔离**（是否按规范分池隔离、有无跨业务共用池）、**锁与共享状态**（锁类型/粒度/锁顺序是否符合规范，规范有约定时）。
- 每条核查结论落四类之一：**合规项**（实际用法遵守规范，附证据文件路径）、**差距项**（违反规范或规范有要求而代码未实现，附证据文件路径与现状说明）、**规范未覆盖**（实际存在并发实例但规范未约定，单列提示规范补全）、**规范条目无实现**（规范约定了但代码中找不到对应实例，不臆造实现位置）。
- 产出差距报告 `docs/tech/concurrency-guidelines/report/{YYYYMMDD}-concurrency-guidelines.md`，按 references/gap-report-template.md 填充：结论概览表 + 逐实例一节（合规项 / 差距项 / 规范未覆盖 / 规范条目无实现，各项均附证据文件路径）。
- 差距报告**只新增不覆盖**，文件名带日期；同日重跑同名覆盖。

### 第 6 步：验证 mermaid 图可渲染（收尾必做）

产出文档中含 ```mermaid 代码块（线程模型图等）时，交付前必须运行 spec-mermaid-diagram skill 的本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/spec-mermaid-diagram/scripts/validate-mermaid.mjs <产出文件...>
```

- 全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。
- 画图规则（label 一律加引号、时序图消息禁 `;`、裸 `end` 禁用等）见 spec-mermaid-diagram skill 的「语法红线」。

## 输出模板

- 每池/原语实例并发规范文档（起草模式）：references/concurrency-guidelines-template.md
- 差距报告（差距分析模式）：references/gap-report-template.md

只填占位符、表格行、图；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **基于实证**：所有"池容量多少、队列有界无界、拒绝策略是什么、是否合规"的结论必须有代码或配置支撑，证据形式为 `文件路径`，**不得出现代码行号**（行号随代码变更失效）。读不到就写「未识别（原因：xxx）」/「未设置」/「框架默认」，禁止凭经验臆造容量取值、拒绝策略或合规结论。
- **建议与现状严格区分**：起草模式产出的「应有约定建议」节是规范初稿（未落地），必须标注建议属性并给出理由；只有代码事实才能进「现状」节。
- **实例 slug 从代码标识符派生**：`{pool}` 取线程池变量名/类型名/配置 key/用途命名处转 kebab-case，禁止 AI 自由起名，保证重跑产出同名文件、资产不断代。
- **活文档覆盖更新**：`docs/tech/concurrency-guidelines/` 下 `concurrency-guidelines-{pool}.md` 同名直接覆盖，不保留历史副本、不加日期后缀；**差距报告才带日期**，落 `report/` 子目录、次抛。
- **只读不改**：只读、只分析、只产出文档，不改动被分析代码仓的任何文件（`docs/tech/concurrency-guidelines/` 下的产出除外）。
- **成品纯净**：最终文档只含成品内容。扫描过程（执行的 grep/rg 命令、命中输出摘要）仅供自检，绝不写入最终文档——其结论须以 `文件路径` 证据形式进入相关表格。
- **语言无关**：不预设被分析仓的语言与框架，按第 2 步实际探测结果走。
- **文档语言**：输出文档用中文，技术术语（ThreadPool / Executor / goroutine / Mutex / RWMutex / channel / Actor / CallerRunsPolicy 等）保留英文。
- **索引分工**：域索引 `docs/tech/README.md` 与总索引 `docs/README.md` 由 all-index 生成，本 skill 不维护；本资产目录不产出 README，多实例靠文件名自描述。
- **与相邻资产互补**：并发框架使用事实清单看 tech-usage-analyze 产出的 `docs/tech/usage/`；超时/重试/熔断等故障策略归 tech-resilience-guidelines-analyze；跨服务调用指导归 tech-comm-guidelines-analyze。
- **mermaid 校验**：产出含 ```mermaid 代码块时，收尾必须用 `node <specgo插件目录>/skills/spec-mermaid-diagram/scripts/validate-mermaid.mjs <产出文件...>` 逐文件校验，全部 VALID 才算完成；INVALID 按报错修复后重验，禁止跳过。

## 参考文件索引

| 文件 | 用途 |
| --- | --- |
| references/concurrency-guidelines-template.md | 起草模式每池/原语实例文档模板（用途定位 + 线程模型图（可选）+ 容量/队列/拒绝策略现状 + 应有约定建议） |
| references/gap-report-template.md | 差距分析模式差距报告模板（结论概览 + 逐实例合规项/差距项/规范未覆盖/规范条目无实现） |
