# Story 设计文档输出模板

两套模板：README.md 索引 + 每功能一篇 story 设计 md。所有文档归档到 `<repo>/docs/story/`。story 设计文档与存量功能文档同构：L1 功能故事（多彩建模）→ L2 结构地图 → L3 AI 编码指南，共七节。

## 模板一：docs/story/README.md 索引

```markdown
# 功能软件要素文档

| 元信息 | 值 |
|--------|-----|
| 代码仓 | <仓库名> |
| 分析基准 | <分支名> 分支 (<YYYY-MM-DD>) |
| 更新时间 | <YYYY-MM-DD> |
| Skill | spec-story-design |
| 主要语言 | <语言> |

> 由 spec-story-design 生成/更新，面向人与 AI 共同消费。

## 功能全景

| 功能域 | 接口数 | 核心模块 | 文档 |
|---|---|---|---|
| 终端鉴权 | 3 新增（设计中）+ 4 注入点 | controllers(auth), service(auth) | [feature-terminal-auth.md](feature-terminal-auth.md) |

## 接口统计

- 对外接口：N 个（框架路由 X / 消息订阅 Y）
- 设计中：N 个（见各功能文档接口表"状态"列）
- 已下线：N 个

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
> 接口数：N 个新增（设计中）+ M 个注入点　核心模块：a, b, c
> 来源：<需求文档路径>（下称"需求"）

## 1. 功能故事（多彩建模）

实现逻辑速览（1~3 句，每句 ≤30 字，业务语言，禁文件名/函数名/行号）：

登录先建档，再按绑定有效性复用或重分实例。

​```mermaid
flowchart LR
  classDef mi fill:#ffd1dc,stroke:#c2185b,color:#000
  classDef role fill:#fff3b0,stroke:#f9a825,color:#000
  classDef ppt fill:#c8e6c9,stroke:#2e7d32,color:#000
  classDef desc fill:#bbdefb,stroke:#1565c0,color:#000

  DEV[终端设备 外部]:::role
  GIDS[GIDS 本服务]:::role
  E1[登录鉴权]:::mi
  E2[分配实例]:::mi
  UB[(UserBind 绑定<br/>无→生效→过期)]:::ppt
  R1[绑定有效期 3 分钟]:::desc

  DEV --> E1
  GIDS -.->|执行| E1
  E1 --> E2
  R1 -.有效期判定.-> E2
  E2 -->|状态变更为生效| UB
​```

术语表：

| 术语 | 人话解释 | 出处 |
|---|---|---|
| 逃生态 | 白名单表为空时一律放行，避免未配置导致全量阻断 | 需求 §2.2.3 |

## 2. 模块划分

​```mermaid
graph LR
  R[routers<br/>beego_router.go 复用] --> C[controllers<br/>auth_controller.go 规划]
  C --> S[service<br/>auth_service.go 规划]
  S --> D[dao<br/>white_list.go 规划]
  D --> DB[(t_white_list)]
​```

| 模块 | 承载功能 |
|---|---|
| controllers/auth（规划） | 三个 HTTP 入口，不做业务逻辑（需求 §2.4） |
| service/auth（规划） | 鉴权决策（需求 §2.4） |
| dao/white_list（规划） | 白名单表读写（需求 §2.4） |
| controllers login（复用，src/controllers/login_controller.go） | 注入鉴权调用（需求 §3） |

## 3. 接口清单

只列对外接口；新增接口状态"设计中"，既有链路注入点单独标注：

| 接口 | 路径/入口 | 请求结构 | 响应结构 | 状态 |
|---|---|---|---|---|
| 终端联合鉴权 | POST /auth/v1/authIMEI（规划 auth_controller） | JSON{imei, imsi} | 均命中 200 / 未命中 401 | 设计中 |
| gridLoginAuth（注入） | POST /app-api/.../gridLoginAuth（src/controllers/exlogin_controller.go） | LoginAuthRequest | 鉴权失败 code=-2 | 在用，27.0 起注入鉴权 |

## 4. 关键数据结构

| 结构 | 定义位置 | 关键字段 |
|---|---|---|
| t_white_list 表 | 规划 models/db/white_list.go | IMEI char(15) 建索引；IMSI char(15) 建索引；联合索引（需求 §7） |
| cacheEntry | 规划 service/auth_cache.go | result + expireAt；容量 1000/TTL 30min（需求 §2.2.4） |

## 5. 调用关系

每条主链路一张 mermaid 时序图，需求中的分支用 alt/opt 表达：

​```mermaid
sequenceDiagram
  participant DEV as 终端设备
  participant C as AuthController(规划)
  participant S as AuthService(规划)
  participant D as WhiteListDao(规划)
  DEV->>C: POST /auth/v1/authIMEI
  C->>S: authIMEI(imei, imsi)
  alt 白名单表为空
    S-->>C: 逃生态放行（需求 §2.2.3）
  else 联合匹配
    S->>D: GetByIMEI
    D-->>S: 命中/未命中
    S-->>C: 放行 / 拒绝
  end
  C-->>DEV: 200 / 401
​```

关键分支与异步环节（各一句，带依据）：

- 导入为同步事务，整批失败回滚（需求 §4）
- 缓存无独立 goroutine，清理在写锁内完成（需求 §2.2.4）

## 6. 框架引用

| 基础框架 | 框架文档 | 本功能中的用途（引用文件） |
|---|---|---|
| Beego Web 路由/Controller | [rpc-beego-web.md](../framework-usage/rpc-beego-web.md) | 新 Controller 按 RouteMapping 注册到内部监听（src/routers/beego_router.go） |
| beego ORM | [storage-beego-orm.md](../framework-usage/storage-beego-orm.md) | 白名单表按三步曲实现，双 DDL 保持一致（src/dao/base_dao.go） |

## 7. AI 编码指南

只列实现要点，每条 ≤30 字，附依据（需求章节号或存量文件）：

- 新接口注册进内部监听 RouteMapping（src/routers/beego_router.go）
- 表结构必须双 DDL 同步（src/dao/db_init.go）
```

## 撰写硬性要求

- 证据两源：需求文档章节号（如"需求 §2.2.3"）与存量代码文件（复用点/注入点）；规划文件一律标注"（规划）"；全文证据粒度到文件级，不写行号。
- **L1 功能故事**：开头 1~3 句实现逻辑速览，每句 ≤30 字；mermaid 四色用 classDef 固定配色（粉 #ffd1dc / 黄 #fff3b0 / 绿 #c8e6c9 / 蓝 #bbdefb）；每个粉色事件必须具备 触发者(黄)/输入(绿/蓝)/输出(绿)/后继(粉) 四要素；事件名用人话业务动作，禁止文件名/函数名/行号；实体标注状态变更（X→Y）；规则用虚线挂到实体；需求未明确处标注"需求未明确，待详设确认"，禁止脑补。
- **术语表**：覆盖需求词汇表与全文黑话；每条=一句话人话解释+出处（需求章节号或存量文件），禁止只写英文全称。
- 模块划分先 mermaid 图后表格；新模块标"（规划）"，复用模块标"（复用，<文件>）"；职责边界遵循需求文档的模块职责约束。
- 接口清单只列对外接口（新增 + 注入点），五列表格，不写段落描述；注入点在接口名后标注"（注入）"，状态列注明注入版本。
- 数据结构只列关键字段与约束；超过 8 个字段的结构只写关键字段。
- 调用关系每条主链路一张时序图（管理链路、业务链路分开画）；短句补关键分支。
- 框架引用逐行链接到仓内存在的 framework-usage 文档，无死链；仓内无该目录时整节省略并在索引注明。
- AI 编码指南每条 ≤30 字（不含依据锚点），1-5 条，禁止空泛表述。
- "状态"列取值：设计中 / 在用 / 已下线 / 灰度中。
