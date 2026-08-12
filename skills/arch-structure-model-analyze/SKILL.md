---
name: arch-structure-model-analyze
description: >-
  分析存量代码仓的结构模型（模块划分、分层、职责与依赖关系），产出 UML 包图（mermaid）+ 依赖矩阵，落盘被分析仓的 docs/arch/structure-model/：仓级总览 README.md + 每模块 structure-model-{module}.md。当用户提到"代码仓结构"、"结构模型"、"目录关系"、"模块依赖图"、"画一下项目结构"、"梳理目录关系"、"生成结构文档"、"第一层目录"、"包之间依赖"、"repo structure"、"structure model"、"module relationship"、"项目摸底"、"架构摸底"时使用。即使用户没明说"结构模型"，只要意图是"看清一个代码仓第一层目录之间、或某目录下包与包之间的依赖关系并出图"，都应触发。务必在生成任何代码仓结构文档之前使用此 skill。
---

# 代码仓结构模型分析 Skill（arch-structure-model-analyze）

## 目的

输入一个代码仓路径或一个目录路径，输出该仓的**结构模型**资产——回答三个问题：

1. 这个代码仓（或目录）分了哪些模块？
2. 模块与模块之间的依赖方向是怎样的？
3. 模块呈现出怎样的分层特征？

产出粒度（对齐存量代码资产治理命名规范 v1.1）：

| 输入 | 粒度 | 画什么 | 产出 |
| --- | --- | --- | --- |
| 代码仓根路径 | 仓库级（模式 A） | 业务代码**第一层目录**之间的关系 | `docs/arch/structure-model/README.md`（仓级总览 1 篇，即资产主文档）+ `docs/arch/structure-model/structure-model-{module}.md`（每模块 1 篇） |
| 某个子目录路径 | 目录级（模式 B） | 该目录下**包与包**之间的关系 | `docs/arch/structure-model/structure-model-{dir}.md`（目录级总览 1 篇）+ `docs/arch/structure-model/structure-model-{dir}-{pkg}.md`（每包 1 篇） |

文档最终落到**被分析代码仓根目录**的 `docs/arch/structure-model/` 下（不存在则创建）。`{module}`/`{dir}`/`{pkg}` 实例 slug 一律从代码标识符派生（目录名/包名转 kebab-case），禁止自由起名——保证重跑产出同名文件、资产不断代。

本 skill 通用，不预设任何特定代码仓。执行时基于实际探测结果走，禁止凭仓库名或已知项目结构臆测。

## 何时触发

- 用户给出代码仓路径或目录路径，要求"看下结构"、"梳理目录"、"画一下模块图"、"生成结构文档/结构模型"。
- 用户要接手新项目、做架构摸底、给新人出结构说明。
- 用户问"这个项目第一层目录之间是什么关系"或"这个目录下的包怎么互相依赖"。

## 两种模式

### 模式 A：仓库级（输入是代码仓根路径）

只承载**业务代码第一层目录**之间的关系。辅助目录（构建产物、配置、文档、测试等）不画进图。理由：业务目录关系是结构模型的核心价值，把 `docs/`、`build/` 这类辅助目录画进来会冲淡主线、让图变成目录清单。

### 模式 B：目录级（输入是某个子目录路径）

分析该目录下**包与包**之间的关系。这里的"包"按语言语义识别：Go 的目录即包、Java 的 package、Node 的模块目录、Python 的包目录、Rust 的 mod 等。

## 工作流程

按下述步骤顺序执行。每一步都要留下可追溯依据（文件路径、关键 import）。分析基于**实际读到的代码**，不得臆测；读不到就明确标注"未识别（原因：xxx）"。

### 第 1 步：判定输入粒度

- 输入路径下若存在构建/包管理文件（`go.mod` / `package.json` / `pom.xml` / `build.gradle` / `Cargo.toml` / `pyproject.toml` / `requirements.txt` / `composer.json` 等）或入口文件（`main.go` / `index.js` / `Application.java` / `main.py` / `src/main.rs`），判定为**模式 A（仓库级）**。
- 否则若输入路径下都是子目录、每个子目录像一个独立包，判定为**模式 B（目录级）**。
- 拿不准时：列出输入路径下一层内容，按"是否存在构建文件"二选一，并在总览文档概览的"业务目录识别依据"里注明判定理由。

### 第 2 步：识别业务代码第一层（仅模式 A）

通用启发式，跨语言跨项目适用，不是硬编码特定代码仓：

1. 读构建/包管理文件，确定语言、源码根（Go 的 `go.mod` 所在目录即源码根；Node 看 `package.json` 的 `main`/`src`；Java 的 `src/main/java`；Rust 的 `src/`；Python 的包根）。
2. 列出源码根下第一层目录。
3. 排除以下"通用辅助目录"（行业共识，非业务代码）：
   - 构建产物：`node_modules` `dist` `build` `target` `bin` `obj` `out`
   - 版本控制/IDE：`.git` `.svn` `.idea` `.vscode`
   - 配置：`config` `conf` `configs` `.config`
   - 文档/资源：`docs` `doc` `assets` `public` `static` `resources`
   - 测试：`test` `tests` `__tests__` `spec`
   - 脚本/工具：`scripts` `script` `tools`
   - 项目元目录：`.opencode` `.github` `.gitlab` `ci`
4. 剩下的即业务代码第一层目录。若某目录名不在排除清单但明显是辅助目录（如 `vendor` `third_party` `mocks` `fixtures` `examples` `demo` `bench`），也排除，并在总览文档概览的"业务目录识别依据"里注明排除理由——这样可追溯、可质疑。
5. 若排除后剩余 0 个目录（极端扁平仓库，所有 `.go`/`.py` 平铺在源码根本身），把源码根本身作为唯一模块处理，图退化为单节点。

这一步只看目录名 + 构建文件，不读每个代码文件的内容——判断"是否业务目录"靠命名约定和位置就够了。读代码内容是第 4 步的事。

### 第 3 步：识别包（仅模式 B）

- 列出输入路径下所有子目录。
- 对每个子目录抽样 1~2 个文件，确认它是否构成一个独立包：
  - Go：目录下有 `.go` 文件且 `package` 声明一致
  - Java：目录下有 `.java` 文件且 `package` 声明一致
  - Node：目录下有 `.js`/`.ts` 文件且有 `package.json` 或被其他文件 import
  - Python：目录下有 `__init__.py` 或 `.py` 文件
  - Rust：目录下有 `.rs` 文件且 `mod.rs` 或 `lib.rs` 声明
- 不构成包的子目录（纯资源、空目录）排除并注明。

### 第 4 步：扫描跨模块 import 依赖（两种模式都要）

这是关系判定的唯一证据来源。理由：目录名推断的关系（如 `controllers` 一定依赖 `services`）是经验而非事实，真实代码里可能有反向依赖或循环依赖，只有 import 语句能给出实证。

- 用 grep / ripgrep 搜索每个模块（目录或包）内文件的 import / require / use / from...import 语句。
- 只记录**跨模块**的依赖：A 模块文件里 import 了 B 模块的路径，记一条 A → B。
- 同模块内部 import 不记（模块内子包间依赖按下一条单独记录）。
- 若模块含第一层子目录（子包），额外记录**模块内跨子包**的 import：A 子包文件 import 了同模块 B 子包，记一条 A → B，证据同样为文件路径，供第 7 步每模块文档"子模块关系图"与"子模块说明"表引用；子包内部更深层级的 import 不记。
- 标准库、第三方库（node_modules / vendor / go pkg 外部模块）不计入。
- 对每条依赖记录证据 `文件路径`（不记行号），作为总览"主要依赖/被依赖"两列的判定依据。

### 第 5 步：画 UML 包图（mermaid）

用 `flowchart LR`（左到右，模块多时换 `TD`）近似 UML 包图。约定：

- 每个模块一个节点，节点 id 用模块名（去重后，必须是合法 mermaid id）。
- 箭头方向：**A 依赖 B 画成 `A --> B`**（A 指向被依赖的 B）。这样图的语义是"沿着箭头读 = 依赖方向"，与 import 指向一致。
- 若 A↔B 双向都有 import，画两条独立箭头，不要合并成双向边。
- 节点显示用业务目录名/包名，不要用绝对路径。

图前加一行 `## 模块关系图` 标题，图后空一行接 `## 模块说明`。

### 第 6 步：写仓级总览 README.md

总览文档 = 概览 + UML 包图 + 依赖矩阵 + 分层特征，骨架见 references/structure-model-template.md。

- **概览**：语言、构建工具、源码根、模块数、业务目录识别依据（第 1~2 步的判定与排除理由）。
- **模块关系图**：第 5 步的 mermaid 包图。
- **模块说明表（依赖矩阵）**：

  | 模块 | 路径 | 职责 | 主要依赖 | 被依赖 |
  | --- | --- | --- | --- | --- |

  - **模块**：目录名或包名
  - **路径**：相对输入路径的路径
  - **职责**：基于目录名 + 抽样文件顶部注释 + 导出符号类型推断，2~4 句话。读不到就写"未识别"。
  - **主要依赖**：该模块 import 了哪些其他模块（列模块名，逗号分隔；无则写"-"）
  - **被依赖**：哪些其他模块 import 了该模块（列模块名，逗号分隔；无人依赖写"-"）

  "主要依赖 + 被依赖"两列合起来即依赖矩阵的表格形态——任意两模块间的依赖边都可在表内查证。
- **分层特征**：基于模块命名约定与依赖方向的实证观察（如入口层/业务层/数据层的流向是否单向、有无跨层直达、有无循环依赖），2~4 句。证据不足写"未识别"，禁止凭经验套三层架构模板。

### 第 7 步：写每模块文档并落盘 docs/arch/structure-model/

- 每个模块 1 篇，骨架见 references/structure-model-module-template.md，内容：模块职责、子模块关系图与子模块说明（模块内第一层子包之间的依赖关系与职责，证据来自第 4 步的跨子包 import 记录；扁平模块、单子包、子包间无依赖三种退化情形按模板规则处理）。跨模块依赖不在每模块文档重复，统一由总览文档的模块说明表（依赖矩阵）承载。
- 文档保存到**被分析代码仓根目录**的 `docs/arch/structure-model/` 下（不是当前工作目录的 `docs/arch/structure-model/`，除非两者相同）。
- 文件名：
  - 模式 A：总览 `README.md`（资产主文档）；每模块 `structure-model-{module}.md`，`{module}` 取模块目录名转 kebab-case。
  - 模式 B：总览 `structure-model-{dir}.md`；每包 `structure-model-{dir}-{pkg}.md`，`{dir}`/`{pkg}` 取目录名/包名转 kebab-case。
- `docs/arch/structure-model/` 不存在则创建（连同 `docs/` 一起创建）。
- 同名文件已存在**直接覆盖更新**——模型文档是活文档，固定名、覆盖更新，git diff 即演进史。

### 第 8 步：验证 mermaid 图可渲染（收尾必做）

产出文档中含 ```mermaid 代码块，交付前必须运行 spec-mermaid-diagram skill 的本地验证脚本校验：

```bash
node <specgo插件目录>/skills/spec-mermaid-diagram/scripts/validate-mermaid.mjs <产出文件>
```

- 总览与每模块文档逐文件验证，全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。
- 画图规则（label 一律加引号、时序图消息禁 `;`、裸 `end` 禁用等）见 spec-mermaid-diagram skill 的「语法红线」。

## 输出模板

- 总览文档严格按 references/structure-model-template.md 骨架填充；
- 每模块文档严格按 references/structure-model-module-template.md 骨架填充。

只填占位符、表格行、图；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **通用性**：本 skill 不依赖任何特定代码仓的结构。执行时基于实际探测结果走，禁止凭仓库名或已知项目结构臆测。第 2 步的"通用辅助目录清单"是跨语言行业共识可以排除，但禁止把特定代码仓的目录名写进 skill。
- **基于实证**：所有"依赖""职责""分层"结论必须有 import 语句或文件路径支撑。读不到就写"未识别（原因：xxx）"，禁止凭目录名直接下依赖结论——`controllers` 不一定依赖 `services`，看代码说了算。证据形式为 `文件路径`，**不得出现代码行号**，行号会随代码变更失效且无跨工具稳定性。
- **只读不改**：只读、只分析、只产出文档，不改动被分析代码仓的任何文件（新建 `docs/arch/structure-model/` 目录和文档文件除外）。
- **语言无关**：不预设被分析仓的语言，按第 1 步实际探测结果走。
- **业务目录识别靠启发式不靠硬编码**：第 2 步的辅助目录清单是行业共识，可以排除；遇到清单外的可疑辅助目录，单独注明理由排除，保留可追溯性。
- **实例 slug 从代码标识符派生**：`{module}`/`{dir}`/`{pkg}` 一律取模块目录名/包名转 kebab-case，禁止 AI 自由起名，保证重跑产出同名文件、资产不断代。
- **活文档覆盖更新**：`docs/arch/structure-model/` 下模型文档同名直接覆盖，不保留历史副本、不加日期后缀——差距报告才带日期，模型文档不带。
- **索引分工**：仓级总览 `README.md` 即本资产目录主文档，由本 skill 产出、活文档同名覆盖；域索引 `docs/arch/README.md` 与总索引 `docs/README.md` 由 all-index skill 统一生成，本 skill 不维护。
- **成品纯净**：最终文档只含成品内容（标题、概览、图、表格）。模板顶部的元说明、写作指令行、占位符说明均为规则，不复制进成品。第 1~4 步的探测过程（执行的 grep/rg 命令、命中输出摘要）仅供自检，绝不写入最终文档——其结论须以 `文件路径` 证据形式进入相关表格，且**证据不得含代码行号**。
- **文档语言**：输出文档用中文，技术术语（Controller / Service / Repository / Package / Module 等）保留英文。
