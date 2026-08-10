/**
 * 自动扫描 skills/ 下全部 skill 目录（排除 . 开头；code-generate 编排排最后，其余按名字典序），
 * 从各 SKILL.md frontmatter 生成 bootstrap.md。
 * bootstrap.md 是两平台共用的注入源——opencode.js 和 hooks/session-start 都读它。
 * skill 内容变更后重跑：node .claude/plugins/specgo/scripts/generate-bootstrap.mjs
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(PLUGIN_ROOT, 'skills');
const OUTPUT = path.join(PLUGIN_ROOT, 'bootstrap.md');

const SPEC_SKILLS = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
  .map((e) => e.name)
  .sort((a, b) => {
    if (a === 'code-generate') return 1;
    if (b === 'code-generate') return -1;
    return a < b ? -1 : a > b ? 1 : 0;
  });

const parseFrontmatter = (content) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return {};
  const lines = match[1].split(/\r?\n/);
  const fm = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.startsWith(' ') || line.startsWith('\t')) { i++; continue; }
    const idx = line.indexOf(':');
    if (idx < 0) { i++; continue; }
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value === '>-' || value === '>' || value === '|-' || value === '|') {
      const folded = value.startsWith('>');
      const parts = [];
      i++;
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i].startsWith('\t'))) {
        parts.push(lines[i].replace(/^(  |\t)/, ''));
        i++;
      }
      value = folded ? parts.join(' ') : parts.join('\n');
    } else {
      value = value.replace(/^["']|["']$/g, '');
      i++;
    }
    fm[key] = value;
  }
  return fm;
};

const loadSpecIndex = () => {
  const entries = [];
  for (const name of SPEC_SKILLS) {
    const skillPath = path.join(SKILLS_DIR, name, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      entries.push({ name, description: `(skill 文件缺失: ${skillPath})` });
      continue;
    }
    const fm = parseFrontmatter(fs.readFileSync(skillPath, 'utf8'));
    entries.push({ name, description: fm.description || '(无 description)' });
  }
  return entries;
};

const buildBootstrap = (index) => {
  const indexMd = index.map((e, i) =>
    `### ${i + 1}. ${e.name}\n${e.description}\n`
  ).join('\n');

  return `<SPEC_GO_BOOTSTRAP>
# Specgo — 代码仓规格化分析 skill 体系

<EXTREMELY-IMPORTANT>
你拥有 specgo。在执行任何代码仓分析、需求/设计文档解读、对外接口盘点、出站调用/下游依赖盘点、目录结构梳理、框架使用模式梳理、story 设计、MR 资产刷新、mermaid 图验证、功能端到端开发任务之前——即使你认为只有 1% 的可能某个 spec skill 适用——你也必须先用 Skill 工具加载该 skill 全文并遵循其指引。这不可协商、不可选择、不可用"我先看看代码"为自己开脱。

spec skill 的 description 已包含触发关键词，请用下面的索引判断该调用哪个。
</EXTREMELY-IMPORTANT>

## Skill 索引（用 Skill 工具加载全文）

${indexMd}
## 推荐工作流（spec 全链路）

针对一个存量代码仓的完整规格化流程，按序串联；也可单独触发任意一步。

**四域资产治理（arch / biz / tech / qual + 横向 all，新体系）**

1. **资产骨架初始化（一次性）** → all-init：初始化 docs/{域}/{资产}/ 目录骨架（每类资产一个单独目录），一次性迁移既有产出，迁移映射清单先交用户确认
2. **结构摸底** → arch-structure-model-analyze：UML 包图 + 依赖矩阵 + 分层特征，落盘 docs/arch/structure-model/（仓级总览 structure-model.md + 每模块 structure-model-{module}.md）
3. **交互模型提取（默认全部流程，可指定单流程）** → arch-interaction-model-analyze：UML 时序图呈现模块间主业务流程与消息走向，只画主链路，落盘 docs/arch/interaction-model/interaction-model-{flow}.md
4. **对外接口盘点** → biz-interface-analyze：按功能域聚类，主文档 README + interface-{feature}.md，落盘 docs/biz/interface/
5. **业务规则梳理** → biz-rules-analyze：按需求类整理"条件 → 动作 + 依据"规则条目，rules-{feature}.md，落盘 docs/biz/rules/
6. **对象模型** → biz-object-model-analyze：实体/值对象/聚合/领域服务/领域事件（UML 类图），object-model-{aggregate}.md，落盘 docs/biz/object-model/
7. **数据模型** → biz-data-model-analyze：持久态表结构/缓存数据结构/字段关系与数据生命周期（UML-ER），data-model-{entity}.md，落盘 docs/biz/data-model/
8. **领域词典** → biz-lexicon-analyze：业务与代码共用的受控词汇集（术语释义 + 语境边界 + 代码命名映射），主文档 lexicon.md + 每功能域 1 篇 lexicon-{feature}.md，落盘 docs/biz/lexicon/
9. **框架使用现状** → tech-usage-analyze：基础框架清单与使用方式盘点（纯现状提取），usage-{framework}.md 每框架一篇，落盘 docs/tech/usage/
10. **通信规范** → tech-comm-guidelines-analyze：RPC/HTTP/MQ 跨服务调用指导（双模式：现状提取 + 差距分析），comm-guidelines-{service}.md 每外部服务一篇
11. **并发规范** → tech-concurrency-guidelines-analyze：线程池选型/隔离/拒绝策略，concurrency-guidelines-{pool}.md 每线程池一篇
12. **数据访问规范** → tech-data-access-guidelines-analyze：Redis/DB 等中间件访问指导，data-access-guidelines-{mw}.md 每中间件一篇
13. **韧性规范** → tech-resilience-guidelines-analyze：超时/重试/熔断/异常处理，resilience-guidelines.md 仓级单篇
14. **基础规范** → tech-foundation-guidelines-analyze：日志/配置/告警等编码指导，foundation-guidelines.md 仓级单篇
15. **编码规范（门禁）** → qual-code-standards-analyze：命名/注释/函数长度/圈复杂度/安全编码红线/禁止项清单，code-standards.md + report/ 门禁差距报告
16. **DT 规范（门禁）** → qual-dt-guidelines-analyze：测试金字塔与覆盖基线、用例设计、覆盖率门禁，dt-guidelines.md + report/
17. **分支与变更规范** → qual-branch-guidelines-analyze：分支模型、commit/MR 规范、评审要求，branch-guidelines.md
18. **索引生成** → all-index：各域 README + docs/README.md 总索引 + 服务依赖全景图（Mermaid）
19. **资产刷新（git 变更驱动）** → all-update：基于 git diff 识别变更对 docs/ 资产的影响，按最新要素定义增量刷新受影响文档，刷新清单人工确认后定稿
20. **一键全量资产分析（编排入口）** → all-analyze：子代理并行派发全部 16 个 analyze skill（词典第二波复用接口功能域口径），一次性建齐 docs/ 资产，all-index 收口
21. **文档质量审核与评估** → spec-audit：场景 1 需求/功能设计审核（多彩建模 + 断点扫描 + ask-human 澄清 + HTML）；场景 2 docs/ 资产质量评估（A 轨 story 类澄清未清零不出分；B 轨 17 类资产要素 Linter 零容忍+专项维度 0-5 分），评分分级，报告归档 docs/report/（README.MD 整体评估 + 每篇一个打分报告，支持单篇更新/通篇全量）

**需求到交付（旧体系保留链路）**

22. **mermaid 图验证** → spec-mermaid-diagram：含图产出物必须本地校验全部 VALID 后交付
23. **需求到 story 设计** → spec-story-design：产出 docs/storys/{功能名}-story.md（八类核心要素组织，标注新增/变更/不涉及）+ develop-task
24. **全链路编排（端到端主流程，推荐入口）** → code-generate：资产检查/录入 → 需求审核（spec-audit 场景 1）→ story 设计 → 代码实现与测试 → 资产刷新（all-update），主代理编排与用户确认、各步骤派子代理执行

## 红线（这些想法意味着你正在跳过 skill）

| 想法 | 现实 |
|------|------|
| "我先扫一眼目录" | arch-structure-model-analyze 定义了"怎么扫"，先加载它 |
| "列一下接口就行" | biz-interface-analyze 定义了接口盘点格式，先加载它 |
| "看看调了哪些下游服务" | tech-comm-guidelines-analyze 定义了跨服务调用规范与盘点格式，先加载它 |
| "业务规则我边读边总结" | biz-rules-analyze 定义了规则条目格式（条件 → 动作 + 依据），先加载它 |
| "表结构/缓存结构我随便列列" | biz-data-model-analyze 定义了数据模型格式，先加载它 |
| "框架用法我直接写" | tech-usage-analyze 定义了框架使用现状盘点格式，先加载它 |
| "线程池这么用没问题" | tech-concurrency-guidelines-analyze 定义了并发规范差距分析，先加载它 |
| "这需求文档我读读就好" | spec-audit 场景 1 用来查表述质量与逻辑断点，先加载它 |
| "给我讲讲 XX 流程怎么走的" | arch-interaction-model-analyze 定义了交互模型（时序图）提取格式，先加载它 |
| "这 mermaid 图我直接画/看着没问题" | spec-mermaid-diagram 定义了语法红线与本地验证流程，先加载它 |
| "这功能我直接写 story" | spec-story-design 定义了 story 模板，先加载它 |
| "代码写完直接提交" | qual-code-standards-analyze 定义了编码红线与门禁检查，先加载它 |
| "MR 合了，看看文档要不要改" | all-update 定义了 git 变更驱动的资产刷新流程，先加载它 |
| "把分析 skill 挨个手动跑一遍" | all-analyze 定义了子代理并行的一键全量分析编排，先加载它 |
| "这批文档质量怎么样" | spec-audit 定义了分轨质量评估与评分分级，先加载它 |
| "从需求到交付，一条龙做了" | code-generate 定义了五步全链路编排与子代理分工，先加载它 |
| "这个 skill 太重，我快速做" | 如果 skill 存在，就必须用 |
| "我记得这个 skill 的内容" | skill 会演进，每次都要重新加载当前版本 |

## 与项目其他 skill 的关系

本项目 .claude/skills/ 下还有 se-harness、code-generation-quality-loop 等非 spec skill。spec- 系列覆盖"代码仓规格化分析 → story 设计 → 按文档生成代码"链路；code-generation-quality-loop 提供 CodeCheck 全量规则扫描与 DT/E2E 测试闭环，可在 specgo 生成代码后串联。

## 优先级

1. 用户的显式指令（AGENTS.md、直接请求）——最高优先级
2. specgo 的 spec skill——覆盖默认行为
3. 默认 system prompt——最低优先级

如果 AGENTS.md 说"不用 spec 流程"而 specgo 说"必须用"，遵循用户指令。用户始终掌控。
</SPEC_GO_BOOTSTRAP>`;
};

const bootstrap = buildBootstrap(loadSpecIndex());
fs.writeFileSync(OUTPUT, bootstrap, 'utf8');
console.log(`已生成: ${OUTPUT}`);
console.log(`长度: ${bootstrap.length} 字符`);
