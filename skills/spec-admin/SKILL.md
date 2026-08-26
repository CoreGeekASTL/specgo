---
name: spec-admin
description: docs/ 资产体系管理主 skill——承载两个低频管理子流程的路由：spec-init（初始化 docs/ 资产目录骨架：0-arch/0-biz/0-tech/0-qual 四域布局，一次性迁移旧布局历史产出，迁移映射清单先交用户确认）与 spec-index（生成/刷新各域索引 docs/0-{域}/README.md 与总索引 docs/README.md，含服务依赖全景图 mermaid）。用户请求"初始化 docs 目录/资产目录骨架/迁移旧文档/旧布局升级/spec-init"或"生成索引/docs 索引/域索引/总索引/资产导航/服务依赖全景图/刷新索引/spec-index"时使用；资产增删后刷新索引也走本 skill 的 spec-index 子流程。
---

# docs/ 资产体系管理主 skill（spec-admin）

低频管理能力的统一入口，按「子流程路由表」定位子流程文件，**读取该文件全文并严格按其执行**。

**路径锚定**：本文件中所有相对路径均以本 SKILL.md 所在目录为锚；派子代理时必须先把子流程文件解析成**绝对路径**写进 prompt，子代理不猜路径。

## 子流程路由表

| 子流程 | 触发意图 | 子流程文件（references/subflows/） | 产出 |
| --- | --- | --- | --- |
| spec-init | 初始化 docs/ 目录骨架、旧布局迁移、spec-init | `spec-init.md` | docs/ 目录骨架 + 迁移执行摘要 |
| spec-index | 生成/刷新索引、服务依赖全景图、spec-index | `spec-index.md` | `docs/README.md` 总索引 + 各域 `docs/0-{域}/README.md` |

子流程引用的模板在 `references/assets/`（`index--<文件名>`）。

## 执行规则

1. 按用户意图命中路由表一行，读取对应子流程文件全文执行；两个子流程也可被 spec-analyze（全量建库第 4 步索引收口）与 specgo（第 5 步索引随资产增删收口）调度。
2. spec-init 的迁移映射清单必须**先交用户确认**再动手；产出迁移执行摘要（已迁移/跳过/冲突清单）。
3. spec-index 只聚合真实存在的文件、不重述资产正文；索引为活文档同名覆盖并标注生成时间；含服务依赖全景图（mermaid）时必须过 mermaid-validate 验证脚本 VALID。
4. 资产文档有增删时，索引随资产同步刷新（spec-index 口径），不允许索引与资产漂移。

## 与其它 skill 的关系

- **spec-analyze**：全量建库第 4 步索引收口调用本 skill 的 spec-index 子流程；旧布局检测提示走 spec-init。
- **specgo**：第 5 步资产刷新后索引收口调用 spec-index 子流程；spec-update 子流程归 specgo 承载。
- **mermaid-validate**：索引全景图验证工具。
