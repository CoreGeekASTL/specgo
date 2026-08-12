# 韧性规范（故障策略）

| 元信息 | 值 |
|--------|-----|
| 分支 | <分支名> 分支 (<YYYY-MM-DD>) |
| 更新日期 | <YYYY-MM-DD> |
| Skill | tech-resilience-guidelines-analyze |
| 运行模式 | 起草模式 |

## 扫描范围总览

| 点位类型 | 数量 | 说明 |
|---|---|---|
| 出站调用点 | <N> | <协议/目标构成，如 HTTP 12 处、RPC 5 处、MQ 生产 3 处、外部存储 4 处> |
| 后台任务 | <N> | <构成，如定时任务 2 个、消费循环 1 个、独立 worker 1 个> |

## 维度覆盖概况

| 维度 | 已设置点位数 | 未设置/框架默认点位数 | 现状一句话 | 子文档 |
|---|---|---|---|---|
| 超时 | <N> | <N> | <如"超时值分散在调用点与封装层，取值 1s~30s 不一"> | [resilience-guidelines-timeout.md](resilience-guidelines-timeout.md) |
| 重试 | <N> | <N> | <如"仅 MQ 消费有重试，出站调用均无重试"> | [resilience-guidelines-retry.md](resilience-guidelines-retry.md) |
| 熔断与降级 | <N> | <N> | <如"全仓无熔断器，个别调用有默认值兜底"> | [resilience-guidelines-circuit-breaker.md](resilience-guidelines-circuit-breaker.md) |
| panic/recover 兜底 | <N> | <N> | <如"主入口有 recover，后台 goroutine 无兜底"> | [resilience-guidelines-panic-recover.md](resilience-guidelines-panic-recover.md) |
| 错误 swallowing | — | <N> | <吞错点位数与主要形态> | [resilience-guidelines-error-swallowing.md](resilience-guidelines-error-swallowing.md) |

<!-- 模式缺省回退时，在文末追加一行：规范未建，本次为现状提取。 -->
