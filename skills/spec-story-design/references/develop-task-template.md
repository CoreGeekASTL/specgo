# develop-task 文档模板

抛弃式文档，聚焦辅助出代码。产出到 `<repo>/docs/develop-task/<功能名>-develop-task.md`。不看排版、不写设计论证——设计细节在 story 设计文档里，本文档只回答"代码怎么改"。同名文件已存在时直接覆盖，不进 README 索引。

> 模板中所有具体内容（服务名、文件路径、框架文档链接、命令等）均为**格式示例**，产出时替换为目标仓实际内容。

```markdown
# <功能名> develop-task

## 1. 任务概述

<一两句话说清本需求做什么>。设计细节见 [story 设计文档](../business/story/feature-<功能名>.md)，本文档只管怎么改代码。

## 2. 修改文件清单

| 文件 | 操作 | 修改点与实现逻辑 |
|------|------|-----------------|
| service/auth_service.go | 修改 | CheckAuth 函数加缓存命中分支：先查 cache，未命中走 DB 并回写 |
| dao/auth_dao.go（规划） | 新增 | 继承 BaseInterface，EntityType 设 AuthWhitelist，按存量 dao 模式实现 |
| routers/router.go | 修改 | 注册 POST /auth/v1/authIMEI 到 controllers.AuthController |

要求：写到**函数级**（改哪个函数、加什么分支、新增什么方法、改哪条路由注册）；存量文件用真实路径与真实函数名，新文件标"（规划）"；修改点多时按分层或按链路分多张表，禁止挤在一张表里导致可读性下降；每条附依据（需求章节号或 story 设计章节）。

**方案选型约束（业务逻辑正确性第一 + 正交四原则）**：每条修改点的实现逻辑必须立足存量代码现状（既有分层、校验与事务边界、并发与边界条件）设计；多种候选方案并存时优先业务逻辑正确、与既有架构一致的合理方案，禁止默认选改动最小的方案；禁止绕过既有校验/状态机、破坏事务一致性、忽略并发竞争、吞掉异常分支、错位分层（如业务逻辑塞进 Controller）等带逻辑缺口的写法。每条修改点同时不得违反正交四原则（DRY/SoC/最小化依赖/稳定依赖方向），确需违规时须经用户确认。

## 3. 要用的框架

| 框架 | 文档链接 | 按哪条约定执行 |
|------|---------|---------------|
| Beego ORM | [usage-beego-orm.md](../tech/usage/usage-beego-orm.md) | DAO 继承 BaseInterface，EntityType 设置，ContextDo 传 context.TODO() |
| HTTP 客户端 | [usage-http-client.md](../tech/usage/usage-http-client.md) | 请求用 https.NewRequest().WithRetry() builder |

每条必须链到 docs/tech/usage/ 真实存在的文档；仓内无该目录时按记忆列框架名并注明"无框架文档，待核实"。

## 4. 要调用的外部接口

| 外部服务 | 接口 | 本功能中的调用位置 | 文档链接 |
|---------|------|-------------------|---------|
| 沐恩云服务 | POST /auth/v1/verify | service/remote_service.go VerifyDevice | [comm-guidelines-munen.md](../tech/comm-guidelines/comm-guidelines-munen.md#auth-verify) |

每条链到 docs/tech/comm-guidelines/ 对应文档的接口章节；仓内无该目录时按需求文档列接口并注明"无出站调用文档，待核实"。本功能无出站调用时本节写"无"。

## 5. 验证方式

- DT 测试：<test/ 目录下的测试文件规划，按仓内存量测试约定搭建>
- 集成测试：<仓内集成/E2E 测试脚本或手工验证步骤，无则写"无">
- 验证命令：<按仓语言与构建工具填写，如 go build ./... && go test ./...、mvn verify、pytest>

## 6. 编码工作流提示

- TDD：先写测试再写实现，红灯→绿灯→重构
- 宣称完成前必须运行验证命令，用证据支撑"已完成"
- 遇 bug / 测试失败：先定位根因再改，禁止试凑式修改

## 7. 澄清问题列表

| 编号 | 疑问描述 | 涉及源码位置 | 用户澄清结论 |
|------|---------|-------------|-------------|
| Q1 | <一句话疑问描述> | <文件路径:函数名> | <用户澄清结论，决定本需求采用哪个方案> |

记录第 5.2 步提交用户的疑问点与用户澄清结论。无疑问点时本节写"无疑问点"。
```
