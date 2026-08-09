---
name: tech-data-access-guidelines-analyze
description: 治理存量代码仓的数据访问规范资产（Redis/DB 等数据访问中间件的访问指导：连接与客户端管理、事务使用、分页与批量、SQL 拼接与注入防护、缓存读写模式、错误处理），双模式运行——起草模式识别仓内数据访问中间件（关系库/ORM、Redis、本地嵌入式存储、对象存储、文件系统等），逐中间件盘点访问方式并起草规范（用途定位 + 访问点分布表 + 现状描述与应有约定）；差距分析模式对照既有规范扫描实际访问的合规差距。产出落盘被分析仓的 docs/tech/data-access-guidelines/：每中间件一篇 data-access-guidelines-{mw}.md；差距报告落盘 docs/tech/data-access-guidelines/report/{YYYYMMDD}-data-access-guidelines.md。当用户提到"数据访问规范"、"Redis 使用规范"、"DB 访问指导"、"数据库访问规范"、"缓存读写模式"、"缓存穿透"、"SQL 注入防护"、"事务使用盘点"、"ORM 怎么用"、"data access guidelines"、"数据访问差距分析"、"对照数据访问规范检查"时使用。
---

# 数据访问规范分析（tech-data-access-guidelines-analyze）

## 目的

输入一个代码仓路径，治理该仓的**数据访问规范**资产——回答三个问题：

1. 仓内用了哪些数据访问中间件（关系库/ORM、Redis、本地嵌入式存储、对象存储、文件系统等）？
2. 每个中间件如何被访问——连接/客户端怎么管、事务在哪开、分页批量怎么做、SQL 怎么拼、缓存怎么读写、错误怎么处理？
3. 实际访问与既定数据访问规范之间有没有差距？

产出粒度对齐存量代码资产治理规范 v1.1：

| 模式 | 产出 | 落盘 |
| --- | --- | --- |
| 起草模式 | 每中间件 1 篇 `data-access-guidelines-{mw}.md` | 被分析仓 `docs/tech/data-access-guidelines/` |
| 差距分析模式 | 差距报告 1 篇 `{YYYYMMDD}-data-access-guidelines.md` | 被分析仓 `docs/tech/data-access-guidelines/report/` |

`{mw}` 实例 slug 一律从代码标识符派生（驱动/依赖名、配置 key、client 变量或封装层名转 kebab-case，如 go-redis → `redis`、gorm + MySQL DSN → `mysql`、sqlite3 → `sqlite`、MinIO client → `minio`；文件系统等无单一标识符时取封装模块名，无封装时用 `filesystem`），禁止 AI 自由起名——保证重跑产出同名文件、资产不断代。同类中间件多实例（如两个 MySQL 库）在一篇内分述，不拆多篇。

本 skill 通用，不预设被分析仓的语言与框架，执行时基于实际探测结果走。

## 何时触发

- 用户要盘点仓内数据访问中间件及其访问方式（连接管理、事务点、SQL 拼接面、缓存读写模式），建立或刷新数据访问规范文档。
- 用户要梳理某中间件的访问现状："Redis 怎么用的"、"事务都在哪开的"、"有没有 SQL 拼接注入风险"。
- 用户给出一份数据访问规范文档（或仓内 `docs/tech/data-access-guidelines/` 下已有规范），要求对照规范检查实际访问是否遵守、输出差距报告。

## 运行模式

### 起草模式（默认）

仓内无既有数据访问规范、用户也未提供规范文档时走本模式。识别仓内数据访问中间件，逐中间件盘点访问方式，产出每中间件一篇 `data-access-guidelines-{mw}.md`——含用途定位、访问点分布表、按六个维度的**现状描述与应有约定**。约定部分从代码事实归纳主导用法、对明显风险点给出应有规则，标注「起草待评审」；文档为活文档，同名覆盖更新。

### 差距分析模式

仓内已存在数据访问规范文档（`docs/tech/data-access-guidelines/` 下既有 guidelines 文档），或用户显式提供规范文件时走本模式。以规范为基准，对照扫描实际访问：连接管理、事务、分页批量、SQL 注入防护、缓存读写模式、错误处理是否遵守规范，产出差距报告 `docs/tech/data-access-guidelines/report/{YYYYMMDD}-data-access-guidelines.md`（逐中间件一节：合规项 / 差距项 / 规范未覆盖 / 规范条目无实现，均附证据文件路径）。差距报告为次抛件，带日期、不覆盖。

guidelines 形态语义：数据访问规范是**指导性规范**（"应该"遵守），违反出报告提示改进，不做 CI 拦截——拦截是 standards 形态资产的语义。

### 模式缺省回退

用户要求差距分析、但未提供规范文档且 `docs/tech/data-access-guidelines/` 下也无既有规范时，默认回退起草模式，并在产出的每篇文档末尾注明「规范未建，本次为现状盘点与约定起草」。

## 工作流程

按下述步骤顺序执行。每一步都要留下可追溯依据（文件路径、配置 key），分析基于**实际读到的代码与配置**，不得臆测。

### 第 1 步：判定运行模式

- 用户显式提供规范文件 → 差距分析模式，规范来源记为该文件路径。
- 否则检查被分析仓 `docs/tech/data-access-guidelines/` 下是否已有 `data-access-guidelines-*.md` 规范文档 → 有则按差距分析模式执行（用户意图是"检查 / 对照 / 差距"时直接执行），规范来源记为该目录下文档。
- 都没有 → 起草模式；若用户本意是差距分析，在每篇文档末尾注明「规范未建，本次为现状盘点与约定起草」。

### 第 2 步：识别数据访问中间件

三路并进，交叉核对：

1. **依赖清单**：读 go.mod、pom.xml / build.gradle、package.json、requirements.txt、Cargo.toml、.csproj 等，提取数据访问相关依赖——DB driver（mysql-connector、pgx、libpq）、ORM（gorm、MyBatis、Hibernate、SQLAlchemy、Django ORM）、Redis/Memcached client（go-redis、jedis、lettuce、redis-py）、嵌入式存储（sqlite3、LevelDB、RocksDB、BoltDB）、对象存储 SDK（S3、OSS、MinIO、GCS、boto3）等。
2. **配置**：yaml / properties / .env / 配置中心中的连接串（host:port、DSN、database url）、连接池参数（maxOpenConns、pool_size）、缓存 TTL、存储桶/目录配置。
3. **代码扫描**：全仓搜索访问点——
   - **连接建立点**：`Open` / `Connect` / `createClient` / `DriverManager.getConnection` / `sql.Open` / `NewClient` 等；
   - **SQL 执行点**：SELECT/INSERT/UPDATE/DELETE 字符串、ORM 调用链（`Where`/`Find`/`Save`、mapper 接口、`@Select` 注解）；
   - **缓存命令调用点**：GET/SET/HGET/DEL/pipeline/eval 等 Redis 命令封装调用；
   - **嵌入式存储打开点**：sqlite3.connect、`sql.Open("sqlite3"...)`、leveldb.open 等；
   - **对象存储调用点**：PutObject / GetObject / upload / download 等 SDK 调用；
   - **文件系统读写点**：open / read / write / ReadFile / WriteFile / fs.createReadStream 等（排除日志框架自身的文件写入，日志归 tech-foundation-guidelines-analyze）。

排除：测试代码、mock、生成代码中的访问点不计入（或单独标注）；中间件识别不出归属的归入「未知中间件」分组并标注待人工确认，**不臆造中间件名**。

### 第 3 步：逐中间件盘点访问方式（六维度）

对每个识别出的中间件，从访问点切入精读相关代码（优先精读封装层——中间件原生 API 只出现在少数文件、业务代码大量调用另一套自有 API 即存在封装层），按六个固定维度盘点事实：

1. **连接与客户端管理**：client 是单例/全局共享还是每请求新建；连接池配置（池大小、空闲、超时、生命周期）与取值来源；初始化与关闭点在哪个文件。
2. **事务使用点**：哪些写路径开了事务、事务边界（起止位置、传播与嵌套）、跨表/跨中间件一致性如何处理；无事务时如实记「代码未使用事务」。
3. **分页与批量**：分页方式（limit/offset、游标/keyset、全量拉取内存分页）、批量读写（batch insert、bulk、pipeline）、大数据量处理（流式/游标/一次性加载）。
4. **SQL 拼接与注入防护**：参数化查询 vs 字符串拼接；动态 SQL 构造点（条件拼装、表名/列名拼接、IN 列表展开）；ORM 原生 SQL 出口（Raw/exec）。
5. **缓存读写模式**：读写策略（Cache-Aside / Read-Through / Write-Through / Write-Behind）、key 命名与 TTL 设置、缓存穿透处理（空值缓存/布隆过滤）、击穿处理（互斥重建/逻辑过期）、雪崩处理（TTL 抖动）；缓存与库的一致性路径（先写库后删缓存等）。非缓存中间件此维度记「本中间件不涉及」。
6. **错误处理**：错误码/异常分类处理（连接失败、超时、唯一键冲突、not found）、有无重试、失败兜底与降级；读不到显式处理记「未设置」或「框架默认」。

每个维度的事实结论必须附证据文件路径（不带行号）；读不到就写「未识别（原因：xxx）」，禁止臆造。

差距分析模式下，六维度即核查维度：逐维度对照规范条目判定合规/差距/规范未覆盖。

### 第 4 步（起草模式）：生成数据访问规范文档

输出到被分析仓 `docs/tech/data-access-guidelines/` 目录，每个中间件一篇 `data-access-guidelines-{mw}.md`，按 references/data-access-guidelines-template.md 填充：

1. **元信息表**：分支 / 更新日期 / Skill / 运行模式。
2. **用途定位**：该中间件在系统中承担什么角色（存什么数据、服务哪些业务模块、实例与库/bucket 划分），1~3 句，从配置与访问点分布归纳。
3. **访问点分布表**：访问点 / 所在文件 / 所在函数 / 访问方式（封装层或裸 client，封装层附文件路径）/ 业务场景；同一访问方式多处调用逐行列出；**预留死代码单列**——client 封装存在但无任何业务调用方的，不计入分布表，在表后「附注」节逐条列出。
4. **六维度章节**：每维度分「现状」与「约定」两小节——现状写第 3 步盘点事实（附证据文件路径）；约定从现状主导用法归纳、对风险点（裸 SQL 拼接、无 TTL、无连接池上限等）给出应有规则，整节标注「起草待评审」；该中间件不涉及的维度写「本中间件不涉及」，不删除章节标题。
5. **附注（可选）**：预留死代码、配置声明了但代码无实际访问的中间件，逐条列出附文件路径。

规则：

- 业务场景不得臆造：从访问点所在函数/模块/注释推断，推断不出标「待确认」。
- 约定从代码事实归纳，不从外部文档照抄；现状内部不一致（同一中间件多种并存用法）时如实并列描述，约定给出统一方向。
- 同名文件已存在**直接覆盖更新**——规范文档是活文档，固定名、覆盖更新，git diff 即演进史。

### 第 5 步（差距分析模式）：对照规范核查并生成差距报告

以第 1 步确定的规范文档为基准，逐中间件、逐规范条目核查第 3 步采集的访问事实：

- 核查维度固定六项：**连接与客户端管理**、**事务使用**、**分页与批量**、**SQL 拼接与注入防护**、**缓存读写模式**、**错误处理**。
- 每条核查结论落四类之一：**合规项**（实际访问遵守规范，附证据文件路径）、**差距项**（违反规范或规范有要求而代码未实现，附证据文件路径与现状说明）、**规范未覆盖**（实际存在访问但规范未约定，单列提示规范补全）、**规范条目无实现**（规范条目在代码里找不到任何对应访问点，不臆造实现位置）。
- 产出差距报告 `docs/tech/data-access-guidelines/report/{YYYYMMDD}-data-access-guidelines.md`，按 references/gap-report-template.md 填充：结论概览表 + 逐中间件一节（合规项 / 差距项 / 规范未覆盖 / 规范条目无实现，各项均附证据文件路径）。
- 差距报告**只新增不覆盖**，文件名带日期；同日重跑同名覆盖。

### 第 6 步：验证 mermaid 图可渲染（收尾必做）

产出文档中含 ```mermaid 代码块（访问链路图、缓存读写时序图等）时，交付前必须运行 spec-mermaid-diagram skill 的本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/spec-mermaid-diagram/scripts/validate-mermaid.mjs <产出文件...>
```

- 全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。
- 画图规则（label 一律加引号、时序图消息禁 `;`、裸 `end` 禁用等）见 spec-mermaid-diagram skill 的「语法红线」。

## 输出模板

- 每中间件数据访问规范文档（起草模式）：references/data-access-guidelines-template.md
- 差距报告（差距分析模式）：references/gap-report-template.md

只填占位符、表格行、图；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **基于实证**：所有"用了哪个中间件、怎么连接、事务在哪开、SQL 怎么拼、缓存怎么读写、是否合规"的结论必须有代码或配置支撑，证据形式为 `文件路径`，**不得出现代码行号**（行号随代码变更失效）。读不到就写「未识别（原因：xxx）」/「未设置」，禁止凭经验臆造中间件名、池参数取值或合规结论。
- **实例 slug 从代码标识符派生**：`{mw}` 取驱动/依赖名、配置 key、client 变量或封装层名转 kebab-case，禁止 AI 自由起名，保证重跑产出同名文件、资产不断代。
- **活文档覆盖更新**：`docs/tech/data-access-guidelines/` 下 `data-access-guidelines-{mw}.md` 同名直接覆盖，不保留历史副本、不加日期后缀；**差距报告才带日期**，落 `report/` 子目录、次抛。
- **只读不改**：只读、只分析、只产出文档，不改动被分析代码仓的任何文件（`docs/tech/data-access-guidelines/` 下的产出除外）。
- **成品纯净**：最终文档只含成品内容。扫描过程（执行的 grep/rg 命令、命中输出摘要）仅供自检，绝不写入最终文档——其结论须以 `文件路径` 证据形式进入相关表格。
- **语言无关**：不预设被分析仓的语言与框架，按第 2 步实际探测结果走。
- **文档语言**：输出文档用中文，技术术语（ORM / DSN / TTL / Cache-Aside / pipeline / connection pool 等）保留英文。
- **索引分工**：域索引 `docs/tech/README.md` 与总索引 `docs/README.md` 由 all-index 生成，本 skill 不维护。
- **与相邻资产互补**：中间件存什么数据（表结构/字段/生命周期）看 biz-data-model-analyze 产出的 `docs/biz/data-model/`；框架用法骨架（无规范、纯现状）看 tech-usage-analyze 产出的 `docs/tech/usage/`；纯故障策略（熔断/降级/重试）的专项规范归 tech-resilience-guidelines-analyze，本 skill 只记录数据访问点的错误处理事实与合规性。
- **mermaid 收尾校验**：产出含 ```mermaid 代码块时，必须用 spec-mermaid-diagram 的 validate-mermaid.mjs 逐文件校验全部 VALID 后才算完成。

## 参考文件索引

| 文件 | 用途 |
| --- | --- |
| references/data-access-guidelines-template.md | 起草模式每中间件文档模板（元信息 + 用途定位 + 访问点分布表 + 六维度现状与约定 + 附注） |
| references/gap-report-template.md | 差距分析模式差距报告模板（结论概览 + 逐中间件合规项/差距项/规范未覆盖/规范条目无实现） |
