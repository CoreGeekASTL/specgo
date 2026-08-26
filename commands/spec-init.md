---
description: 初始化被分析仓的 docs/ 资产目录骨架（HELP.MD v1.1「每类资产一个单独目录」布局：0-arch/{structure-model,interaction-model}、0-biz/{interface,rules,object-model,data-model,lexicon}、0-tech/{framework-guidelines,external-call-guidelines,concurrency-guidelines,data-access-guidelines,resilience-guidelines,basic-mechanism-guidelines}、0-qual/{code-standards,dt-guidelines,branch-guidelines}），并一次性迁移既有产出到新布局（旧扁平结构模型/交互模型文档、docs/business/interface/、docs/technical/external-call/、docs/technical/framework-usage/ 等历史产出，文件名同步去 spec- 前缀），迁移映射清单先交用户确认再动手，产出迁移执行摘要（已迁移/跳过/冲突清单）。当首次在一个代码仓启用 specgo 资产治理、需要从旧布局升级到 v1.1 新布局时使用。触发场景包括"初始化 docs 目录"、"资产目录骨架"、"docs 骨架"、"迁移旧文档"、"docs 目录迁移"、"旧布局升级"、"spec-init"、"初始化资产目录"等。
---

<!-- generated-by: specgo -->
加载 spec-admin skill，按其「子流程路由表」执行子流程 spec-init。
