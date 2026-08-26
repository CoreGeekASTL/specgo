---
description: 分析存量代码仓的对象模型（实体、值对象、聚合、领域服务、领域事件），产出 UML 类图（mermaid classDiagram），落盘被分析仓的 docs/0-biz/object-model/：README.md 聚合导航主文档 + object-model-{aggregate}.md（每聚合 1 篇）。用户指定聚合时只梳理该聚合；未指定时默认全量——扫描模型层与核心 service，按聚合根归集后逐聚合产出，不阻塞式询问。类图只画聚合内结构（关键属性与关联，方法省略）与聚合间引用方向，以代码中的结构体/类为准，禁止把 DB 表字段机械照抄成类图。当用户提到"对象模型"、"领域模型"、"实体"、"值对象"、"聚合"、"聚合根"、"领域服务"、"领域事件"、"类图"、"class diagram"、"object model"、"domain model"、"DDD"、"梳理 XX 聚合"、"画一下领域对象"、"实体建模"时使用。务必在生成任何领域对象/实体类图文档之前使用此 skill。
---

<!-- generated-by: specgo -->
加载 spec-analyze skill，按其「子流程路由表」执行子流程 biz-object-model-analyze。
