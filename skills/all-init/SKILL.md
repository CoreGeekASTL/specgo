---
name: all-init
description: >-
  初始化被分析仓的 docs/ 资产目录骨架（HELP.MD v1.1「每类资产一个单独目录」布局：arch/{structure-model,interaction-model}、biz/{interface,rules,object-model,data-model,lexicon}、tech/{usage,comm-guidelines,concurrency-guidelines,data-access-guidelines,resilience-guidelines,foundation-guidelines}、qual/{code-standards,dt-guidelines,branch-guidelines}），并一次性迁移既有产出到新布局（旧扁平结构模型/交互模型文档、docs/business/interface/、docs/technical/external-call/、docs/technical/framework-usage/ 等历史产出，文件名同步去 spec- 前缀），迁移映射清单先交用户确认再动手，产出迁移执行摘要（已迁移/跳过/冲突清单）。当首次在一个代码仓启用 specgo 资产治理、需要从旧布局升级到 v1.1 新布局时使用。触发场景包括"初始化 docs 目录"、"资产目录骨架"、"docs 骨架"、"迁移旧文档"、"docs 目录迁移"、"旧布局升级"、"all-init"、"初始化资产目录"等。
---

# 资产目录初始化与迁移 Skill（all-init）

## 目的

为被分析仓建立 specgo v1.1 资产布局，做两件事：

1. **建骨架**：按 HELP.MD 3.2 目录树在 `docs/` 下创建全部域/资产目录，让后续各 analyze skill 有标准落盘位置；
2. **一次性迁移**：把 v1.1 之前各 skill 产出的旧布局文档（扁平结构模型文档、`docs/business/`、`docs/technical/` 等）搬到新目录并改齐文件名，保证资产不断代、重跑同名覆盖语义不变。

本 skill 只做目录与文件操作，不产出任何资产内容文档；域索引 `docs/{域}/README.md` 与总索引 `docs/README.md` 由 all-index 生成，本 skill 不维护。

## 何时触发

- 首次在一个代码仓启用 specgo 资产治理，需要建立 `docs/` 目录骨架。
- 仓内已有旧布局产出（`docs/business/`、`docs/technical/`、扁平 `docs/arch/structure-model*.md` 等），需要升级到 v1.1 新布局。
- 用户提到"初始化 docs 目录""资产目录骨架""迁移旧文档""旧布局升级""all-init"。

## 工作流程

### 第 1 步：扫描现状

- 确认被分析仓根路径，判断是否为 git 仓（仓根存在 `.git/`）——决定迁移用 `git mv` 还是 `mv`。
- 扫描 `docs/` 下既有内容，对照「迁移映射表」（第 3 步）识别命中项：旧布局目录/文件是否存在、各包含哪些文件。
- 同时探测每个迁移目标的落点是否已存在同名文件（潜在冲突）。

### 第 2 步：生成迁移映射清单，交用户确认

把扫描结果整理成**源文件 → 目标文件**逐行映射清单（含骨架将创建的目录列表），标注每行处置方式：

| 源文件 | 目标文件 | 处置 |
| --- | --- | --- |
| docs/arch/structure-model.md | docs/arch/structure-model/README.md | 迁移（仓级总览即资产主文档） |
| docs/business/interface/spec-interface-login.md | docs/biz/interface/interface-login.md | 迁移+改名 |
| docs/tech/usage/usage-grpc.md | （已存在） | 冲突，待裁决 |
| docs/business/key-class/README.md | （不动） | 跳过：不在新 taxonomy |

- **未获用户确认前禁止动手**；骨架目录创建可与清单一并确认。
- 冲突项（目标已存在同名文件）逐条列出，交用户裁决（覆盖 / 保留目标跳过 / 放弃该条迁移），**禁止静默覆盖**。

### 第 3 步：创建目录骨架

按 HELP.MD 3.2 在 `docs/` 下创建以下资产目录，**已存在则跳过**，不删除任何既有内容：

```
docs/
├── arch/
│   ├── structure-model/
│   └── interaction-model/
├── biz/
│   ├── interface/
│   ├── rules/
│   ├── object-model/
│   ├── data-model/
│   └── lexicon/
├── tech/
│   ├── usage/
│   ├── comm-guidelines/
│   ├── concurrency-guidelines/
│   ├── data-access-guidelines/
│   ├── resilience-guidelines/
│   └── foundation-guidelines/
└── qual/
    ├── code-standards/
    ├── dt-guidelines/
    └── branch-guidelines/
```

说明：

- 只建资产目录；`report/` 子目录由各 skill 产出差距报告时自建，不在骨架内。
- 域索引 `docs/{域}/README.md` 与总索引 `docs/README.md` 由 all-index 产出，骨架不创建占位 README。
- git 仓中如需空目录入库，可在各资产目录放 `.gitkeep`；用户无此要求时省略。

### 第 4 步：执行迁移

按用户确认的映射清单逐条执行：

- **git 仓用 `git mv` 保留历史**（源文件未被 git 跟踪时 `git mv` 会失败，降级用 `mv`）；**非 git 仓用 `mv`**。
- 逐条执行、逐条核对结果；某条失败不中断整体，记入摘要的失败/跳过清单。
- 迁移完成后，源目录已空的旧目录（如 `docs/business/interface/`、`docs/technical/external-call/`）提示用户可删除，**不擅自删除非空目录**。

迁移映射表（旧 → 新）：

| 旧位置 | 新位置 | 文件名处理 |
| --- | --- | --- |
| `docs/arch/structure-model.md`、`docs/arch/structure-model-{module}.md`（扁平散放） | `docs/arch/structure-model/` | 文件名不变 |
| `docs/arch/interaction-model-{flow}.md`（扁平散放） | `docs/arch/interaction-model/` | 文件名不变 |
| `docs/business/interface/` | `docs/biz/interface/` | `spec-interface-{feature}.md` → `interface-{feature}.md`；`README.md` 原名迁移 |
| `docs/technical/external-call/` | `docs/tech/comm-guidelines/` | `external-call-{service}.md` → `comm-guidelines-{service}.md`；`README.md` 原名迁移 |
| `docs/technical/framework-usage/` | `docs/tech/usage/` | 去 `spec-` 前缀并统一为 `usage-{framework}.md`；`README.md` 原名迁移 |
| `docs/business/key-class/`、`docs/business/data-structure/`、`docs/business/story/` | — | **不在新 taxonomy 内，保持不动** |

注意：

- 上表以外的旧文件不臆测去向，列入摘要"未识别/保持不动"清单交用户判断。
- 迁移只动位置与文件名，**不改文件内容**——文档内旧路径互链如已失效，在摘要中提示用户，不擅自改写。

### 第 5 步：输出迁移执行摘要

向用户输出本次执行摘要，分四类清单：

1. **已创建目录**：本次新建的骨架目录（已存在跳过的单列或不列）；
2. **已迁移**：源文件 → 目标文件逐行清单（含改名说明、git mv / mv 方式）；
3. **跳过**：保持不动的旧目录/文件及原因（如 `docs/business/key-class/` 不在新 taxonomy）；
4. **冲突与裁决**：目标已存在同名文件的条目及用户最终裁决结果；执行失败条目及原因。

摘要末尾提示后续动作：运行各 analyze skill 填充资产、运行 all-index 生成索引。

## 输出模板

本 skill 不产出资产内容文档，唯一产出是**迁移执行摘要**（直接呈现给用户，不落盘，用户要求时可落盘为 `docs/all-init-迁移摘要-{YYYYMMDD}.md`）：

```markdown
# all-init 执行摘要（{YYYY-MM-DD}）

## 已创建目录
- docs/arch/structure-model/（新建）
- docs/biz/interface/（已存在，跳过）
- ...

## 已迁移（N 个文件）
| 源文件 | 目标文件 | 方式 |
| --- | --- | --- |
| docs/business/interface/spec-interface-login.md | docs/biz/interface/interface-login.md | git mv + 改名 |

## 跳过（保持不动）
- docs/business/key-class/ — 不在新 taxonomy 内
- docs/business/story/ — 不在新 taxonomy 内

## 冲突与裁决
| 目标文件 | 冲突情况 | 裁决 |
| --- | --- | --- |
| docs/tech/usage/usage-grpc.md | 目标已存在 | 保留目标，源文件未迁移 |

## 后续建议
- 运行各 analyze skill 填充资产；运行 all-index 生成域索引与总索引。
- 文档内旧路径互链可能已失效，建议人工检查。
```

## 关键约束

- **先确认后动手**：迁移映射清单（源文件 → 目标文件）必须先交用户确认，未确认禁止执行任何迁移；骨架目录创建一并确认。
- **冲突禁止静默覆盖**：目标已存在同名文件时逐条列出交用户裁决（覆盖 / 跳过 / 放弃），用户未裁决的条目一律跳过。
- **保留历史**：git 仓内一律用 `git mv`（源文件未被跟踪时降级 `mv`），非 git 仓用 `mv`；迁移只动位置与文件名，不改文件内容。
- **taxonomy 之外不动**：`docs/business/{key-class,data-structure,story}/` 及映射表以外的既有文件保持不动，列入摘要交用户判断，不臆测去向。
- **目录幂等**：骨架目录已存在则跳过，不删除、不清空任何既有内容；不擅自删除非空旧目录。
- **只读不改**：除 `docs/` 下的目录创建与迁移操作外，不改动被分析仓的任何文件。
- **成品纯净**：摘要只含执行结果清单；第 1 步的扫描过程（ls/find 命令与原始输出）不写入摘要。
- **文档语言**：输出用中文，技术术语保留英文。
- **无 mermaid 校验条款**：本 skill 为纯目录与文件操作，产出不含 mermaid 代码块，不执行 validate-mermaid 校验。
- **不维护索引**：域索引与总索引归 all-index，本 skill 不创建、不更新任何 README 索引（迁移 `README.md` 文件本身除外）。

## 参考文件索引

- 插件根 HELP.MD — 命名规范（第 1 章）、skill 清单与各资产输出文件名（第 2 章）、v1.1 目录树与命名规范（第 3 章），本 skill 的骨架与迁移目标以其为唯一权威来源。
