# 基础规范（日志 / 配置 / 告警）

| 元信息 | 值 |
|--------|-----|
| 分支 | <分支名> 分支 (<YYYY-MM-DD>) |
| 更新日期 | <YYYY-MM-DD> |
| Skill | tech-basic-mechanism-guidelines-analyze |

## 机制全景

| 维度 | 使用框架 / SDK | 函数清单概要 | 子文档 |
|---|---|---|---|
| 日志 | <日志库 / 封装层，附文件路径> | <一句话：对外函数个数与代表性函数> | [basic-mechanism-guidelines-log.md](basic-mechanism-guidelines-log.md) |
| 配置 | <配置文件 / 配置中心 / 环境变量读取入口> | <同上> | [basic-mechanism-guidelines-config.md](basic-mechanism-guidelines-config.md) |
| 告警 | <告警 SDK / 上报 client，附文件路径> | <同上> | [basic-mechanism-guidelines-alarm.md](basic-mechanism-guidelines-alarm.md) |
| <增补维度> | <同上> | <同上> | [basic-mechanism-guidelines-<dimension>.md](basic-mechanism-guidelines-<dimension>.md) |

<!-- 探测不到的核心维度在全景表中保留一行、函数清单概要列写「未发现」、子文档列写「—」（不产出该维度文件），证明排查过。 -->

## 附注（可选，无此类情况整节删除）

- <排查到但无法判定归属 / 待人工确认的机制或调用点，逐条列出，附文件路径>
