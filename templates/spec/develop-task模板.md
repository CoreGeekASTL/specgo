# {功能名} develop-task

> 抛弃式施工单：只回答"代码怎么改"，设计论证见 story 设计文档。同名覆盖、不进 README 索引。

## 1. 任务概述

{两三句话说清本需求做什么、拆成几个 Task}。设计论证见 [story 设计文档]({功能名}-story.md)（同目录），本文档只管怎么改代码。

## 2. 任务拆分总览

| Task | 任务名 | 范围 | 前置 Task | 文件数 |
| --- | --- | --- | --- | --- |
| {1} | {鉴权结果写缓存} | {authIMEI 鉴权结论 fail-open 写缓存} | {无} | {2} |
| {2} | {HTTP 恒 200 应答} | {三档结果统一 HTTP 200、body code 区分} | {1（复用 Task 1 的结果对象）} | {1} |

<!-- 实施顺序唯一依据：前置 Task 列标注须先完成的 Task 编号，空=可并行；同一文件只允许出现在一个 Task 内；跨 Task 公共改动归入序号最小的基础 Task；改动单一时本表只有一行、第 3 节只展开一个 Task -->

## 3. Task 1：{任务名}

### 3.1 修改文件清单

| # | 文件 | 操作 | 依赖前置 | 改动 |
| --- | --- | --- | --- | --- |
| {1} | {src/service/auth_cache.go} | {新增} | {无} | {新增鉴权结论缓存读写} |
| {2} | {src/service/auth_service.go} | {修改} | {1} | {CheckAuth fail-open 结果写缓存} |

<!-- 操作取值：新增 / 修改 / 删除；依赖前置填本 Task 内的 # 编号，空=可并行 -->

### 3.2 逐文件改动详情

#### {src/service/auth_cache.go}（新增）

- **落位与命名**：{放 src/service/，命名对照存量 auth_whitelist.go 的同类文件约定}
- **完整契约**：
  - `{type AuthCache struct { ... }——字段 ttl time.Duration、maxSize int}`
  - `{func (c *AuthCache) Get(imei string) (bool, bool)——返回（是否命中白名单，是否命中缓存）}`
  - `{func (c *AuthCache) Set(imei string, allowed bool)——写缓存，超容量按 LRU 清理}`
  - 错误码/枚举：{无新增；缓存不可用时不报错、降级直连（fail-open）}
- **复用样板**：{写法参照 src/service/auth_whitelist.go 的包级单例模式}

<!-- 新增类改动必须给出完整契约：函数/接口签名、字段列表、错误码/枚举取值直给——开发者不读 story、不读源码也能照单施工 -->

#### {src/service/auth_service.go}（修改）

- **改动点**：{CheckAuth 函数——鉴权服务调用失败分支}（文件 + 函数名，禁止行号）
- **行为对照**：

| 场景 | 变更前 | 变更后 |
| --- | --- | --- |
| {鉴权服务正常返回} | {直接返回结论} | 不变 |
| {鉴权服务超时/不可用} | {返回错误，拒绝请求} | {fail-open 放行，结论写缓存} |

<!-- 穷举所有受影响分支不得遗漏，含成功路径；不变的分支标"不变" -->

- **具体改法**：{CheckAuth 中 callAuthService 返回 error 的分支，由 return nil, err 改为记 warn 日志后 authCache.Set(imei, true) 并返回 Degraded=true 的结果；函数签名不变，调用方无联动}（代码级描述，允许代码符号）

### 3.3 测试清单

| 文件 | 操作 | 看护改动 | 断言要点 |
| --- | --- | --- | --- |
| {src/service/auth_service_test.go} | {新增 2 个 Test 函数} | {Task 1 改动点} | {超时分支放行且写缓存；正常分支不触碰缓存} |

<!-- 逐条标注看护哪个 Task 的哪个改动 -->

### 3.4 验证方式

- DT 测试：{go test ./src/service/ -run TestCheckAuth}
- 集成测试：{testsuit/TC_002.py（前置：鉴权服务可配故障注入）；无则写"无"}
- 验证命令：{go build ./... && go test ./...——按仓语言与构建工具实填}

## 4. Task 2：……

（同 Task 1 结构展开）

## 5. 决策记录

| 编号 | 疑问描述 | 涉及源码位置 | 用户裁定 |
| --- | --- | --- | --- |
| {Q1} | {CheckAuth 无缓存参数，缓存实例如何持有} | {src/service/auth_service.go:CheckAuth} | {函数内部持有包级单例，不改签名} |

<!-- 记录条件触发澄清的结论，与 {功能名}-待澄清清单.md 裁定一致；未触发澄清时本节写"无" -->
