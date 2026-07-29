# 输出模板

两套模板：README.md 索引 + 每功能一篇 feature md。所有文档归档到 `<repo>/docs/story/`。功能文档与 `docs/story/feature-cache-manage.md` 同构：L1 功能故事（多彩建模）→ L2 结构地图 → L3 AI 编码指南，共七节。

## 模板一：docs/story/README.md 索引

```markdown
# 功能软件要素文档

| 元信息 | 值 |
|--------|-----|
| 代码仓 | <仓库名> |
| 分析基准 | <分支名> 分支 (<YYYY-MM-DD>) |
| 更新时间 | <YYYY-MM-DD> |
| Skill | spec-feature-analyze |
| 主要语言 | <语言> |
| 分析范围 | <全部接口类型 / 仅 idl / 仅 route / 仅 async> |

> 由 spec-feature-analyze 生成/更新，面向人与 AI 共同消费。

## 功能全景

| 功能域 | 接口数 | 核心模块 | 文档 |
|---|---|---|---|
| 缓存管理 | 1（外部+内部同注册） | controllers, service, common/cse | [feature-cache-manage.md](feature-cache-manage.md) |

## 接口统计

- 对外接口：N 个（IDL 契约 X / 框架路由 Y / 消息订阅定时 Z）
- 已下线：N 个（见各功能文档接口表"状态"列）
- 说明：语言级内部接口（仓内模块间契约）仅用于分析，不写入功能文档

## 未归类接口

以下接口探测到但未纳入任何功能域，原因逐条说明：

- `GET /test/v1/get`（测试桩，非业务功能）

## 使用说明

- **新人上手**：每篇先读第 1 节「功能故事」（多彩建模图+术语表），再按需深入 L2 结构地图。
- **AI 编码时**：L1 建立业务认知后重点读「AI 编码指南」，再按"接口清单 → 调用关系"定位改动点。
```

## 模板二：feature-<功能名>.md（七节结构）

```markdown
# <功能名>

> 功能域概述：一两句话说明该功能解决什么业务问题。
> 接口数：N（外部 X / 内部 Y）　核心模块：a, b, c

## 1. 功能故事（多彩建模）

实现逻辑速览（1~3 句，每句 ≤30 字，业务语言，禁文件名/函数名/行号）：

收到请求后筛出全部健康实例，逐台下发指令，单台失败只记日志。

​```mermaid
flowchart LR
  classDef mi fill:#ffd1dc,stroke:#c2185b,color:#000
  classDef role fill:#fff3b0,stroke:#f9a825,color:#000
  classDef ppt fill:#c8e6c9,stroke:#2e7d32,color:#000
  classDef desc fill:#bbdefb,stroke:#1565c0,color:#000

  Caller[调用方 外部]:::role
  E1[受理请求]:::mi
  E2[遍历实例逐个下发]:::mi
  E3[汇总返回]:::mi
  Data[(业务数据<br/>状态 X→Y)]:::ppt
  R1[单点失败不影响整体]:::desc

  Caller --> E1 --> E2 --> E3
  E2 -.读写.-> Data
  R1 -.约束.-> E2
​```

术语表：

| 术语 | 人话解释 | 出处 |
|---|---|---|
| 就绪实例 | 插件装完、容量有余、健康在线的实例 | src/service/browser_service.go |

## 2. 模块划分

​```mermaid
graph LR
  Client[客户端] --> Router[routers/beego_router.go]
  Router --> Ctrl[controllers/cache_controller.go]
  Ctrl --> Svc[service/cache_service.go]
  Svc --> GW[下游 BrowserGW]
​```

| 模块 | 承载功能（引用文件） |
|---|---|
| controllers/cache_controller.go | 路由表声明与入口、失败审计日志、响应封装（src/controllers/cache_controller.go） |
| service/cache_service.go | 业务编排与下游调用（src/service/cache_service.go） |

## 3. 接口清单

只列对外接口与本功能的出向调用，五列表格，不写散文：

| 接口 | 路径/入口（含注册处） | 请求结构 | 响应结构 | 状态 |
|---|---|---|---|---|
| DeleteCache | POST /app-api/.../deleteCache；入口 src/controllers/cache_controller.go；注册 src/routers/beego_router.go | DeleteCacheRequest（src/models/req/request_entity.go）：{imei, imsi} 均必填 | DataResponse（src/models/resp/response_entity.go）：{code, message, data} | 在用 |
| （出向）BrowserGW 删除用户数据 | DELETE http://{endpoint}/browsergw/browser/userdata/delete（src/service/cache_service.go） | JSON {imei, imsi}；超时 5s | 仅接受 HTTP 200 | 在用 |

## 4. 关键数据结构

| 结构 | 定义位置 | 关键字段（含义+约束） |
|---|---|---|
| DeleteCacheRequest | src/models/req/request_entity.go | IMEI（json imei，必填，Validate 非空校验）；IMSI（同约束） |

## 5. 调用关系

每条主链路一张 mermaid 时序图：

​```mermaid
sequenceDiagram
  participant C as 客户端
  participant CC as CacheController
  participant S as CacheService
  participant GW as 下游实例群
  C->>CC: POST /app-api/.../deleteCache
  CC->>S: DeleteCache(imei, imsi)
  loop 每个就绪实例
    S->>GW: DELETE /userdata/delete
    GW-->>S: 200 / 错误(仅记日志)
  end
  S-->>CC: nil
  CC-->>C: {code:200, data:true}
​```

关键分支与异步环节（各一句，带证据文件）：

- 解析/校验失败返回 code=-2（src/controllers/controller.go）
- 单实例失败不中断、不上抛，整体仍报成功（src/service/cache_service.go）

## 6. 框架引用

| 基础框架 | 框架文档 | 本功能中的用途（引用文件） |
|---|---|---|
| Beego Web 路由/Controller | [rpc-beego-web.md](../framework-usage/rpc-beego-web.md) | 路由注册与请求处理（src/routers/beego_router.go、src/controllers/cache_controller.go） |

## 7. AI 编码指南

只列实现要点，每条 ≤30 字，附证据文件：

- 路由改动只动 RouteInfo()，两侧监听同步生效（src/controllers/cache_controller.go）
- 下游调用沿用 5s 超时与 200 判定约定（src/service/cache_service.go）
```

## 撰写硬性要求

- 证据唯一来源是存量代码：所有位置证据使用**文件级**路径（相对代码仓根目录），禁止写行号；术语表"出处"列同样只写文件。代码推断不出的业务背景标注"代码中未体现"，禁止脑补。
- **L1 功能故事**：开头 1~3 句实现逻辑速览，每句 ≤30 字，用业务语言概括代码实现逻辑，禁止文件名/函数名/行号；mermaid 四色用 classDef 固定配色（粉 #ffd1dc / 黄 #fff3b0 / 绿 #c8e6c9 / 蓝 #bbdefb）；粉色事件按时序连成主干，每个事件必须具备 触发者(黄)/输入(绿/蓝)/输出(绿)/后继(粉) 四要素；事件名用人话业务动作；实体标注状态变更（X→Y）；规则用虚线挂到实体。方法论详见 references/color-modeling.md。
- **术语表**：覆盖功能故事与接口清单中全部业务缩写/黑话/外部系统名；每条=一句话人话解释+出处文件，禁止只写英文全称。
- 模块划分必须先 mermaid 图后表格，图节点带入口文件名；依赖方向在图中用箭头表达，禁止纯文字罗列。
- 接口清单只列对外接口与本功能的出向调用（出向在接口名前标注"（出向）"）；语言级内部接口一律不写入；只填表格五列，禁止为每个接口写段落描述；接口 > 20 个时按子功能拆多张表。
- 数据结构只列"理解该功能必须知道"的结构与关键字段；超过 8 个字段的结构只写关键字段。
- 调用关系必须先 mermaid 时序图，再用短句补关键分支/异步/明确不走的链路；同接口多实现的选择机制在模块划分表或关键分支中说明。
- **框架引用**：逐行必须有代码事实依据（import/调用点所在文件），禁止按框架文档目录全量罗列；框架文档列必须链接到仓内存在的文档，相对路径，无死链；仓内无 docs/framework-usage/ 目录时整节省略并在索引 README 注明。
- AI 编码指南每条 ≤30 字（不含证据锚点），1-5 条，禁止"建议合理设计""注意代码质量"类空泛表述。
- "状态"列只取：在用 / 已下线 / 灰度中。
