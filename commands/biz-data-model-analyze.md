---
description: 分析存量代码仓的数据模型资产（持久态表结构、缓存数据结构、字段关系与数据生命周期），产出 UML-ER 图（mermaid erDiagram）+ 字段表 + 生命周期说明，落盘被分析仓的 docs/0-biz/data-model/：README.md 实体导航主文档 + data-model-{entity}.md（每数据实体 1 篇）。用户指明实体时只梳理该实体；未指明时默认全量——扫描建表 SQL（CREATE TABLE）、ORM entity 注册（TableName/RegisterModel）与关键缓存结构体，逐实体产出，不阻塞式询问。逻辑关联无 DB 约束时标注"代码未体现物理外键"。当用户提到"数据模型"、"表结构"、"ER 图"、"数据库设计"、"字段说明"、"数据字典"、"梳理 XX 表"、"数据生命周期"、"缓存数据结构"、"TTL"、"data model"、"ER diagram"、"schema 文档"时使用。务必在生成任何表结构/ER 图/数据字典类文档之前使用此 skill。
---

<!-- generated-by: specgo -->
加载 spec-analyze skill，按其「子流程路由表」执行子流程 biz-data-model-analyze。
