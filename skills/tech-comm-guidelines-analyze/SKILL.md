---
name: tech-comm-guidelines-analyze
description: 治理存量代码仓的通信规范资产（RPC/HTTP/MQ 等跨服务调用指导：本服务调用了哪些外部业务节点、协议与封装方式、超时重试与错误码处理），双模式运行——提取模式扫描仓内全部出站调用（HTTP 客户端 / RPC client / IDL client stub / 消息队列生产端 / 进程间通信 / 平台 SDK），按被调外部业务服务归类成文；差距分析模式对照既有通信规范文档核查实际调用的合规差距。边界：只承载业务节点间跨服务调用——DB/Redis/对象存储等数据存储的访问不视为外部服务调用，归 tech-data-access-guidelines-analyze。产出落盘被分析仓的 docs/tech/comm-guidelines/：README 索引 + 每外部服务一篇 comm-guidelines-{service}.md；差距报告落盘 docs/tech/comm-guidelines/report/{YYYYMMDD}-comm-guidelines.md。当用户提到"通信规范"、"外部调用"、"下游接口"、"出站调用"、"调用了哪些外部服务"、"服务依赖盘点"、"跨服务调用指导"、"调用规范差距分析"、"对照通信规范检查"、"external call"、"comm guidelines"时使用。
---

# 通信规范分析（tech-comm-guidelines-analyze）

## 目的

输入一个代码仓路径，治理该仓的**通信规范**资产——回答两个问题：

1. 本服务出站调用了哪些外部服务的哪些接口（业务场景、接口功能、调用位置、协议信息）？
2. 这些实际调用与既定通信规范之间有没有差距（协议封装 / 超时 / 重试 / 错误码处理是否遵守规范）？

与 biz-interface-analyze（入站方向：本服务对外暴露什么接口）互补，本 skill 管出站方向。

**资产边界（严格遵守）**：本资产只承载**业务节点间的跨服务调用**——被调方是独立部署的业务服务/平台服务（有服务发现名或业务接口）。**DB / Redis / 对象存储等数据存储不视为外部服务调用**，其访问指导（连接管理、驱动、SQL/命令）归 tech-data-access-guidelines-analyze 产出的 `docs/tech/data-access-guidelines/`；扫描命中数据存储连接点（如 DSN、连接串获取）时不立 comm-guidelines 篇，在 README 标注"归 data-access-guidelines 承载"。进程内引用的库/框架归 tech-framework-guidelines-analyze。

产出粒度对齐存量代码资产治理规范 v1.1：

| 模式 | 产出 | 落盘 |
| --- | --- | --- |
| 提取模式 | README 索引 + 每外部服务 1 篇 `comm-guidelines-{service}.md` | 被分析仓 `docs/tech/comm-guidelines/` |
| 差距分析模式 | 差距报告 1 篇 `{YYYYMMDD}-comm-guidelines.md` | 被分析仓 `docs/tech/comm-guidelines/report/` |

`{service}` 实例 slug 一律从代码标识符派生（服务发现名 / 配置 key / client 类名转 kebab-case），禁止 AI 自由起名——保证重跑产出同名文件、资产不断代。

本 skill 通用，不预设被分析仓的语言与框架，执行时基于实际探测结果走。

## 何时触发

- 用户要盘点代码仓依赖哪些下游服务、梳理出站调用清单、做依赖治理 / 影响分析 / 新人上手。
- 用户要建立或刷新"通信规范"文档：把仓内跨服务调用的协议、封装方式、超时重试、错误码处理现状沉淀成文。
- 用户给出一份通信规范文档（或仓内 `docs/tech/comm-guidelines/` 下已有规范），要求对照规范检查实际调用是否遵守、输出差距报告。

## 运行模式

### 提取模式（默认）

仓内无既有通信规范、用户也未提供规范文档时走本模式。扫描仓内全部出站调用，按被调外部服务归类，产出 README 索引 + 每服务一篇 `comm-guidelines-{service}.md`，作为通信规范的事实基线（活文档，同名覆盖更新）。

### 差距分析模式

仓内已存在通信规范文档（`docs/tech/comm-guidelines/` 下既有 guidelines 文档），或用户显式提供规范文件时走本模式。以规范为基准，对照扫描实际调用：协议封装方式、超时设置、重试策略、错误码处理是否遵守规范，产出差距报告 `docs/tech/comm-guidelines/report/{YYYYMMDD}-comm-guidelines.md`（逐服务一节：合规项 / 差距项 / 证据文件路径）。差距报告为次抛件，带日期、不覆盖。

guidelines 形态语义：通信规范是**指导性规范**（"应该"遵守），违反出报告提示改进，不做 CI 拦截——拦截是 standards 形态资产的语义。

### 模式缺省回退

用户要求差距分析、但未提供规范文档且 `docs/tech/comm-guidelines/` 下也无既有规范时，默认回退提取模式，并在产出的 README 索引末尾注明「规范未建，本次为现状提取」。

## 工作流程

按下述步骤顺序执行。每一步都要留下可追溯依据（文件路径、配置 key），分析基于**实际读到的代码与配置**，不得臆测。

### 第 1 步：判定运行模式

- 用户显式提供规范文件 → 差距分析模式，规范来源记为该文件路径。
- 否则检查被分析仓 `docs/tech/comm-guidelines/` 下是否已有 `comm-guidelines-*.md` 规范文档 → 有则询问或直接按差距分析模式执行（用户意图是"检查 / 对照 / 差距"时直接执行），规范来源记为该目录下文档。
- 都没有 → 提取模式；若用户本意是差距分析，在 README 末尾注明「规范未建，本次为现状提取」。

### 第 2 步：全仓扫描，识别出站调用点

按以下模式全仓搜索（语言无关，按仓内实际技术栈取舍）：

- **HTTP 客户端**：RestTemplate / WebClient / @FeignClient、okhttp、HttpClient、requests / httpx、axios / fetch、Go net/http、封装的公司内部 HTTP SDK
- **RPC / IDL client**：gRPC stub（NewXxxClient）、Dubbo @Reference、Thrift client、Kitex/Hertz、自研 RPC 框架 client stub
- **消息队列生产端**：Kafka producer、RocketMQ producer、RabbitMQ publish、Pulsar producer
- **进程间通信**：Unix domain socket、命名管道、共享内存、本地 RPC/signal 调用
- **平台/公司内部 SDK 出站**：告警 SDK、监控/话统 SDK、证书 SDK、日志 SDK、注册发现 client 等——封装在 stubs/vendor 内但**调用点在业务代码**的也算出站调用，记录业务调用位置
- **外部存储**：外部 DB 连接（MySQL/PostgreSQL 等，含连接串获取方式）、Redis/OSS 等中间件 client 调用
- **配置辅助定位**：yaml / properties / 配置中心中的下游服务地址（host:port、服务发现名）、代理/网关封装层；微服务框架的 `references`/依赖声明清单

每个调用点记录：协议类型、接口标识（URL path / RPC 方法 / topic）、调用位置（所在文件，**不带行号**）、所在函数与业务模块。

差距分析模式下，每个调用点还需额外记录四项核查事实：**封装方式**（直连裸 client 还是走统一封装层）、**超时设置**（有无显式超时、取值来源）、**重试策略**（有无重试、次数与退避）、**错误码处理**（响应错误码 / 异常如何分类处理）——读不到显式设置就记「未设置」或「框架默认」，禁止臆造取值。

### 第 3 步：判定目标服务归属

按优先级推断每个调用点属于哪个外部服务：

1. **显式服务名**：服务发现名、Feign name、gRPC target、配置 key 中的服务名
2. **配置映射**：host/域名/IP+端口 在配置文件中的服务命名
3. **上下文推断**：包名/类名/常量命名（如 XxxServiceClient）、注释
4. **无法判定的归入「未知服务」分组**，标注待人工确认——**不臆造服务名**

服务名确定后转 kebab-case 作为 `{service}` slug（如 `auth-service`、`AuthCenterClient` → `auth-center-client`）。

### 第 4 步（提取模式）：生成通信规范文档

输出到被分析仓 `docs/tech/comm-guidelines/` 目录：1 个主文档 `README.md` + 每个外部服务一个子文档 `comm-guidelines-{service}.md`。

主文档按 references/readme-template.md 填充（元信息表 + 外部服务全景表）；子文档按 references/service-template.md 填充（按协议分二级小节，每个外部调用接口一个三级章节：业务场景、接口功能、调用位置、协议信息——协议/封装方式/超时重试/错误码处理现状）。

规则：

- **业务场景不得臆造**：从调用点上下文推断；推断不出标「待确认」
- 同一接口多处调用：合并为一个章节，调用位置列出全部文件
- **预留死代码单列**：客户端封装存在但无任何业务调用方的（如未被引用的 Redis/OSS client），不计入接口清单，有此类情况时在 README 表格后追加「附注」节逐条列出
- **配置声明 vs 实际调用差异**：微服务框架依赖声明（如 references）中声明了但代码中无实际调用的下游，同上在「附注」节列出，避免误导依赖治理
- 需要下游依赖全景图时，可在 README 表格前加 mermaid flowchart（可选，非必需）
- 同名文件已存在**直接覆盖更新**——规范文档是活文档，固定名、覆盖更新，git diff 即演进史

### 第 5 步（差距分析模式）：对照规范核查并生成差距报告

以第 1 步确定的规范文档为基准，逐服务、逐规范条目核查第 2 步采集的调用事实：

- 核查维度固定四项：**协议与封装方式**（是否走规范要求的协议 / 统一封装层）、**超时**（是否按规范设置显式超时）、**重试**（重试次数 / 退避是否符合规范，含规范禁止重试而实际重试的情形）、**错误码处理**（错误码分类与处理路径是否遵守规范）。
- 每条核查结论落三类之一：**合规项**（实际调用遵守规范，附证据文件路径）、**差距项**（违反规范或规范有要求而代码未实现，附证据文件路径与现状说明）、**规范未覆盖**（实际存在调用但规范未约定，单列提示规范补全）。
- 规范条目中在代码里找不到任何对应调用点的，记「规范条目无实现」，不臆造实现位置。
- 产出差距报告 `docs/tech/comm-guidelines/report/{YYYYMMDD}-comm-guidelines.md`，按 references/gap-report-template.md 填充：结论概览表 + 逐服务一节（合规项 / 差距项 / 规范未覆盖，各项均附证据文件路径）。
- 差距报告**只新增不覆盖**，文件名带日期；同日重跑同名覆盖。

### 第 6 步：验证 mermaid 图可渲染（收尾必做）

产出文档中含 ```mermaid 代码块（下游依赖全景图等）时，交付前必须运行 mermaid-validate skill 的本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/mermaid-validate/scripts/validate-mermaid.mjs <产出文件...>
```

- 全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。
- 画图规则（label 一律加引号、时序图消息禁 `;`、裸 `end` 禁用等）见 mermaid-validate skill 的「语法红线」。

## 输出模板

- README 索引（提取模式）：references/readme-template.md
- 每服务通信规范文档（提取模式）：references/service-template.md
- 差距报告（差距分析模式）：references/gap-report-template.md

只填占位符、表格行、图；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **基于实证**：所有"调用了哪个服务、走什么协议、超时重试如何、是否合规"的结论必须有代码或配置支撑，证据形式为 `文件路径`，**不得出现代码行号**（行号随代码变更失效）。读不到就写「未识别（原因：xxx）」/「未设置」，禁止凭经验臆造服务名、超时取值或合规结论。
- **实例 slug 从代码标识符派生**：`{service}` 取服务发现名 / 配置 key / client 类名转 kebab-case，禁止 AI 自由起名，保证重跑产出同名文件、资产不断代。
- **活文档覆盖更新**：`docs/tech/comm-guidelines/` 下 README 与 `comm-guidelines-{service}.md` 同名直接覆盖，不保留历史副本、不加日期后缀；**差距报告才带日期**，落 `report/` 子目录、次抛。
- **只读不改**：只读、只分析、只产出文档，不改动被分析代码仓的任何文件（`docs/tech/comm-guidelines/` 下的产出除外）。
- **成品纯净**：最终文档只含成品内容。扫描过程（执行的 grep/rg 命令、命中输出摘要）仅供自检，绝不写入最终文档——其结论须以 `文件路径` 证据形式进入相关表格。
- **语言无关**：不预设被分析仓的语言与框架，按第 2 步实际探测结果走。
- **文档语言**：输出文档用中文，技术术语（HTTP / RPC / gRPC / MQ / SDK / timeout / retry 等）保留英文。
- **索引分工**：域索引 `docs/tech/README.md` 与总索引 `docs/README.md` 由 spec-index 生成，本 skill 不维护。
- **与相邻资产互补**：入站接口看 biz-interface-analyze 产出的 `docs/biz/interface/`；纯故障策略（熔断 / 降级）的专项规范归 tech-resilience-guidelines-analyze，本 skill 只记录调用点的超时/重试/错误码处理事实与合规性。

## 参考文件索引

| 文件 | 用途 |
| --- | --- |
| references/readme-template.md | 提取模式 README 索引模板（元信息 + 外部服务全景表 + 附注） |
| references/service-template.md | 提取模式每服务文档模板（接口清单 + 按协议分节，含协议信息四项） |
| references/gap-report-template.md | 差距分析模式差距报告模板（结论概览 + 逐服务合规项/差距项/规范未覆盖） |
