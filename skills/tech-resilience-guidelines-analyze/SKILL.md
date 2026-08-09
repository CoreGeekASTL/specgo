---
name: tech-resilience-guidelines-analyze
description: 治理存量代码仓的韧性规范资产（超时/重试/熔断降级/异常处理等故障策略——只管故障来了怎么扛，不管通信协议本身，协议与封装归通信规范），双模式运行——起草模式扫描仓内全部出站调用点与后台任务的故障策略现状（超时值与位置、重试次数/间隔/退避、熔断降级、panic/recover、错误 swallowing），按策略分节汇总成规范文档（每策略一节：现状调用点分布表 + 证据文件路径 + 应有约定建议）；差距分析模式对照既有韧性规范逐项核查差距。产出落盘被分析仓的 docs/tech/resilience-guidelines/：仓级单篇 resilience-guidelines.md（活文档，同名覆盖更新）；差距报告落盘 docs/tech/resilience-guidelines/report/{YYYYMMDD}-resilience-guidelines.md（次抛，带日期）。当用户提到"韧性规范"、"超时设置"、"重试策略"、"熔断降级"、"故障策略"、"异常处理规范"、"panic recover"、"错误吞掉"、"吞错"、"错误 swallowing"、"错误被忽略"、"容错"、"稳定性治理"、"韧性差距分析"、"对照韧性规范检查"、"resilience"时使用。
---

# 韧性规范分析（tech-resilience-guidelines-analyze）

## 目的

输入一个代码仓路径，治理该仓的**韧性规范**资产——回答两个问题：

1. 仓内全部出站调用点与后台任务的故障策略现状如何（超时、重试、熔断降级、panic/recover、错误 swallowing）？
2. 这些现状与既定韧性规范之间有没有差距？

资产边界：**只管故障策略，不管通信协议本身**——协议选型、封装方式、错误码语义归 tech-comm-guidelines-analyze（通信规范）；线程池选型、隔离、拒绝策略归 tech-concurrency-guidelines-analyze（并发规范）。本资产只回答"故障来了怎么扛"。

产出粒度对齐存量代码资产治理规范 v1.1：

| 模式 | 产出 | 落盘 |
| --- | --- | --- |
| 起草模式 | 仓级单篇 `resilience-guidelines.md` | 被分析仓 `docs/tech/resilience-guidelines/` |
| 差距分析模式 | 差距报告 1 篇 `{YYYYMMDD}-resilience-guidelines.md` | 被分析仓 `docs/tech/resilience-guidelines/report/` |

仓级单篇、文件名固定为 `resilience-guidelines.md`，无实例 slug；规范文档为活文档，同名覆盖更新，git diff 即演进史。

本 skill 通用，不预设被分析仓的语言与框架，执行时基于实际探测结果走。

**自包含原则**：本 skill 所需模板归档在自身 references/ 目录下，不依赖其它 skill 的文件。

## 何时触发

- 用户要盘点仓内超时 / 重试 / 熔断 / 异常处理现状，做故障策略摸底、稳定性治理、新人上手。
- 用户要建立或刷新"韧性规范"文档：把故障策略现状沉淀成文，并给出应有约定建议。
- 用户给出一份韧性规范文档（或仓内 `docs/tech/resilience-guidelines/` 下已有规范），要求对照规范检查实际代码是否遵守、输出差距报告。

## 运行模式

### 起草模式（默认）

仓内无既有韧性规范、用户也未提供规范文档时走本模式。扫描仓内全部出站调用点与后台任务的故障策略现状，按策略分节汇总成仓级单篇 `resilience-guidelines.md`——每策略一节（现状调用点分布表 + 证据文件路径 + 应有约定建议），作为韧性规范的事实基线（活文档，同名覆盖更新）。

### 差距分析模式

仓内已存在韧性规范文档（`docs/tech/resilience-guidelines/resilience-guidelines.md`），或用户显式提供规范文件时走本模式。以规范为基准逐项核查：超时取值与位置、重试次数 / 间隔 / 退避、熔断降级、panic/recover、错误 swallowing 是否遵守规范，产出差距报告 `docs/tech/resilience-guidelines/report/{YYYYMMDD}-resilience-guidelines.md`（逐策略一节：合规项 / 差距项 / 规范未覆盖，各项附证据文件路径）。差距报告为次抛件，带日期、不覆盖。

guidelines 形态语义：韧性规范是**指导性规范**（"应该"遵守），违反出报告提示改进，不做 CI 拦截——拦截是 standards 形态资产的语义。

### 模式缺省回退

用户要求差距分析、但未提供规范文档且 `docs/tech/resilience-guidelines/` 下也无既有规范时，默认回退起草模式，并在产出的规范文档末尾注明「规范未建，本次为现状提取」。

## 工作流程

按下述步骤顺序执行。每一步都要留下可追溯依据（文件路径、配置 key），分析基于**实际读到的代码与配置**，不得臆测。

### 第 1 步：判定运行模式

- 用户显式提供规范文件 → 差距分析模式，规范来源记为该文件路径。
- 否则检查被分析仓 `docs/tech/resilience-guidelines/resilience-guidelines.md` 是否存在 → 有则按差距分析模式执行（用户意图是"检查 / 对照 / 差距"时直接执行），规范来源记为该文档。
- 都没有 → 起草模式；若用户本意是差距分析，在文档末尾注明「规范未建，本次为现状提取」。

### 第 2 步：全仓扫描，定位出站调用点与后台任务

按仓内实际技术栈取舍（语言无关），定位两类点位：

**出站调用点**：

- HTTP 客户端：RestTemplate / WebClient / Feign、okhttp、HttpClient、requests / httpx、axios / fetch、net/http、封装的公司内部 HTTP SDK
- RPC / IDL client：gRPC stub、Dubbo @Reference、Thrift client、Kitex/Hertz、自研 RPC 框架 client stub
- 消息队列生产端与消费端：Kafka / RocketMQ / RabbitMQ / Pulsar producer 与 consumer
- 平台/公司内部 SDK 出站：告警、监控、证书、日志、注册发现 client 等——封装在 stubs/vendor 内但调用点在业务代码的也算
- 外部存储：外部 DB 连接与读写（MySQL/PostgreSQL 等）、Redis/OSS 等中间件 client 调用

**后台任务**：定时任务（cron / scheduler 注册点）、独立 goroutine / 线程 / worker、消息消费循环、job 批处理。

每个点位记录：点位类型（出站调用 / 后台任务）、被调目标（服务 / 中间件 / topic）、所在文件（**不带行号**）、所在函数。

### 第 3 步：逐点位采集五类故障策略事实

对第 2 步每个点位，采集以下五类事实。读不到显式设置就记「未设置」或「框架默认」，禁止臆造取值：

1. **超时设置**：有无显式超时；超时值；设置位置（调用点 / 统一封装层 / 全局配置 / 配置文件 key）；超时粒度（connect / read / total / deadline）。
2. **重试策略**：有无重试；重试次数、间隔、退避方式（固定 / 指数 / 抖动）；重试触发条件（哪些错误 / 状态码可重试）；有无幂等保障。
3. **熔断与降级**：熔断器使用（hystrix / sentinel / resilience4j / 自研 / 无）；降级逻辑（fallback、默认值返回、缓存兜底、直接失败）。
4. **panic/recover 与异常兜底**：goroutine / 线程 / 任务级有无 recover 兜底；顶层未捕获异常的传播路径。
5. **错误 swallowing**：error 被丢弃的点位（赋值给 `_`、空 catch、只记日志不上抛不处理）；记日志后无任何后续处理的点位。

配置辅助定位：yaml / properties / 配置中心中的超时与重试配置 key、熔断规则配置文件。

差距分析模式下，第 3 步采集的事实即核查素材；规范条目中的取值要求与代码读到的实际取值逐项对照。

### 第 4 步（起草模式）：生成韧性规范文档

按 references/resilience-guidelines-template.md 填充，输出仓级单篇 `docs/tech/resilience-guidelines/resilience-guidelines.md`：

- 元信息表 + 扫描范围总览：点位类型分布表 + 五类策略覆盖概况表（已设置 / 未设置点位数 + 现状一句话）。
- **每策略一节**（一、超时策略；二、重试策略；三、熔断与降级；四、panic/recover 与异常兜底；五、错误 swallowing）：
  - 现状调用点分布表：点位（文件 · 函数）、被调目标、策略现状（取值与位置 / 未设置 / 框架默认）、证据文件路径；
  - 应有约定建议：基于现状分布给出指导性约定（如"出站 HTTP 调用应统一在封装层设置显式超时，建议取值区间…"）——建议须从现状多数派实践与框架能力归纳，行文中明确标注为建议、不得与现状事实混淆。
- 目录不存在则创建（连同 `docs/` 一起创建）；同名文件已存在**直接覆盖更新**。

### 第 5 步（差距分析模式）：对照规范核查并生成差距报告

以第 1 步确定的规范文档为基准，逐策略、逐规范条目核查第 3 步采集的事实：

- 核查维度固定五类：超时、重试、熔断降级、panic/recover、错误 swallowing。
- 每条核查结论落三类之一：**合规项**（实际遵守规范，附证据文件路径）、**差距项**（违反规范或规范有要求而代码未实现，附证据文件路径与现状说明）、**规范未覆盖**（实际存在点位但规范未约定，单列提示规范补全）。
- 规范条目中在代码里找不到任何对应点位的，记「规范条目无实现」，不臆造实现位置。
- 产出差距报告 `docs/tech/resilience-guidelines/report/{YYYYMMDD}-resilience-guidelines.md`，按 references/gap-report-template.md 填充：结论概览表 + 逐策略一节（合规项 / 差距项 / 规范未覆盖 / 规范条目无实现）。
- 差距报告**只新增不覆盖**，文件名带日期；同日重跑同名覆盖。

### 第 6 步：验证 mermaid 图可渲染（有条件必做）

产出文档中含 ```mermaid 代码块时（本资产通常为纯表格文档，不含图），交付前必须运行 spec-mermaid-diagram skill 的本地验证脚本逐文件校验：

```bash
node /Users/sunhe/2026/yunshouji/AIAction/.claude/plugins/specgo/skills/spec-mermaid-diagram/scripts/validate-mermaid.mjs <产出文件...>
```

全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。

## 输出模板

- 韧性规范文档（起草模式）：references/resilience-guidelines-template.md
- 差距报告（差距分析模式）：references/gap-report-template.md

只填占位符、表格行；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **基于实证**：所有"超时取值、重试次数、熔断器有无、吞错点位、是否合规"的结论必须有代码或配置支撑，证据形式为 `文件路径`，**不得出现代码行号**（行号随代码变更失效）。读不到就写「未设置」/「框架默认」/「未识别（原因：xxx）」，禁止凭经验臆造取值或合规结论。
- **仓级单篇文件名固定**：产出固定为 `docs/tech/resilience-guidelines/resilience-guidelines.md`，无实例 slug；文档内表格中的点位标识从代码标识符（文件名 / 函数名 / 配置 key）派生，禁止 AI 自由起名。
- **活文档覆盖更新**：`resilience-guidelines.md` 同名直接覆盖，不保留历史副本、不加日期后缀；**差距报告才带日期**，落 `report/` 子目录、次抛。
- **只读不改**：只读、只分析、只产出文档，不改动被分析代码仓的任何文件（`docs/tech/resilience-guidelines/` 下的产出除外）。
- **成品纯净**：最终文档只含成品内容。探测过程（执行的 grep/rg 命令、命中输出摘要）仅供自检，绝不写入最终文档——其结论须以 `文件路径` 证据形式进入相关表格。
- **语言无关**：不预设被分析仓的语言与框架，按第 2 步实际探测结果走。
- **文档语言**：输出文档用中文，技术术语（HTTP / RPC / MQ / SDK / timeout / retry / circuit breaker / fallback / panic / recover 等）保留英文。
- **索引分工**：域索引 `docs/tech/README.md` 与总索引 `docs/README.md` 由 all-index 生成，本 skill 不维护。
- **与相邻资产边界**：通信协议与封装方式归 tech-comm-guidelines-analyze 产出的 `docs/tech/comm-guidelines/`；线程池选型、隔离、拒绝策略归 tech-concurrency-guidelines-analyze 产出的 `docs/tech/concurrency-guidelines/`。本 skill 只记录故障策略事实与合规性，越界内容不写入本文档。

## 参考文件索引

| 文件 | 用途 |
| --- | --- |
| references/resilience-guidelines-template.md | 起草模式韧性规范文档模板（元信息 + 扫描范围总览 + 五策略分节：现状分布表 + 应有约定建议） |
| references/gap-report-template.md | 差距分析模式差距报告模板（结论概览 + 逐策略合规项/差距项/规范未覆盖/规范条目无实现） |
