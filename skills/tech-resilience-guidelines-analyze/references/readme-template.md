# 韧性规范（超时 / 重试 / 熔断降级 / 异常处理）

| 元信息 | 值 |
|--------|-----|
| 分支 | <分支名> 分支 (<YYYY-MM-DD>) |
| 更新日期 | <YYYY-MM-DD> |
| Skill | tech-resilience-guidelines-analyze |

## 维度导航

| 维度 | 使用入口概要 | 子文档 |
|---|---|---|
| 超时 timeout | <一句话：封装函数 / 配置 key 与代表取值> | [resilience-guidelines-timeout.md](resilience-guidelines-timeout.md) |
| 重试 retry | <同上；无则写「无」> | [resilience-guidelines-retry.md](resilience-guidelines-retry.md) |
| 熔断与降级 circuit-breaker | <同上；无则写「无」> | [resilience-guidelines-circuit-breaker.md](resilience-guidelines-circuit-breaker.md) |
| panic/recover 与异常兜底 panic-recover | <同上> | [resilience-guidelines-panic-recover.md](resilience-guidelines-panic-recover.md) |
| 错误 swallowing error-swallowing | <同上> | [resilience-guidelines-error-swallowing.md](resilience-guidelines-error-swallowing.md) |
