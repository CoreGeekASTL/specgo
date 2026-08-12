# 基础规范（日志 / 配置 / 告警）

| 元信息 | 值 |
|--------|-----|
| 分支 | <分支名> 分支 (<YYYY-MM-DD>) |
| 更新日期 | <YYYY-MM-DD> |
| Skill | tech-foundation-guidelines-analyze |
| 运行模式 | 起草模式 |

## 机制全景

| 维度 | 使用框架 / SDK | 调用点分布概要 | 现状要点 | 子文档 |
|---|---|---|---|---|
| 日志 | <日志库 / 封装层，附文件路径> | <主要模块 / 目录，调用点数> | <一句话现状：级别使用 / 脱敏 / 审计概况> | [foundation-guidelines-log.md](foundation-guidelines-log.md) |
| 配置 | <配置文件 / 配置中心 / 环境变量读取入口> | <主要模块 / 目录，调用点数> | <一句话现状：读取方式 / 默认值 / 环境变量概况> | [foundation-guidelines-config.md](foundation-guidelines-config.md) |
| 告警 | <告警 SDK / 上报 client，附文件路径> | <主要模块 / 目录，调用点数> | <一句话现状：告警 ID / 上报恢复配对概况> | [foundation-guidelines-alarm.md](foundation-guidelines-alarm.md) |
| <增补维度> | <同上> | <同上> | <同上> | [foundation-guidelines-<dimension>.md](foundation-guidelines-<dimension>.md) |

<!-- 探测不到的核心维度在全景表中保留一行、现状要点列写「未发现」、子文档列写「—」（不产出该维度文件），证明排查过。 -->

## 附注（可选，无此类情况整节删除）

- <排查到但无法判定归属 / 待人工确认的机制或调用点，逐条列出，附文件路径>

<!-- 模式缺省回退时，在文末追加一行：规范未建，本次为现状提取 + 约定建议。 -->
