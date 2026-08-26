---
description: 提取存量代码仓的并发规范资产（线程池、锁、channel、goroutine 启动点、Actor、定时任务并发等并发原语实例），单模式提取运行——盘点仓内并发原语并按实例归集成文，产出 README.md 实例导航主文档 + 每实例一篇 concurrency-guidelines-{pool}.md；每篇文档章节不超过三个（用途定位 + 使用说明 + 代码案例），人一看就懂：用途定位一段话说清该实例干什么、为什么需要并发；使用说明列可调用的封装函数/原语入口清单（作用、参数或取值、定义文件）；代码案例给真实调用片段（注明来源文件路径）。产出落盘被分析仓的 docs/0-tech/concurrency-guidelines/（活文档，同名覆盖更新）。当用户提到"并发规范"、"线程池"、"池隔离"、"并发原语盘点"、"goroutine 启动点"、"锁使用"、"channel"、"Actor"、"定时任务并发"、"concurrency guidelines"、"thread pool"时使用。
---

<!-- generated-by: specgo -->
加载 spec-analyze skill，按其「子流程路由表」执行子流程 tech-concurrency-guidelines-analyze。
