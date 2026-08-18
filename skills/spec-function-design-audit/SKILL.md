---
name: spec-function-design-audit
description: >-
  需求/功能设计审核 skill——基于多彩建模方法论审核 Spec/需求/功能设计文档的完备性（表述质量扫描：句子成分残缺/弱表述/术语失范/语义多解 + 业务逻辑断裂点 + 设计要素：时序图/验收用例/接口信息），三类问题一次扫描、统一 ask-human 批量澄清补齐，建模结果以 HTML 可视化呈现，审核完成后可选输出规范功能设计 md。当用户提到"spec-function-design-audit"、"审核 spec 业务逻辑完备性"、"多彩建模"、"检查需求逻辑断点"、"需求表述质量检查"、"需求歧义扫描"、"建模结果生成 HTML 并找人确认"、"功能设计文档校验"、"需求审核"时使用。docs/ 四域资产文档的质量审核归 spec-asset-audit。
---

# 需求/功能设计审核（spec-function-design-audit）

| 输入 | 干什么 | 产出 |
| --- | --- | --- |
| 一篇 Spec/需求/功能设计文档 | 多彩建模 + 三类断点扫描 + ask-human 批量澄清，补齐到可供编码 | 源文档同目录：`{功能名}-建模结果.html`；可选 `{功能名}-功能设计.md` |

**自包含原则**：规则与模板全部归档在自身 references/ 与 assets/ 下（mermaid 验证脚本除外，全插件共用）。

核心思想：把文档翻译成多彩建模图（事件-角色-实体-描述的因果链路），逻辑断裂点在图上自然暴露；同时扫描表述质量问题；三类问题合并为一份断点清单，统一 ask-human 澄清，产出可供编码人员审核的 HTML。

七阶段，严格按序。

## 阶段 1：解读文档，完成多彩建模

1. 通读文档全文。
2. 按 [references/color-modeling.md](references/color-modeling.md) 提取四类元素：粉「事件」、黄「角色」、绿「实体」、蓝「描述」，按时序/因果连接成链路。不臆造文档中不存在的规则——不确定的标记「待确认」。

## 阶段 2：全面扫描，生成初版 HTML

1. **表述质量扫描（必做）**：对照 [references/requirement-quality-checklist.md](references/requirement-quality-checklist.md) 逐句扫描 5 类——成分残缺/弱表述/术语失范/语义多解/带病放行。弱词黑名单：内置词表 ∪ 仓内 `docs/audit/weak-words.txt`（存在则追加）。
2. **逻辑断裂点扫描（必做）**：对照 [references/gap-checklist.md](references/gap-checklist.md) 断点 1-9。
3. **设计要素校验（含实现设计章节的文档必做，纯需求文档跳过）**：对照 gap-checklist.md 断点 10/11/12（时序图/验收用例/接口信息）。
4. 术语失范与断点 9 重叠的命中合并为一个断点。
5. 复制 [assets/model-template.html](assets/model-template.html)，填入建模结果与全部断点卡片（红色虚线高亮），保存到**源文档所在目录**，文件名 `{功能名}-建模结果.html`。

本阶段只检出、不提问。

## 阶段 3：统一 ask-human 澄清（批量提问循环 + 质量门禁）

1. 断点合并为一份清单，按严重程度排序（🔴 阻塞 → 🟠 风险 → 🟡 提示，分级规则见 gap-checklist.md）。
2. **批量提问**：一次抛出全部问题。每问含编号、原文引用、问题类别、2-4 个具体候选选项（推荐项标注，不提供"其他"兜底）；语义多解类把 N 种理解全部列成选项。
3. **核对回答，循环追问**：已裁定的记录「人工裁定+答复时间」；未答/含糊的进下一轮；裁定引入新疑点的重新扫描生成新断点；循环至无新问题。
4. **质量门禁**：全部断点有裁定才进阶段 4。用户跳过或明确带病继续的记「仍存疑」保留红色标记——表述质量类仍存疑项须在阶段 5 单独列出"表述问题未清零，不建议进入编码"。

## 阶段 4：完善 HTML

1. 裁定回填，断点卡片转「已补齐」（绿色边框+裁定内容）；仍存疑项保留醒目标记。
2. 可读性：四色图例置顶；主流程→分支/异常分层；每个元素卡片标注颜色类别、原文出处、确认状态（原文明确/人工补齐/仍存疑）。

## 阶段 5：提醒编码人员审核

最终回复中输出「编码人员审核提醒」：HTML 位置与查看方式、审核要点（已补齐裁定是否符合真实业务、仍存疑项、建模未覆盖的编码细节），并明确提示 **HTML 未经编码人员确认前不得进入编码阶段**。

## 阶段 6：可选输出规范功能设计 md（必须先询问用户）

**必须询问用户**是否按 [references/functional-design-template.md](references/functional-design-template.md) 输出功能设计 md。确认后：

1. 按模板章节生成（功能概述/SR 设计/实现设计/接口设计/安全配置/功能规格/DFX/分配需求）。
2. 内容来源 = 原文档 + 人工裁定；可选章节无内容标"不涉及"裁剪；未覆盖内容标"待确认"，**禁止脑补**。
3. 输出到**源文档所在目录**，文件名 `{功能名}-功能设计.md`。

## 阶段 7：验证产出物中的 mermaid 图（收尾必做）

产出物含 ```mermaid 代码块时，交付前必须逐文件校验：

```bash
node <specgo插件目录>/skills/mermaid-validate/scripts/validate-mermaid.mjs <产出文件...>
```

全部 VALID 才算完成；INVALID 按报错行号修复重验。首次使用先在脚本目录 `npm install`。语法红线见 mermaid-validate skill。

## 输出规范

- HTML 单文件无外部依赖，浏览器直接打开；配色遵循模板内置色板，不改语义。
- 全程用中文输出建模内容、提问与报告；代码标识符与技术术语保留英文。

## 质量检查清单

- [ ] 三类检出全部执行，断点清单分级编号完整
- [ ] ask-human 批量澄清：一次抛出、每问 2-4 个候选、语义多解列全部理解；循环追问至无新问题
- [ ] 全部断点有裁定（或带病记「仍存疑」并单独列出"不建议进入编码"）
- [ ] HTML 落盘源文档同目录，图例置顶、元素标注出处与确认状态
- [ ] 功能设计 md 经用户明确确认才输出；未覆盖内容标"待确认"，无脑补
- [ ] 含 mermaid 产出物全部通过 validate-mermaid.mjs 验证（VALID）

## 关键约束

- **基于实证**：所有检出以实际读到的文档证据为准；引用原文必须真实摘录，禁止目测通过。
- **澄清门禁不可跳**：断点未裁定不进下一阶段，带病继续记「仍存疑」。
- **不修改被审文档正文**：补齐只落在建模 HTML 与可选功能设计 md。

## 与其它 skill 的关系

- **spec-asset-audit**：姊妹 skill——本 skill 审需求/功能设计文档（编码前），spec-asset-audit 审 docs/ 四域资产文档质量（资产治理侧）。
- **mermaid-validate**：mermaid 校验脚本提供方。
- **specgo**：全链路编排第 2 步（需求审核）调用本 skill。

## 参考文件索引

- [references/color-modeling.md](references/color-modeling.md) — 多彩建模方法论（阶段 1）
- [references/requirement-quality-checklist.md](references/requirement-quality-checklist.md) — 需求表述质量清单 5 类 + 弱词黑名单（阶段 2）
- [references/gap-checklist.md](references/gap-checklist.md) — 逻辑断裂点清单 12 类 + 严重程度分级 + ask-human 规范（阶段 2/3）
- [assets/model-template.html](assets/model-template.html) — 建模 HTML 模板（阶段 2/4）
- [references/functional-design-template.md](references/functional-design-template.md) — 功能设计模板（阶段 6）
