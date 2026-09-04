# develop-task 施工单模板

抛弃式文档，聚焦辅助出代码。产出到 `<repo>/docs/1-storys/{功能名}/{功能名}-develop-task.md`（与 story 设计文档同目录）。不写设计论证——设计细节在 story 设计文档里，本文档只回答"代码怎么改"。单文档多 Task：一个 story 的改动按相对独立功能块拆为若干 Task 章，开发人员按 Task 逐个实现。同名文件已存在时直接覆盖，不进 README 索引。

> 模板中所有具体内容（服务名、文件路径、签名、命令等）均为**格式示例**，产出时替换为目标仓实际内容。

## 写作规则

- **新增类改动必须给出完整契约**：落位目录与命名依据、函数/接口签名、字段列表、错误码/枚举取值直给——开发者不读 story、不读源码也能照单施工。
- **修改类改动**：函数级改动点（文件 + 函数名，禁止行号）+ 行为对照表穷举所有受影响分支（不变标"不变"）+ 具体改法（代码级，允许代码符号）。
- 测试清单逐条标注看护哪个 Task 的哪个改动。
- mermaid 不强制；如出现，按语法红线自查（本产出非资产文档，不跑验证脚本）。
- 参考的仓内文档链接必须真实存在；无对应资产注明"待核实"，禁止臆造链接。

## 模板正文

````markdown
# <功能名> develop-task

## 1. 任务概述

<两三句话说清本需求做什么、拆成几个 Task>。设计论证见 [story 设计文档](<功能名>-story.md)（同目录），本文档只管怎么改代码。

## 2. 任务拆分总览

| Task | 任务名 | 范围 | 前置 Task | 文件数 |
| --- | --- | --- | --- | --- |
| 1 | 鉴权结果写缓存 | authIMEI 鉴权结论 fail-open 写缓存 | 无 | 2 |
| 2 | HTTP 恒 200 应答 | 三档结果统一 HTTP 200、body code 区分 | 1（复用 Task 1 的结果对象） | 1 |

<!-- 实施顺序唯一依据：前置 Task 列标注须先完成的 Task 编号，空=可并行；同一文件只允许出现在一个 Task 内；改动单一时本表只有一行 -->

## 3. Task 1：鉴权结果写缓存

### 3.1 修改文件清单

| # | 文件 | 操作 | 依赖前置 | 改动 |
| --- | --- | --- | --- | --- |
| 1 | src/service/auth_cache.go | 新增 | 无 | 新增鉴权结论缓存读写 |
| 2 | src/service/auth_service.go | 修改 | 1 | CheckAuth fail-open 结果写缓存 |

### 3.2 逐文件改动详情

#### src/service/auth_cache.go（新增）

- **落位与命名**：放 `src/service/`，命名对照存量 `auth_whitelist.go` 的同类缓存文件约定。
- **完整契约**：
  - `type AuthCache struct { ... }`：字段 `ttl time.Duration`、`maxSize int`
  - `func (c *AuthCache) Get(imei string) (bool, bool)`：返回（是否命中白名单，是否命中缓存）
  - `func (c *AuthCache) Set(imei string, allowed bool)`：写缓存，超容量按 LRU 清理
  - 错误码：无新增；缓存不可用时不报错、降级直连（fail-open）
- **复用样板**：写法参照 `src/service/auth_whitelist.go` 的包级单例模式。

#### src/service/auth_service.go（修改）

- **改动点**：`CheckAuth` 函数——鉴权服务调用失败分支。
- **行为对照**：

| 场景 | 变更前 | 变更后 |
| --- | --- | --- |
| 鉴权服务正常返回 | 直接返回结论 | 不变 |
| 鉴权服务超时/不可用 | 返回错误，拒绝请求 | fail-open 放行，结论写缓存 |

- **具体改法**：`CheckAuth` 中 `callAuthService` 返回 error 的分支，由 `return nil, err` 改为记 warn 日志后 `authCache.Set(imei, true); return &AuthResult{Allowed: true, Degraded: true}, nil`；函数签名不变，调用方无联动。

### 3.3 测试清单

| 文件 | 操作 | 看护改动 | 断言要点 |
| --- | --- | --- | --- |
| src/service/auth_service_test.go | 新增 2 个 Test 函数 | Task 1 改动点 | 超时分支放行且写缓存；正常分支不触碰缓存 |

### 3.4 验证方式

- DT 测试：`go test ./src/service/ -run TestCheckAuth`
- 集成测试：testsuit/TC_002.py（前置：鉴权服务可配故障注入）
- 验证命令：`go build ./... && go test ./...`

## 4. Task 2：……（同 Task 1 结构展开）

## 5. 决策记录

| 编号 | 疑问描述 | 涉及源码位置 | 用户裁定 |
| --- | --- | --- | --- |
| Q1 | CheckAuth 无缓存参数，缓存实例如何持有 | src/service/auth_service.go:CheckAuth | 函数内部持有包级单例，不改签名 |

<!-- 未触发条件澄清时本节写"无" -->
````

## 质量检查要点

- [ ] 任务拆分总览前置依赖标注完整；同一文件未出现在多个 Task 内；改动单一时未强拆
- [ ] 每个 Task 四小节齐全（修改文件清单 / 逐文件改动详情 / 测试清单 / 验证方式）
- [ ] 新增类改动完整契约直给（签名/字段/错误码/枚举），修改类改动行为对照表穷举分支、不变标"不变"
- [ ] 无行号；测试清单逐条标注看护改动；验证命令按仓语言与构建工具实填
- [ ] 决策记录与 {功能名}-待澄清清单.md 裁定一致（未触发澄清写"无"）
