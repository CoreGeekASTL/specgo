---
name: spec-asset-refresh
description: 基于 MR（merge request / 分支 diff）识别当前需求给代码仓规格化资产带来的变化，并增量刷新七类资产文档——接口（docs/biz/interface/）、框架使用（docs/tech/usage/）、外部接口调用（docs/tech/comm-guidelines/）、结构模型（docs/arch/structure-model/）、关键类（docs/business/key-class/）、关键数据结构（docs/business/data-structure/）、feature 文档（docs/business/story/），刷新内容逐类列出交人工审核确认后定稿。当 MR 合入前后需要评估"这个需求改了哪些文档资产""刷新 docs/ 下哪些文档""MR 影响分析""资产同步"时使用。触发场景包括"基于 MR 刷新资产""需求带来哪些资产变化""MR 改了哪些文档""资产文档同步""刷新接口/框架/feature 文档"等。
---

# Spec 资产刷新（基于 MR 的资产变化识别与同步）

核心思想：spec- 系列分析 skill 产出的七类资产文档是代码仓的"活文档"——代码随 MR 演进，文档不同步就会变成误导。本 skill 以 MR diff 为输入，识别每类资产是否受影响，**增量刷新**受影响文档，刷新内容交人工审核后定稿。

与七个分析类 skill 的关系：分析类 skill 负责"从零生成"或"全量重刷"，本 skill 负责"MR 驱动的增量同步"——复用各类资产的既有格式与更新策略，不重写整篇。

与 spec-code-check 的关系：spec-code-check 是"代码实现完成 → 资产刷新"之间的质量闸门（clean code 检查 + 架构变更分析，产出 `docs/engineering/code-check/` 检查文档）。若需求代码刚实现完成且尚未经过 spec-code-check，先执行 spec-code-check 再做本 skill 的资产刷新；spec-code-check 检查文档中列出的资产缺口（如 key-class 清单缺失条目）是本 skill 刷新的直接输入。

## 工作流程（五阶段，严格按序执行）

### 阶段 1：获取 MR 变更清单

1. 确认 diff 范围：用户给定的 base...head（如 `main...feature/xxx`）、commit 列表或 PR 编号。未给定时询问，禁止默认猜测基准分支。
2. 执行 `git diff --stat <base>...<head>` 与 `git diff <base>...<head>`，提取：
   - 变更文件清单（新增/修改/删除）
   - 每个文件的关键 diff 片段（函数级）
3. 排除噪声变更：格式化、注释、测试数据、文档自身（docs/、doc/）变更不触发资产刷新，但要确认这些文档变更是否已覆盖本次需求。

### 阶段 2：变更映射到七类资产

按变更文件与 diff 内容，逐项判定七类资产是否受影响：

| # | 资产 | 目录 | 触发信号 |
|---|------|------|---------|
| 1 | 对外接口 | `docs/biz/interface/` | 路由注册/IDL 契约/消息订阅 handler 的增删改；接口请求响应结构变化；接口下线 |
| 2 | 框架使用 | `docs/tech/usage/` | 依赖清单（go.mod/pom.xml/package.json 等）增删框架；框架初始化/配置方式变化；新封装层出现 |
| 3 | 外部接口调用 | `docs/tech/comm-guidelines/` | 出站调用（HTTP/RPC client、MQ 生产端、平台 SDK）的增删改；下游服务地址/协议变化 |
| 4 | 结构模型 | `docs/arch/structure-model/` | 第一层目录增删；跨模块 import 方向变化（含新增依赖边、依赖移除、循环依赖出现） |
| 5 | 关键类 | `docs/business/key-class/` | 关键类的增删（核心领域模型/入口 handler/编排类/状态机/高被引用类的增删改）；关键类职责漂移 |
| 6 | 关键数据结构 | `docs/business/data-structure/` | 关键数据结构增删（自定义容器/缓存/队列/注册表/核心 map·slice·chan 实例的增删改）；并发模型变化 |
| 7 | feature 文档 | `docs/business/story/` | 业务行为变化：接口语义、处理流程、状态机、数据结构的实质修改（不是重构式改名） |

每类资产输出三态判定：**受影响（需刷新）/ 不受影响 / 不确定**，不确定项列出疑点交人工裁定——禁止把"不确定"静默归为"不受影响"。

### 阶段 3：关联分析——一个变更牵动多类资产

同一个变更常常同时命中多类资产，必须交叉说明关联关系，避免人工审核时只见树木：

- 新增对外接口（资产 1）通常同时带来 feature 文档接口清单新增行（资产 7）
- 新增出站调用（资产 3）若引入新框架依赖，同时命中框架使用（资产 2）
- 新增关键类（资产 5）或关键数据结构（资产 6）若承载新功能，接口与 feature 文档需同步
- 新模块目录（资产 4）若承载新功能，接口与 feature 文档需同步

输出一张**影响矩阵**：变更点 × 七类资产，标注每格的判定结果与依据（diff 文件路径）。

### 阶段 4：增量刷新受影响文档

对判定"受影响"的资产逐类刷新，遵循各资产的既有格式与更新策略：

1. **增量更新，禁止整篇覆盖**：接口表格加行/改行、feature 文档按节更新、README 索引同步对应行。
2. **变更处标注来源**：在刷新内容处注明来源 MR/分支与日期（如"（X.Y MR#123 变更）"），便于回溯与审核定位。
3. **资产文档不存在**：该资产从未生成过时，不借本 skill 从零生成——提示用户先运行对应的分析类 skill（biz-interface-analyze / tech-usage-analyze / tech-comm-guidelines-analyze / arch-structure-model-analyze / spec-key-class-analyze / spec-data-structure-analyze / spec-feature-analyze），本 skill 只做增量。
4. **元信息同步**：被刷新文档的固定元信息表"更新时间"刷新为当天。

### 阶段 5：人工审核刷新内容

刷新完成后、定稿前，向用户输出**刷新审核清单**：

1. 影响矩阵（阶段 3 产出）
2. 每个被刷新文档的变更摘要：改了哪几节、依据哪个 diff
3. 不确定项与待人工裁定项
4. 明确提示：**逐条确认后再定稿**；用户否决的刷新项回退，用户补充的裁定回填

### 阶段 6：验证 mermaid 图可渲染（收尾必做）

被刷新的文档中凡含 ```mermaid 代码块（含本次改动的与既有的），定稿前必须运行 spec-mermaid-diagram skill 的本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/spec-mermaid-diagram/scripts/validate-mermaid.mjs <被刷新文件...>
```

- 全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。
- 画图规则（label 一律加引号、时序图消息禁 `;`、裸 `end` 禁用等）见 spec-mermaid-diagram skill 的「语法红线」。

## 输出规范

- 全程中文输出
- 判定与刷新必须有 diff 证据（文件路径），禁止凭 MR 标题臆测影响面
- 审核清单中每个刷新项可追溯到具体 diff 文件与资产文档章节
