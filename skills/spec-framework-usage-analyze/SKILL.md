---
name: spec-framework-usage-analyze
description: 分析存量代码仓中的基础框架（RPC、线程池、Actor、日志、序列化、配置、依赖注入、存储/ORM、消息队列、调度、资源池、容错治理、监控、基础库、测试框架等）及其使用方式，按部件维度产出框架使用指导——每个框架一篇 md（含用途定位、使用模式），统一归档到代码仓 docs/technical/framework-usage/ 目录并附索引 README。当需要盘点代码仓技术栈、梳理框架使用模式与调用点分布、为 AI 代码生成沉淀"框架使用知识"、或为重构/迁移/新人上手提供框架使用文档时使用。
---

# 存量代码基础框架分析

从存量代码仓中识别基础框架并分析其使用方式，产出可供人与 AI 共同消费的框架资产报告。

分析遵循五步工作流：

1. 明确范围与目的
2. 框架探测（依赖清单 + 扫描脚本）
3. 使用点定位与聚类
4. 用法模式分析
5. 生成框架使用指导文档（按部件维度归档到 docs/technical/framework-usage/）

## 第 1 步：明确范围与目的

- 确认代码仓路径、主要语言、需要排除的目录（生成代码、第三方代码）。
- 确认分析目的，据此选择深度（详见 references/analysis-dimensions.md「分析深度分级」）：
  - **技术栈盘点/汇报** → 浅（清单级）
  - **架构文档/新人上手** → 中（模式级）
  - **AI 代码生成资产/重构迁移** → 深（资产级，默认）
- 用户未说明时，默认按"深（资产级）"执行，面向 AI 代码生成产出。

## 第 2 步：框架探测

两条线并行，再交叉核对：

1. **依赖清单**：读取 go.mod、pom.xml、build.gradle、package.json、requirements.txt、Cargo.toml、CMakeLists.txt、.csproj 等，提取框架名称与版本。
2. **代码扫描**：运行内置扫描脚本：

```bash
python3 <skill_dir>/scripts/scan_frameworks.py <repo_path> -o scan_result.md
# 可选：--lang go|java|cpp|python 限定语言；--format json 输出结构化结果
# 自研/内部框架：--custom patterns.json 追加自定义模式（格式见脚本 docstring）
```

3. **查漏**：对照 references/framework-catalog.md 的十六类框架逐项核对——清单里有但扫描没命中（或反之）的必须追查；特别注意目录中列出的"易遗漏项"（自研框架、IDL 生成代码虚增、一框多用、版本双轨）。发现自研框架时，归纳其特征字符串写入自定义模式 JSON 重新扫描。

## 第 3 步：使用点定位与聚类

- 以扫描输出的热点文件为入口，用 grep 补全每框架的全量调用点。
- **优先识别封装层**：框架原生 API 只出现在少数文件、业务代码大量调用另一套自有 API → 存在封装层。封装层文件全部精读，它是用法分析的第一优先级。
- 按模块/场景对调用点聚类，识别并存用法（如封装池 vs 裸线程）。
- 按 references/analysis-dimensions.md「抽样策略」选取代表性调用点精读，禁止全量阅读。

## 第 4 步：用法模式分析

按 references/analysis-dimensions.md 的八个维度逐框架分析：用途定位、初始化与配置、核心使用模式、封装层与扩展点、并发与线程模型、错误处理与容错、约定与规范、已知问题与反模式。

硬性要求：

- 每个结论必须附代码证据（`文件:行号`），禁止臆测；约定从代码事实归纳，不从文档照抄。
- 区分"通过封装层使用"与"直接使用框架原生 API"两类调用点，分别统计与描述。
- 核心使用模式必须提取为"用法骨架"代码片段，让读者看完就知道新代码怎么写。

## 第 5 步：生成框架使用指导文档（按部件维度归档）

按部件（框架）维度拆分输出，**每个框架一篇 md**，统一归档到代码仓 `docs/technical/framework-usage/` 目录：

```
<repo>/docs/technical/framework-usage/
├── README.md                        # 索引：元信息 + 框架全景导航表
├── rpc-grpc.md                      # 每框架一篇使用指导
├── concurrency-task-executor.md
├── actor-caf.md
└── ...
```

文件命名规则：`<类别缩写>-<框架名>.md`，全小写 kebab-case。类别缩写：rpc（RPC/通信）、concurrency（并发/线程池）、actor（Actor 模型）、log（日志）、codec（序列化）、config（配置管理）、di（依赖注入/组件）、storage（存储/ORM）、mq（消息队列）、schedule（定时/调度）、eventloop（网络/事件循环）、pool（资源池）、resilience（容错/服务治理）、metrics（监控/可观测）、base（基础库）、test（测试框架）。自研框架同样按此规则命名。

两个模板：

1. **索引 README.md**：按 references/readme-template.md 填充——固定三行元信息表（分支/更新日期/Skill）+ 框架全景清单表（# | 类别 | 框架 | 使用指导链接，无死链）。README 只起导航作用，不加其他章节；未命中的类别列一行标注"未发现"，证明排查过。
2. **每框架一篇 `<类别缩写>-<框架名>.md`**：按 references/usage-template.md 填充，只含两节——**用途定位**（该框架在系统中承担什么角色、用在哪些模块）+ **使用模式**（典型调用序列骨架，真实代码片段注明来源）。

更新策略：目录与文件已存在时，按框架逐篇对比更新（框架被移除则归档标注"已下线"），不要整目录覆盖重写；README.md 索引随框架增删同步更新。

## 第 6 步：验证 mermaid 图可渲染（收尾必做）

产出文档中含 ```mermaid 代码块（框架调用关系图、线程模型图等），交付前必须运行 spec-mermaid-diagram skill 的本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/spec-mermaid-diagram/scripts/validate-mermaid.mjs <产出文件...>
```

- 全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。
- 画图规则（label 一律加引号、时序图消息禁 `;`、裸 `end` 禁用等）见 spec-mermaid-diagram skill 的「语法红线」。

## 质量检查清单

交付前逐项确认：

- [ ] 十六类框架全部排查过（含未命中的）
- [ ] 依赖清单版本与代码实际使用一致（已交叉核对）
- [ ] 自研/内部框架已识别并纳入分析
- [ ] 每个框架一篇 md，全部归档在 `docs/technical/framework-usage/`，命名符合 `<类别缩写>-<框架名>.md`
- [ ] README.md 开头为固定三行元信息表（分支/更新日期/Skill），索引中每个清单条目都能链接到存在的框架 md，无死链
- [ ] 每篇 md 只含「用途定位」「使用模式」两节，使用模式附真实代码片段并注明来源 `文件:行号`
- [ ] 每框架结论均有 `文件:行号` 证据
- [ ] 已区分封装层使用与裸 API 使用
- [ ] IDL 生成代码未虚增调用点统计
- [ ] 产出文档中的 mermaid 图已全部通过本地渲染验证（spec-mermaid-diagram 验证脚本全部 VALID）

## 参考文件索引

- references/framework-catalog.md — 十六类框架清单、探测线索、易遗漏项（第 2 步用）
- references/analysis-dimensions.md — 八维用法分析、深度分级、抽样策略（第 3、4 步用）
- references/readme-template.md — 索引 README 模板（第 5 步用）
- references/usage-template.md — 每框架一篇使用指导模板（第 5 步用）
- scripts/scan_frameworks.py — 框架使用点扫描脚本，内置常见开源框架模式库（第 2 步用）
