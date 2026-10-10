---
name: mermaid-validate
description: >-
  指导如何编写可被正确渲染的 mermaid 图，并在本地验证渲染结果。当用户提到"mermaid"、"画图"、"流程图"、"时序图"、"架构图"、"依赖图"、"图渲染失败"、"图渲染不出来"、"验证 mermaid"、"mermaid 报错"时使用；任何产出物（文档/HTML）中包含 ```mermaid 代码块时，必须用本 skill 的验证流程确认每张图可被解析渲染后才能宣称完成。
---

# Mermaid 图编写与本地验证 Skill

## 目的

解决两类问题：

1. 写出来的 mermaid 图在 GitHub / 文档站 / 编辑器里渲染报错。
2. 图在交付前从未被验证过，语法错误漏进文档。

核心原则：**凡产出物中含 ```mermaid 代码块，必须本地验证全部 VALID 后才算完成**，禁止凭"看着没问题"直接交付。

## 何时触发

- 用户要求画任何 mermaid 图（流程图、时序图、类图、ER 图、状态图、架构图等）。
- 用户反馈某文档里的 mermaid 图渲染失败、报错、显示异常。
- 任何资产整理/设计类 skill（arch-structure-model-analyze、arch-interaction-model-analyze、biz-object-model-analyze、biz-data-model-analyze、spec-index、spec-update、spec-analyze、spec-story-design、spec-function-design-audit、spec-asset-audit 等）执行到收尾阶段，产出物中含 mermaid 图。

## 图类型速查

| 场景 | 类型 | 关键字 |
| --- | --- | --- |
| 模块依赖、业务流程、判定分支 | 流程图 | `flowchart LR/TD` |
| 接口调用、鉴权链路、消息传递 | 时序图 | `sequenceDiagram` |
| 领域模型、类关系 | 类图 | `classDiagram` |
| 数据库表结构 | ER 图 | `erDiagram` |
| 状态机、生命周期 | 状态图 | `stateDiagram-v2` |
| 项目计划、排期 | 甘特图 | `gantt` |
| 分支策略 | Git 图 | `gitGraph` |
| 主题拆解 | 脑图 | `mindmap` |

## 语法红线（编写时必须遵守）

以下每一条都来自实际渲染失败案例或 mermaid 官方约束。违反即可能在某些渲染器（GitHub 内置、Kroki、旧版 mermaid）上报错。

| # | 红线 | 错误示例 | 正确写法 |
| --- | --- | --- | --- |
| 1 | flowchart 节点 label 含 `_` `/` `+` `(` `)` `;` `:` 空格等特殊字符时**必须加双引号**。未加引号的 `_`（如 `base_dao.go`）在多个渲染器版本上直接解析失败 | `A[dao/base_dao.go]` | `A["dao/base_dao.go"]` |
| 2 | sequenceDiagram 消息文本**禁止出现 `;`**——分号是语句终止符，其后内容会被当成新语句解析 | `A->>B: BEGIN; 清表; COMMIT` | `A->>B: 事务：清表+批量插入+提交` |
| 3 | 节点 label 不要用裸关键字 `end`、`graph`、`subgraph` 开头或单独出现（`end` 是保留字） | `A[end]` | `A["end节点"]` |
| 4 | 箭头不要混用：flowchart 用 `-->` / `-.->`，sequence 用 `->>` / `-->>` | sequence 里写 `A-->B` | sequence 里写 `A->>B` |
| 5 | subgraph 名称带空格必须加引号 | `subgraph My Layer` | `subgraph "My Layer"` |
| 6 | flowchart 边 label 含特殊字符时用管道符或引号 | `A --a:b(c)--> B` | `A --"a:b(c)"--> B` 或 `A --\|a:b(c)\|--> B` |
| 7 | 节点 id 只能是字母数字和下划线，中文/路径只能放 label 里 | `控制器[鉴权] --> ...`（id 用中文在部分版本报错） | `AC["鉴权控制器"] --> ...` |
| 8 | 换行用 `<br/>`，不要用 `\n` 字面量 | `A["第一行\n第二行"]` | `A["第一行<br/>第二行"]` |

**默认保险策略：节点 label 一律加双引号**，即 `id["显示文本"]`。加引号永远不错，不加引号可能在某个渲染器版本上炸。

## 本地验证（必须步骤）

本 skill 自带 `scripts/validate-mermaid.mjs`，支持 `.mmd` 文件与 `.md` 文件（自动提取全部 ```mermaid 代码块并逐块校验，报告每个图的起始行号与解析错误位置）。

**只需跑一条命令，校验级别由脚本自动决定（三级逻辑）**：

1. **完整解析（parsed）**：依赖（mermaid + linkedom）已装 → 调用 mermaid 官方解析器真解析，确定性、离线、可重复。
2. **自动试装**：依赖缺失 → 脚本自动执行 `npm install`，**30 秒硬超时，超时或失败不重试**。
3. **降级语法校验（syntax-only）**：试装失败（如离线环境）→ 自动切换零依赖校验器 `validate-mermaid-lite.mjs`，只机检上方「语法红线」可静态检查的部分 + 基本结构完整性（subgraph/end 配对、引号配对、图类型识别），非完整解析。

使用：

```bash
# 校验整个 markdown 文档里的所有 mermaid 图
node <本skill目录>/scripts/validate-mermaid.mjs docs/1-storys/xxx/xxx-story.md

# 校验单个 .mmd 文件
node <本skill目录>/scripts/validate-mermaid.mjs diagram.mmd

# 一次校验多个文件
node <本skill目录>/scripts/validate-mermaid.mjs a.md b.md c.mmd
```

输出与退出码：

- 每张图一行：`[VALID] 文件 第N个图(起始行X) (图类型, parsed)` 或 `[VALID-LITE] ... (图类型, syntax-only)`；失败为 `[INVALID]` / `[INVALID-LITE]` + 错误定位。
- 全部通过退出码 0；任一失败退出码 1。**退出码非 0 必须修复后重验**。
- `[VALID-LITE]` 视为语法级通过、**允许交付**，但必须在交付说明中标注"离线环境仅做语法级校验，联网后需补跑完整解析验证"。

一次性准备（联网环境首次）：

```bash
cd <本skill目录>/scripts && npm install   # 安装 mermaid + linkedom
```

## 工作流程

1. **选类型**：按"图类型速查"表确定图类型。
2. **编写**：写 `.mmd` 或直接在 md 里写 ```mermaid 块，遵守"语法红线"，label 默认加引号。
3. **验证**：跑 `node <本skill目录>/scripts/validate-mermaid.mjs <产出文件...>`，必须全部 VALID 或 VALID-LITE。
4. **修复循环**：INVALID / INVALID-LITE 时按错误行号定位修复，重验，直至全部通过。
5. **交付**：报告验证结果（几张图、校验级别 parsed / syntax-only、全部通过）；syntax-only 级别需标注"联网后需补跑完整解析验证"。

## 与资产整理类 skill 的集成约定

所有产出物可能含 mermaid 图的 skill，在收尾步骤必须执行：

> 对最终产出的每个文档文件运行 `node <mermaid-validate>/scripts/validate-mermaid.mjs <产出文件...>`，全部 VALID 或 VALID-LITE 才算完成；INVALID / INVALID-LITE 必须修复重验，禁止跳过。

## 关键约束

- **验证前置**：任何含 mermaid 图的产出物，未通过验证（parsed 或 syntax-only）不得宣称完成。
- **修复基于报错**：INVALID / INVALID-LITE 时按报错给出的行号与规则定位修复，禁止整图重写碰运气。
- **降级有界**：syntax-only 只覆盖语法红线可机检部分，允许交付但必须标注"联网后补验"；**联网环境禁止主动选择降级**（依赖可用时脚本自动走完整解析，不要绕过）。
- **脚本依赖一次性安装**：`scripts/` 下的 `node_modules` 不入库（已 gitignore）；脚本在依赖缺失时会自动试装一次（30 秒超时，不重试），失败自动降级 lite 校验，离线环境不会卡死。
