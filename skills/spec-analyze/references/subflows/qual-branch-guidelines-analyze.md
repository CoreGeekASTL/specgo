---
name: qual-branch-guidelines-analyze
description: 治理存量代码仓的分支与变更规范资产（分支模型、commit/MR 规范、评审要求），双模式运行——起草模式从 git 历史提取现状（git branch -a 采样归纳分支命名形态、merge commit / squash / rebase 证据判定 merge 策略、git log 采样归纳 commit message 类型前缀/语言/长度分布、MR 评审痕迹），归纳现状后起草规范文档（现状描述与应有约定分节，约定标注「建议，待团队确认」）；差距分析模式对照规范检查近期 N 个 commit/分支的差距。产出落盘被分析仓的 docs/0-qual/branch-guidelines/：仓级单篇 branch-guidelines.md（活文档，同名覆盖更新）；差距报告落盘 docs/0-qual/branch-guidelines/report/{YYYYMMDD}-branch-guidelines.md（次抛，带日期）。当用户提到"分支规范"、"分支模型"、"分支命名规范"、"git flow"、"commit 规范"、"commit message 规范"、"MR 规范"、"合并请求规范"、"评审要求"、"merge 策略"、"squash merge"、"rebase 还是 merge"、"branch guidelines"、"分支规范差距分析"、"对照分支规范检查"时使用。
---

<!-- 子流程：不独立暴露为 skill；由 spec-analyze 主 skill 路由加载，也可由 /qual-branch-guidelines-analyze 命令触发。依赖文件在同级 ../assets/（带短名前缀） -->

# 分支与变更规范分析（qual-branch-guidelines-analyze）

## 目的

输入一个代码仓路径，治理该仓的**分支与变更规范**资产——回答两个问题：

1. 该仓的协作变更现状如何——分支怎么命名与流转（分支模型）、commit message 什么形态、变更怎么合入（merge 策略）、评审要求落实没有？
2. 近期变更与既定分支与变更规范之间有没有差距？

资产边界：**只管"变更怎么进仓"的协作规矩**——分支命名与生命周期、commit message 格式、merge 策略、MR/评审要求。代码本身写到什么程度算合格归 qual-code-standards-analyze（编码规范），测试与覆盖要求归 qual-dt-guidelines-analyze（DT 规范）。

产出粒度对齐存量代码资产治理规范 v1.1：

| 模式 | 产出 | 落盘 |
| --- | --- | --- |
| 起草模式 | 仓级单篇 `branch-guidelines.md` | 被分析仓 `docs/0-qual/branch-guidelines/` |
| 差距分析模式 | 差距报告 1 篇 `{YYYYMMDD}-branch-guidelines.md` | 被分析仓 `docs/0-qual/branch-guidelines/report/` |

仓级单篇、文件名固定为 `branch-guidelines.md`，无实例 slug；规范文档为活文档，同名覆盖更新，git diff 即演进史。

本 skill 的实证来源与其它资产不同：**主要证据是 git 历史**（分支名、commit 短 hash、tag 名、merge commit message、commit trailer），辅以仓内协作配置文件路径（CODEOWNERS、commitlint 配置、PR/MR 模板等）。不预设被分析仓的语言、框架与托管平台（GitHub / GitLab / Gerrit / 自建平台均适用），执行时基于实际探测结果走。

**自包含原则**：本 skill 所需模板归档在自身 references/ 目录下，不依赖其它 skill 的文件。

## 何时触发

- 用户要盘点仓内分支与变更协作现状：分支命名形态、merge 策略、commit message 形态、评审痕迹，建立或刷新"分支与变更规范"文档。
- 用户要把 git 历史中的多数派实践沉淀成团队约定（现状描述与应有约定分节，约定待团队确认）。
- 用户给出一份分支与变更规范文档（或仓内 `docs/0-qual/branch-guidelines/` 下已有规范），要求对照规范检查近期 N 个 commit/分支是否遵守、输出差距报告。

## 运行模式

### 起草模式（默认）

仓内无既有分支与变更规范、用户也未提供规范文档时走本模式。从 git 历史提取现状四维度（分支命名形态 / merge 策略 / commit message 形态 / MR 评审痕迹），归纳多数派实践后起草仓级单篇 `branch-guidelines.md`——每维度一节，**现状描述与应有约定分节**，约定部分从现状归纳并整节标注「建议，待团队确认」，作为分支与变更规范的事实基线（活文档，同名覆盖更新）。

### 差距分析模式

仓内已存在分支与变更规范文档（`docs/0-qual/branch-guidelines/branch-guidelines.md`），或用户显式提供规范文件时走本模式。以规范为基准，对照检查近期 N 个 commit（默认 N=50，用户可指定）与当前活跃分支：分支命名、commit message 格式、merge 策略、评审要求是否遵守规范，产出差距报告 `docs/0-qual/branch-guidelines/report/{YYYYMMDD}-branch-guidelines.md`（逐维度一节：合规项 / 差距项 / 规范未覆盖 / 规范条目无检查对象，各项附 git 对象或文件路径证据）。差距报告为次抛件，带日期、不覆盖。

guidelines 形态语义：分支与变更规范是**指导性规范**（"应该"遵守），违反出报告提示改进，不做 CI 拦截——拦截是 standards 形态资产的语义。

### 模式缺省回退

用户要求差距分析、但未提供规范文档且 `docs/0-qual/branch-guidelines/` 下也无既有规范时，默认回退起草模式，并在产出的规范文档末尾注明「规范未建，本次为现状提取」。

## 工作流程

按下述步骤顺序执行。每一步都要留下可追溯依据（分支名 / commit 短 hash / 文件路径），分析基于**实际读到的 git 历史与配置文件**，不得臆测。全程 git 命令只读（branch / log / tag / remote / config / symbolic-ref），禁止任何写操作类 git 命令（commit / push / branch -d / checkout / merge 等）。

### 第 1 步：判定运行模式与前置校验

- 目标目录不是 git 仓（无 `.git`）→ 终止执行并向用户说明「未识别（原因：非 git 仓）」，禁止臆造历史。
- 浅克隆（存在 `.git/shallow`）或可见历史极短 → 继续执行，但在产出文档附注中声明「浅克隆，历史不全，结论仅基于可见历史」。
- 用户显式提供规范文件 → 差距分析模式，规范来源记为该文件路径。
- 否则检查被分析仓 `docs/0-qual/branch-guidelines/branch-guidelines.md` 是否存在 → 有则按差距分析模式执行（用户意图是"检查 / 对照 / 差距"时直接执行），规范来源记为该文档。
- 都没有 → 起草模式；若用户本意是差距分析，在文档末尾注明「规范未建，本次为现状提取」。

### 第 2 步：采集分支模型现状

- **默认分支判定**：`git symbolic-ref refs/remotes/origin/HEAD` 或 `git remote show <remote>`；判不出记「未识别（原因：xxx）」。
- **分支清单采样**：`git branch -a` 取全量本地+远端分支，剔除默认分支与 HEAD 指针行；超过 50 条时按最近活跃（committerdate 降序）采样 50 条，并在文档注明采样口径。
- **命名形态归纳**：按「前缀目录（feature/ / fix/ / hotfix/ / release/ / 无前缀）× 分隔符（/、-、_）× 工单引用（#123 / PROJ-123 / 无）× 语言（英文 / 拼音 / 中文）」归类，统计各形态样本数与占比；每形态取 1~3 个**真实分支名**作示例证据，禁止虚构示例。
- **生命周期**：`git branch --merged <默认分支>` 统计已合入未删除分支数；识别长期常驻分支（develop / release / 集成分支）。
- **tag 形态**：`git tag` 采样归纳发布形态（语义化版本 v1.2.3 / 日期戳 / 无规律），取 1~3 个真实 tag 名作示例。
- **仓内协作配置文件**：查找 `CODEOWNERS`（.github/、.gitlab/ 或根目录）、`.gitmessage`、`commitlint.config.*`、`.husky/`、`CONTRIBUTING.md`、`.github/pull_request_template.*`、`.gitlab/merge_request_templates/`——存在即以文件路径记录，作为"仓内已有成文约定"事实。

### 第 3 步：采集 commit message 与 merge 策略现状

在默认分支历史上执行（只读）：

- `git log` 采样近 100 条 commit（起草模式口径；差距分析模式按用户指定 N、默认 50 条），逐条采集：subject、是否 merge commit、trailer（Reviewed-by / Signed-off-by 等）。
- **commit message 形态归纳**：
  - 类型前缀：conventional commits（feat / fix / docs / style / refactor / perf / test / build / ci / chore / revert）命中率、其它自定义前缀（如"【需求】"类）分布、无前缀占比；
  - 语言：中文 / 英文 / 混合占比；
  - subject 长度分布：≤50 字符 / 51~72 / >72 各多少条；
  - 引用形态：工单号（#123、PROJ-123）、MR/PR 编号（"(#45)" 后缀、"!45"）出现率；
  - 每类形态取 1~3 个 commit 短 hash 作证据。
- **merge 策略判定**（按证据判定，不臆断）：
  - 存在 merge commit 且 message 形如 "Merge pull request #N" / "Merge branch 'x' into 'y'" / "See merge request !N" → merge commit 策略，附 merge commit 短 hash 证据；
  - 采样窗口内历史线性（无 merge commit）且大量 subject 带 "(#N)" 后缀（GitHub squash 典型痕迹）→ squash merge，附 commit 短 hash 证据；
  - 历史线性且无 PR 引用痕迹 → rebase / fast-forward；两者无法区分时如实注明「rebase 与 fast-forward 不可区分」，不臆断；
  - 多种策略并存时如实并列（如"merge commit 与 squash 并存"），给出各自占比与证据，不粉饰成统一。

### 第 4 步：采集 MR 评审痕迹

按平台可得性分层采集；读不到就记「未识别（原因：xxx）」，禁止臆造评审结论：

1. **git 历史内痕迹**（任何平台可用）：merge commit message 中的 MR/PR 编号出现率；commit trailer（Reviewed-by / Approved-by / Acked-by / Signed-off-by）出现率；附 commit 短 hash 证据。
2. **平台 CLI**（环境允许时）：`gh pr list / view`（GitHub）、`glab mr list / view`（GitLab）采集评审人数、approval 数、是否要求 CI 通过；CLI 不存在或未登录时记「未识别（原因：无平台访问权限）」。
3. **仓内成文约定**：第 2 步记录的 CODEOWNERS / PR 模板 / CONTRIBUTING 中的评审要求要点摘录，附文件路径。

### 第 5 步（起草模式）：生成分支与变更规范文档

按 ../assets/branch-guidelines--branch-guidelines-template.md 填充，输出仓级单篇 `docs/0-qual/branch-guidelines/branch-guidelines.md`：

- 元信息表 + 采样口径（分支全量/采样数、commit 采样窗口与所在分支）。
- **四维度章节**（一、分支模型；二、commit message 规范；三、merge 策略；四、MR 与评审要求），每维度分「现状」与「约定」两小节：
  - 现状：写第 2~4 步归纳事实（分布表 + 证据：分支名 / commit 短 hash / 文件路径）；多种实践并存如实并列，不粉饰成统一；
  - 约定：从现状多数派实践归纳应有约定（如"分支命名统一 {type}/{工单}-{简述}"、"merge 策略统一为 squash 保持线性历史"），整节标注「建议，待团队确认」；现状无明显多数派时给出收敛方向建议并注明现状分歧。
- 目录不存在则创建（连同 `docs/` 一起创建）；同名文件已存在**直接覆盖更新**。

### 第 6 步（差距分析模式）：对照规范核查并生成差距报告

以第 1 步确定的规范文档为基准，取近期 N 个 commit（默认 N=50，用户可指定，所在分支记为当前默认分支或用户指定分支）与当前活跃分支（未合入默认分支的分支）为核查对象，逐维度、逐规范条目核查：

- 核查维度固定四项：**分支命名**、**commit message**、**merge 策略**、**MR 与评审**。
- 每条核查结论落四类之一：**合规项**（检查对象遵守规范，附分支名 / commit 短 hash）、**差距项**（违反规范，附 git 对象证据与现状说明）、**规范未覆盖**（实际存在形态但规范未约定，提示规范补全）、**规范条目无检查对象**（规范约定了但核查窗口内无对应场景，如窗口内无 hotfix 分支、无平台访问权限时评审人数类条目，如实注明无法核查原因，不臆造差距）。
- 逐 commit / 逐分支出结果：差距项必须落到具体分支名或 commit 短 hash，禁止只写"部分 commit 不符合"。
- 产出差距报告 `docs/0-qual/branch-guidelines/report/{YYYYMMDD}-branch-guidelines.md`，按 ../assets/branch-guidelines--gap-report-template.md 填充：结论概览表 + 逐维度一节（合规项 / 差距项 / 规范未覆盖 / 规范条目无检查对象）。
- 差距报告**只新增不覆盖**，文件名带日期；同日重跑同名覆盖。

### 第 7 步：验证 mermaid 图可渲染（有条件必做）

产出文档中含 ```mermaid 代码块时（分支模型图可选用 mermaid gitGraph / flowchart 呈现，非必需），交付前必须运行 mermaid-validate skill 的本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/mermaid-validate/scripts/validate-mermaid.mjs <产出文件...>
```

全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。

## 输出模板

- 分支与变更规范文档（起草模式）：../assets/branch-guidelines--branch-guidelines-template.md
- 差距报告（差距分析模式）：../assets/branch-guidelines--gap-report-template.md

只填占位符、表格行、图；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **基于实证**：所有"分支命名形态、merge 策略、commit message 分布、评审痕迹、是否合规"的结论必须有 git 历史或仓内文件支撑。证据两类——git 对象标识（分支名 / commit 短 hash / tag 名）与仓内文件路径（**不带行号**，行号随代码变更失效）。读不到就写「未识别（原因：xxx）」，禁止凭经验臆造团队约定、评审要求或合规结论。
- **采样口径明示**：分支与 commit 均为采样归纳，文档必须注明采样窗口（分支全量或采样 N 条、commit 近 N 条及所在分支），禁止把采样结论表述为全量事实。
- **仓级单篇文件名固定**：产出固定为 `docs/0-qual/branch-guidelines/branch-guidelines.md`，无实例 slug；文档内表格中的样本标识一律取真实 git 对象（分支名 / commit 短 hash / tag 名），禁止 AI 自由起名、禁止虚构示例。
- **活文档覆盖更新**：`branch-guidelines.md` 同名直接覆盖，不保留历史副本、不加日期后缀；**差距报告才带日期**，落 `report/` 子目录、次抛。
- **只读不改**：只读、只分析、只产出文档；git 命令只读（branch / log / tag / remote / config / symbolic-ref），禁止执行任何写操作类 git 命令（commit / push / branch -d / checkout / merge 等）；不改动被分析代码仓的任何文件（`docs/0-qual/branch-guidelines/` 下的产出除外）。
- **成品纯净**：最终文档只含成品内容。探测过程（执行的 git 命令、原始输出摘要）仅供自检，绝不写入最终文档——其结论须以 git 对象或 `文件路径` 证据形式进入相关表格。
- **语言无关、平台无关**：不预设被分析仓的语言、框架与托管平台；平台 CLI（gh / glab）不可用时降级为纯 git 历史痕迹分析并如实标注。
- **文档语言**：输出文档用中文，技术术语（merge commit / squash / rebase / fast-forward / conventional commits / MR / PR / CODEOWNERS / trailer 等）保留英文。
- **索引分工**：域索引 `docs/0-qual/README.md` 与总索引 `docs/README.md` 自 v3.0 起不再自动生成（spec-index 已移除），本 skill 不维护。
- **与相邻资产边界**：代码本身写到什么程度算合格归 qual-code-standards-analyze 产出的 `docs/0-qual/code-standards/`；测试与覆盖要求归 qual-dt-guidelines-analyze 产出的 `docs/0-qual/dt-guidelines/`。本 skill 只记录"变更怎么进仓"的协作规矩事实与合规性，越界内容不写入本文档。
- **mermaid 收尾校验**：产出含 ```mermaid 代码块时，必须用 validate-mermaid.mjs 逐文件校验全部 VALID 后才算完成。

## 参考文件索引

| 文件 | 用途 |
| --- | --- |
| ../assets/branch-guidelines--branch-guidelines-template.md | 起草模式分支与变更规范文档模板（元信息 + 采样口径 + 四维度分节：现状分布表 + 约定建议） |
| ../assets/branch-guidelines--gap-report-template.md | 差距分析模式差距报告模板（结论概览 + 逐维度合规项/差距项/规范未覆盖/规范条目无检查对象） |
