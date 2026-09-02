---
name: spec-requirement-audit
description: >-
  需求审核 skill——基于多彩建模方法论审核 Spec/需求/功能设计文档：既看文档也看代码（代码对照：文档描述的既有行为/接口/规则/数据结构与代码事实比对，初步定位注入点/复用点），三类断点扫描（表述质量：句子成分残缺/弱表述/术语失范/语义多解 + 业务逻辑断裂点 + 设计要素：时序图/验收用例/接口信息）合并分级后统一澄清（默认 ask-human 批量提问、每问附基于代码事实的推荐做法；用户声明"以报告形式呈现"则输出待澄清报告等回复），澄清闭环后一次成型产出建模 HTML 与规范功能实现设计 md（功能设计规范格式），收尾输出不落盘审核报告（断点逐条 + 代码对照结论 + 产出清单）交用户审视。当用户提到"spec-requirement-audit"、"spec-function-design-audit"、"需求审核"、"审核 spec 业务逻辑完备性"、"多彩建模"、"检查需求逻辑断点"、"需求表述质量检查"、"需求歧义扫描"、"需求与代码对照"、"建模结果生成 HTML 并找人确认"、"功能设计文档校验"时使用。
---

# 需求审核（spec-requirement-audit）

| 输入 | 干什么 | 产出 |
| --- | --- | --- |
| 一篇 Spec/需求/功能设计文档 | 多彩建模 + 代码对照 + 三类断点扫描 + 澄清闭环，补齐到可供 story 设计 | 源文档同目录：`{功能名}-建模结果.html` + `{功能名}-规范功能实现设计.md`；收尾：不落盘审核报告 |

**自包含原则**：规则与模板全部归档在自身 references/assets/ 下（mermaid 验证脚本除外，全插件共用）。

**交互双模式（全局条款）**：本 skill 所有询问点**默认使用 ask-human 工具**；若任务开始时用户声明"以报告形式呈现"（或同类意思），则全程**不使用 ask-human**——所有待澄清/待审视内容以报告形式输出，等用户回复后继续。

核心思想：把文档翻译成多彩建模图（事件-角色-实体-描述的因果链路），逻辑断裂点在图上自然暴露；同时与代码事实对照、扫描表述质量问题；所有断点合并为一份清单统一澄清，产出可供下游 story 设计直接使用的建模 HTML 与规范功能实现设计。

五阶段，严格按序。

## 阶段 1：解读文档，完成多彩建模

1. 通读文档全文。
2. 按 [references/assets/color-modeling.md](references/assets/color-modeling.md) 提取四类元素：粉「事件」、黄「角色」、绿「实体」、蓝「描述」，按时序/因果连接成链路。不臆造文档中不存在的规则——不确定的标记「待确认」。

## 阶段 2：代码对照

需求涉及存量功能变更/与存量链路交互时，按 [references/assets/code-crosscheck-guide.md](references/assets/code-crosscheck-guide.md) 的读取范围纪律实读相关代码（只读与需求直接相关的文件，禁止全仓通读；纯全新功能且无存量交互的需求可跳过本阶段并注明理由）：

1. **现状一致性**：文档描述的"现状/既有行为"与代码事实是否一致；不一致计入断点清单，类别「文档与代码不符」。
2. **存在性核实**：文档提到的既有接口/规则/数据结构在代码中是否真实存在；提及但不存在的计入断点清单。
3. **注入点/复用点初步定位**：记录需求涉及的存量链路注入点与可复用点的真实文件路径与函数名（为下游 story 设计减负），写进审核报告「代码对照结论」节。

## 阶段 3：扫描 + 澄清

1. **表述质量扫描（必做）**：对照 [references/assets/requirement-quality-checklist.md](references/assets/requirement-quality-checklist.md) 逐句扫描 5 类——成分残缺/弱表述/术语失范/语义多解/带病放行。弱词黑名单：内置词表 ∪ 仓内 `docs/audit/weak-words.txt`（存在则追加）。
2. **逻辑断裂点扫描（必做）**：对照 [references/assets/gap-checklist.md](references/assets/gap-checklist.md) 断点 1-9。
3. **设计要素校验（含实现设计章节的文档必做，纯需求文档跳过）**：对照 gap-checklist.md 断点 10/11/12（时序图/验收用例/接口信息）。
4. 术语失范与断点 9 重叠的命中合并为一个断点；阶段 2 的代码对照断点并入。
5. 断点合并为一份清单，按严重程度排序（🔴 阻塞 → 🟠 风险 → 🟡 提示，分级规则见 gap-checklist.md）。**本阶段只检出与澄清，不输出任何 HTML/文档。**
6. **澄清（双模式）**：
   - **默认（ask-human 模式）**：一次抛出全部问题。每问含编号、原文引用、问题类别、2-4 个具体候选选项（**推荐项必须基于阶段 2 代码事实给出并标注理由**，不提供"其他"兜底）；语义多解类把 N 种理解全部列成选项。
   - **报告模式**（用户任务开始时声明"以报告形式呈现"）：不使用 ask-human——将全部待澄清内容（编号/原文引用/类别/候选选项/推荐做法及理由）输出为**待澄清报告**，等用户回复。
7. **核对回答，循环追问**：已裁定的记录「人工裁定+答复时间」；未答/含糊的进下一轮；裁定引入新疑点的重新扫描生成新断点；循环至无新问题。
8. **质量门禁**：全部断点有裁定才进阶段 4。用户跳过或明确带病继续的记「仍存疑」——表述质量类仍存疑项须在阶段 5 报告中单独列出"表述问题未清零，不建议进入编码"。

## 阶段 4：输出 + 验证

澄清闭环后**一次成型**产出两份文档（无初版/完善版之分）：

1. **建模 HTML**：复制 [references/assets/model-template.html](references/assets/model-template.html)，填入建模结果与全部断点卡片（已补齐：绿色边框+裁定内容；仍存疑：红色虚线醒目标记），保存到**源文档所在目录**，文件名 `{功能名}-建模结果.html`。可读性要求：四色图例置顶；主流程→分支/异常分层；每个元素卡片标注颜色类别、原文出处、确认状态（原文明确/人工补齐/仍存疑）。HTML 单文件无外部依赖，浏览器直接打开；配色遵循模板内置色板，不改语义。
2. **规范功能实现设计 md**：按 [references/assets/functional-design-template.md](references/assets/functional-design-template.md) 章节生成（功能概述/SR 设计/实现设计/接口设计/安全配置/功能规格/DFX/分配需求），保存到**源文档所在目录**，文件名 `{功能名}-规范功能实现设计.md`。内容 = 原文档 + 人工裁定回填 + 代码事实校正；可选章节无内容标"不涉及"裁剪；未覆盖内容标"待确认"，**禁止脑补**；仍存疑项显式标注。本文档是下游 spec-story-design 的权威输入。
3. **mermaid 验证**：产出物含 ```mermaid 代码块时，紧接着逐文件校验：

```bash
node <specgo插件目录>/scripts/mermaid-validate/validate-mermaid.mjs <产出文件...>
```

全部 VALID 才算产出完成；INVALID 按报错行号修复重验。首次使用先在脚本目录 `npm install`。语法红线见 `<specgo插件目录>/references/mermaid-guide.md`。

## 阶段 5：审核报告（不落盘，收尾必做）

对话内输出审核报告全文（不落盘；用户要求时可落盘）：

```
# 需求审核报告（{功能名}）
1. 审核结论总览：断点命中统计（表述质量/逻辑断点/设计要素/文档与代码不符 各 N 条，🔴🟠🟡 分级分布）
2. 断点清单逐条：编号 | 原文位置（章节+摘录） | 问题类别 | 候选答案 | 推荐做法及代码依据 | 用户裁定 | 状态（已补齐/仍存疑）
3. 代码对照结论：现状一致性核对结果、存在性核实结果、注入点/复用点初步定位（文件+函数）
4. 未闭环遗留项：仍存疑清单 + "不建议进入编码"显式警告（如有）
5. 产出文件清单：建模 HTML 路径、规范功能实现设计 md 路径、mermaid VALID 结论
6. 下一步建议：可进入 spec-story-design / 需先补齐的输入
```

- **默认**：报告末尾用 ask-human 询问用户是否审视通过；有意见则整改后重新呈现报告。
- **报告模式**：仅输出报告，不使用 ask-human。
- 明确提示：**建模 HTML 与规范功能实现设计未经用户确认前不得进入 story 设计阶段**。

## 输出规范

- 全程用中文输出建模内容、提问与报告；代码标识符与技术术语保留英文。

## 质量检查清单

- [ ] 多彩建模先于扫描完成，不确定项标「待确认」，无臆造
- [ ] 代码对照已执行（或纯全新功能已注明跳过理由）：现状一致性、存在性核实、注入点/复用点定位三项齐全
- [ ] 三类检出 + 代码对照断点全部执行，断点清单分级编号完整；阶段 3 未输出任何 HTML
- [ ] 澄清符合双模式：默认 ask-human 批量提问（一次抛出、每问 2-4 候选、推荐做法附代码依据、语义多解列全部理解）；报告模式输出待澄清报告；循环追问至无新问题
- [ ] 全部断点有裁定（或带病记「仍存疑」并在报告中单独列出"不建议进入编码"）
- [ ] HTML 与规范功能实现设计一次成型、落盘源文档同目录；HTML 图例置顶、元素标注出处与确认状态；定稿未覆盖内容标"待确认"，无脑补
- [ ] 含 mermaid 产出物全部通过 validate-mermaid.mjs 验证（VALID）
- [ ] 审核报告六节齐全，按双模式完成用户审视

## 关键约束

- **基于实证**：所有检出以实际读到的文档与代码证据为准；引用原文/代码必须真实摘录，禁止目测通过。
- **澄清门禁不可跳**：断点未裁定不进输出阶段，带病继续记「仍存疑」。
- **不修改被审文档正文**：补齐只落在建模 HTML 与规范功能实现设计 md。
- **代码对照有边界**：只核实文档涉及的存量事实，不做全仓分析（见 code-crosscheck-guide.md）。

## 与其它 skill 的关系

- **spec-story-design**：下游——规范功能实现设计 md 与建模 HTML 是 story 设计的输入。
- **mermaid 验证**：共用参考 `<specgo插件目录>/references/mermaid-guide.md`，验证脚本 `scripts/mermaid-validate/validate-mermaid.mjs`。
- **spec-analyze / spec-update**：资产分析与刷新侧，与本 skill 无调用关系。

## 参考文件索引

- [references/assets/color-modeling.md](references/assets/color-modeling.md) — 多彩建模方法论（阶段 1）
- [references/assets/code-crosscheck-guide.md](references/assets/code-crosscheck-guide.md) — 代码对照读取范围纪律（阶段 2）
- [references/assets/requirement-quality-checklist.md](references/assets/requirement-quality-checklist.md) — 需求表述质量清单 5 类 + 弱词黑名单（阶段 3）
- [references/assets/gap-checklist.md](references/assets/gap-checklist.md) — 逻辑断裂点清单 12 类 + 严重程度分级 + ask-human 规范（阶段 3）
- [references/assets/model-template.html](references/assets/model-template.html) — 建模 HTML 模板（阶段 4）
- [references/assets/functional-design-template.md](references/assets/functional-design-template.md) — 规范功能实现设计（功能设计）模板（阶段 4）
