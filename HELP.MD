# 存量代码资产治理

> 版本：v1.1　日期：2026-08-08
> 适用范围：基于"四分类资产模型"的存量代码资产治理
> v1.1 变更：输出目录改为"每类资产一个单独目录"（`docs/{域}/{资产}/`），同域不同资产不再混放。

## 一、命名规范

### 1.1 命名公式

```
{域}-{资产}-{形态}-analyze
```

- 全小写 kebab-case；
- 四段式，缺一不可（豁免项见 1.3）；
- 横向与编排能力不受四段式约束：`spec-init` / `spec-index` / `spec-update` / `spec-analyze` / `specgo` 五个。

### 1.2 受控词汇表

**域（5 个，新增需先扩表）**

| 域 | 含义 | 治理问题 |
|---|---|---|
| `arch` | 架构要素 | 定结构：代码往哪放 |
| `biz` | 业务要素 | 定业务：对象怎么建、数据存什么 |
| `tech` | 技术要素 | 定用法：机制怎么用、调用怎么跑 |
| `qual` | 工程要素 | 定规矩：写到什么程度才算合格 |
| `spec` | 横向 | 跨资产能力 |

**形态（3 个，编码资产性质）**

| 形态 | 资产性质 | 运行模式 |
|---|---|---|
| `model` | 提取型：代码里已长出的事实 | 现状提取 |
| `guidelines` | 约束型·指导性规范（应该，违反出报告） | 差距分析 |
| `standards` | 约束型·红线标准（必须，违反即拦截） | 差距分析 + 门禁 |

**形态豁免**（词本身已含形态，不再追加）：`interface`、`rules`、`lexicon`、`usage`。

### 1.3 命名红线

1. **查表制**：域名、形态词、动作词只准从词汇表取，新增资产先扩表再起名；
2. **动作统一 `analyze`**：提取与差距检查不占用命名，由 SKILL.md 内部双模式实现区分；
3. **实例 slug 从代码标识符派生**：模块名/表名/服务名转 kebab-case，禁止 AI 自由起名，保证重跑产出同名文件、资产不断代；
4. **standards 与 guidelines 不合并**：一词之差对应门禁策略（拦截 vs 报告），CI 按名配置。

---

## 二、全套 Skill 清单（19 + 2）

### 2.1 架构要素（arch）—— 定结构：代码往哪放

| Skill | 治理资产 | 资产内涵 | 产出粒度 | 输出文件 | 模式 | 优先级 |
|---|---|---|---|---|---|---|
| `arch-structure-model-analyze` | 结构模型 | 模块划分、分层、职责与依赖关系（UML 包图 + 依赖矩阵） | 仓级总览 1 篇 + 每模块 1 篇 | `README.md`<br>`structure-model-{module}.md` | 提取 | P0 |
| `arch-interaction-model-analyze` | 交互模型 | 模块间主业务流程、消息走向（UML 时序图），只画主链路，分支逻辑归业务规则 | 主文档 + 每业务类型 1 篇 | `README.md`<br>`interaction-model-{flow}.md` | 提取 | P0 |

### 2.2 业务要素（biz）—— 定业务：对象怎么建、数据存什么

| Skill | 治理资产 | 资产内涵 | 产出粒度 | 输出文件 | 模式 | 优先级 |
|---|---|---|---|---|---|---|
| `biz-interface-analyze` | 接口 | 服务对外接口清单，按功能域聚类（业务能力归此，协议/错误码归通信规范） | 主文档 + 每功能域 1 篇 | `README.md`<br>`interface-{feature}.md` | 提取 | P0 |
| `biz-rules-analyze` | 业务规则 | 按需求类整理"条件 → 动作 + 依据"规则条目（表格） | 主文档 + 每需求类 1 篇 | `README.md`<br>`rules-{feature}.md` | 提取 | P0 |
| `biz-object-model-analyze` | 对象模型 | 实体、值对象、聚合、领域服务、领域事件（UML 类图） | 主文档 + 每聚合 1 篇 | `README.md`<br>`object-model-{aggregate}.md` | 提取 | P0 |
| `biz-data-model-analyze` | 数据模型 | 持久态表结构、缓存数据结构、字段关系与数据生命周期（UML-ER） | 主文档 + 每数据实体 1 篇 | `README.md`<br>`data-model-{entity}.md` | 提取 | P0 |
| `biz-lexicon-analyze` | 领域词典 | 业务与代码共用的受控词汇集：术语释义、语境边界、代码命名映射 | 主文档 + 每功能域 1 篇（按业务子域拆分，子域×术语类型两级组织） | `README.md`<br>`lexicon-{feature}.md` | 提取 | P1 |

### 2.3 技术要素（tech）—— 定用法：机制怎么用、调用怎么跑

| Skill | 治理资产 | 资产内涵 | 产出粒度 | 输出文件 | 模式 | 优先级 |
|---|---|---|---|---|---|---|
| `tech-comm-guidelines-analyze` | 通信规范 | RPC/HTTP/MQ 跨服务调用指导（协议与封装归此；故障策略归韧性） | 主文档 + 每外部服务 1 篇 | `README.md`<br>`comm-guidelines-{service}.md` | 双模式 | P0 |
| `tech-framework-usage-analyze` | 框架使用现状 | 基础框架清单与使用方式盘点（无规范文档，纯现状） | 主文档 + 每框架 1 篇 | `README.md`<br>`usage-{framework}.md` | 提取 | P0 |
| `tech-concurrency-guidelines-analyze` | 并发规范 | 线程池/锁/channel 等并发原语实例的用途定位、使用说明与代码案例（章节上限三节） | 主文档 + 每实例 1 篇 | `README.md`<br>`concurrency-guidelines-{pool}.md` | 提取 | P0 |
| `tech-data-access-guidelines-analyze` | 数据访问规范 | Redis/DB 等中间件访问指导 | 主文档 + 每中间件 1 篇 | `README.md`<br>`data-access-guidelines-{mw}.md` | 双模式 | P1 |
| `tech-resilience-guidelines-analyze` | 韧性规范 | 超时/重试/熔断/异常处理的使用说明与代码案例（只管故障策略） | 主文档 + 每维度 1 篇 | `README.md`<br>`resilience-guidelines-{dimension}.md` | 提取 | P1 |
| `tech-foundation-guidelines-analyze` | 基础规范 | 日志/配置/告警等基础机制的函数调用说明与使用代码案例 | 主文档 + 每维度 1 篇 | `README.md`<br>`foundation-guidelines-{dimension}.md` | 提取 | P1 |

### 2.4 工程要素（qual）—— 定规矩：写到什么程度才算合格

| Skill | 治理资产 | 资产内涵 | 产出粒度 | 输出文件 | 模式 | 优先级 |
|---|---|---|---|---|---|---|
| `qual-code-standards-analyze` | 编码规范 | 命名、注释、函数长度/圈复杂度、安全编码红线、禁止项清单（每条规则标注可否机器检查） | 仓级单篇 | `code-standards.md` | 双模式+门禁 | P0 |
| `qual-dt-guidelines-analyze` | DT规范 | 测试金字塔与覆盖基线、用例设计方法、自测报告要求、新增代码覆盖率门禁 | 仓级单篇 | `dt-guidelines.md` | 双模式+门禁 | P0 |
| `qual-branch-guidelines-analyze` | 分支与变更规范 | 分支模型、commit/MR 规范、评审要求 | 仓级单篇 | `branch-guidelines.md` | 双模式 | P1 |

### 2.5 横向能力（spec）

| Skill | 职责 | 输出 |
|---|---|---|
| `spec-init` | 初始化仓级 `docs/` 资产目录骨架（每类资产一个单独目录）；一次性迁移既有产出（external-call/AR/framework-usage 及扁平布局历史产出） | 目录骨架 |
| `spec-index` | 生成各域索引 README + 总索引 + 服务依赖全景图（Mermaid） | `docs/README.md` 及各域 `README.md` |
| `spec-update` | 基于 git 变更识别代码变化对 docs/ 资产的影响，按最新要素定义增量刷新受影响文档（刷新清单人工确认后定稿） | 受影响 docs/ 文档就地刷新（同名覆盖） |
| `spec-analyze` | 一键全量资产分析编排：子代理并行派发全部 16 个 analyze skill（词典第二波复用接口功能域口径），spec-index 收口索引 | `docs/` 全套资产 + 各域索引与总索引 |

---

## 三、输出文件命名规范

### 3.1 总公式

**每类资产一个单独目录**：`docs/{域}/{资产}/`。资产目录名从 skill 名派生——去掉 `{域}-` 前缀与 `-analyze` 后缀（如 `arch-structure-model-analyze` → `structure-model/`），禁止自由起名。例外：`tech-framework-usage-analyze` 的资产锚点为 `usage`（落盘 `docs/tech/usage/`），为兼容存量资产不随 skill 改名迁移。

```
docs/{域}/{资产}/{资产}-{形态}-{实例}.md           ← 模型/规范文档（活文档，覆盖更新；形态豁免资产无形态段）
docs/{域}/{资产}/README.md                         ← 多文件资产的主文档/索引（必产出，内容口径按各 SKILL.md 约定）
docs/{域}/{资产}/report/{YYYYMMDD}-{资产}-{形态}.md ← 差距报告（次抛，带日期）
docs/{域}/README.md                                ← 域索引（spec-index 产出）
docs/README.md                                     ← 总索引 + 依赖全景图（spec-index 产出）
```

规则：

1. **同域不同资产不混放**：资产目录内只放本资产的文档及其 `report/` 子目录；
2. **单文件资产同样独占目录**（code-standards、dt-guidelines、branch-guidelines），目录内仅一个同名 md——目录即资产身份，新增多实例时无需迁移；
3. **多文件资产必须在目录内置 `README.md` 作为主文档/索引**（如接口资产的全景主文档、韧性规范的扫描范围总览），由各资产 analyze skill 产出、活文档同名覆盖；域索引与总索引仍归 spec-index；
4. **文件名不变**：本次仅调整目录层级，各资产文件名沿用第 2 章表格「输出文件」列，保证既有链接与重跑同名覆盖语义不断代。

### 3.2 目录树

```
docs/
├── README.md                                ← spec-index 产出（总索引 + 依赖全景图）
├── arch/
│   ├── README.md                            ← 域索引（spec-index 产出）
│   ├── structure-model/
│   │   ├── README.md                        ← 仓级总览（资产主文档）
│   │   └── structure-model-{module}.md      ← 每模块 1 篇
│   └── interaction-model/
│       ├── README.md                        ← 流程导航主文档
│       └── interaction-model-{flow}.md      ← 每业务流程 1 篇
├── biz/
│   ├── README.md
│   ├── interface/
│   │   ├── README.md                        ← 接口全景主文档
│   │   └── interface-{feature}.md           ← 每功能域 1 篇
│   ├── rules/
│   │   ├── README.md                        ← 功能域导航主文档
│   │   └── rules-{feature}.md               ← 每需求类 1 篇
│   ├── object-model/
│   │   ├── README.md                        ← 聚合导航主文档
│   │   └── object-model-{aggregate}.md      ← 每聚合 1 篇
│   ├── data-model/
│   │   ├── README.md                        ← 实体导航主文档
│   │   └── data-model-{entity}.md           ← 每数据实体 1 篇
│   └── lexicon/
│       ├── README.md                        ← 主文档（说明/待确认清单/子域导航/通用节）
│       └── lexicon-{feature}.md             ← 每功能域 1 篇（按业务子域拆分）
├── tech/
│   ├── README.md
│   ├── usage/
│   │   ├── README.md                        ← 框架清单索引
│   │   └── usage-{framework}.md             ← 每框架 1 篇
│   ├── comm-guidelines/
│   │   ├── README.md                        ← 外部服务导航主文档
│   │   └── comm-guidelines-{service}.md     ← 每外部服务 1 篇
│   ├── concurrency-guidelines/
│   │   ├── README.md                        ← 实例导航主文档
│   │   └── concurrency-guidelines-{pool}.md ← 每线程池 1 篇
│   ├── data-access-guidelines/
│   │   ├── README.md                        ← 中间件导航主文档
│   │   └── data-access-guidelines-{mw}.md   ← 每中间件 1 篇
│   ├── resilience-guidelines/
│   │   ├── README.md                        ← 扫描范围总览 + 维度导航
│   │   └── resilience-guidelines-{dimension}.md ← 每维度 1 篇
│   └── foundation-guidelines/
│       ├── README.md                        ← 机制全景索引
│       └── foundation-guidelines-{dimension}.md ← 每维度 1 篇
└── qual/
    ├── README.md
    ├── code-standards/
    │   ├── code-standards.md                ← 仓级单篇
    │   └── report/                          ← 门禁差距报告（次抛，带日期）
    ├── dt-guidelines/
    │   ├── dt-guidelines.md
    │   └── report/
    └── branch-guidelines/
        └── branch-guidelines.md
```



