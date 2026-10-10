# 韧性规范 - <维度名（超时 / 重试 / 熔断与降级 / panic recover / 错误 swallowing）>

| 元信息 | 值 |
|--------|-----|
| 分支 | <分支名> 分支 (<YYYY-MM-DD>) |
| 更新日期 | <YYYY-MM-DD> |
| Skill | tech-resilience-guidelines-analyze |
| 维度 | <timeout / retry / circuit-breaker / panic-recover / error-swallowing> |

## 使用说明

<!-- 该维度机制在仓内的使用入口：优先列封装层对外函数；无封装时列框架/库被实际调用的 API 或配置项。定义文件不带行号。全仓无该维度点位时本表写「无」。 -->

| 函数 / 配置项 | 作用 | 参数 / 取值说明 | 定义文件 |
|---|---|---|---|
| <https.NewRequest().WithTimeout(d time.Duration)> | <设置出站请求超时> | <d：总超时时长，覆盖 connect+read> | <src/utils/https/request.go> |
| <retry.times（配置 key）> | <重试次数> | <整数，默认 3，来自 config.yaml> | <src/conf/config.go> |
| <……> | <一句话作用> | <逐参数 / 取值说明> | <文件路径> |

## 代码案例

<!-- 从业务代码摘取真实片段，照抄即可用；每段注明来源文件路径（不带行号）；同一维度多个典型场景各取一段代表性案例。error-swallowing 维度案例如实摘录，用于反面参照。 -->

```<lang>
// 来源：<文件路径>
<真实代码片段——场景 1>
```

```<lang>
// 来源：<文件路径>
<真实代码片段——场景 2>
```
