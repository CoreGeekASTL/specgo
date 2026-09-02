---
name: tech-framework-guidelines-analyze
description: >-
  分析存量代码仓中的内部代码框架（RPC/Web 框架、线程池、Actor、日志、序列化、配置、依赖注入、消息队列、调度、资源池、容错治理、监控、基础库、测试框架等）及其使用方式，提取"框架使用指导"资产（基础框架清单与使用方式盘点，纯现状、无规范文档），落盘被分析仓的 docs/0-tech/framework-guidelines/：索引 README.md + 每框架一篇 framework-guidelines-{framework}.md（含用途定位、使用模式）。边界：只承载内部代码框架使用指导——数据存储访问（DB driver/ORM/Redis/MinIO/嵌入式存储等）归 tech-data-access-guidelines-analyze，跨服务业务节点调用归 tech-external-call-guidelines-analyze，均不纳入本资产。当需要盘点代码仓技术栈、梳理框架使用模式与调用点分布、为 AI 代码生成沉淀"框架使用知识"、或为重构/迁移/新人上手提供框架使用文档时使用。触发场景包括"框架使用指导"、"框架使用现状"、"技术栈盘点"、"框架使用"、"用了哪些框架"、"XX 框架怎么用"、"线程池怎么用"、"RPC 怎么调的"、"framework guidelines"、"framework usage"、"tech stack"等。
---

<!-- 子流程：不独立暴露为 skill；由 spec-analyze 主 skill 路由加载，也可由 /tech-framework-guidelines-analyze 命令触发。依赖文件在同级 ../assets/（带短名前缀） -->

# 框架使用指导分析 Skill（tech-framework-guidelines-analyze）

## 目的

输入一个存量代码仓路径，识别其中的**内部代码框架**并分析其使用方式，产出**框架使用指导**资产——回答三个问题：

1. 这个代码仓用了哪些基础框架（含自研/内部框架）？
2. 每个框架在系统中承担什么角色、用在哪些模块？
3. 每个框架的用法骨架是什么——新代码照着怎么写？

**资产边界（严格遵守）**：

- 本资产只承载**内部代码框架使用指导**——进程内引用的库/框架/自研封装怎么用。
- **数据存储访问不纳入**：DB driver / ORM / Redis / MinIO / 嵌入式存储等数据存储的访问指导归 tech-data-access-guidelines-analyze 产出的 `docs/0-tech/data-access-guidelines/`（ORM 作为"怎么访问 DB"的事实已在该资产承载，本资产不再立篇）。
- **跨服务业务节点调用不纳入**：HTTP/RPC/MQ 调用外部业务服务的指导归 tech-external-call-guidelines-analyze 产出的 `docs/0-tech/external-call-guidelines/`。
- 框架探测（第 2 步）命中存储/ORM 类依赖时，在 README 清单表相应类别标注"归 data-access-guidelines 承载"，不在本目录立篇。

本资产为**提取型纯现状**：只记录代码里已长出的事实，不含"应该怎么用"的规范性要求（规范类资产由 tech 域 guidelines/standards 形态的 skill 承载）。

产出物落盘**被分析代码仓根目录**的 `docs/0-tech/framework-guidelines/`（不存在则创建，连同 `docs/` 一起创建）：

| 产出 | 文件 |
| --- | --- |
| 索引 | `docs/0-tech/framework-guidelines/README.md`（元信息 + 框架全景导航表） |
| 每框架 1 篇 | `docs/0-tech/framework-guidelines/framework-guidelines-{framework}.md`（用途定位 + 使用模式） |

`{framework}` 实例 slug 从代码标识符派生（依赖清单/代码中的框架名转 kebab-case，如 gRPC → `framework-guidelines-grpc.md`、自研 TaskExecutor → `framework-guidelines-task-executor.md`），禁止自由起名——保证重跑产出同名文件、资产不断代。

本 skill 通用，不预设被分析仓的语言/框架，执行时基于实际探测结果走，禁止凭仓库名或已知项目结构臆测。

## 何时触发

- 盘点代码仓技术栈、梳理框架使用模式与调用点分布。
- 为 AI 代码生成沉淀"框架使用知识"。
- 重构/迁移/新人上手需要框架使用文档。
- 用户提到"框架使用指导""框架使用现状""技术栈盘点""用了哪些框架""XX 框架怎么用"。

## 工作流程

### 第 1 步：明确范围与目的

- 确认代码仓路径、主要语言、需要排除的目录（生成代码、第三方代码）。
- 确认分析目的，据此选择深度（详见 ../assets/framework-guidelines--analysis-dimensions.md「分析深度分级」）：
  - **技术栈盘点/汇报** → 浅（清单级）
  - **架构文档/新人上手** → 中（模式级）
  - **AI 代码生成资产/重构迁移** → 深（资产级，默认）
- 用户未说明时，默认按"深（资产级）"执行，面向 AI 代码生成产出。

### 第 2 步：框架探测

两条线并行，再交叉核对：

1. **依赖清单**：读取 go.mod、pom.xml、build.gradle、package.json、requirements.txt、Cargo.toml、CMakeLists.txt、.csproj 等，提取框架名称与版本。
2. **代码扫描**：运行内置扫描脚本：

```bash
python3 <skill_dir>/../assets/framework-guidelines--scan_frameworks.py <repo_path> -o scan_result.md
# 可选：--lang go|java|cpp|python 限定语言；--format json 输出结构化结果
# 自研/内部框架：--custom patterns.json 追加自定义模式（格式见脚本 docstring）
```

3. **查漏**：对照 ../assets/framework-guidelines--framework-catalog.md 的十六类框架逐项核对——清单里有但扫描没命中（或反之）的必须追查；特别注意目录中列出的"易遗漏项"（自研框架、IDL 生成代码虚增、一框多用、版本双轨）。发现自研框架时，归纳其特征字符串写入自定义模式 JSON 重新扫描。
4. **边界过滤**：命中存储/ORM 类（DB driver、ORM、Redis/Memcached client、对象存储 SDK、嵌入式存储）的框架不立篇，标注"归 data-access-guidelines 承载"；命中外部业务服务 client stub 的不立篇，标注"归 external-call-guidelines 承载"。

### 第 3 步：使用点定位与聚类

- 以扫描输出的热点文件为入口，用 grep 补全每框架的全量调用点。
- **优先识别封装层**：框架原生 API 只出现在少数文件、业务代码大量调用另一套自有 API → 存在封装层。封装层文件全部精读，它是用法分析的第一优先级。
- 按模块/场景对调用点聚类，识别并存用法（如封装池 vs 裸线程）。
- 按 ../assets/framework-guidelines--analysis-dimensions.md「抽样策略」选取代表性调用点精读，禁止全量阅读。

### 第 4 步：用法模式分析

按 ../assets/framework-guidelines--analysis-dimensions.md 的八个维度逐框架分析：用途定位、初始化与配置、核心使用模式、封装层与扩展点、并发与线程模型、错误处理与容错、约定与规范、已知问题与反模式。

硬性要求：

- 每个结论必须附代码证据，证据为**文件路径**（不带行号），禁止臆测；约定从代码事实归纳，不从文档照抄。
- 区分"通过封装层使用"与"直接使用框架原生 API"两类调用点，分别统计与描述。
- 核心使用模式必须提取为"用法骨架"代码片段，让读者看完就知道新代码怎么写。

### 第 5 步：生成框架使用指导文档并落盘 docs/0-tech/framework-guidelines/

按部件（框架）维度拆分输出，**每个框架一篇 md**，统一归档到被分析仓 `docs/0-tech/framework-guidelines/` 目录：

```
<repo>/docs/0-tech/framework-guidelines/
├── README.md                                # 索引：元信息 + 框架全景导航表
├── framework-guidelines-grpc.md             # 每框架一篇使用指导
├── framework-guidelines-task-executor.md
└── ...
```

文件命名规则：`framework-guidelines-{framework}.md`，全小写 kebab-case。框架类别（RPC/并发/Actor/日志等十六类）**不编码进文件名**，由 README 清单表的"类别"列承载；自研框架同样按此规则命名。

两个模板：

1. **索引 README.md**：按 ../assets/framework-guidelines--readme-template.md 填充——固定三行元信息表（分支/更新日期/Skill）+ 框架全景清单表（# | 类别 | 框架 | 使用指导文档链接，无死链）。README 只起导航作用，不加其他章节；未命中的类别列一行标注"未发现"，存储/ORM 类命中时标注"归 data-access-guidelines 承载"，证明排查过。
2. **每框架一篇 `framework-guidelines-{framework}.md`**：按 ../assets/framework-guidelines--framework-guidelines-template.md 填充，只含两节——**用途定位**（该框架在系统中承担什么角色、用在哪些模块）+ **使用模式**（典型调用序列骨架，真实代码片段注明来源文件路径）。

更新策略：目录与文件已存在时，按框架逐篇对比更新（框架被移除则在该篇标注"已下线"），不要整目录覆盖重写；README.md 索引随框架增删同步更新。历史产出若仍位于旧布局 `docs/technical/framework-usage/` 或旧锚点 `docs/0-tech/usage/`，需人工一次性迁移，本 skill 只读写 `docs/0-tech/framework-guidelines/`。

### 第 6 步：验证 mermaid 图可渲染（收尾必做）

产出文档中含 ```mermaid 代码块（框架调用关系图、线程模型图等），交付前必须运行 mermaid 本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/spec-analyze/scripts/validate-mermaid.mjs <产出文件...>
```

- 全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。
- 画图规则（label 一律加引号、时序图消息禁 `;`、裸 `end` 禁用等）见 `<specgo插件目录>/skills/spec-analyze/references/mermaid-guide.md` 的「语法红线」。

## 输出模板

- 索引 `README.md` 严格按 ../assets/framework-guidelines--readme-template.md 骨架填充；
- 每框架 `framework-guidelines-{framework}.md` 严格按 ../assets/framework-guidelines--framework-guidelines-template.md 骨架填充，只含「用途定位」「使用模式」两节。

只填占位符、表格行、真实代码片段；写作规则见上文各步骤与「关键约束」。

## 关键约束

- **语言无关**：不预设被分析仓的语言/框架，按第 1 步实际探测结果走。
- **资产边界**：只承载内部代码框架使用指导；数据存储访问归 tech-data-access-guidelines-analyze，跨服务业务节点调用归 tech-external-call-guidelines-analyze——边界处探测命中时在 README 标注归属，不在本目录立篇。
- **基于实证**：所有结论必须有代码证据支撑，证据为**文件路径**（不带行号——行号随代码变更失效且无跨工具稳定性），禁止臆测；约定从代码事实归纳，不从文档照抄。
- **实例 slug 从代码标识符派生**：`{framework}` 取依赖清单/代码中的框架名转 kebab-case，禁止 AI 自由起名，保证重跑产出同名文件、资产不断代。
- **活文档覆盖更新**：`docs/0-tech/framework-guidelines/` 下文档同名直接覆盖（按框架逐篇更新），不保留历史副本、不加日期后缀。
- **索引分工**：索引 `README.md`（框架全景导航）即本资产目录主文档，由本 skill 产出、活文档同名覆盖；域索引 `docs/0-tech/README.md` 与总索引 `docs/README.md` 自 v3.0 起不再自动生成（spec-index 已移除），本 skill 不维护。
- **只读不改**：只读、只分析、只产出文档，不改动被分析代码仓的任何文件（`docs/` 下产出除外）。
- **成品纯净**：最终文档只含成品内容；第 2~4 步的探测过程（执行的 grep 命令、扫描脚本输出摘要）仅供自检，绝不写入最终文档——其结论须以文件路径证据形式进入文档。
- **文档语言**：输出文档用中文，技术术语（RPC / Actor / ORM / ThreadPool / Channel 等）保留英文。
- **排查完备性**：十六类框架全部排查（含未命中的，README 相应类别标注"未发现"；存储/ORM 类标注"归 data-access-guidelines 承载"）；依赖清单版本与代码实际使用交叉核对；自研/内部框架必须识别并纳入分析。
- **封装层优先**：封装层文件全部精读；文档中明确区分"通过封装层使用"与"直接使用框架原生 API"两类调用点。
- **统计口径**：IDL 生成代码不计入调用点统计（或单独标注），避免虚增。
- **mermaid 校验**：产出含 ```mermaid 代码块时，收尾必须用 `node <specgo插件目录>/skills/spec-analyze/scripts/validate-mermaid.mjs <产出文件...>` 逐文件校验，全部 VALID 才算完成；INVALID 按报错修复后重验，禁止跳过。

## 参考文件索引

- ../assets/framework-guidelines--framework-catalog.md — 十六类框架清单、探测线索、易遗漏项（第 2 步用）
- ../assets/framework-guidelines--analysis-dimensions.md — 八维用法分析、深度分级、抽样策略（第 3、4 步用）
- ../assets/framework-guidelines--readme-template.md — 索引 README 模板（第 5 步用）
- ../assets/framework-guidelines--framework-guidelines-template.md — 每框架一篇使用指导模板（第 5 步用）
- ../assets/framework-guidelines--scan_frameworks.py — 框架使用点扫描脚本，内置常见开源框架模式库（第 2 步用）
