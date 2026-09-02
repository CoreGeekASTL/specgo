---
description: 治理存量代码仓的分支与变更规范资产（分支模型、commit/MR 规范、评审要求），双模式运行——起草模式从 git 历史提取现状（git branch -a 采样归纳分支命名形态、merge commit / squash / rebase 证据判定 merge 策略、git log 采样归纳 commit message 类型前缀/语言/长度分布、MR 评审痕迹），归纳现状后起草规范文档（现状描述与应有约定分节，约定标注「建议，待团队确认」）；差距分析模式对照规范检查近期 N 个 commit/分支的差距。产出落盘被分析仓的 docs/0-qual/branch-guidelines/：仓级单篇 branch-guidelines.md（活文档，同名覆盖更新）；差距报告落盘 docs/0-qual/branch-guidelines/report/{YYYYMMDD}-branch-guidelines.md（次抛，带日期）。当用户提到"分支规范"、"分支模型"、"分支命名规范"、"git flow"、"commit 规范"、"commit message 规范"、"MR 规范"、"合并请求规范"、"评审要求"、"merge 策略"、"squash merge"、"rebase 还是 merge"、"branch guidelines"、"分支规范差距分析"、"对照分支规范检查"时使用。
---

<!-- generated-by: specgo -->
加载 spec-analyze skill，按其「子流程路由表」执行子流程 qual-branch-guidelines-analyze。
