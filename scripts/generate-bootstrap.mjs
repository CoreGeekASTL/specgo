/**
 * 自动扫描 skills/ 下全部主 skill 目录（排除 . 开头，按名字典序），
 * 从各 SKILL.md frontmatter 生成 bootstrap.md。
 * spec-analyze 下的 references/subflows/*.md 是子流程（不是独立 skill），不进索引，
 * 其触发关键词已汇总进主 skill 的 description。
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
  .sort();

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
你拥有 specgo。在执行任何代码仓分析、需求/设计文档解读与审核、对外接口盘点、出站调用/下游依赖盘点、目录结构梳理、框架使用模式梳理、story 设计、代码生成、总结报告、MR 资产刷新、mermaid 图验证任务之前——即使你认为只有 1% 的可能某个 spec skill 适用——你也必须先用 Skill 工具加载对应 skill 全文并遵循其指引。这不可协商、不可选择、不可用"我先看看代码"为自己开脱。

体系结构：7 个独立 skill（6 个主 skill + mermaid-validate 横切工具，下方索引）+ 17 个子流程（spec-analyze 内 references/subflows/*.md，由 spec-analyze 路由表加载，也可用同名 / 命令直接触发）。各 skill 独立执行、按需串联，无编排层。skill 的 description 已汇总触发关键词，请用下面的索引判断该加载哪个 skill；命中 spec-analyze 子流程场景时加载 spec-analyze 并按其「子流程路由表」执行具体子流程。

**交互双模式（全部 skill 通用）**：各 skill 内的 ask-human 询问点默认使用 ask-human 工具；若任务开始时用户声明"以报告形式呈现"（或同类意思），则全程不使用 ask-human——所有待澄清/待审视内容以报告形式输出，等用户回复后继续。
</EXTREMELY-IMPORTANT>

## Skill 索引（用 Skill 工具加载全文）

${indexMd}
## 推荐工作流（spec 全链路）

针对一个存量代码仓的完整规格化流程，按序串联；也可单独触发任意一步。子流程均可用同名 / 命令直接触发（如 /arch-structure-model-analyze），或由 spec-analyze 路由加载；独立 skill 直接加载。

**四域资产治理（arch / biz / tech / qual）**

1. **结构摸底** → arch-structure-model-analyze（spec-analyze 子流程，/arch-structure-model-analyze）：UML 包图 + 依赖矩阵 + 分层特征，落盘 docs/0-arch/structure-model/（仓级总览 README.md + 每模块 structure-model-{module}.md）
2. **交互模型提取（默认全部流程，可指定单流程）** → arch-interaction-model-analyze（spec-analyze 子流程，/arch-interaction-model-analyze）：UML 时序图呈现模块间主业务流程与消息走向，只画主链路，落盘 docs/0-arch/interaction-model/（README.md 流程导航 + interaction-model-{flow}.md）
3. **对外接口盘点** → biz-interface-analyze（spec-analyze 子流程，/biz-interface-analyze）：按功能域聚类，主文档 README + interface-{feature}.md，落盘 docs/0-biz/interface/
4. **业务规则梳理** → biz-rules-analyze（spec-analyze 子流程，/biz-rules-analyze）：按需求类整理"条件 → 动作 + 依据"规则条目，README.md 功能域导航 + rules-{feature}.md，落盘 docs/0-biz/rules/
5. **对象模型** → biz-object-model-analyze（spec-analyze 子流程，/biz-object-model-analyze）：实体/值对象/聚合/领域服务/领域事件（UML 类图），README.md 聚合导航 + object-model-{aggregate}.md，落盘 docs/0-biz/object-model/
6. **数据模型** → biz-data-model-analyze（spec-analyze 子流程，/biz-data-model-analyze）：持久态表结构/缓存数据结构/字段关系与数据生命周期（UML-ER），README.md 实体导航 + data-model-{entity}.md，落盘 docs/0-biz/data-model/
7. **领域词典** → biz-lexicon-analyze（spec-analyze 子流程，/biz-lexicon-analyze）：业务与代码共用的受控词汇集（术语释义 + 语境边界 + 代码命名映射），主文档 README.md + 每功能域 1 篇 lexicon-{feature}.md，落盘 docs/0-biz/lexicon/
8. **框架使用指导** → tech-framework-guidelines-analyze（spec-analyze 子流程，/tech-framework-guidelines-analyze）：基础框架清单与使用方式盘点（纯现状提取），framework-guidelines-{framework}.md 每框架一篇，落盘 docs/0-tech/framework-guidelines/
9. **通信规范** → tech-external-call-guidelines-analyze（spec-analyze 子流程，/tech-external-call-guidelines-analyze）：RPC/HTTP/MQ 跨服务调用指导（双模式：现状提取 + 差距分析），external-call-guidelines-{service}.md 每外部服务一篇
10. **并发规范** → tech-concurrency-guidelines-analyze（spec-analyze 子流程，/tech-concurrency-guidelines-analyze）：线程池/锁/channel 等并发原语实例的用途定位、使用说明与代码案例（章节上限三节），README.md 实例导航 + concurrency-guidelines-{pool}.md 每实例一篇
11. **数据访问规范** → tech-data-access-guidelines-analyze（spec-analyze 子流程，/tech-data-access-guidelines-analyze）：Redis/DB 等中间件访问指导，README.md 中间件导航 + data-access-guidelines-{mw}.md 每中间件一篇
12. **韧性规范** → tech-resilience-guidelines-analyze（spec-analyze 子流程，/tech-resilience-guidelines-analyze）：超时/重试/熔断/异常处理的使用说明与代码案例，README 索引 + resilience-guidelines-{dimension}.md 每维度一篇
13. **基础规范** → tech-basic-mechanism-guidelines-analyze（spec-analyze 子流程，/tech-basic-mechanism-guidelines-analyze）：日志/配置/告警等基础机制的函数调用说明与使用代码案例，README 索引 + basic-mechanism-guidelines-{dimension}.md 每维度一篇
14. **编码规范（门禁）** → qual-code-standards-analyze（spec-analyze 子流程，/qual-code-standards-analyze）：命名/注释/函数长度/圈复杂度/安全编码红线/禁止项清单，code-standards.md + report/ 门禁差距报告
15. **DT 规范（门禁）** → qual-dt-guidelines-analyze（spec-analyze 子流程，/qual-dt-guidelines-analyze）：测试金字塔与覆盖基线、用例设计、覆盖率门禁，dt-guidelines.md + report/
16. **分支与变更规范** → qual-branch-guidelines-analyze（spec-analyze 子流程，/qual-branch-guidelines-analyze）：分支模型、commit/MR 规范、评审要求，branch-guidelines.md
17. **资产质量审核** → asset-audit（spec-analyze 子流程，/asset-audit）：docs/ 四类资产两维度审核（表达质量 + 代码一致性），E/C 打分三档（已基线/待修订/重写），报告归档 docs/report/（README.md 总览 + 每篇一个审核报告，支持单篇/增量/总览/全量四种模式）
18. **资产刷新（git 变更驱动）** → spec-update（独立 skill，/spec-update）：基于 git diff 识别变更对 docs/ 资产的影响，按最新要素定义增量刷新受影响文档，刷新清单人工确认后定稿
19. **一键全量资产分析（编排入口）** → spec-analyze 全量模式：子代理并行派发全部 16 个分析子流程（词典第二波复用接口功能域口径），一次性建齐 docs/ 资产

**需求到交付（4 个独立 skill，按需顺序串联，无编排层）**

20. **需求审核** → spec-requirement-audit（独立 skill，/spec-requirement-audit）：看文档 + 看代码（代码对照：文档描述与代码事实比对、注入点/复用点初步定位），多彩建模 + 断点扫描 + 澄清闭环，产出建模 HTML + 规范功能实现设计 md（源文档同目录），收尾输出不落盘审核报告
21. **story 设计** → spec-story-design（独立 skill，/spec-story-design）：产出 docs/1-storys/{功能名}/ 目录（{功能名}-story.md 八类核心要素组织、标注新增/变更/不涉及 + {功能名}-develop-task.md），收尾输出不落盘设计报告
22. **代码生成** → spec-code-generate（独立 skill，/spec-code-generate）：依据 story/develop-task 落地零 TODO 完整代码，子代理实现、主代理执行单测/集成测试/验证命令
23. **总结报告** → spec-report（独立 skill）：代码生成收口后产出三节总结报告（代码生成的准确性——对照 develop-task 逐任务核对 + 测试实跑证据 / 资产使用情况 / 用户反馈——询问用户准确率与主要问题，不回答则不写入），落盘 docs/1-storys/{功能名}/{YYYYMMDD}-report.md
24. **mermaid 图验证** → mermaid-validate（独立 skill）：含图产出物必须本地校验全部 VALID 后交付

## 红线（这些想法意味着你正在跳过 skill）

| 想法 | 现实 |
|------|------|
| "我先扫一眼目录" | arch-structure-model-analyze 子流程定义了"怎么扫"，先加载 spec-analyze 路由到它 |
| "列一下接口就行" | biz-interface-analyze 子流程定义了接口盘点格式，先加载 spec-analyze 路由到它 |
| "看看调了哪些下游服务" | tech-external-call-guidelines-analyze 子流程定义了跨服务调用规范与盘点格式，先加载 spec-analyze 路由到它 |
| "业务规则我边读边总结" | biz-rules-analyze 子流程定义了规则条目格式（条件 → 动作 + 依据），先加载 spec-analyze 路由到它 |
| "表结构/缓存结构我随便列列" | biz-data-model-analyze 子流程定义了数据模型格式，先加载 spec-analyze 路由到它 |
| "框架用法我直接写" | tech-framework-guidelines-analyze 子流程定义了框架使用指导盘点格式，先加载 spec-analyze 路由到它 |
| "线程池这么用没问题" | tech-concurrency-guidelines-analyze 子流程定义了并发实例的用途定位与使用案例提取格式，先加载 spec-analyze 路由到它 |
| "这需求文档我读读就好" | spec-requirement-audit 用来查表述质量/逻辑断点并做代码对照，先加载它 |
| "给我讲讲 XX 流程怎么走的" | arch-interaction-model-analyze 子流程定义了交互模型（时序图）提取格式，先加载 spec-analyze 路由到它 |
| "这 mermaid 图我直接画/看着没问题" | mermaid-validate 定义了语法红线与本地验证流程，先加载它 |
| "这功能我直接写 story" | spec-story-design 定义了 story 模板，先加载它 |
| "代码写完直接提交" | qual-code-standards-analyze 子流程定义了编码红线与门禁检查，先加载 spec-analyze 路由到它 |
| "MR 合了，看看文档要不要改" | spec-update 定义了 git 变更驱动的资产刷新流程，先加载它 |
| "把分析子流程挨个手动跑一遍" | spec-analyze 全量模式定义了子代理并行的一键全量分析编排，先加载它 |
| "这批文档质量怎么样" | asset-audit 子流程定义了资产两维度质量审核与打分三档，先加载 spec-analyze 路由到它 |
| "代码跑完测试过了直接交付" | spec-report 定义了收口总结报告的取证纪律（任务核对/资产使用/用户反馈），先加载它 |
| "这个 skill 太重，我快速做" | 如果子流程存在，就必须用 |
| "我记得这个子流程的内容" | 子流程会演进，每次都要重新读取当前版本 |
| "子流程用 Skill 工具加载" | 子流程不是独立 skill——由主 skill 路由读取文件，或用同名 / 命令触发 |

## 与项目其他 skill 的关系

本项目 .claude/skills/ 下还有 se-harness、code-generation-quality-loop 等非 spec skill。spec- 系列覆盖"代码仓规格化分析 → 需求审核 → story 设计 → 按文档生成代码 → 收口总结报告"链路；code-generation-quality-loop 提供 CodeCheck 全量规则扫描与 DT/E2E 测试闭环，可在 spec-code-generate 生成代码后串联。

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
