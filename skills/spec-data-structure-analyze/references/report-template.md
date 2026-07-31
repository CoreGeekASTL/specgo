# 输出模板

产出**一个主文档 + 多个子文档**，归档到 `<repo>/docs/data-structure/`。主文档为 `README.md`（目录索引惯例），含数据结构全景与类型索引；每个类型一个子文档，以 `spec-` 开头。强调人类阅读友好。

## 文件结构

```
<repo>/docs/data-structure/
├── README.md                                   # 主文档
├── spec-data-structure-<类型1>.md               # 子文档（每类型一份）
├── spec-data-structure-<类型2>.md
└── ...
```

## 模板一：主文档 README.md

```markdown
# 关键数据结构总览

| 元信息 | 值 |
|--------|-----|
| 代码仓 | <仓库名> |
| 分析基准 | <分支名> 分支 (<YYYY-MM-DD>) |
| 更新时间 | <YYYY-MM-DD> |
| Skill | spec-data-structure-analyze |
| 主要语言 | <语言> |

> 面向人类阅读。范围：本仓承载关键业务/自定义/高被引用/特殊并发语义的数据结构，不含一次性局部变量与生成代码。

## 1. 数据结构全景

一张 mermaid 图：本仓为中心节点，指向各数据结构类型；类型节点按类型配色。

​```mermaid
flowchart LR
  classDef repo fill:#e1f5ff,stroke:#0277bd,color:#000
  classDef map fill:#bbdefb,stroke:#1565c0,color:#000
  classDef list fill:#c8e6c9,stroke:#2e7d32,color:#000
  classDef custom fill:#ffe0b2,stroke:#e65100,color:#000
  classDef sync fill:#e1bee7,stroke:#6a1b9a,color:#000

  Repo[(本仓)]:::repo
  Map[map 映射]:::map
  Slice[切片/列表]:::list
  Cache[自定义容器]:::custom
  Chan[队列 channel]:::sync

  Repo --> Map
  Repo --> Slice
  Repo --> Cache
  Repo --> Chan
​```

统计：共 **N** 个类型，**N** 个关键数据结构实例（array X / slice Y / map Z / set W / 自定义容器 V ...）。

## 2. 类型索引

| 类型 | 实例数 | 核心用途 | 子文档 |
|---|---|---|---|
| map | 5 | 缓存表/注册表/会话池 | [spec-data-structure-map.md](spec-data-structure-map.md) |
| slice | 3 | 批量缓冲/采样窗口 | [spec-data-structure-slice.md](spec-data-structure-slice.md) |
| custom-container | 2 | LRU 缓存/连接池 | [spec-data-structure-custom-container.md](spec-data-structure-custom-container.md) |
| set | 0 | — | 未发现（已排查） |

> 未归类实例：无（若有探测到但无法归入任何类型的实例，在此逐条列出并说明原因）

自检：扫描 N 个实例，已记录 N 个，未归类 M 个（见上表），差集已清零（YYYY-MM-DD）

## 3. 全局风险与注意点

跨类型的共性风险，每条带 `文件:行号` 证据：

- **并发安全 map 封装**：models/cache.go:23（Cache struct 内嵌 RWMutex + map，新增字段须沿用同款封装）
- **全局注册表生命周期**：routers/router.go:15（var handlers 全局 map，无显式 unregister，长期运行内存增长风险）

（无风险点时此节可省略，但需在全景图后注明"未发现显著风险点"）
```

## 模板二：子文档 spec-data-structure-<类型名>.md

```markdown
# <类型名>

> 类型：map　实例数：5　返回 [README.md](README.md)

## 1. 定位

map 在本仓承担核心状态承载——缓存表、路由注册表、会话池均以带锁 map 封装实现。

## 2. 关键实例清单

| 实例名 | 作用 | 定义位置 |
|---|---|---|
| sessionCache | 终端会话缓存 | models/session.go |
| routeTable | 路由注册表 | routers/router.go |
| whiteList | 白名单集合(map 当 set) | models/whitelist.go |

## 3. 实例详解

对应实例清单逐个说明：

- **sessionCache**
  - 结构：`type sessionCache struct { mu sync.RWMutex; m map[string]*Session }`（models/session.go）
  - 关键字段：m（会话 map，key=token）；mu（读写锁，并发安全）
  - 典型操作：Get/Put 均走 mu.RLock/Lock；过期清理靠定时扫全表
  - 使用点：controllers/login_controller.go:42（Put）、controllers/auth_controller.go:18（Get）
  - 并发模型：读写锁，读多写少
- **routeTable**
  - 结构：`var routeTable = map[string]Handler{...}`（routers/router.go:15，全局 var 注册表）
  - 关键操作：包 init() 时注册，运行期只读
  - 使用点：routers/router.go:40（分发查询）
  - 并发模型：初始化后只读，无需锁

## 4. 使用模式与约定

- 新增缓存一律套 `type Xxx struct { mu sync.RWMutex; m map[K]V }` 封装，禁止裸暴露 map 字段
- 注册表用包级 `var x = map[...]{}` + init 注册，运行期只读

## 5. AI 编码指南

1. 新增"key->业务对象"缓存时，复用 `sessionCache` 同款读写锁封装，禁止裸 map + 外部加锁（依据：models/session.go:23，仓内统一约定）
2. map 当集合用时，value 一律 `struct{}` 而非 `bool`（依据：models/whitelist.go:8，零内存语义）

## 6. 风险与注意点（可选）

该类型实例内的风险点，每条带 `文件:行号` 证据：

- **sessionCache 无容量上限**：models/session.go:23（仅靠定时清理，无 LRU，长连接场景内存增长）

（无风险点时此节可省略）
```

## 撰写硬性要求

- **主 + 子文档**：1 个主文档 `README.md` + N 个子文档 `spec-data-structure-<类型名>.md`，禁止全部塞进单文件。
- **命名**：主文档 `README.md`（目录索引惯例，不以 `spec-` 开头）；子文档 `spec-data-structure-<类型名>.md`，类型名英文 kebab-case（如 `map`、`linked-list`、`ring-buffer`、`custom-container`）。
- **主文档全景图**：必须 mermaid `flowchart`，本仓为中心节点；类型节点按数据结构类型命名；用 classDef 按类型配色（map / 顺序容器 / 自定义容器 / 并发容器 各一色）；类型数 ≤ 12 全列，> 12 按相近类型合并。
- **类型索引表**：每行含类型名、实例数、核心用途、子文档链接；链接必须能跳到对应子文档，无死链；未命中的类型列一行标"未发现（已排查）"。
- **子文档元信息**：首行元信息含"返回 [README.md](README.md)"链接，便于从子文档跳回主文档。
- **子文档五要素**：定位（一句话）/ **关键实例表格** / **表格下方逐实例详解** / 使用模式与约定 / **AI 编码指南**，缺一不可。
- **关键实例表格列固定**：实例名 | 作用 | 定义位置。
- **"定义位置"列不带行号**：只填文件路径（如 `models/session.go`），让表格简洁；使用点、并发控制点等需精确定位的证据保留 `文件:行号` 格式。
- **表下实例详解格式**：对应实例表格里每个实例，用列表逐个说明其结构定义、关键字段/约束、典型操作、使用点（`文件:行号`）、并发/性能语义；同类型内多实例共用的封装模式只在首次出现处详述，后续注明"同上封装"。
- **表格化**：实例清单必须用表格，禁止散文段落描述单个实例。
- **证据锚点**：使用点、并发控制点等需精确定位的结论附 `文件:行号` 格式证据，相对代码仓根目录。
- **关键字段**：只列"理解该实例必须知道"的字段与约束，超过 8 字段只列关键，不整段搬运 struct 定义。
- **实例清单精简**：单类型实例数 > 10 时，列代表性 5~10 处，注明"全量见 xxx"，禁止全量罗列刷屏。
- **AI 编码指南**：1-3 条可执行规则（新代码该用哪个实例/类型、禁止什么、何时自建容器），每条标注依据（`文件:行号`），禁止"建议合理使用数据结构"类空泛表述。
- **风险点**：每条带 `文件:行号` 证据，禁止空泛表述；无风险时省略该节。
- **状态标注**：已下线/灰度/仅测试使用的数据结构，在实例表格"作用"列或详解首行标注。
