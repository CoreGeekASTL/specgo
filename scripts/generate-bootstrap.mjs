/**
 * 从 skills/ 下 10 个 spec skill 的 frontmatter 生成 bootstrap.md。
 * bootstrap.md 是两平台共用的注入源——opencode.js 和 hooks/session-start 都读它。
 * skill 内容变更后重跑：bun .claude/plugins/specgo/scripts/generate-bootstrap.mjs
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(PLUGIN_ROOT, 'skills');
const OUTPUT = path.join(PLUGIN_ROOT, 'bootstrap.md');

const SPEC_SKILLS = [
  'spec-structure-analyze',
  'spec-interface-analyze',
  'spec-external-call-analyze',
  'spec-feature-analyze',
  'spec-key-class-analyze',
  'spec-framework-usage-analyze',
  'spec-logic-audit',
  'spec-story-design',
  'spec-asset-refresh',
  'specgo',
];

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
你拥有 specgo。在执行任何代码仓分析、需求/设计文档解读、对外接口盘点、出站调用/下游依赖盘点、目录结构梳理、框架使用模式梳理、story 设计、MR 资产刷新、按 story 设计文档生成代码任务之前——即使你认为只有 1% 的可能某个 spec skill 适用——你也必须先用 Skill 工具加载该 skill 全文并遵循其指引。这不可协商、不可选择、不可用"我先看看代码"为自己开脱。

spec skill 的 description 已包含触发关键词，请用下面的索引判断该调用哪个。
</EXTREMELY-IMPORTANT>

## Skill 索引（用 Skill 工具加载全文）

${indexMd}
## 推荐工作流（spec 全链路）

针对一个存量代码仓的完整规格化流程，按序串联；也可单独触发任意一步。

1. **结构摸底** → spec-structure-analyze：mermaid 依赖图 + 模块说明表
2. **对外接口盘点** → spec-interface-analyze：主文档 README + 功能域子文档
3. **出站调用盘点** → spec-external-call-analyze：README 索引 + external-call-*.md（按下游服务归类）
4. **接口归纳为功能域** → spec-feature-analyze：feature-*.md（L1 多彩建模 + L2 结构地图 + L3 AI 编码指南 + 外部文档引用）
5. **关键类剖析** → spec-key-class-analyze：docs/key-class/README.md 单文件单表（类名/类的职责，职责 38 字内）
6. **框架使用模式** → spec-framework-usage-analyze：每框架一篇使用指导，归档 docs/framework-usage/
7. **需求文档逻辑审核** → spec-logic-audit：多彩建模 + HTML 可视化 + ask-human 补逻辑断点
8. **需求到 story 设计** → spec-story-design：产出与 docs/story/ 同构的新功能设计文档
9. **MR 后资产刷新** → spec-asset-refresh：基于 MR diff 识别五类资产变化，增量刷新 + 人工审核
10. **文档到代码** → specgo：只读 story 设计文档 + 关联 develop-task 任务文档 + 被引用文档，直接生成代码

## 红线（这些想法意味着你正在跳过 skill）

| 想法 | 现实 |
|------|------|
| "我先扫一眼目录" | spec-structure-analyze 定义了"怎么扫"，先加载它 |
| "列一下接口就行" | spec-interface-analyze 定义了接口盘点格式，先加载它 |
| "看看调了哪些下游服务" | spec-external-call-analyze 定义了出站调用盘点格式，先加载它 |
| "核心类我挑几个讲讲" | spec-key-class-analyze 定义了关键类识别与清单格式，先加载它 |
| "这需求文档我读读就好" | spec-logic-audit 用来查逻辑断点，先加载它 |
| "这功能我直接写 story" | spec-story-design 定义了 story 模板，先加载它 |
| "MR 合了，看看文档要不要改" | spec-asset-refresh 定义了 MR 驱动的资产刷新流程，先加载它 |
| "设计文档有了，我直接写代码" | specgo 定义了按 story + develop-task 文档生成代码的加载与编码纪律，先加载它 |
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
