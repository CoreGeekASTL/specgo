---
description: 生成被分析仓 docs/ 资产体系的索引层——各域索引 docs/0-{域}/README.md（列出本域各资产目录及目录内真实文件清单，每文件一句话说明、从文件首行标题提取，无资产的域不生成）+ 总索引 docs/README.md（四域导航表 + 服务依赖全景图：mermaid flowchart，从 docs/0-tech/external-call-guidelines/ 各文档提取本仓→下游服务依赖边；通信规范资产未建时该节注明"通信规范资产未建"）。索引为活文档，同名覆盖更新并标注生成时间；只聚合真实存在的文件、不重述资产正文。当各 analyze skill 跑完需要统一生成/刷新导航、spec-init 建骨架或迁移后首次建索引、资产增删后刷新索引、需要下游依赖全景图时使用。触发场景包括"生成索引"、"docs 索引"、"域索引"、"总索引"、"资产导航"、"服务依赖全景图"、"依赖全景图"、"刷新 README 索引"、"刷新索引"、"spec-index"等。
---

<!-- generated-by: specgo -->
加载 spec-admin skill，按其「子流程路由表」执行子流程 spec-index。
