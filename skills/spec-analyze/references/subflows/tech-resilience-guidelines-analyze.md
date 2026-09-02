---
name: tech-resilience-guidelines-analyze
description: 提取存量代码仓的韧性规范资产（超时/重试/熔断降级/异常处理等故障策略——只管故障来了怎么扛，不管通信协议本身，协议与封装归通信规范），单模式提取运行——扫描仓内全部出站调用点与后台任务的故障策略，产出 README 索引 + 每维度一篇 resilience-guidelines-{dimension}.md；每篇文档只含两项内容：使用说明（该维度机制在仓内怎么用——可调用的封装函数/配置项清单：作用、参数或取值、来源文件）与代码案例（真实代码片段，注明来源文件路径）。产出落盘被分析仓的 docs/0-tech/resilience-guidelines/（活文档，同名覆盖更新）。当用户提到"韧性规范"、"超时设置"、"重试策略"、"熔断降级"、"故障策略"、"异常处理"、"panic recover"、"错误吞掉"、"吞错"、"错误 swallowing"、"容错"、"稳定性治理"、"resilience"时使用。
---

<!-- 子流程：不独立暴露为 skill；由 spec-analyze 主 skill 路由加载，也可由 /tech-resilience-guidelines-analyze 命令触发。依赖文件在同级 ../assets/（带短名前缀） -->

# 韧性规范分析（tech-resilience-guidelines-analyze）

## 目的

输入一个代码仓路径，提取该仓的**韧性规范**资产——回答两个问题：

1. 仓内出站调用与后台任务的故障策略（超时 / 重试 / 熔断降级 / panic recover / 错误 swallowing）通过哪些封装函数 / 配置项实现（怎么用）？
2. 业务代码实际怎么写的（真实代码案例长什么样）？

资产边界：**只管故障策略，不管通信协议本身**——协议选型、封装方式、错误码语义归 tech-external-call-guidelines-analyze（通信规范）；线程池选型、隔离、拒绝策略归 tech-concurrency-guidelines-analyze（并发规范）。本资产只回答"故障来了怎么扛、照着怎么写"。

产出粒度对齐存量代码资产治理规范 v1.1——**按维度拆分，每个维度一个文件**：

| 产出 | 落盘 |
| --- | --- |
| 主文档 `README.md`（维度导航）+ 每维度 1 篇 `resilience-guidelines-{dimension}.md` | 被分析仓 `docs/0-tech/resilience-guidelines/` |

`{dimension}` 维度 slug 固定五类：`timeout`（超时）/ `retry`（重试）/ `circuit-breaker`（熔断与降级）/ `panic-recover`（panic/recover 与异常兜底）/ `error-swallowing`（错误 swallowing）——保证重跑产出同名文件、资产不断代。

本 skill 通用，不预设被分析仓的语言与框架，执行时基于实际探测结果走。

**自包含原则**：本 skill 所需模板归档在自身 references/ 目录下，不依赖其它 skill 的文件。

## 何时触发

- 用户要盘点仓内超时 / 重试 / 熔断 / 异常处理怎么用，做故障策略摸底、稳定性治理、新人上手。
- 用户要建立或刷新"韧性规范"文档：把各维度故障策略的使用方式与代码案例沉淀成文。

## 工作流程

按下述步骤顺序执行。每一步都要留下可追溯依据（文件路径、配置 key），分析基于**实际读到的代码与配置**，不得臆测。

### 第 1 步：全仓扫描，定位出站调用点与后台任务

按仓内实际技术栈取舍（语言无关），定位两类点位：

**出站调用点**：

- HTTP 客户端：RestTemplate / WebClient / Feign、okhttp、HttpClient、requests / httpx、axios / fetch、net/http、封装的公司内部 HTTP SDK
- RPC / IDL client：gRPC stub、Dubbo @Reference、Thrift client、Kitex/Hertz、自研 RPC 框架 client stub
- 消息队列生产端与消费端：Kafka / RocketMQ / RabbitMQ / Pulsar producer 与 consumer
- 平台/公司内部 SDK 出站：告警、监控、证书、日志、注册发现 client 等——封装在 stubs/vendor 内但调用点在业务代码的也算
- 外部存储：外部 DB 连接与读写（MySQL/PostgreSQL 等）、Redis/OSS 等中间件 client 调用

**后台任务**：定时任务（cron / scheduler 注册点）、独立 goroutine / 线程 / worker、消息消费循环、job 批处理。

### 第 2 步：逐维度提取使用方式与代码案例

对第 1 步定位的点位，按五维度各采集两组事实：

1. **使用说明**：该维度机制在仓内的使用入口——可调用的封装函数（**优先从封装层提取**：业务代码大量走自有封装时，封装层文件全部精读）或配置项（yaml / properties / 配置中心中的超时与重试配置 key、熔断规则配置）。逐条记录：函数签名或配置 key、一句话作用、参数 / 取值说明、定义所在文件路径（不带行号）。读不到显式设置就记「未设置」或「框架默认」，禁止臆造。
2. **代码案例**：从业务代码摘取真实片段（照抄即可用的最小案例），每段注明来源文件路径（不带行号）；同一维度多个典型场景各取一段代表性案例。点位多时按代表性抽样精读，禁止全量阅读。

五维度采集要点：

- **timeout（超时）**：显式超时设置方式（封装参数 / 配置 key / client 构造选项）、超时粒度（connect / read / total / deadline）。
- **retry（重试）**：重试封装函数或框架用法（次数、间隔、退避方式、触发条件、幂等保障）。
- **circuit-breaker（熔断与降级）**：熔断器用法（hystrix / sentinel / resilience4j / 自研）、降级写法（fallback、默认值返回、缓存兜底）。
- **panic-recover（panic/recover 与异常兜底）**：goroutine / 线程 / 任务级 recover 兜底写法、顶层未捕获异常的处理入口。
- **error-swallowing（错误 swallowing）**：error 被丢弃的写法（赋值给 `_`、空 catch、只记日志不上抛）——案例如实摘录，用于反面参照。

### 第 3 步：生成韧性规范文档

输出到被分析仓 `docs/0-tech/resilience-guidelines/` 目录：1 个主文档 `README.md` + 每个维度一个子文档 `resilience-guidelines-{dimension}.md`。

- **主文档 `README.md`** 按 ../assets/resilience-guidelines--readme-template.md 填充：元信息表 + 五维度导航表（维度 / 使用入口概要 / 子文档链接）。
- **每维度子文档** 按 ../assets/resilience-guidelines--dimension-template.md 填充，固定两小节：**使用说明**（封装函数 / 配置项清单表格：函数或配置 key / 作用 / 参数或取值说明 / 定义文件）、**代码案例**（真实代码片段，每段注明来源文件路径）。
- 文档只含上述两项内容——不写调用点分布统计、不写应有约定建议、不写合规性判断。
- 某维度全仓无任何点位（如无熔断器且无降级逻辑）时仍产出该维度文件，两小节写「无」——该维度是治理重点，不得省略。
- 目录不存在则创建（连同 `docs/` 一起创建）；同名文件已存在**直接覆盖更新**。

### 第 4 步：验证 mermaid 图可渲染（有条件必做）

产出文档中含 ```mermaid 代码块时（本资产通常为纯表格与代码片段文档，不含图），交付前必须运行 mermaid 本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/spec-analyze/scripts/validate-mermaid.mjs <产出文件...>
```

全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。

## 输出模板

- 主文档 README 索引：../assets/resilience-guidelines--readme-template.md
- 每维度韧性规范文档：../assets/resilience-guidelines--dimension-template.md

只填占位符、表格行、真实代码片段；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **基于实证**：所有"超时怎么设、重试怎么调、吞错案例在哪"的结论必须有代码或配置支撑，证据形式为 `文件路径`，**不得出现代码行号**（行号随代码变更失效）。读不到就写「未设置」/「框架默认」/「未识别（原因：xxx）」，禁止凭经验臆造函数签名、配置 key 或代码案例。
- **内容边界**：输出文档只含使用说明与代码案例两项内容；不写调用点分布统计、不写"应该"级约定、不做合规性判断。
- **维度 slug 固定**：五大维度 slug 固定为 `timeout` / `retry` / `circuit-breaker` / `panic-recover` / `error-swallowing`；文档内表格中的条目标识从代码标识符（函数名 / 配置 key / 文件名）派生，禁止 AI 自由起名，保证重跑产出同名文件、资产不断代。
- **活文档覆盖更新**：`docs/0-tech/resilience-guidelines/` 下 README 与 `resilience-guidelines-{dimension}.md` 同名直接覆盖，不保留历史副本、不加日期后缀。
- **只读不改**：只读、只分析、只产出文档，不改动被分析代码仓的任何文件（`docs/0-tech/resilience-guidelines/` 下的产出除外）。
- **成品纯净**：最终文档只含成品内容。探测过程（执行的 grep/rg 命令、命中输出摘要）仅供自检，绝不写入最终文档——其结论须以 `文件路径` 证据形式进入相关表格。
- **语言无关**：不预设被分析仓的语言与框架，按第 1 步实际探测结果走。
- **文档语言**：输出文档用中文，技术术语（HTTP / RPC / MQ / SDK / timeout / retry / circuit breaker / fallback / panic / recover 等）保留英文。
- **索引分工**：域索引 `docs/0-tech/README.md` 与总索引 `docs/README.md` 自 v3.0 起不再自动生成（spec-index 已移除），本 skill 不维护；本资产目录的 README 是资产主文档（维度导航），非域索引。
- **与相邻资产边界**：通信协议与封装方式归 tech-external-call-guidelines-analyze 产出的 `docs/0-tech/external-call-guidelines/`；线程池选型、隔离、拒绝策略归 tech-concurrency-guidelines-analyze 产出的 `docs/0-tech/concurrency-guidelines/`。本 skill 只记录故障策略的使用方式与代码案例，越界内容不写入本文档。

## 参考文件索引

| 文件 | 用途 |
| --- | --- |
| ../assets/resilience-guidelines--readme-template.md | 主文档模板（元信息 + 五维度导航表） |
| ../assets/resilience-guidelines--dimension-template.md | 每维度文档模板（使用说明 + 代码案例） |
