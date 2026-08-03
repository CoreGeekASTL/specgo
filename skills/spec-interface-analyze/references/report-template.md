# 输出模板

产出**一个主文档 + 多个子文档**，归档到 `<repo>/docs/interface/`。主文档为 `README.md`（目录索引惯例），含接口全景与功能域索引；每个功能域一个子文档，以 `spec-` 开头。强调人类阅读友好。

> 本模板中所有具体内容（功能域名、文件路径、行号、接口名等）均为**格式示例**，取自一个 Go/Beego 仓的案例；产出时替换为目标仓实际内容。

## 文件结构

```
<repo>/docs/interface/
├── README.md                          # 主文档
├── spec-interface-<功能名1>.md         # 子文档（每功能域一份）
├── spec-interface-<功能名2>.md
└── ...
```

## 模板一：主文档 README.md

```markdown
# 对外接口总览

| 元信息 | 值 |
|--------|-----|
| 代码仓 | <仓库名> |
| 分析基准 | <分支名> 分支 (<YYYY-MM-DD>) |
| 更新时间 | <YYYY-MM-DD> |
| Skill | spec-interface-analyze |
| 主要语言 | <语言> |
| Web 框架 | <框架及版本> |
| API 契约 | <契约文件类型与数量，无则写"无"> |

> 面向人类阅读。范围：本仓对外提供的接口（HTTP 路由 / RPC service / 消息订阅 handler / IDL 契约），不含本仓调用别人的接口。

## 1. 接口全景

一张 mermaid 图：本仓为中心节点，指向各功能域；功能域节点按业务功能命名。

​```mermaid
flowchart LR
  classDef repo fill:#e1f5ff,stroke:#0277bd,color:#000
  classDef http fill:#bbdefb,stroke:#1565c0,color:#000
  classDef rpc fill:#c8e6c9,stroke:#2e7d32,color:#000
  classDef async fill:#e1bee7,stroke:#6a1b9a,color:#000

  Repo[(本仓)]:::repo
  Login[终端登录鉴权]:::http
  File[文件管理]:::http
  Cert[证书订阅]:::async

  Repo --> Login
  Repo --> File
  Repo --> Cert
​```

统计：共 **N** 个功能域，**N** 个对外接口（HTTP X / RPC Y / 消息订阅 Z / 定时任务 W）。

## 2. 功能域索引

| 功能域 | 接口数 | 核心模块 | 子文档 |
|---|---|---|---|
| 终端登录鉴权 | 3 | controllers/exlogin, controllers/login | [spec-interface-login.md](spec-interface-login.md) |
| 文件管理 | 8 | controllers/exfile, controllers/file | [spec-interface-file-mgmt.md](spec-interface-file-mgmt.md) |
| 证书订阅 | 3（异步） | common/cert | [spec-interface-cert.md](spec-interface-cert.md) |

> 未归类接口：无（若有探测到但无法归入任何功能域的接口，在此逐条列出并说明原因）

自检：扫描 N 个接口，已记录 N 个，未归类 M 个（见上表），差集已清零（YYYY-MM-DD）

## 3. 全局风险与注意点

跨功能域的共性风险，每条带 `文件:行号` 证据：

- **全局中间件**：routers/beego_router.go:19（OverLoadFilter 全局限流，所有接口共用）
- **双 server 架构**：routers/beego_router.go:17/28（externalServer HTTPS + innerServer HTTP，同接口双暴露）

（无风险点时此节可省略，但需在全景图后注明"未发现显著风险点"）
```

## 模板二：子文档 spec-interface-<功能名>.md

```markdown
# <功能名>

> 功能域：终端登录鉴权　接口数：3　所属 server：外部(HTTPS) + 内部(HTTP)
> 子文档 of [README.md](README.md)

## 1. 定位

终端登录鉴权与浏览器预开。同一组 3 个路径经 externalServer（HTTPS）与 innerServer（HTTP）双暴露。

## 2. 接口清单

| 接口名 | 作用 | 所在文件 | 方法/路径 |
|---|---|---|---|
| GridLoginAuth | 网格登录鉴权 | controllers/exlogin_controller.go | POST /app-api/devicetcp/app/login/v1/gridLoginAuth |
| GridLoginAuthOpenBrowser | 登录鉴权并预开浏览器 | controllers/exlogin_controller.go | POST /app-api/devicetcp/app/login/v1/gridLoginAuthOpenBrowser |
| DeviceLoginAuth | 设备登录鉴权 | controllers/exlogin_controller.go | POST /app-api/devicetcp/app/login/v1/deviceLoginAuth |

## 3. 数据结构说明

对应接口清单逐个说明请求与响应数据结构：

- **GridLoginAuth / GridLoginAuthOpenBrowser / DeviceLoginAuth**
  - 请求 `req.LoginAuthRequest`（models/req/login.go）：IMEI（15 位纯数字，必填）；IMSI（15 位纯数字，必填）；Manufacturer；Model
  - 响应 `resp.LoginInfo`（models/resp/login.go）：Token；ExpireAt；BrowserEndpoint
  - DeviceLoginAuth 经由沐恩云服务二次鉴权（service/remote_service.go:18）

## 4. 风险与注意点（可选）

该功能域内的风险点，每条带 `文件:行号` 证据：

- **同组接口双暴露**：controllers/exlogin_controller.go:29（gridLoginAuth 等在 HTTPS 外部与 HTTP 内部重复注册，鉴权策略不一致风险）

（无风险点时此节可省略）
```

## 撰写硬性要求

- **主 + 子文档**：1 个主文档 `README.md` + N 个子文档 `spec-interface-<功能名>.md`，禁止全部塞进单文件。
- **命名**：主文档 `README.md`（目录索引惯例，不以 `spec-` 开头）；子文档 `spec-interface-<功能名>.md`，功能名英文 kebab-case。
- **主文档接口全景图**：必须 mermaid `flowchart`，本仓为中心节点；功能域节点按**业务功能命名**（如"账号管理"），禁止按技术层命名；用 classDef 按接口类型配色（HTTP 矩形 / RPC 圆角 / 消息订阅 平行四边形 / 定时任务 子图）；功能域数 ≤ 12 全列，> 12 按业务域聚合。
- **功能域索引表**：每行含功能域名、接口数、核心模块、子文档链接；链接必须能跳到对应子文档，无死链。
- **子文档元信息**：首行元信息含"子文档 of [README.md](README.md)"返回链接，便于从子文档跳回主文档。
- **子文档四要素**：定位（一句话）/ **接口表格** / **表格下方逐个接口数据结构说明** / 该功能风险（可选），缺一不可。
- **接口表格列固定**：接口名 | 作用 | 所在文件 | 方法/路径或调用方式（HTTP 填 `POST /api/v1/xxx`，RPC 填 `UserService.GetUser`，消息订阅填 `Consume topic-xxx`，定时任务填 `@every 1m` 或 cron 表达式）。
- **"所在文件"列不带行号**：只填文件路径（如 `controllers/login_controller.go`），让表格简洁；其余需精确定位的证据（风险点、连接配置、全局中间件挂载点等）保留 `文件:行号` 格式。
- **表下数据结构说明格式**：对应接口表格里每个接口，用列表逐个说明其请求与响应数据结构——格式为「结构名（定义位置）：关键字段+约束」；同功能域内多接口共用的结构只在首次出现处详述，后续接口注明"同上"。
- **表格化**：接口清单必须用表格，禁止散文段落描述单个接口。
- **证据锚点**：风险点、连接配置等需精确定位的结论附 `文件:行号` 格式证据，相对代码仓根目录。
- **关键字段**：数据结构只列"理解该接口必须知道"的字段与约束，超过 8 字段只列关键，不整段搬运 struct 定义。
- **接口清单精简**：单功能域接口数 > 10 时，列代表性 5~10 处，注明"全量见 xxx"，禁止全量罗列刷屏。
- **风险点**：每条带 `文件:行号` 证据，禁止"建议合理设计""注意代码质量"类空泛表述；无风险时省略该节。
- **状态标注**：已下线/灰度/仅测试使用的接口，在接口表格"作用"列或数据结构说明首行标注。
