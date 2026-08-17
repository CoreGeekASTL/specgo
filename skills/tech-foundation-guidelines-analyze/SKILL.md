---
name: tech-foundation-guidelines-analyze
description: 提取存量代码仓的基础规范资产（日志/配置/告警等横切编码机制的使用指导），单模式提取运行——盘点仓内基础编码机制，产出 README 索引 + 每维度一篇 foundation-guidelines-{dimension}.md；每篇文档只含两项内容：基础机制的函数调用说明（可调用的函数/方法清单：签名、作用、参数、来源文件）与使用代码案例（真实代码片段，注明来源文件路径）。产出落盘被分析仓的 docs/tech/foundation-guidelines/。当用户提到"基础规范"、"日志规范"、"日志怎么用"、"配置规范"、"配置读取方式"、"环境变量"、"告警规范"、"告警 ID"、"告警怎么上报"、"编码指导"、"foundation guidelines"时使用。
---

# 基础规范分析（tech-foundation-guidelines-analyze）

## 目的

输入一个代码仓路径，提取该仓的**基础规范**资产——日志 / 配置 / 告警等横切编码机制的使用指导，回答两个问题：

1. 仓内这些基础编码机制提供了哪些可调用的函数 / 方法（签名、作用、参数、定义在哪个文件）？
2. 业务代码怎么调用它们（真实使用代码案例长什么样）？

与 tech-framework-usage-analyze（框架使用现状：用了什么框架、用法骨架如何）互补——本资产聚焦**基础编码机制的可调用 API 与调用案例**，给编码提供"照抄即可用"的函数级参考。

产出粒度对齐存量代码资产治理规范 v1.1——**按维度拆分，每个维度一个文件**：

| 产出 | 落盘 |
| --- | --- |
| 主文档 `README.md`（机制全景索引）+ 每维度 1 篇 `foundation-guidelines-{dimension}.md` | 被分析仓 `docs/tech/foundation-guidelines/` |

`{dimension}` 维度 slug：三大核心维度固定取 `log`（日志）/ `config`（配置）/ `alarm`（告警）；增补机制 slug 从该机制的代码标识符派生（日志框架名 / 配置中心 client 名 / 告警 SDK 名转 kebab-case），禁止 AI 自由起名——保证重跑产出同名文件、资产不断代。

本 skill 通用，不预设被分析仓的语言与框架，执行时基于实际探测结果走。

## 何时触发

- 用户要建立或刷新"基础规范"文档：把仓内日志 / 配置 / 告警等基础编码机制的函数调用方式沉淀成文。
- 用户要查某基础机制怎么调用："日志怎么打"、"配置怎么读"、"告警怎么上报"。

## 工作流程

按下述步骤顺序执行。每一步都要留下可追溯依据（文件路径、函数名、配置 key、常量名），分析基于**实际读到的代码与配置**，不得臆测。

### 第 1 步：探测基础编码机制清单

三类核心机制逐项探测（语言无关，按仓内实际技术栈取舍线索），确认仓内"有 / 无"该机制、用的什么库或自研封装：

- **日志**：日志库（log4j / slf4j / logback、zap / logrus / klog、loguru / spdlog、winston / pino、console / print 直出等）；统一日志封装层（自有 Logger / 日志工具类）；审计日志专用通道（独立 logger / 独立 appender / 独立文件）。
- **配置**：配置文件（yaml / properties / ini / toml / env 文件）；配置中心 client（Nacos / Apollo / etcd / consul / 自研配置服务）；环境变量读取（os.Getenv / System.getenv / process.env / getenv）；配置结构体绑定与热更新机制。
- **告警**：告警 SDK / 告警平台上报 client（含公司内部告警 SDK）；告警 ID 定义位置（集中常量 / 枚举）；告警上报与恢复调用点（raise / clear、alarm / recover 等成对 API）。

仓内另有横切编码机制且具复用价值的（如监控埋点 metrics、链路追踪 traceId 传递、国际化文案），按实际探测结果增补维度；探测不到某类核心机制时，README 全景表中该行函数清单概要写「未发现」、不产出该维度文件，证明排查过。

### 第 2 步：逐维度提取函数清单与调用案例

每个维度固定采集两组事实：

1. **函数调用说明**：该机制对外可调的函数 / 方法清单——**优先从封装层提取**（业务代码大量走自有封装 API 时，封装层文件全部精读，它是函数清单的第一来源；无封装层时提取框架/库被实际调用的 API 子集）。逐函数记录：签名（函数名 + 关键参数）、一句话作用、参数说明、定义所在文件路径（不带行号）。
2. **使用代码案例**：从业务代码中摘取真实调用片段（照抄即可用的最小案例），每段注明来源文件路径（不带行号）；同一函数多个典型场景（如日志的 DEBUG/ERROR、告警的上报/恢复）各取一段代表性案例。调用点多时按代表性抽样精读，禁止全量阅读。

读不到显式实现就记「未设置」或「未识别（原因：xxx）」，禁止臆造函数签名或案例。

### 第 3 步：生成基础规范文档

输出到被分析仓 `docs/tech/foundation-guidelines/` 目录：1 个主文档 `README.md` + 每个维度一个子文档 `foundation-guidelines-{dimension}.md`。

- **主文档 `README.md`** 按 references/readme-template.md 填充：元信息表 + 机制全景表（维度 / 使用框架或 SDK / 函数清单概要 / 子文档链接）+ 附注（排查到但无法判定归属 / 待人工确认的机制或调用点）。
- **每维度子文档** 按 references/dimension-template.md 填充，固定两小节：**函数调用说明**（函数清单表格：函数 / 作用 / 参数说明 / 定义文件）、**使用代码案例**（真实代码片段，每段注明来源文件路径）。
- 文档只含上述两项内容——不写调用点分布统计、不写应有约定建议、不写合规性判断。
- 探测不到的核心维度不产出子文档，仅在 README 全景表中保留一行并标注「未发现」。
- 同名文件已存在**直接覆盖更新**——规范文档是活文档，固定名、覆盖更新，git diff 即演进史。

### 第 4 步：验证 mermaid 图可渲染（收尾必做）

产出文档中含 ```mermaid 代码块（如机制调用关系图）时，交付前必须运行 mermaid-validate skill 的本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/mermaid-validate/scripts/validate-mermaid.mjs <产出文件...>
```

- 全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。
- 画图规则（label 一律加引号、时序图消息禁 `;`、裸 `end` 禁用等）见 mermaid-validate skill 的「语法红线」。

## 输出模板

- 主文档 README 索引：references/readme-template.md
- 每维度基础规范文档：references/dimension-template.md

只填占位符、表格行、真实代码片段；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **基于实证**：所有"机制提供哪些函数、怎么调用"的结论必须有代码或配置支撑，证据形式为 `文件路径`，**不得出现代码行号**（行号随代码变更失效）。读不到就写「未识别（原因：xxx）」/「未设置」，禁止凭经验臆造函数签名、参数或调用案例。
- **内容边界**：输出文档只含函数调用说明与使用代码案例两项内容；不写调用点分布统计、不写"应该"级约定、不做合规性判断。
- **维度 slug 固定或从代码标识符派生**：三大核心维度 slug 固定为 `log` / `config` / `alarm`；增补机制 slug 取该机制的代码标识符（框架名 / client 名 / SDK 名）转 kebab-case，禁止 AI 自由起名，保证重跑产出同名文件、资产不断代。
- **活文档覆盖更新**：`docs/tech/foundation-guidelines/` 下 README 与 `foundation-guidelines-{dimension}.md` 同名直接覆盖，不保留历史副本、不加日期后缀。
- **只读不改**：只读、只分析、只产出文档，不改动被分析代码仓的任何文件（`docs/tech/foundation-guidelines/` 下的产出除外）。
- **成品纯净**：最终文档只含成品内容。扫描过程（执行的 grep/rg 命令、命中输出摘要）仅供自检，绝不写入最终文档——其结论须以 `文件路径` 证据形式进入相关表格。
- **语言无关**：不预设被分析仓的语言与框架，按第 1 步实际探测结果走。
- **文档语言**：输出文档用中文，技术术语（DEBUG / INFO / WARN / ERROR / Nacos / SDK / metrics / traceId 等）保留英文。
- **索引分工**：域索引 `docs/tech/README.md` 与总索引 `docs/README.md` 由 spec-index 生成，本 skill 不维护；本资产目录的 README 是资产主文档（机制全景 + 维度导航），非域索引。
- **mermaid 校验**：产出含 ```mermaid 代码块时，收尾必须用 `node <specgo插件目录>/skills/mermaid-validate/scripts/validate-mermaid.mjs <产出文件...>` 逐文件校验，全部 VALID 才算完成；INVALID 按报错修复后重验，禁止跳过。
- **与相邻资产互补**：框架用法骨架（用了什么框架、怎么用）归 tech-framework-usage-analyze 的 `docs/tech/usage/`；超时 / 重试 / 熔断等故障策略归 tech-resilience-guidelines-analyze；跨服务调用规范归 tech-comm-guidelines-analyze；命名 / 函数长度等"必须"级编码红线归 qual-code-standards-analyze。本 skill 只管日志 / 配置 / 告警等基础编码机制的函数级使用参考。

## 参考文件索引

| 文件 | 用途 |
| --- | --- |
| references/readme-template.md | 主文档模板（元信息 + 机制全景表 + 附注） |
| references/dimension-template.md | 每维度文档模板（函数调用说明 + 使用代码案例） |
