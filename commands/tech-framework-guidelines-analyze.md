---
description: 分析存量代码仓中的内部代码框架（RPC/Web 框架、线程池、Actor、日志、序列化、配置、依赖注入、消息队列、调度、资源池、容错治理、监控、基础库、测试框架等）及其使用方式，提取"框架使用指导"资产（基础框架清单与使用方式盘点，纯现状、无规范文档），落盘被分析仓的 docs/0-tech/framework-guidelines/：索引 README.md + 每框架一篇 framework-guidelines-{framework}.md（含用途定位、使用模式）。边界：只承载内部代码框架使用指导——数据存储访问（DB driver/ORM/Redis/MinIO/嵌入式存储等）归 tech-data-access-guidelines-analyze，跨服务业务节点调用归 tech-external-call-guidelines-analyze，均不纳入本资产。当需要盘点代码仓技术栈、梳理框架使用模式与调用点分布、为 AI 代码生成沉淀"框架使用知识"、或为重构/迁移/新人上手提供框架使用文档时使用。触发场景包括"框架使用指导"、"框架使用现状"、"技术栈盘点"、"框架使用"、"用了哪些框架"、"XX 框架怎么用"、"线程池怎么用"、"RPC 怎么调的"、"framework guidelines"、"framework usage"、"tech stack"等。
---

<!-- generated-by: specgo -->
加载 spec-analyze skill，按其「子流程路由表」执行子流程 tech-framework-guidelines-analyze。
