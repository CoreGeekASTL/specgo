---
description: 提取存量代码仓的韧性规范资产（超时/重试/熔断降级/异常处理等故障策略——只管故障来了怎么扛，不管通信协议本身，协议与封装归通信规范），单模式提取运行——扫描仓内全部出站调用点与后台任务的故障策略，产出 README 索引 + 每维度一篇 resilience-guidelines-{dimension}.md；每篇文档只含两项内容：使用说明（该维度机制在仓内怎么用——可调用的封装函数/配置项清单：作用、参数或取值、来源文件）与代码案例（真实代码片段，注明来源文件路径）。产出落盘被分析仓的 docs/0-tech/resilience-guidelines/（活文档，同名覆盖更新）。当用户提到"韧性规范"、"超时设置"、"重试策略"、"熔断降级"、"故障策略"、"异常处理"、"panic recover"、"错误吞掉"、"吞错"、"错误 swallowing"、"容错"、"稳定性治理"、"resilience"时使用。
---

<!-- generated-by: specgo -->
加载 spec-analyze skill，按其「子流程路由表」执行子流程 tech-resilience-guidelines-analyze。
