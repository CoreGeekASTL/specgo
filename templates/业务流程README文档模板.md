# 业务流程文档索引

| 元信息 | 值 |
|--------|-----|
| 代码仓 | <仓库名> |
| 分析基准 | <分支名> 分支 (<YYYY-MM-DD>) |
| 更新时间 | <YYYY-MM-DD> |
| Skill | spec-business-flow-analyze |
| 主要语言 | <语言> |

| 流程 | 一句话说明 | 入口位置 | 文档 |
|------|-----------|---------|------|
| 设备登录 | 终端携带凭证登录，鉴权通过后建立会话 | routers/router.go 注册 POST /auth/v1/login | [device-login.md](device-login.md) |
