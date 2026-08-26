---
description: 基于 git 变更（工作区未提交改动 / 指定 commit / 分支或 MR diff）识别代码原始内容变化，结合新增代码审视 docs/ 资产体系中对应文档是否需要刷新，并按最新要素定义（arch/biz/tech/qual 各 analyze skill 的目录布局、文件命名、模板骨架、组织规则）增量刷新受影响文档——变更文件映射到资产要素、逐资产判定影响（受影响 / 不受影响 / 资产未建），刷新清单先交人工确认再动笔定稿；索引资产（docs/0-{域}/README.md、docs/README.md）随资产增删按 spec-index 口径收口。当代码提交或 MR 合入后需要评估"这次变更要更新哪些 docs 文档""资产是否过期""按最新定义同步文档"时使用。触发场景包括"spec-update"、"资产刷新"、"刷新 docs"、"代码改了哪些文档要更新"、"变更影响分析"、"文档同步"、"docs 与代码不同步"、"MR 后刷新文档"、"git diff 刷新资产"等。
---

<!-- generated-by: specgo -->
加载 specgo skill，按其「子流程路由表」执行子流程 spec-update。
