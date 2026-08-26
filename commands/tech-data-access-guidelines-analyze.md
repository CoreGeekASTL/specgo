---
description: 治理存量代码仓的数据访问规范资产（数据存储的访问指导），按数据形态分两类治理——内存数据（进程内内存结构 map+锁/sync.Map/自研缓存，及 Redis/Memcached 等内存型存储）与持久化数据（关系库/ORM、本地嵌入式存储、对象存储、文件系统），两类各用一个模板，模板聚焦三件事：数据设计与定位（存什么、为什么放这里、结构/容量/TTL/生命周期）、如何使用这个数据（读写路径、一致性、并发/事务、降级）、应该在什么场景使用这个数据（业务场景与兜底边界）；外围维度含连接与客户端管理、分页与批量、SQL 拼接与注入防护、错误处理。双模式运行——起草模式识别仓内数据存储并分类，逐存储盘点访问方式并起草规范（数据设计与定位 + 使用方式 + 适用场景 + 现状描述与应有约定）；差距分析模式对照既有规范扫描实际访问的合规差距。产出落盘被分析仓的 docs/0-tech/data-access-guidelines/：README.md 导航主文档 + 每存储一篇 data-access-guidelines-{mw}.md；差距报告落盘 docs/0-tech/data-access-guidelines/report/{YYYYMMDD}-data-access-guidelines.md。当用户提到"数据访问规范"、"Redis 使用规范"、"DB 访问指导"、"数据库访问规范"、"内存缓存"、"进程内缓存"、"缓存读写模式"、"缓存穿透"、"SQL 注入防护"、"事务使用盘点"、"ORM 怎么用"、"data access guidelines"、"数据访问差距分析"、"对照数据访问规范检查"时使用。
---

<!-- generated-by: specgo -->
加载 spec-analyze skill，按其「子流程路由表」执行子流程 tech-data-access-guidelines-analyze。
