#!/usr/bin/env node
// validate-mermaid-lite.mjs — 零依赖 mermaid 语法红线校验器（离线兜底）
//
// 定位：validate-mermaid.mjs 的降级方案。不做完整解析，只机检 SKILL.md
// 「语法红线」中可静态检查的部分 + 基本结构完整性。纯 Node 实现，无任何 npm 依赖。
//
// 用法：node validate-mermaid-lite.mjs <xxx.mmd|xxx.md> [...]
// 退出码：0 全部通过；1 存在违例；2 参数错误
// 同时作为模块被 validate-mermaid.mjs 在依赖安装失败时 import（export validateFiles / extractBlocks）

import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';

// 已知图类型关键字（首行匹配）
const TYPE_RE = /^\s*(flowchart|graph|sequenceDiagram|classDiagram|erDiagram|stateDiagram-v2|stateDiagram|gantt|gitGraph|mindmap|journey|pie|timeline|quadrantChart|xychart-beta|block-beta|packet-beta|architecture-beta)\b/;

// extractBlocks 从 markdown 文本提取 ```mermaid 代码块，返回 {source, startLine} 列表
export function extractBlocks(mdText) {
  const blocks = [];
  const re = /```mermaid[^\n]*\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(mdText)) !== null) {
    const startLine = mdText.slice(0, m.index).split('\n').length;
    blocks.push({ source: m[1], startLine });
  }
  return blocks;
}

// checkBlock 对单个图源做语法红线检查，返回 { type, violations: [{line, rule, detail}] }
// line 为图源内行号（1 起）
export function checkBlock(source) {
  const lines = source.split('\n');
  const violations = [];
  const firstMeaningful = lines.find(l => l.trim() !== '' && !l.trim().startsWith('%%'));
  const tm = firstMeaningful ? firstMeaningful.match(TYPE_RE) : null;
  const type = tm ? tm[1] : null;
  if (!type) {
    violations.push({ line: 1, rule: '基础', detail: `无法识别图类型（首行应为 flowchart/sequenceDiagram/classDiagram/erDiagram 等关键字）：${(firstMeaningful || '').trim().slice(0, 60)}` });
    return { type: 'unknown', violations };
  }
  const isFlow = type === 'flowchart' || type === 'graph';
  const isSeq = type === 'sequenceDiagram';

  let subgraphCount = 0;
  let endCount = 0;

  lines.forEach((line, idx) => {
    const ln = idx + 1;
    const t = line.trim();
    if (t === '' || t.startsWith('%%')) return;

    // 引号配对（基础结构）：一行内双引号数为奇数
    const quotes = (line.match(/"/g) || []).length;
    if (quotes % 2 === 1) {
      violations.push({ line: ln, rule: '基础', detail: `双引号未配对：${t.slice(0, 80)}` });
    }

    // 红线 #8：label 内 \n 字面量（应用 <br/>）
    if (/\\n/.test(line)) {
      violations.push({ line: ln, rule: '#8', detail: 'label 内出现 \\n 字面量，换行应使用 <br/>' });
    }

    if (isFlow) {
      // subgraph / end 配对计数
      if (/^subgraph\b/.test(t)) subgraphCount++;
      if (/^end\s*$/.test(t)) endCount++;

      // 红线 #5：subgraph 名称带空格未加引号（允许 subgraph id["标题"] 形式）
      const sm = t.match(/^subgraph\s+(.+)$/);
      if (sm) {
        const rest = sm[1];
        if (/\s/.test(rest) && !rest.startsWith('"') && !/^\w+\s*\[/.test(rest)) {
          violations.push({ line: ln, rule: '#5', detail: `subgraph 名称带空格必须加引号：${t.slice(0, 80)}` });
        }
      }

      // 红线 #1：flowchart 节点 label 未加引号且含特殊字符 _ / + ( ) ; : 空格
      // 匹配方括号 label（跳过已加引号、跳过 [[...]] 子程序形）
      const labelRe = /\[([^\[\]"]*)\]/g;
      let lm;
      while ((lm = labelRe.exec(line)) !== null) {
        const label = lm[1];
        if (/[_\/+();: ]/.test(label)) {
          violations.push({ line: ln, rule: '#1', detail: `节点 label 含特殊字符必须加双引号：[${label.slice(0, 60)}]` });
        }
        // 红线 #3：裸保留字作 label
        if (/^(end|graph|subgraph)$/.test(label.trim())) {
          violations.push({ line: ln, rule: '#3', detail: `label 不能用裸保留字：[${label.trim()}]` });
        }
      }
    }

    if (isSeq) {
      // 红线 #4：sequenceDiagram 中出现 flowchart 箭头 -->（-->> 合法，需排除）
      if (/(?<!-)-->(?!>)/.test(line)) {
        violations.push({ line: ln, rule: '#4', detail: `sequenceDiagram 中箭头混用 -->（应为 ->> 或 -->>）：${t.slice(0, 80)}` });
      }
      // 红线 #2：消息文本含分号（分号是语句终止符）
      const am = line.match(/(?:->>|-->>|-\)|--\)|->)\s*[^:]*:(.*)$/);
      if (am && /;/.test(am[1])) {
        violations.push({ line: ln, rule: '#2', detail: 'sequenceDiagram 消息文本禁止出现分号 ;' });
      }
    }
  });

  if (isFlow && subgraphCount !== endCount) {
    violations.push({ line: 1, rule: '基础', detail: `subgraph/end 不配对：subgraph ${subgraphCount} 个，end ${endCount} 个` });
  }

  return { type, violations };
}

// validateFiles 校验一批文件并打印结果，返回是否存在违例
export function validateFiles(files) {
  let hasInvalid = false;
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const blocks = file.endsWith('.md') ? extractBlocks(text) : [{ source: text, startLine: 1 }];
    if (blocks.length === 0) {
      console.log(`[SKIP] ${file}: 未找到 mermaid 代码块`);
      continue;
    }
    for (let i = 0; i < blocks.length; i++) {
      const { source, startLine } = blocks[i];
      const tag = file.endsWith('.md') ? `${file} 第${i + 1}个图(起始行${startLine})` : file;
      const { type, violations } = checkBlock(source);
      if (violations.length === 0) {
        console.log(`[VALID-LITE] ${tag} (${type}, syntax-only)`);
      } else {
        hasInvalid = true;
        const detail = violations
          .map(v => `行${startLine + v.line - 1} [红线${v.rule}] ${v.detail}`)
          .join('\n        ');
        console.log(`[INVALID-LITE] ${tag} (${type})\n        ${detail}`);
      }
    }
  }
  return hasInvalid;
}

// CLI 入口
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('用法: node validate-mermaid-lite.mjs <xxx.mmd|xxx.md> [...]');
    process.exit(2);
  }
  const hasInvalid = validateFiles(files);
  if (!hasInvalid) {
    console.log('[提示] 本次为语法级校验（syntax-only），非完整解析；联网环境请优先使用 validate-mermaid.mjs 真解析验证');
  }
  process.exit(hasInvalid ? 1 : 0);
}
