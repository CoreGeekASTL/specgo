---
description: 治理存量代码仓的编码规范资产（命名、注释、函数长度/圈复杂度、安全编码红线、禁止项清单，每条规则标注可否机器检查），双模式运行——起草模式在仓内无规范时以内置规则底稿（27 条通用 clean code 规则 + 安全附加项 S1~S3 + Go/Java/Python/C++ 语言特则）为基础、结合仓内代码现状裁剪生成仓级单篇 code-standards.md；差距分析模式对照既有规范扫描代码差距，产出带日期的差距报告。规则分两级：红线（必须，违反即拦截，CI 门禁判定依据）与建议（应该，违反仅出报告）。产出落盘被分析仓的 docs/0-qual/code-standards/：规范文档 code-standards.md（活文档，同名覆盖）；差距报告落盘 docs/0-qual/code-standards/report/{YYYYMMDD}-code-standards.md，红线违反单独成节供 CI 解析拦截，建议级差距另列一节。当用户提到"编码规范"、"代码规范"、"clean code 规范"、"命名规范"、"函数长度限制"、"圈复杂度"、"安全编码红线"、"禁止项清单"、"代码风格规范"、"编码规范差距分析"、"对照编码规范检查"、"CI 门禁规则"、"code standards"、"coding guidelines 红线"时使用。
---

<!-- generated-by: specgo -->
加载 spec-analyze skill，按其「子流程路由表」执行子流程 qual-code-standards-analyze。
