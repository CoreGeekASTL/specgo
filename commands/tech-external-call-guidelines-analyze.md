---
description: 治理存量代码仓的通信规范资产（RPC/HTTP/MQ 等跨服务调用指导：本服务调用了哪些外部业务节点、协议与封装方式、超时重试与错误码处理），双模式运行——提取模式扫描仓内全部出站调用（HTTP 客户端 / RPC client / IDL client stub / 消息队列生产端 / 进程间通信 / 平台 SDK），按被调外部业务服务归类成文；差距分析模式对照既有通信规范文档核查实际调用的合规差距。边界：只承载业务节点间跨服务调用——DB/Redis/对象存储等数据存储的访问不视为外部服务调用，归 tech-data-access-guidelines-analyze。产出落盘被分析仓的 docs/0-tech/external-call-guidelines/：README 索引 + 每外部服务一篇 external-call-guidelines-{service}.md；差距报告落盘 docs/0-tech/external-call-guidelines/report/{YYYYMMDD}-external-call-guidelines.md。当用户提到"通信规范"、"外部调用"、"下游接口"、"出站调用"、"调用了哪些外部服务"、"服务依赖盘点"、"跨服务调用指导"、"调用规范差距分析"、"对照通信规范检查"、"external call"、"comm guidelines"时使用。
---

<!-- generated-by: specgo -->
加载 spec-analyze skill，按其「子流程路由表」执行子流程 tech-external-call-guidelines-analyze。
