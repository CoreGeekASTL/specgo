---
name: spec-business-flow-analyze
description: 由用户主动触发并指定目标业务流程，从存量代码仓梳理该流程的完整实现链路（触发入口、主流程、分支与异常去向），按统一模板产出精简流程文档（概述 + 主流程图 + 补充说明），归档到 docs/architecture/business-flow/<流程名>.md 并维护 README 索引。与全仓盘点类 skill 的区别：本 skill 面向用户指定的单个业务流程做深度梳理，不做全仓扫描。触发场景包括"梳理 XX 业务流程"、"整理 XX 流程文档"、"XX 流程是怎么走的"、"把 XX 流程落成文档"等。
---

# 业务流程梳理：从存量代码到流程文档

针对**用户指定的单个业务流程**，从存量代码仓梳理出该流程的完整实现链路，按 references/business-flow-template.md 模板产出流程文档，归档到 `docs/architecture/business-flow/<流程名>.md`，并维护 `docs/architecture/business-flow/README.md` 索引。

与全仓盘点类 skill（spec-interface-analyze 等）的本质区别：本 skill **由用户主动触发并点名要梳理哪个流程**，证据来源是该流程实际经过的代码文件；不做全仓扫描、不自动触发。

**自包含原则**：本 skill 所需模板归档在自身 references/ 目录下，不依赖其它 skill 的文件。

## 工作流（顺序不可颠倒）

### 第 1 步：确认目标流程

1. 用户未指明流程名时，**先询问**要梳理哪个业务流程，不得自行猜测开干。
2. 明确流程边界：起点（什么触发）与终点（什么算走完）。用户未说明时给出你的推断并向用户确认。
3. 若用户给的流程名含糊（如"登录流程"但仓内有多种登录），列出候选让用户选择。

### 第 2 步：定位入口，顺链阅读代码

1. 从流程入口切入：HTTP 路由注册、消息订阅 handler、定时任务、IDL 契约实现等，定位入口文件与函数。
2. 顺调用链逐层阅读（controllers → service → dao → models，或本仓等价分层），只读与本流程直接相关的代码，**禁止全仓通读**。
3. 沿途记录：主流程步骤序列、分支条件与异常处理路径、读写哪些实体/缓存/文件、发生哪些外部调用（下游服务/消息队列）、关键代码位置（文件 + 函数名）。
4. 可借助存量资产加速：docs/business/key-class/（关键类定位）、docs/architecture/module-structure/（分层归属）、docs/technical/external-call/（下游契约）、docs/business/story/（既有功能文档）。资产缺失不影响本流程梳理，以实读代码为准。

### 第 3 步：按模板产出流程文档

按 references/business-flow-template.md 的精简结构产出（概述 + 主流程图 + 补充说明）：

1. **流程概述**：业务目标、触发者、参与角色，1~3 句。
2. **主流程**：一张 mermaid 图表达完整主链路——多方交互用时序图，单服务内多分支用流程图；分支与异常去向在图中用 alt/opt 或分支边表达。
3. **补充说明**：2~4 句，点明关键步骤的业务含义、关键分支/异常去向（重试/拒绝/逃生/补偿）、涉及的关键实体状态变更。

规则：

- 主流程图必须与代码实际调用链一致，禁止臆造步骤； participant/节点对应的代码位置（文件+函数）在补充说明中点出。
- 分支与异常路径必须覆盖代码中全部条件分支与错误处理。
- 涉及下游调用时，引用 docs/technical/external-call/ 存在的文档链接，无则注明"无出站调用文档，待核实"。
- 所有内容必须有代码事实依据；代码中读不出来、属于业务规约的内容标注"代码未体现，待确认"，禁止脑补。

### 第 4 步：归档与索引

- 输出到 `docs/architecture/business-flow/<流程名>.md`（流程名用英文短名 kebab-case，如 `device-login.md`）；目录不存在时新建。
- 更新 `docs/architecture/business-flow/README.md` 索引表（按 references/readme-template.md：元信息表 + 流程索引表）；README 不存在时按模板从头生成。
- 同名流程文档已存在时：按节增量更新，禁止整篇重写覆盖；文档头注明最近更新日期与触发来源。

### 第 5 步：验证 mermaid 图可渲染（收尾必做）

产出文档中含 ```mermaid 代码块（主流程时序图/流程图等），交付前必须运行 spec-mermaid-diagram skill 的本地验证脚本逐文件校验：

```bash
node <specgo插件目录>/skills/spec-mermaid-diagram/scripts/validate-mermaid.mjs <产出文件...>
```

- 全部 VALID 才算完成；INVALID 按报错行号定位修复后重验，禁止跳过。
- 首次使用需先在脚本目录执行 `npm install`（安装 mermaid + linkedom，node_modules 不入库）。

## 质量检查清单

- [ ] 目标流程已经用户明确指定或经候选确认，流程边界（起点/终点）已界定
- [ ] 只实读了与本流程直接相关的代码，未全仓通读
- [ ] 主流程图与代码实际调用链一致，无臆造步骤
- [ ] 分支与异常去向已在图中或补充说明中覆盖代码中全部条件分支与错误处理
- [ ] 补充说明中点出的代码位置均指向真实存在的文件与函数
- [ ] 代码未体现的业务规约已标注"代码未体现，待确认"，未脑补
- [ ] README.md 索引已同步，无死链
- [ ] mermaid 图已全部通过本地渲染验证（VALID）

## 参考文件索引

- references/business-flow-template.md — 流程文档模板（概述 + 主流程图 + 补充说明，第 3 步用）
- references/readme-template.md — README 索引模板（第 4 步用）
