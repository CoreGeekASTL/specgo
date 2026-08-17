---
name: spec-index
description: >-
  生成被分析仓 docs/ 资产体系的索引层——各域索引 docs/0-{域}/README.md（列出本域各资产目录及目录内真实文件清单，每文件一句话说明、从文件首行标题提取，无资产的域不生成）+ 总索引 docs/README.md（四域导航表 + 服务依赖全景图：mermaid flowchart，从 docs/0-tech/comm-guidelines/ 各文档提取本仓→下游服务依赖边；通信规范资产未建时该节注明"通信规范资产未建"）。索引为活文档，同名覆盖更新并标注生成时间；只聚合真实存在的文件、不重述资产正文。当各 analyze skill 跑完需要统一生成/刷新导航、spec-init 建骨架或迁移后首次建索引、资产增删后刷新索引、需要下游依赖全景图时使用。触发场景包括"生成索引"、"docs 索引"、"域索引"、"总索引"、"资产导航"、"服务依赖全景图"、"依赖全景图"、"刷新 README 索引"、"刷新索引"、"spec-index"等。
---

# 资产索引生成 Skill（spec-index）

## 目的

为被分析仓的 `docs/` 资产体系生成**索引层**——不分析代码、不产出资产内容，只聚合各 analyze skill 的既有产出，回答三个问题：

1. 本仓已建了哪些域、哪些资产？
2. 每篇资产文档讲什么（一句话）？
3. 本仓依赖哪些下游服务（全景图）？

产出粒度（对齐存量代码资产治理命名规范 v1.1）：

| 产出 | 内容 | 落盘 |
| --- | --- | --- |
| 域索引 | 本域各资产目录 + 目录内文件清单（每文件一句话说明） | 被分析仓 `docs/0-{域}/README.md`（每有资产的域 1 篇） |
| 总索引 | 四域导航表 + 服务依赖全景图（mermaid flowchart） | 被分析仓 `docs/README.md` |

索引为活文档：同名覆盖更新、标注生成时间、重跑幂等。只索引真实存在的文件，无资产的域不生成索引；索引**只聚合不重述**——资产正文（接口表格、规则条目、模型图等）一律不拷进索引。

本 skill 与被分析仓语言/框架无关：只读 `docs/`，不读代码。资产目录内的 README（如 `docs/0-biz/interface/README.md` 主文档）归各 analyze skill 维护，本 skill 只产出 `docs/0-{域}/README.md` 与 `docs/README.md`，不覆盖资产级 README。

## 何时触发

- 各 analyze skill 跑完一轮后，需要统一生成或刷新 `docs/` 导航索引。
- spec-init 建骨架/迁移完成后，首次生成索引。
- 资产文档增删后（新建某资产、重跑某 analyze skill），刷新索引保持导航准确。
- 需要一张"本仓 → 下游服务"依赖全景图时。
- 典型触发语："生成索引""docs 索引""域索引""总索引""资产导航""服务依赖全景图""刷新 README 索引""spec-index"。

## 工作流程

按下述步骤顺序执行。索引基于**实际扫描到的 `docs/` 文件**，不得臆造文件、臆造说明。

### 第 1 步：扫描 docs/ 现状

- 确认被分析仓根路径。
- `docs/` 不存在 → 直接告知用户"资产目录未建，请先运行 spec-init 建骨架、运行各 analyze skill 产出资产"，**停止，不创建空索引**。
- 枚举 `docs/` 下一层目录，对照受控域名表（`0-arch`/`0-biz`/`0-tech`/`0-qual`）识别四域；taxonomy 外目录（如历史遗留 `docs/business/`、`docs/technical/`）不索引，记入总索引「附注」节交用户判断（可提示运行 spec-init 迁移）。
- 逐域枚举资产目录（只认 HELP.MD taxonomy 内的资产目录名）与目录内真实存在的 `.md` 文件，并记录各资产目录 `report/` 子目录内的差距报告数量与最新日期。

受控域名表（唯一权威为插件根 HELP.MD 第 1、2 章，此处为查表快照）：

| 域 | 中文名 | 治理问题 |
| --- | --- | --- |
| `0-arch` | 架构要素 | 定结构：代码往哪放 |
| `0-biz` | 业务要素 | 定业务：对象怎么建、数据存什么 |
| `0-tech` | 技术要素 | 定用法：机制怎么用、调用怎么跑 |
| `0-qual` | 工程要素 | 定规矩：写到什么程度才算合格 |

受控资产目录表（资产目录 → 资产中文名 + 内涵一句话，域索引各资产节的说明文字从这里查，禁止自由发挥）：

| 资产目录 | 资产中文名 | 内涵一句话 |
| --- | --- | --- |
| `0-arch/structure-model` | 结构模型 | 模块划分、分层、职责与依赖关系（UML 包图 + 依赖矩阵） |
| `0-arch/interaction-model` | 交互模型 | 模块间主业务流程、消息走向（UML 时序图） |
| `0-biz/interface` | 接口 | 服务对外接口清单，按功能域聚类 |
| `0-biz/rules` | 业务规则 | 按需求类整理"条件 → 动作 + 依据"规则条目 |
| `0-biz/object-model` | 对象模型 | 实体、值对象、聚合、领域服务、领域事件 |
| `0-biz/data-model` | 数据模型 | 持久态表结构、缓存数据结构、字段关系与数据生命周期 |
| `0-biz/lexicon` | 领域词典 | 业务与代码共用的受控词汇集 |
| `0-tech/framework-guidelines` | 框架使用指导 | 基础框架清单与使用方式盘点 |
| `0-tech/comm-guidelines` | 通信规范 | RPC/HTTP/MQ 跨服务调用指导 |
| `0-tech/concurrency-guidelines` | 并发规范 | 线程池选型、隔离、拒绝策略 |
| `0-tech/data-access-guidelines` | 数据访问规范 | Redis/DB 等中间件访问指导 |
| `0-tech/resilience-guidelines` | 韧性规范 | 超时/重试/熔断/异常处理 |
| `0-tech/foundation-guidelines` | 基础规范 | 日志/配置/告警等编码指导 |
| `0-qual/code-standards` | 编码规范 | 命名、注释、函数长度/圈复杂度、安全编码红线、禁止项清单 |
| `0-qual/dt-guidelines` | DT规范 | 测试金字塔与覆盖基线、用例设计方法、覆盖率门禁 |
| `0-qual/branch-guidelines` | 分支与变更规范 | 分支模型、commit/MR 规范、评审要求 |

### 第 2 步：逐域生成域索引 docs/0-{域}/README.md

只处理**有资产的域**（域目录存在且至少一个资产目录内有 `.md` 文件）；无资产的域不生成索引。按 references/domain-readme-template.md 填充：

1. **资产节**：每个有 `.md` 文件的资产目录一节，节标题为资产目录名 + 资产中文名，节首一句资产内涵（查第 1 步受控资产目录表）。资产节按上表 taxonomy 顺序排列。
2. **文件清单表**：列出该资产目录内真实存在的 `.md` 文件（按文件名字典序），每文件一句话说明：
   - 说明取**文件首行标题**（第一个 `# ` 行的文字，原样摘录，不展开正文）；
   - 首行无标题取首个非空行；均读不到写「未识别（原因：xxx）」；
   - 资产目录自带的 `README.md`（各 analyze skill 产出的主文档）同样列入清单，说明取其首行标题。
3. **report/ 标注**：资产目录含 `report/` 且内有差距报告时，在该资产节表格后加一行「差距报告 N 份（最新 {YYYYMMDD}）」并附 `report/` 链接；`report/` 不逐文件索引（次抛件带日期、随跑随增，逐文件列会让活索引频繁抖动）。无 `report/` 或为空则不注。
4. 同名文件已存在**直接覆盖更新**，标注本次生成时间。

### 第 3 步：生成总索引 docs/README.md

按 references/root-readme-template.md 填充：

1. **四域导航表**：域 | 治理问题 | 已建资产 | 域索引链接。「已建资产」列列本域真实存在的资产目录名（顿号分隔）；无资产的域该列写「暂无资产」，域索引列写「—」，**不留死链**。
2. **服务依赖全景图**（mermaid `flowchart LR`）：
   - 数据源：`docs/0-tech/comm-guidelines/comm-guidelines-{service}.md`，每篇文档 = 一个下游服务节点（`{service}` 取文件名去 `comm-guidelines-` 前缀与 `.md` 后缀）。
   - 边：本仓节点 `-->` 每下游服务节点；边 label 标协议——从该服务文档的二级章节标题（`## HTTP` / `## RPC` / `## MQ` …）提取协议类名，多个协议顿号合并；章节标题不可读时从「协议：」行提取；均失败则该边不加 label。
   - 本仓节点 label 用仓根目录名。
   - mermaid 语法红线：节点 id 只能是字母数字与下划线——`{service}` slug 与仓名中的 `-` 等非法字符转 `_` 作 id，原名放 label 并**一律加双引号**；边 label 用管道符或引号。
   - `docs/0-tech/comm-guidelines/` 缺失或其内无服务文档 → 本节**不画空图、不臆造依赖**，只写一行「通信规范资产未建（docs/0-tech/comm-guidelines/ 缺失），请先运行 tech-comm-guidelines-analyze 提取出站调用后再生成全景图」。
3. **附注节**（可选，无此类情况整节删除）：taxonomy 外目录逐条列出，注明"不在 specgo v1.1 taxonomy 内，未索引"。
4. 同名**直接覆盖更新**，标注本次生成时间。

### 第 4 步：验证 mermaid 图可渲染（收尾必做）

总索引含 ```mermaid 代码块（服务依赖全景图），交付前必须运行 mermaid-validate skill 的本地验证脚本逐文件校验：

```bash
node /Users/sunhe/2026/yunshouji/AIAction/.claude/plugins/specgo/skills/mermaid-validate/scripts/validate-mermaid.mjs docs/README.md <其他含图产出...>
```

- 全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 域索引正常不含 mermaid 图；若某篇域索引因故含图，一并纳入校验清单。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。
- 画图规则（label 一律加引号、裸 `end` 禁用、节点 id 仅字母数字下划线等）见 mermaid-validate skill 的「语法红线」。

## 输出模板

- 域索引 `docs/0-{域}/README.md`：references/domain-readme-template.md（域名 + 生成时间 + 各资产节：内涵一句话 + 文件清单表 + report/ 标注）
- 总索引 `docs/README.md`：references/root-readme-template.md（四域导航表 + 服务依赖全景图 + 附注）

只填占位符、表格行、图；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **只聚合不重述**：索引只含资产目录名、文件链接、一句话说明、依赖边与生成时间；禁止把资产正文（接口表格、规则条目、模型图、数据结构说明等）拷进索引——索引是导航，不是摘要合集。
- **基于实证**：只索引扫描时真实存在的文件，说明从文件首行标题原样提取，读不到写「未识别（原因：xxx）」；证据形式为文件路径，**不得出现代码行号**。禁止臆造文件、臆造说明、臆造依赖边。
- **不派生新实例**：本 skill 不产出任何资产实例文档，不存在实例 slug 命名问题；引用既有资产的文件名**原样索引**，不改名、不归类重排、不新建文档。
- **活文档覆盖更新**：`docs/0-{域}/README.md` 与 `docs/README.md` 同名直接覆盖，不保留历史副本、不加日期后缀（差距报告才带日期，索引不带）；每次生成标注生成时间；重跑幂等。
- **只读不改、永不删文件**：不改动被分析仓的任何文件（`docs/0-{域}/README.md` 与 `docs/README.md` 两处产出除外）；不删除任何文件——域内资产清空后遗留的旧域索引不擅自删除，交用户处理。
- **成品纯净**：最终索引只含成品内容。扫描过程（find/ls 命令与原始输出）仅供自检，绝不写入索引。
- **taxonomy 查表制**：域名、资产目录名、资产内涵说明只从第 1 步受控表（源自插件根 HELP.MD）取；taxonomy 外目录不索引，只进总索引「附注」节。
- **索引分工**：资产目录内的 README（如 `docs/0-biz/interface/README.md`）归各 analyze skill 产出与维护，本 skill 只在域索引中链接它，不覆盖、不改写；骨架目录创建归 spec-init，本 skill 不建目录。
- **无资产不生成**：无资产的域不生成域索引；`docs/` 不存在时停止并提示先跑 spec-init 与各 analyze skill，不创建空索引。
- **语言无关**：只读 `docs/` 目录与 Markdown 文件，与被分析仓语言、框架无关。
- **mermaid 收尾校验**：产出含 ```mermaid 代码块时，必须按第 4 步用 validate-mermaid.mjs 逐文件校验全部 VALID 后才算完成。
- **文档语言**：输出索引用中文，技术术语（RPC / HTTP / MQ / flowchart / README 等）保留英文。

## 参考文件索引

| 文件 | 用途 |
| --- | --- |
| references/domain-readme-template.md | 域索引模板（第 2 步用） |
| references/root-readme-template.md | 总索引模板：四域导航表 + 服务依赖全景图 + 附注（第 3 步用） |
| 插件根 HELP.MD | 受控词汇表（域名/资产目录名/资产内涵）与 v1.1 目录规范的唯一权威来源，第 1 步查表快照以其为准 |
