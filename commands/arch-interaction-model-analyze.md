---
description: 分析存量代码仓业务流程的交互模型（模块间主业务流程、消息走向），产出 UML 时序图（mermaid），落盘被分析仓的 docs/0-arch/interaction-model/：README.md 流程导航主文档 + interaction-model-{flow}.md（每业务流程 1 篇）。用户指明流程时只梳理该流程；未指明时默认枚举仓内全部业务流程逐篇产出，不阻塞式询问。只画主链路，分支与异常逻辑不画入图——归业务规则资产承载。当用户提到"交互模型"、"模块交互"、"消息走向"、"时序图"、"调用链"、"梳理 XX 业务流程"、"XX 流程是怎么走的"、"画一下 XX 流程"、"把 XX 流程落成文档"、"梳理全部业务流程"、"interaction model"、"sequence diagram"时使用。务必在生成任何模块交互/流程时序文档之前使用此 skill。
---

<!-- generated-by: specgo -->
加载 spec-analyze skill，按其「子流程路由表」执行子流程 arch-interaction-model-analyze。
