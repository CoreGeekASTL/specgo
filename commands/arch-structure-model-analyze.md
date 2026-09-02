---
description: 分析存量代码仓的结构模型（模块划分、分层、职责与依赖关系），产出 UML 包图（mermaid）+ 依赖矩阵，落盘被分析仓的 docs/0-arch/structure-model/：仓级总览 README.md + 每模块 structure-model-{module}.md。当用户提到"代码仓结构"、"结构模型"、"目录关系"、"模块依赖图"、"画一下项目结构"、"梳理目录关系"、"生成结构文档"、"第一层目录"、"包之间依赖"、"repo structure"、"structure model"、"module relationship"、"项目摸底"、"架构摸底"时使用。即使用户没明说"结构模型"，只要意图是"看清一个代码仓第一层目录之间、或某目录下包与包之间的依赖关系并出图"，都应触发。务必在生成任何代码仓结构文档之前使用此 skill。
---

<!-- generated-by: specgo -->
加载 spec-analyze skill，按其「子流程路由表」执行子流程 arch-structure-model-analyze。
