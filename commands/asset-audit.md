---
description: 四类资产质量审核 skill——审核 docs/{arch,biz,tech,qual}/ 资产文档与索引，只做两个维度：表达质量（文字表达连续、人能读懂）与代码一致性（重点：锚点反查、接口/数据结构/出站调用与代码事实比对、mermaid 渲染校验），按 E/C 规则扣分打分（通用分/专项分/总分，0.4/0.6 加权，分级：≥95 已基线 / 80-95 待修订 / <80 重写），报告归档 docs/report/（README.md 打分总览 + 每篇一个 {文档基名}-audit.md，镜像 docs/ 相对路径，同名覆盖）；范围四种模式：指定单篇 / 增量（已实现代码、有 git 变更时默认，只审受影响资产）/ 总览（首次建资产后推荐，全量审核打分但只落盘 README.md，问题清单写在 README 第 3 节）/ 全量（逐篇报告 + README 全量重建，总览的备选）。当用户提到"asset-audit"、"资产质量评估"、"评估 docs 文档质量"、"文档与代码一致性检查"、"资产失实检查"、"审核资产文档"时使用。需求/功能设计文档的审核归 spec-requirement-audit skill。
---

<!-- generated-by: specgo -->
加载 spec-analyze skill，按其「子流程路由表」执行子流程 asset-audit。
