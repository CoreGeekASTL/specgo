---
name: tech-foundation-guidelines-analyze
description: 治理存量代码仓的基础规范资产（日志/配置/告警等横切编码机制的编码指导：日志级别使用/敏感信息脱敏/审计日志、配置读取方式/默认值处理/环境变量、告警 ID 使用/上报与恢复配对），双模式运行——起草模式盘点仓内基础编码机制使用现状，产出 README 索引 + 每维度一篇 foundation-guidelines-{dimension}.md（每篇含使用模式、调用点分布、应有约定建议）；差距分析模式对照既有基础规范逐维度逐条目核查合规差距。产出落盘被分析仓的 docs/tech/foundation-guidelines/：README.md + foundation-guidelines-{dimension}.md；差距报告落盘 docs/tech/foundation-guidelines/report/{YYYYMMDD}-foundation-guidelines.md。当用户提到"基础规范"、"日志规范"、"日志级别使用"、"敏感信息脱敏"、"审计日志"、"配置规范"、"配置读取方式"、"默认值处理"、"环境变量"、"告警规范"、"告警 ID"、"告警上报与恢复配对"、"对照基础规范检查"、"编码指导"、"foundation guidelines"时使用。
---

# 基础规范分析（tech-foundation-guidelines-analyze）

## 目的

输入一个代码仓路径，治理该仓的**基础规范**资产——日志 / 配置 / 告警等横切编码机制的编码指导，回答两个问题：

1. 仓内这些基础编码机制现在是怎么用的（使用模式是什么、调用点分布在哪些文件）？
2. 应该怎样用（应有约定建议）？既有规范与实际代码之间有没有差距？

与 tech-usage-analyze（提取型纯现状：用了什么框架、用法骨架如何）互补——本资产是 guidelines 形态：现状之上给出"应该"级约定，并支持对照规范的差距核查。框架本身的用法骨架归 `docs/tech/usage/`；机制的编码约定（日志级别怎么选、敏感信息怎么脱敏、配置默认值怎么给、告警上报与恢复怎么配对）归本资产。

产出粒度对齐存量代码资产治理规范 v1.1——**按维度拆分，每个维度一个文件**：

| 模式 | 产出 | 落盘 |
| --- | --- | --- |
| 起草模式 | 主文档 `README.md`（机制全景索引）+ 每维度 1 篇 `foundation-guidelines-{dimension}.md` | 被分析仓 `docs/tech/foundation-guidelines/` |
| 差距分析模式 | 差距报告 1 篇 `{YYYYMMDD}-foundation-guidelines.md` | 被分析仓 `docs/tech/foundation-guidelines/report/` |

`{dimension}` 维度 slug：三大核心维度固定取 `log`（日志）/ `config`（配置）/ `alarm`（告警）；增补机制 slug 从该机制的代码标识符派生（日志框架名 / 配置中心 client 名 / 告警 SDK 名转 kebab-case），禁止 AI 自由起名——保证重跑产出同名文件、资产不断代。

本 skill 通用，不预设被分析仓的语言与框架，执行时基于实际探测结果走。

## 何时触发

- 用户要建立或刷新"基础规范"文档：把仓内日志 / 配置 / 告警等基础编码机制的使用现状与应有约定沉淀成文。
- 用户要盘点仓内日志级别使用、敏感信息脱敏、审计日志、配置读取方式、默认值处理、环境变量、告警 ID、告警上报与恢复配对的现状。
- 用户给出一份基础规范文档（或仓内 `docs/tech/foundation-guidelines/` 下已有规范），要求对照规范检查实际代码是否遵守、输出差距报告。

## 运行模式

### 起草模式（默认）

仓内无既有基础规范、用户也未提供规范文档时走本模式。盘点仓内基础编码机制使用现状——日志（级别使用 / 敏感信息脱敏 / 审计日志）、配置（配置读取方式 / 默认值处理 / 环境变量）、告警（告警 ID 使用 / 上报与恢复配对）——产出主文档 `README.md`（元信息 + 机制全景表 + 各维度导航）+ 每维度一篇 `foundation-guidelines-{dimension}.md`（使用模式、调用点分布（文件路径）、应有约定建议），作为基础规范的事实基线（活文档，同名覆盖更新）。

### 差距分析模式

仓内已存在基础规范文档（`docs/tech/foundation-guidelines/` 下既有 README 与 `foundation-guidelines-*.md`），或用户显式提供规范文件时走本模式。以规范为基准，对照扫描实际代码：逐维度、逐规范条目核查是否遵守，产出差距报告 `docs/tech/foundation-guidelines/report/{YYYYMMDD}-foundation-guidelines.md`（逐维度一节：合规项 / 差距项 / 规范未覆盖 / 规范条目无实现，各项附证据文件路径）。差距报告为次抛件，带日期、不覆盖。

guidelines 形态语义：基础规范是**指导性规范**（"应该"遵守），违反出报告提示改进，不做 CI 拦截——拦截是 standards 形态资产（如 qual-code-standards-analyze）的语义。

### 模式缺省回退

用户要求差距分析、但未提供规范文档且 `docs/tech/foundation-guidelines/` 下也无既有规范时，默认回退起草模式，并在 README 末尾注明「规范未建，本次为现状提取 + 约定建议」。

## 工作流程

按下述步骤顺序执行。每一步都要留下可追溯依据（文件路径、配置 key、常量名），分析基于**实际读到的代码与配置**，不得臆测。

### 第 1 步：判定运行模式

- 用户显式提供规范文件 → 差距分析模式，规范来源记为该文件路径。
- 否则检查被分析仓 `docs/tech/foundation-guidelines/` 下是否已有 `foundation-guidelines-*.md` 规范文档 → 存在且用户意图是"检查 / 对照 / 差距"时按差距分析模式执行，规范来源记为该目录下文档。
- 都没有 → 起草模式；若用户本意是差距分析，在 README 末尾注明「规范未建，本次为现状提取 + 约定建议」。

### 第 2 步：探测基础编码机制清单

三类核心机制逐项探测（语言无关，按仓内实际技术栈取舍线索），确认仓内"有 / 无"该机制、用的什么库或自研封装：

- **日志**：日志库（log4j / slf4j / logback、zap / logrus / klog、loguru / spdlog、winston / pino、console / print 直出等）；统一日志封装层（自有 Logger / 日志工具类）；审计日志专用通道（独立 logger / 独立 appender / 独立文件）。
- **配置**：配置文件（yaml / properties / ini / toml / env 文件）；配置中心 client（Nacos / Apollo / etcd / consul / 自研配置服务）；环境变量读取（os.Getenv / System.getenv / process.env / getenv）；配置结构体绑定与热更新机制。
- **告警**：告警 SDK / 告警平台上报 client（含公司内部告警 SDK）；告警 ID 定义位置（集中常量 / 枚举 vs 散落魔法数）；告警上报与恢复调用点（raise / clear、alarm / recover 等成对 API）。

仓内另有横切编码机制且具规范价值的（如监控埋点 metrics、链路追踪 traceId 传递、国际化文案），按实际探测结果增补维度；探测不到某类核心机制时，README 全景表中该行现状要点写「未发现」、不产出该维度文件，证明排查过。

### 第 3 步：逐维度分析使用现状

每个维度固定采集三组事实：

1. **使用模式**：从代码归纳的用法骨架——logger 怎么获取与打日志、配置怎么读取与缺省处理、告警 ID 怎么定义与上报 / 恢复；提取为可照写的代码骨架片段（真实代码，注明来源文件路径）。**优先识别封装层**：业务代码大量走自有封装 API 时，封装层文件全部精读，它是使用模式的第一来源。
2. **调用点分布**：按维度的关注维度统计调用点并列出文件路径（不带行号），按模块聚类；调用点多时按代表性抽样精读，禁止全量阅读：
   - 日志：**级别使用**（DEBUG / INFO / WARN / ERROR 各用于什么场景，有无级别滥用）、**敏感信息脱敏**（密码 / 密钥 / 证件号 / 手机号 / IMEI 等是否脱敏及脱敏方式）、**审计日志**（操作审计 / 登录审计等有无、记录内容、输出通道）；
   - 配置：**配置读取方式**（配置文件 / 配置中心 / 环境变量各自入口，有无散落硬编码）、**默认值处理**（缺配时的缺省值与行为，有无静默零值 / 缺配即崩溃）、**环境变量**（哪些配置走环境变量、命名规律、与配置文件是否混用冲突）；
   - 告警：**告警 ID 使用**（集中定义还是散落、命名规律）、**上报与恢复配对**（每条上报是否有对应恢复、恢复条件，只报不恢复的逐条记录）。
3. **差距分析模式追加**：按规范条目的核查维度逐项记录核查事实（如规范要求"ERROR 级日志必须关联告警 ID"，则记录每个 ERROR 日志点是否关联）——读不到显式实现就记「未设置」或「未识别（原因：xxx）」，禁止臆造。

### 第 4 步（起草模式）：生成基础规范文档

输出到被分析仓 `docs/tech/foundation-guidelines/` 目录：1 个主文档 `README.md` + 每个维度一个子文档 `foundation-guidelines-{dimension}.md`。

- **主文档 `README.md`** 按 references/readme-template.md 填充：元信息表 + 机制全景表（维度 / 使用框架或 SDK / 调用点分布概要 / 现状要点 / 子文档链接）+ 附注（排查到但无法判定归属 / 待人工确认的机制或调用点）。
- **每维度子文档** 按 references/dimension-template.md 填充，固定三小节：**使用模式**（用法骨架 + 真实代码片段注明来源文件路径）、**调用点分布**（按关注维度列表，文件路径不带行号）、**应有约定建议**（基于现状归纳的"应该"级约定条目，逐条编号——编号供差距分析模式逐条对照引用，每条标注「现状已遵守 / 现状部分遵守 / 现状缺失」）。
- 约定建议从代码事实与业界通行做法归纳，不得脱离仓内现状凭空立法；业务语义推断不出标「待确认」。
- 探测不到的核心维度不产出子文档，仅在 README 全景表中保留一行并标注「未发现」。
- 同名文件已存在**直接覆盖更新**——规范文档是活文档，固定名、覆盖更新，git diff 即演进史。

### 第 5 步（差距分析模式）：对照规范核查并生成差距报告

以第 1 步确定的规范文档为基准，逐维度、逐规范条目核查第 3 步采集的事实：

- 核查维度按机制固定：日志（级别使用 / 敏感信息脱敏 / 审计日志）、配置（配置读取方式 / 默认值处理 / 环境变量）、告警（告警 ID 使用 / 上报与恢复配对）；增补机制按该机制规范条目对应的维度。
- 每条核查结论落三类之一：**合规项**（遵守规范，附证据文件路径）、**差距项**（违反规范或规范有要求而代码未实现，附证据文件路径、现状说明与建议）、**规范未覆盖**（实际存在该机制调用但规范未约定，单列提示规范补全）。
- 规范条目中在代码里找不到任何对应实现点的，记「规范条目无实现」，不臆造实现位置。
- 产出差距报告 `docs/tech/foundation-guidelines/report/{YYYYMMDD}-foundation-guidelines.md`，按 references/gap-report-template.md 填充：结论概览表 + 逐维度一节（合规项 / 差距项 / 规范未覆盖 / 规范条目无实现，各项均附证据文件路径）。差距报告为仓级单篇次抛件，不按维度拆分。
- 差距报告**只新增不覆盖**，文件名带日期；同日重跑同名覆盖。

### 第 6 步：验证 mermaid 图可渲染（收尾必做）

产出文档中含 ```mermaid 代码块（如机制调用分布图）时，交付前必须运行 spec-mermaid-diagram skill 的本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/spec-mermaid-diagram/scripts/validate-mermaid.mjs <产出文件...>
```

- 全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。
- 画图规则（label 一律加引号、时序图消息禁 `;`、裸 `end` 禁用等）见 spec-mermaid-diagram skill 的「语法红线」。

## 输出模板

- 主文档 README 索引（起草模式）：references/readme-template.md
- 每维度基础规范文档（起草模式）：references/dimension-template.md
- 差距报告（差距分析模式）：references/gap-report-template.md

只填占位符、表格行、真实代码片段；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **基于实证**：所有"机制怎么用、调用点在哪、是否合规"的结论必须有代码或配置支撑，证据形式为 `文件路径`，**不得出现代码行号**（行号随代码变更失效）。读不到就写「未识别（原因：xxx）」/「未设置」，禁止凭经验臆造机制、取值或合规结论。
- **维度 slug 固定或从代码标识符派生**：三大核心维度 slug 固定为 `log` / `config` / `alarm`；增补机制 slug 取该机制的代码标识符（框架名 / client 名 / SDK 名）转 kebab-case，禁止 AI 自由起名，保证重跑产出同名文件、资产不断代。
- **约定编号跨维度唯一**：约定条目编号带维度前缀（日志 LOG-xx / 配置 CONF-xx / 告警 ALM-xx / 增补机制自取前缀），全资产内唯一，供差距分析模式逐条对照引用。
- **活文档覆盖更新**：`docs/tech/foundation-guidelines/` 下 README 与 `foundation-guidelines-{dimension}.md` 同名直接覆盖，不保留历史副本、不加日期后缀；**差距报告才带日期**，落 `report/` 子目录、次抛。
- **只读不改**：只读、只分析、只产出文档，不改动被分析代码仓的任何文件（`docs/tech/foundation-guidelines/` 下的产出除外）。
- **成品纯净**：最终文档只含成品内容。扫描过程（执行的 grep/rg 命令、命中输出摘要）仅供自检，绝不写入最终文档——其结论须以 `文件路径` 证据形式进入相关表格。
- **语言无关**：不预设被分析仓的语言与框架，按第 2 步实际探测结果走。
- **文档语言**：输出文档用中文，技术术语（DEBUG / INFO / WARN / ERROR / Nacos / SDK / metrics / traceId 等）保留英文。
- **索引分工**：域索引 `docs/tech/README.md` 与总索引 `docs/README.md` 由 all-index 生成，本 skill 不维护；本资产目录的 README 是资产主文档（机制全景 + 维度导航），非域索引。
- **mermaid 校验**：产出含 ```mermaid 代码块时，收尾必须用 `node <specgo插件目录>/skills/spec-mermaid-diagram/scripts/validate-mermaid.mjs <产出文件...>` 逐文件校验，全部 VALID 才算完成；INVALID 按报错修复后重验，禁止跳过。
- **与相邻资产互补**：框架用法骨架（用了什么框架、怎么用）归 tech-usage-analyze 的 `docs/tech/usage/`；超时 / 重试 / 熔断等故障策略归 tech-resilience-guidelines-analyze；跨服务调用规范归 tech-comm-guidelines-analyze；命名 / 函数长度等"必须"级编码红线归 qual-code-standards-analyze。本 skill 只管日志 / 配置 / 告警等基础编码机制的"应该"级约定。

## 参考文件索引

| 文件 | 用途 |
| --- | --- |
| references/readme-template.md | 起草模式主文档模板（元信息 + 机制全景表 + 维度导航 + 附注） |
| references/dimension-template.md | 起草模式每维度文档模板（使用模式 / 调用点分布 / 应有约定建议） |
| references/gap-report-template.md | 差距分析模式差距报告模板（结论概览 + 逐维度合规项 / 差距项 / 规范未覆盖 / 规范条目无实现） |
