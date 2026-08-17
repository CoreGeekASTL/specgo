---
name: tech-concurrency-guidelines-analyze
description: 提取存量代码仓的并发规范资产（线程池、锁、channel、goroutine 启动点、Actor、定时任务并发等并发原语实例），单模式提取运行——盘点仓内并发原语并按实例归集成文，产出 README.md 实例导航主文档 + 每实例一篇 concurrency-guidelines-{pool}.md；每篇文档章节不超过三个（用途定位 + 使用说明 + 代码案例），人一看就懂：用途定位一段话说清该实例干什么、为什么需要并发；使用说明列可调用的封装函数/原语入口清单（作用、参数或取值、定义文件）；代码案例给真实调用片段（注明来源文件路径）。产出落盘被分析仓的 docs/tech/concurrency-guidelines/（活文档，同名覆盖更新）。当用户提到"并发规范"、"线程池"、"池隔离"、"并发原语盘点"、"goroutine 启动点"、"锁使用"、"channel"、"Actor"、"定时任务并发"、"concurrency guidelines"、"thread pool"时使用。
---

# 并发规范分析（tech-concurrency-guidelines-analyze）

## 目的

输入一个代码仓路径，提取该仓的**并发规范**资产——回答三个问题：

1. 仓内有哪些并发原语实例（线程池/Executor、裸 goroutine/裸线程启动点、锁、channel、Actor、定时任务并发）？
2. 每个实例干什么、为什么需要并发（用途定位）？
3. 每个实例怎么用——调用入口是什么、业务代码实际怎么写（使用说明 + 代码案例）？

与 tech-framework-guidelines-analyze（框架使用指导：盘点"用了哪些并发框架"的事实清单）互补——本资产按**实例**归集，给编码提供"这个池/锁照着怎么写"的实例级参考。

产出粒度对齐存量代码资产治理规范 v1.1：

| 产出 | 落盘 |
| --- | --- |
| 主文档 `README.md`（实例导航）+ 每池/原语实例 1 篇 `concurrency-guidelines-{pool}.md` | 被分析仓 `docs/tech/concurrency-guidelines/` |

`{pool}` 实例 slug 一律从代码标识符派生（线程池变量名/类型名/配置 key 转 kebab-case；goroutine 池以用途命名处派生；锁以被保护资源名派生），禁止 AI 自由起名——保证重跑产出同名文件、资产不断代。

本 skill 通用，不预设被分析仓的语言与框架，执行时基于实际探测结果走。

## 何时触发

- 用户要盘点仓内并发用法：有哪些线程池、goroutine 都在哪启动、锁和 channel 怎么用的、定时任务是否并发安全。
- 用户要建立或刷新"并发规范"文档：为每个池/原语实例沉淀用途定位与使用方式（新代码照着怎么写）。

## 工作流程

按下述步骤顺序执行。每一步都要留下可追溯依据（文件路径、配置 key），分析基于**实际读到的代码与配置**，不得臆测。

### 第 1 步：全仓扫描，盘点并发原语

按以下模式全仓搜索（语言无关，按仓内实际技术栈取舍）：

- **线程池 / Executor**：ThreadPoolExecutor / Executors / @Async executor、Go 池化库（ants 等）与自研 goroutine pool、C++ 自研 thread pool、Python ThreadPoolExecutor / ProcessPoolExecutor、.NET Task/ThreadPool 配置、自研任务执行框架
- **裸并发启动点**：`go func` / `go xxx()`、`new Thread` / `std::thread` / `thread::spawn`、`asyncio.create_task` / `threading.Thread` 等未经池化的直接启动点
- **锁**：sync.Mutex / sync.RWMutex、ReentrantLock / synchronized、std::mutex / std::shared_mutex、threading.Lock 等；分布式锁只记并发语义，访问规范细节归 tech-data-access-guidelines-analyze
- **channel / 任务缓冲**：Go channel（buffer 大小）、BlockingQueue / Disruptor、生产-消费队列封装
- **Actor 模型**：Akka / Orleans / protoactor / 自研 Actor 框架的 actor 定义与消息投递点
- **定时任务并发**：cron / @Scheduled / time.Ticker / 调度框架任务的并发语义（是否允许重入、任务体内是否再开并发）
- **配置辅助定位**：yaml / properties / 配置中心中的池大小、队列容量、线程名前缀等参数 key

### 第 2 步：实例归集与逐实例提取

- 按**池/原语实例**归集：同一池变量的多处任务提交点归并为一个实例；锁按被保护的共享资源归集；channel 按生产者-消费者链路归集；同一定时任务归为一个实例。
- `{pool}` slug 从代码标识符派生转 kebab-case；无法判定用途的实例归入「未命名」分组，slug 取代码标识符本身并标注「待人工确认」——**不臆造名称**。
- 仓内存在大量裸 goroutine/裸线程启动点、无池化封装时，按用途函数归集为"裸并发"实例，用途中明确标注「无池化」。

每个实例固定采集三组事实：

1. **用途定位**：1~3 句人话——处理什么业务任务、为什么需要并发/并发保护；从定义处注释/提交点所在函数/模块推断，推断不出标「待确认」。
2. **使用说明**：该实例的调用入口清单——可调用的封装函数（**优先从封装层提取**）或原语本身（加锁/提交/投递方法）与关键配置（容量、队列、buffer 大小等，附取值与来源）。逐条记录：函数/原语或配置 key、一句话作用、参数或取值说明、定义文件路径（不带行号）。读不到显式配置就记「未设置」或「框架默认」，禁止臆造取值。
3. **代码案例**：从业务代码摘取真实调用片段（照抄即可用的最小案例：如 Get 读锁、Set 写锁、任务提交），每段注明来源文件路径（不带行号）；典型读写/提交场景各取一段代表性案例。使用点多时按代表性抽样精读，禁止全量阅读。

### 第 3 步：生成并发规范文档

输出到被分析仓 `docs/tech/concurrency-guidelines/` 目录：主文档 `README.md` + 每个池/原语实例一篇 `concurrency-guidelines-{pool}.md`，实例文档按 references/concurrency-guidelines-template.md 填充。

主文档 `README.md`（活文档，同名覆盖）内容仅两项：元信息表（分支/更新日期/Skill）+ 实例导航表（实例 → `concurrency-guidelines-{pool}.md` 链接 + 实例类型 + 一句话用途定位）。

实例文档规则：

- **章节不超过三个**：固定为「用途定位」「使用说明」「代码案例」三节（元信息表不计章节），人一看就懂——不多设章节、不堆分布统计。
- **只写事实与案例**：不写应有约定建议、不做合规性判断。
- 用途定位不得臆造：从定义处注释/提交点所在函数/模块推断；推断不出标「待确认」。
- 同名文件已存在**直接覆盖更新**——规范文档是活文档，固定名、覆盖更新，git diff 即演进史。

### 第 4 步：验证 mermaid 图可渲染（收尾必做）

产出文档中含 ```mermaid 代码块时（本资产默认不画图），交付前必须运行 mermaid-validate skill 的本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/mermaid-validate/scripts/validate-mermaid.mjs <产出文件...>
```

- 全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。
- 画图规则（label 一律加引号、时序图消息禁 `;`、裸 `end` 禁用等）见 mermaid-validate skill 的「语法红线」。

## 输出模板

- 每池/原语实例并发规范文档：references/concurrency-guidelines-template.md

只填占位符、表格行、真实代码片段；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **基于实证**：所有"实例干什么、怎么用、容量取值多少"的结论必须有代码或配置支撑，证据形式为 `文件路径`，**不得出现代码行号**（行号随代码变更失效）。读不到就写「未识别（原因：xxx）」/「未设置」/「框架默认」，禁止凭经验臆造容量取值或使用方式。
- **章节上限三节**：实例文档只含「用途定位 / 使用说明 / 代码案例」三节（元信息表不计）；不写调用点分布统计、不写"应该"级约定、不做合规性判断。
- **实例 slug 从代码标识符派生**：`{pool}` 取线程池变量名/类型名/配置 key/用途命名处转 kebab-case，禁止 AI 自由起名，保证重跑产出同名文件、资产不断代。
- **活文档覆盖更新**：`docs/tech/concurrency-guidelines/` 下 README 与 `concurrency-guidelines-{pool}.md` 同名直接覆盖，不保留历史副本、不加日期后缀。
- **只读不改**：只读、只分析、只产出文档，不改动被分析代码仓的任何文件（`docs/tech/concurrency-guidelines/` 下的产出除外）。
- **成品纯净**：最终文档只含成品内容。扫描过程（执行的 grep/rg 命令、命中输出摘要）仅供自检，绝不写入最终文档——其结论须以 `文件路径` 证据形式进入相关表格。
- **语言无关**：不预设被分析仓的语言与框架，按第 1 步实际探测结果走。
- **文档语言**：输出文档用中文，技术术语（ThreadPool / Executor / goroutine / Mutex / RWMutex / channel / Actor 等）保留英文。
- **索引分工**：本资产目录的 `README.md`（实例导航主文档）由本 skill 产出，活文档同名覆盖；域索引 `docs/tech/README.md` 与总索引 `docs/README.md` 由 spec-index 生成，本 skill 不维护。
- **与相邻资产互补**：并发框架使用事实清单看 tech-framework-guidelines-analyze 产出的 `docs/tech/framework-guidelines/`；超时/重试/熔断等故障策略归 tech-resilience-guidelines-analyze；跨服务调用指导归 tech-comm-guidelines-analyze。
- **mermaid 校验**：产出含 ```mermaid 代码块时，收尾必须用 `node <specgo插件目录>/skills/mermaid-validate/scripts/validate-mermaid.mjs <产出文件...>` 逐文件校验，全部 VALID 才算完成；INVALID 按报错修复后重验，禁止跳过。

## 参考文件索引

| 文件 | 用途 |
| --- | --- |
| references/concurrency-guidelines-template.md | 每池/原语实例文档模板（用途定位 + 使用说明 + 代码案例，章节上限三节） |
