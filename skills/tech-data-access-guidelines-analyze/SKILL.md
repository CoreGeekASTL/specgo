---
name: tech-data-access-guidelines-analyze
description: 治理存量代码仓的数据访问规范资产（数据存储的访问指导），按数据形态分两类治理——内存数据（进程内内存结构 map+锁/sync.Map/自研缓存，及 Redis/Memcached 等内存型存储）与持久化数据（关系库/ORM、本地嵌入式存储、对象存储、文件系统），两类各用一个模板，模板聚焦三件事：数据设计与定位（存什么、为什么放这里、结构/容量/TTL/生命周期）、如何使用这个数据（读写路径、一致性、并发/事务、降级）、应该在什么场景使用这个数据（业务场景与兜底边界）；外围维度含连接与客户端管理、分页与批量、SQL 拼接与注入防护、错误处理。双模式运行——起草模式识别仓内数据存储并分类，逐存储盘点访问方式并起草规范（数据设计与定位 + 使用方式 + 适用场景 + 现状描述与应有约定）；差距分析模式对照既有规范扫描实际访问的合规差距。产出落盘被分析仓的 docs/tech/data-access-guidelines/：README.md 导航主文档 + 每存储一篇 data-access-guidelines-{mw}.md；差距报告落盘 docs/tech/data-access-guidelines/report/{YYYYMMDD}-data-access-guidelines.md。当用户提到"数据访问规范"、"Redis 使用规范"、"DB 访问指导"、"数据库访问规范"、"内存缓存"、"进程内缓存"、"缓存读写模式"、"缓存穿透"、"SQL 注入防护"、"事务使用盘点"、"ORM 怎么用"、"data access guidelines"、"数据访问差距分析"、"对照数据访问规范检查"时使用。
---

# 数据访问规范分析（tech-data-access-guidelines-analyze）

## 目的

输入一个代码仓路径，治理该仓的**数据访问规范**资产——按数据形态分两类回答四个问题：

1. 仓内有哪些数据存储——**内存数据**（进程内内存结构：map+锁 / sync.Map / 自研缓存；内存型存储：Redis / Memcached）与**持久化数据**（关系库/ORM、本地嵌入式存储、对象存储、文件系统）？
2. **数据设计与定位**：每个存储存什么数据、为什么放这里（而不是另一种形态）、结构怎么设计（key/字段/索引/容量/TTL）、数据生命周期如何？
3. **如何使用、什么场景使用**：读写路径怎么走、一致性怎么保、什么业务场景该用/不该用这个数据、兜底路径是什么？
4. 实际访问与既定数据访问规范之间有没有差距？

产出粒度对齐存量代码资产治理规范 v1.1：

| 模式 | 产出 | 落盘 |
| --- | --- | --- |
| 起草模式 | 每存储 1 篇 `data-access-guidelines-{mw}.md`（内存数据与持久化数据各用一个模板） | 被分析仓 `docs/tech/data-access-guidelines/` |
| 差距分析模式 | 差距报告 1 篇 `{YYYYMMDD}-data-access-guidelines.md` | 被分析仓 `docs/tech/data-access-guidelines/report/` |

`{mw}` 实例 slug 一律从代码标识符派生（驱动/依赖名、配置 key、client 变量、封装层名或进程内结构体/变量名转 kebab-case，如 go-redis → `redis`、gorm + MySQL DSN → `mysql`、sqlite3 → `sqlite`、MinIO client → `minio`、进程内 `authCache` 结构 → `auth-cache`；文件系统等无单一标识符时取封装模块名，无封装时用 `filesystem`），禁止 AI 自由起名——保证重跑产出同名文件、资产不断代。同类存储多实例（如两个 MySQL 库）在一篇内分述，不拆多篇。

本 skill 通用，不预设被分析仓的语言与框架，执行时基于实际探测结果走。

## 何时触发

- 用户要盘点仓内数据存储（内存数据 + 持久化数据）及其访问方式（数据设计、读写路径、事务点、SQL 拼接面、缓存读写模式），建立或刷新数据访问规范文档。
- 用户要梳理某存储的访问现状："Redis 怎么用的"、"鉴权缓存怎么设计的"、"事务都在哪开的"、"有没有 SQL 拼接注入风险"。
- 用户给出一份数据访问规范文档（或仓内 `docs/tech/data-access-guidelines/` 下已有规范），要求对照规范检查实际访问是否遵守、输出差距报告。

## 运行模式

### 起草模式（默认）

仓内无既有数据访问规范、用户也未提供规范文档时走本模式。识别仓内数据存储并按**内存数据 / 持久化数据**分类，逐存储盘点访问方式，产出每存储一篇 `data-access-guidelines-{mw}.md`——内存数据套 references/memory-data-template.md、持久化数据套 references/persistent-data-template.md，两模板统一聚焦**数据设计与定位、使用方式、适用场景**三段，外加外围维度的**现状描述与应有约定**。约定部分从代码事实归纳主导用法、对明显风险点给出应有规则，标注「起草待评审」；文档为活文档，同名覆盖更新。

### 差距分析模式

仓内已存在数据访问规范文档（`docs/tech/data-access-guidelines/` 下既有 guidelines 文档），或用户显式提供规范文件时走本模式。以规范为基准，对照扫描实际访问：数据设计与定位、使用方式（读写路径/一致性/并发或事务/降级）、适用场景与外围维度是否遵守规范，产出差距报告 `docs/tech/data-access-guidelines/report/{YYYYMMDD}-data-access-guidelines.md`（逐存储一节：合规项 / 差距项 / 规范未覆盖 / 规范条目无实现，均附证据文件路径）。差距报告为次抛件，带日期、不覆盖。

guidelines 形态语义：数据访问规范是**指导性规范**（"应该"遵守），违反出报告提示改进，不做 CI 拦截——拦截是 standards 形态资产的语义。

### 模式缺省回退

用户要求差距分析、但未提供规范文档且 `docs/tech/data-access-guidelines/` 下也无既有规范时，默认回退起草模式，并在产出的每篇文档末尾注明「规范未建，本次为现状盘点与约定起草」。

## 工作流程

按下述步骤顺序执行。每一步都要留下可追溯依据（文件路径、配置 key），分析基于**实际读到的代码与配置**，不得臆测。

### 第 1 步：判定运行模式

- 用户显式提供规范文件 → 差距分析模式，规范来源记为该文件路径。
- 否则检查被分析仓 `docs/tech/data-access-guidelines/` 下是否已有 `data-access-guidelines-*.md` 规范文档 → 有则按差距分析模式执行（用户意图是"检查 / 对照 / 差距"时直接执行），规范来源记为该目录下文档。
- 都没有 → 起草模式；若用户本意是差距分析，在每篇文档末尾注明「规范未建，本次为现状盘点与约定起草」。

### 第 2 步：识别数据存储并分类（内存数据 / 持久化数据）

三路并进，交叉核对：

1. **依赖清单**：读 go.mod、pom.xml / build.gradle、package.json、requirements.txt、Cargo.toml、.csproj 等，提取数据访问相关依赖——DB driver（mysql-connector、pgx、libpq）、ORM（gorm、MyBatis、Hibernate、SQLAlchemy、Django ORM）、Redis/Memcached client（go-redis、jedis、lettuce、redis-py）、进程内缓存库（bigcache、freecache、ristretto、Caffeine、Guava Cache、lru-cache）、嵌入式存储（sqlite3、LevelDB、RocksDB、BoltDB）、对象存储 SDK（S3、OSS、MinIO、GCS、boto3）等。
2. **配置**：yaml / properties / .env / 配置中心中的连接串（host:port、DSN、database url）、连接池参数（maxOpenConns、pool_size）、缓存 TTL 与容量、存储桶/目录配置。
3. **代码扫描**：全仓搜索访问点——
   - **进程内内存态**：包级/结构体级 `map` 配合 `sync.Mutex`/`sync.RWMutex`/`sync.Map` 的读写封装、自研 cache struct、进程内缓存库调用点（Get/Set/Delete + TTL/容量参数）；
   - **连接建立点**：`Open` / `Connect` / `createClient` / `DriverManager.getConnection` / `sql.Open` / `NewClient` 等；
   - **SQL 执行点**：SELECT/INSERT/UPDATE/DELETE 字符串、ORM 调用链（`Where`/`Find`/`Save`、mapper 接口、`@Select` 注解）；
   - **缓存命令调用点**：GET/SET/HGET/DEL/pipeline/eval 等 Redis 命令封装调用；
   - **嵌入式存储打开点**：sqlite3.connect、`sql.Open("sqlite3"...)`、leveldb.open 等；
   - **对象存储调用点**：PutObject / GetObject / upload / download 等 SDK 调用；
   - **文件系统读写点**：open / read / write / ReadFile / WriteFile / fs.createReadStream 等（排除日志框架自身的文件写入，日志归 tech-foundation-guidelines-analyze）。

排除：测试代码、mock、生成代码中的访问点不计入（或单独标注）；识别不出归属的归入「未知存储」分组并标注待人工确认，**不臆造存储名**。

**分类判定**（每个识别出的存储归入一类，决定第 4 步套哪个模板）：

- **内存数据**：进程内内存结构（map+锁 / sync.Map / 自研缓存）、Redis / Memcached 等内存型存储——特征是进程重启即失或承担缓存角色；
- **持久化数据**：关系库/ORM、本地嵌入式存储（SQLite 等）、对象存储、文件系统——特征是进程重启后数据仍在，承担权威数据源角色。

同一进程内内存结构承载多类业务数据且生命周期/定位不同时，按业务数据拆分多篇（slug 取各自结构名）；同一结构承载的数据同质化时合一篇。

### 第 3 步：逐存储盘点（按分类取维度集）

对每个识别出的存储，从访问点切入精读相关代码（优先精读封装层——原生 API 只出现在少数文件、业务代码大量调用另一套自有 API 即存在封装层）。两类存储各有一套固定维度，三段核心（数据设计与定位 / 使用方式 / 适用场景）为模板重点承载内容：

**内存数据维度集**：

1. **数据设计与定位**：存什么数据（key 形态/值结构）、为什么放内存而不持久化（定位：缓存/会话态/计算中间态）、容量与 TTL、生命周期（写入触发、失效与清理机制）。
2. **使用方式**：读写策略（Cache-Aside / Read-Through / 进程内直读直写）、读写顺序与回写路径、并发控制（锁粒度、清理与写入是否同锁、有无独立 goroutine）、与持久层的一致性路径、持久层故障时的降级行为。
3. **适用场景**：哪些业务场景读写该数据、什么条件下命中、不适用场景（如容量超限、重启后冷启动）的兜底路径。
4. **错误处理**（外围维度）：读写失败分类处理、穿透/击穿/雪崩防护（空值缓存、互斥重建、TTL 抖动）、失败兜底。

**持久化数据维度集**：

1. **数据设计与定位**：存什么数据（表与索引 / bucket / 目录划分）、为什么持久化（定位：权威数据源/归档）、结构约束（字段类型、唯一性、联合索引）、生命周期（写入、更新、清理/归档）。
2. **使用方式**：连接与客户端管理（单例/池化与取值来源）、事务使用点（边界、传播、跨表一致性）、分页与批量（分页方式、批量读写、大数据量处理）、SQL 拼接与注入防护（参数化 vs 拼接、动态 SQL 构造点）。
3. **适用场景**：哪些业务场景读写该数据、读写量级与频率特征、不适用场景（如热路径高频读应走缓存）的分工边界。
4. **错误处理**（外围维度）：错误码/异常分类处理（连接失败、超时、唯一键冲突、not found）、有无重试、失败兜底与降级。

每个维度的事实结论必须附证据文件路径（不带行号）；读不到就写「未识别（原因：xxx）」，禁止臆造。

差距分析模式下，上述维度集即核查维度：按存储分类取对应维度集，逐维度对照规范条目判定合规/差距/规范未覆盖。

### 第 4 步（起草模式）：生成数据访问规范文档

输出到被分析仓 `docs/tech/data-access-guidelines/` 目录：主文档 `README.md` + 每个存储一篇 `data-access-guidelines-{mw}.md`。

主文档 `README.md`（活文档，同名覆盖）内容仅两项：元信息表（分支/更新日期/Skill/运行模式）+ 存储导航表（存储名 + 分类（内存数据/持久化数据）→ `data-access-guidelines-{mw}.md` 链接 + 一句话数据定位，从各文档「数据设计与定位」节提取）。

存储文档按分类选模板填充——内存数据套 references/memory-data-template.md，持久化数据套 references/persistent-data-template.md。两模板统一只有两章：

1. **元信息表**：分支 / 更新日期 / Skill / 运行模式 / 数据分类（内存数据 / 持久化数据）。
2. **数据库说明 / 数据说明**：一句话定位（粗体总起）+ 数据设计或连接管理要点（表格/列表）+ 可调用封装清单（函数/入口 | 作用 | 来源文件）+ 错误处理要点 + 风险点（可选）。
3. **数据库使用示例 / 数据使用示例**：选一个代表性业务对象作贯穿示例，给 2~4 个真实代码案例（覆盖最典型的读 / 写 / 事务或清理路径），代码从仓内真实文件原样摘录、禁止改写，每例注明来源文件；其余同类访问只归纳机制、不逐一枚举。

**章节取舍原则——只保留有信息增量的章节**：全文只有上述两章，禁止增设「访问点分布」「适用场景」「约定」等章节（访问点已随证据列给出；场景与兜底融入示例；约定待评审成熟后另行立项）；某节内容若与其他节完全重叠，删节不删信息，并入信息更全的那节。

风险点（裸 SQL 拼接、无 TTL、无容量上限、无连接池上限、敏感信息泄露等）在「说明」章「风险点」小节逐条列出，附文件路径。

规则：

- 事实不得臆造：从访问点所在函数/模块/注释推断，推断不出标「待确认」。
- 说明从代码事实归纳，不从外部文档照抄；现状内部不一致（同一存储多种并存用法）时如实并列描述。
- 同名文件已存在**直接覆盖更新**——规范文档是活文档，固定名、覆盖更新，git diff 即演进史。

### 第 5 步（差距分析模式）：对照规范核查并生成差距报告

以第 1 步确定的规范文档为基准，逐存储、逐规范条目核查第 3 步采集的访问事实：

- 核查维度按存储分类取对应维度集（见第 3 步）：内存数据——数据设计与定位、使用方式（读写/一致性/并发/降级）、适用场景、错误处理；持久化数据——数据设计与定位、使用方式（连接/事务/分页批量/SQL 防护）、适用场景、错误处理。
- 每条核查结论落四类之一：**合规项**（实际访问遵守规范，附证据文件路径）、**差距项**（违反规范或规范有要求而代码未实现，附证据文件路径与现状说明）、**规范未覆盖**（实际存在访问但规范未约定，单列提示规范补全）、**规范条目无实现**（规范条目在代码里找不到任何对应访问点，不臆造实现位置）。
- 产出差距报告 `docs/tech/data-access-guidelines/report/{YYYYMMDD}-data-access-guidelines.md`，按 references/gap-report-template.md 填充：结论概览表 + 逐存储一节（合规项 / 差距项 / 规范未覆盖 / 规范条目无实现，各项均附证据文件路径）。
- 差距报告**只新增不覆盖**，文件名带日期；同日重跑同名覆盖。

### 第 6 步：验证 mermaid 图可渲染（收尾必做）

产出文档中含 ```mermaid 代码块（访问链路图、缓存读写时序图等）时，交付前必须运行 mermaid-validate skill 的本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/mermaid-validate/scripts/validate-mermaid.mjs <产出文件...>
```

- 全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。
- 画图规则（label 一律加引号、时序图消息禁 `;`、裸 `end` 禁用等）见 mermaid-validate skill 的「语法红线」。

## 输出模板

- 内存数据文档（起草模式）：references/memory-data-template.md
- 持久化数据文档（起草模式）：references/persistent-data-template.md
- 差距报告（差距分析模式）：references/gap-report-template.md

只填占位符、表格行、图；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **基于实证**：所有"用了哪个存储、怎么连接、事务在哪开、SQL 怎么拼、缓存怎么读写、是否合规"的结论必须有代码或配置支撑，证据形式为 `文件路径`，**不得出现代码行号**（行号随代码变更失效）。读不到就写「未识别（原因：xxx）」/「未设置」，禁止凭经验臆造存储名、池参数取值或合规结论。
- **实例 slug 从代码标识符派生**：`{mw}` 取驱动/依赖名、配置 key、client 变量或封装层名转 kebab-case，禁止 AI 自由起名，保证重跑产出同名文件、资产不断代。
- **活文档覆盖更新**：`docs/tech/data-access-guidelines/` 下 `data-access-guidelines-{mw}.md` 同名直接覆盖，不保留历史副本、不加日期后缀；**差距报告才带日期**，落 `report/` 子目录、次抛。
- **只读不改**：只读、只分析、只产出文档，不改动被分析代码仓的任何文件（`docs/tech/data-access-guidelines/` 下的产出除外）。
- **成品纯净**：最终文档只含成品内容。扫描过程（执行的 grep/rg 命令、命中输出摘要）仅供自检，绝不写入最终文档——其结论须以 `文件路径` 证据形式进入相关表格。
- **语言无关**：不预设被分析仓的语言与框架，按第 2 步实际探测结果走。
- **文档语言**：输出文档用中文，技术术语（ORM / DSN / TTL / Cache-Aside / pipeline / connection pool 等）保留英文。
- **可读性红线**（模板头部注释同款，全篇适用）：
  1. 一句一事实——每句只讲一个事实，禁止用「；」「——」串联多个事实的复合长句；单句超 60 字必须拆分。
  2. 现状节一律用表格或 bullet 列表呈现，禁止整段散文；同一子维度连续 3 句以上必须拆成列表。
  3. 证据句尾——证据文件路径放该句/该行末尾的括号内，不与事实混排在句中。
  4. 结论先行——每个子维度开头一句粗体总起句给结论，细节跟在后面。
  5. 示例驱动——每篇文档选一个代表性业务对象（一张表 / 一类 key）作贯穿示例说明访问机制，其余同类访问只归纳机制、不逐一枚举；全量表/字段清单归 biz-data-model-analyze 产出的 docs/biz/data-model/，本资产不罗列。
- **索引分工**：本资产目录的 `README.md`（存储导航主文档，含内存数据/持久化数据分类列）由本 skill 产出，活文档同名覆盖；域索引 `docs/tech/README.md` 与总索引 `docs/README.md` 由 spec-index 生成，本 skill 不维护。
- **与相邻资产互补**：持久化存储的表结构/字段/生命周期细节看 biz-data-model-analyze 产出的 `docs/biz/data-model/`（本资产重"怎么用、什么场景用"，数据模型资产重"字段与关系"）；框架用法骨架（无规范、纯现状）看 tech-framework-guidelines-analyze 产出的 `docs/tech/framework-guidelines/`；纯故障策略（熔断/降级/重试）的专项规范归 tech-resilience-guidelines-analyze，本 skill 只记录数据访问点的错误处理事实与合规性。
- **mermaid 收尾校验**：产出含 ```mermaid 代码块时，必须用 mermaid-validate 的 validate-mermaid.mjs 逐文件校验全部 VALID 后才算完成。

## 参考文件索引

| 文件 | 用途 |
| --- | --- |
| references/memory-data-template.md | 起草模式内存数据文档模板（元信息 + 数据说明 + 数据使用示例，两章结构） |
| references/persistent-data-template.md | 起草模式持久化数据文档模板（元信息 + 数据库说明 + 数据库使用示例，两章结构） |
| references/gap-report-template.md | 差距分析模式差距报告模板（结论概览 + 逐存储合规项/差距项/规范未覆盖/规范条目无实现） |
