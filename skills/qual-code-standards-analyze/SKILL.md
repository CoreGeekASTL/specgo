---
name: qual-code-standards-analyze
description: 治理存量代码仓的编码规范资产（命名、注释、函数长度/圈复杂度、安全编码红线、禁止项清单，每条规则标注可否机器检查），双模式运行——起草模式在仓内无规范时以内置规则底稿（27 条通用 clean code 规则 + 安全附加项 S1~S3 + Go/Java/Python/C++ 语言特则）为基础、结合仓内代码现状裁剪生成仓级单篇 code-standards.md；差距分析模式对照既有规范扫描代码差距，产出带日期的差距报告。规则分两级：红线（必须，违反即拦截，CI 门禁判定依据）与建议（应该，违反仅出报告）。产出落盘被分析仓的 docs/0-qual/code-standards/：规范文档 code-standards.md（活文档，同名覆盖）；差距报告落盘 docs/0-qual/code-standards/report/{YYYYMMDD}-code-standards.md，红线违反单独成节供 CI 解析拦截，建议级差距另列一节。当用户提到"编码规范"、"代码规范"、"clean code 规范"、"命名规范"、"函数长度限制"、"圈复杂度"、"安全编码红线"、"禁止项清单"、"代码风格规范"、"编码规范差距分析"、"对照编码规范检查"、"CI 门禁规则"、"code standards"、"coding guidelines 红线"时使用。
---

# 编码规范分析（qual-code-standards-analyze）

## 目的

输入一个代码仓路径，治理该仓的**编码规范**资产——回答两个问题：

1. 这个仓的编码规范是什么（命名、注释、函数长度/圈复杂度、安全编码红线、禁止项清单）？
2. 实际代码与既定编码规范之间有没有差距（红线是否被违反、建议项落实如何）？

编码规范是 standards 形态资产（红线标准："必须"遵守，违反即拦截），与 guidelines 形态的指导性规范（违反仅出报告）门禁策略不同，二者不合并。产出粒度对齐存量代码资产治理规范 v1.1：

| 模式 | 产出 | 落盘 |
| --- | --- | --- |
| 起草模式 | 仓级单篇 `code-standards.md`（活文档，同名覆盖更新） | 被分析仓 `docs/0-qual/code-standards/` |
| 差距分析模式 | 差距报告 1 篇 `{YYYYMMDD}-code-standards.md`（次抛，带日期） | 被分析仓 `docs/0-qual/code-standards/report/` |

每条规则必须标注两项元数据：**检查方式**（【可机器检查】/【需人工评审】）与**级别**（红线/建议）——前者决定 CI 自动化拦截的可行性，后者决定门禁策略。

本 skill 通用，不预设被分析仓的语言与框架，执行时基于实际探测结果走。

## 何时触发

- 用户要为代码仓建立编码规范：把命名、注释、函数规模、安全编码等要求沉淀成文，作为评审与 CI 门禁依据。
- 用户给出一份编码规范文档（或仓内 `docs/0-qual/code-standards/code-standards.md` 已存在），要求对照规范检查代码、输出差距报告。
- 用户要配置 CI 编码门禁：需要一份"红线/建议"分级、标注可否机器检查的规范清单作为判定依据。
- 用户要刷新既有编码规范（语言/框架演进后重新裁剪）。

## 运行模式

### 起草模式（默认）

仓内无既有编码规范、用户也未提供规范文档时走本模式。以内置规则底稿 [references/rules-catalog.md](references/rules-catalog.md)（27 条通用 clean code 规则 + 安全附加项 S1~S3 + Go/Java/Python/C++ 语言特则，每条已预标注检查方式与默认级别）为基础，结合仓内代码现状（主语言、框架、存量风格）裁剪：选取仓内主语言对应的语言特则章节（其余语言章节剔除）、按仓内约定调整可调参数与默认级别、收录仓内特有约定为新增条目，产出仓级单篇 `docs/0-qual/code-standards/code-standards.md`。裁剪决策必须记录在该文档「七、裁剪说明」节，保证规范演进可追溯。

### 差距分析模式

仓内已存在 `docs/0-qual/code-standards/code-standards.md`，或用户显式提供规范文件时走本模式。以规范为基准扫描代码，产出差距报告 `docs/0-qual/code-standards/report/{YYYYMMDD}-code-standards.md`。报告章节固定：一、红线违反（CI 门禁拦截）→ 二、建议级差距 → 三、合规项 → 四、豁免/裁量项 → 五、规范未覆盖 → 六、规范条目无实现。差距报告为次抛件，带日期、不覆盖（同日重跑同名覆盖）。

### standards 门禁语义（与 guidelines 形态的本质区别）

编码规范文档中规则分两级：

- **红线（必须）**：违反即拦截，是 CI 门禁判定依据。差距报告「一、红线违反」节存在任意一行记录即判定**拦截**——该节标题与表格列名固定不变，供 CI 脚本解析；安全附加项 S1~S3 默认全部为红线且不得降级。
- **建议（应该）**：违反仅出报告提示改进，不拦截，落差距报告「二、建议级差距」节。

CI 侧按本 skill 名（`qual-code-standards-analyze` / 资产目录 `code-standards`）配置门禁：解析最新一份差距报告的红线违反节，非空则拦截流水线。

### 模式缺省回退

用户要求差距分析、但未提供规范文档且 `docs/0-qual/code-standards/code-standards.md` 也不存在时，默认回退起草模式，并在产出的 code-standards.md「七、裁剪说明」节注明「规范未建，本次为起草生成」；也可用内置规则底稿直接代位做差距分析（用户明确要求"先用底稿查一遍"时），此时报告元信息「对照规范」必须注明"内置底稿代位"。

## 工作流程

按下述步骤顺序执行。每一步都要留下可追溯依据（文件路径），分析基于**实际读到的代码**，不得臆测。

### 第 1 步：判定运行模式

- 用户显式提供规范文件 → 差距分析模式，规范来源记为该文件路径。
- 否则检查被分析仓 `docs/0-qual/code-standards/code-standards.md` 是否已存在 → 存在则按差距分析模式执行（用户意图是"起草 / 重建 / 刷新规范"时走起草模式，同名覆盖）。
- 都没有 → 起草模式；若用户本意是差距分析，按「模式缺省回退」处理。

### 第 2 步：探测仓内语言与代码现状

- **主语言判定**：按源文件扩展名分布（`.go`/`.java`/`.py`/`.cc`/`.cpp` 等）与构建文件（go.mod / pom.xml / build.gradle / requirements.txt / CMakeLists.txt 等）确定仓内主语言；多语言仓按目录归属分别记录，语言特则按文件归属分别启用。
- **代码现状摸底**（起草模式裁剪依据；差距分析模式的扫描面）：
  - 存量命名风格（驼峰/蛇形、布尔前缀习惯、测试命名惯例）
  - 存量函数规模分布（抽查核心模块最长函数行数，校准函数长度/圈复杂度上限的合理性）
  - 格式化工具链（gofmt / clang-format / black 等，判定缩进类规则是否豁免）
  - 已有静态检查配置（.golangci.yml / checkstyle.xml / .flake8 / .clang-tidy 等，已有配置的规则优先保留并对齐参数）
  - 安全敏感面（日志输出点、SQL 拼接、命令执行、密钥读取方式），校准安全红线落点
- 探测结论仅供裁剪与扫描使用，**不写入产出文档正文**（裁剪结论以「七、裁剪说明」节的决策表形式呈现）。

### 第 3 步（起草模式）：裁剪生成 code-standards.md

按 [references/code-standards-template.md](references/code-standards-template.md) 填充，产出 `docs/0-qual/code-standards/code-standards.md`：

1. **规则迁移**：从内置底稿迁移规则条目，编号保持底稿编号不变（通用数字编号 / `S` / `G`/`J`/`P`/`C` 前缀），禁止重排编号——保证跨仓规范编号语义一致、差距报告可对照。
2. **语言特则裁剪**：只保留仓内主语言对应的语言特则章节；多语言仓保留多个章节并注明各章节适用目录；其余语言章节剔除并记入裁剪说明。
3. **参数与级别校准**：可调参数（函数行数 50、圈复杂度 10 等）沿用底稿默认值，或按仓内现状/团队约定调整并写明依据；级别调整（建议↔红线）必须有明确理由并记入裁剪说明，S1~S3 不得降级。
4. **仓内特有约定**：仓内自研框架/库的强制用法（如统一错误封装、必须走的日志组件）可新增为条目，编号续在对应类别之后（如 `G11`、`28`），标注级别与检查方式。
5. **豁免表**：将底稿「语言/框架惯例冲突的默认豁免判定」中适用于本仓的条目收录进「六、豁免与裁量」节（如 Go 仓收录 gofmt 缩进豁免、Test 前缀豁免）。
6. **总览统计**：填写「一、总览」表的条目数/红线数/建议数/可机器检查数。
7. 同名文件已存在**直接覆盖更新**——规范文档是活文档，固定名、覆盖更新，git diff 即演进史。

### 第 4 步（差距分析模式）：对照规范扫描并生成差距报告

以第 1 步确定的规范文档为基准，逐条规则扫描代码：

1. **可机器检查条目优先工具执行**：仓内已有 linter/静态检查配置的（第 2 步探测到），直接运行并按规则编号归组结果；无工具链的条目用 grep/rg 模式扫描（如 `_ =` 忽略 error、`strcpy` 调用、日志中疑似密钥字段）。工具/命令执行输出仅供自检，**不写入报告**——报告证据一律为 `文件路径`（不带行号）。
2. **需人工评审条目逐条阅读判定**：命名意图、SLAP、DRY 语义级重复、并发保护等，抽读核心模块与公共路径代码判定，禁止凭语言习惯臆断合规。
3. **扫描面**：默认全仓源码（排除 vendor/node_modules/生成代码，按仓内实际标记）；用户给定 MR/commit 时只扫描增量范围并沿用"存量未改动行不纳入统计"红线。
4. **每条规则落一类结论**：合规项 / 红线违反 / 建议级差距 / 豁免裁量项（命中规范「豁免与裁量」节，写明依据）/ 规范未覆盖 / 规范条目无实现。
5. 按 [references/gap-report-template.md](references/gap-report-template.md) 填充产出 `docs/0-qual/code-standards/report/{YYYYMMDD}-code-standards.md`：「一、红线违反」节标题与表格列名固定（CI 解析锚点，禁止改动），红线违反非空时元信息「门禁结论」填**拦截**。

### 第 5 步：验证 mermaid 图可渲染（收尾必做）

产出文档中一般不含 mermaid 图；若因补充说明引入 ```mermaid 代码块，交付前必须逐文件校验：

```bash
node /Users/sunhe/2026/yunshouji/AIAction/.claude/plugins/specgo/skills/mermaid-validate/scripts/validate-mermaid.mjs <产出文件...>
```

全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。画图规则见 mermaid-validate skill 的「语法红线」。

## 输出模板

- 编码规范文档（起草模式）：[references/code-standards-template.md](references/code-standards-template.md)
- 差距报告（差距分析模式）：[references/gap-report-template.md](references/gap-report-template.md)
- 规则底稿（起草裁剪基础 / 差距分析代位依据）：[references/rules-catalog.md](references/rules-catalog.md)

只填占位符与表格行；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **基于实证**：所有"合规/违反/豁免"结论必须有代码支撑，证据形式为 `文件路径`，**不得出现代码行号**（行号随代码变更失效）。读不到就写「未识别（原因：xxx）」，禁止凭经验臆造违规或合规结论。
- **实例 slug 从代码标识符派生**：本资产为仓级单篇、固定名 `code-standards.md`，无多实例；裁剪新增条目的编号续接底稿编号体系，禁止 AI 自由起名/重排编号，保证重跑产出同名文件、资产不断代。
- **活文档覆盖更新**：`docs/0-qual/code-standards/code-standards.md` 同名直接覆盖，不保留历史副本、不加日期后缀；**差距报告才带日期**，落 `report/` 子目录、次抛。
- **门禁语义不可混淆**：红线=违反即拦截（CI 依据），建议=违反仅出报告；standards 与 guidelines 不合并，CI 按资产名配置门禁。S1~S3 安全红线不得降级。
- **只读不改**：只读、只分析、只产出文档，不改动被分析代码仓的任何文件（`docs/0-qual/code-standards/` 下的产出除外）。
- **成品纯净**：最终文档只含成品内容。扫描过程（执行的 grep/rg/linter 命令、命中输出摘要）仅供自检，绝不写入最终文档——其结论须以 `文件路径` 证据形式进入相关表格。
- **语言无关**：不预设被分析仓的语言与框架，按第 2 步实际探测结果选取语言特则。
- **文档语言**：输出文档用中文，技术术语（lint / CI / error / defer / mutex / RAII 等）保留英文。
- **索引分工**：域索引 `docs/0-qual/README.md` 与总索引 `docs/README.md` 由 spec-index 生成，本 skill 不维护。
- **与相邻资产互补**：本 skill 治理的是仓级规范基线本身及其全量差距；代码变更后 docs 资产是否需要刷新走 spec-update。日志/配置/告警等编码指导归 tech-basic-mechanism-guidelines-analyze，DT/测试规范归 qual-dt-guidelines-analyze。

## 参考文件索引

| 文件 | 用途 |
| --- | --- |
| [references/rules-catalog.md](references/rules-catalog.md) | 内置规则底稿：通用 27 条 + 安全附加项 S1~S3 + 语言特则（Go G1~G10 / Java J1~J6 / Python P1~P5 / C/C++ C1~C4），每条预标注检查方式与默认级别，附惯例冲突豁免判定表（第 2、3、4 步用） |
| [references/code-standards-template.md](references/code-standards-template.md) | 起草模式 code-standards.md 模板（总览 + 红线规则 + 建议规则 + 安全编码红线 + 禁止项清单 + 豁免与裁量 + 裁剪说明）（第 3 步用） |
| [references/gap-report-template.md](references/gap-report-template.md) | 差距分析模式差距报告模板（红线违反节为 CI 解析锚点 + 建议级差距 + 合规项 + 豁免裁量 + 规范未覆盖 + 规范条目无实现）（第 4 步用） |
