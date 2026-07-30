#!/usr/bin/env node
// validate-mermaid.mjs — 本地校验 mermaid 图是否能被正确解析渲染
// 用法：
//   node validate-mermaid.mjs <文件...>
//   支持 .mmd 文件（整文件即图源）与 .md 文件（自动提取全部 ```mermaid 代码块）
// 退出码：0 全部 VALID；1 存在 INVALID；2 依赖缺失或参数错误

import { readFileSync } from 'fs';
import { basename } from 'path';

let mermaid;
try {
  const { parseHTML } = await import('linkedom');
  const { window } = parseHTML('<!DOCTYPE html><html><body></body></html>');
  global.window = window;
  global.document = window.document;
  Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
  mermaid = (await import('mermaid')).default;
} catch {
  console.error('[SETUP] 依赖缺失：请先执行 cd <skill目录>/scripts && npm install（安装 mermaid + linkedom）');
  process.exit(2);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('用法: node validate-mermaid.mjs <xxx.mmd|xxx.md> [...]');
  process.exit(2);
}

// extractBlocks 从 markdown 文本提取 ```mermaid 代码块，返回 {source, startLine} 列表
function extractBlocks(mdText) {
  const blocks = [];
  const re = /```mermaid[^\n]*\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(mdText)) !== null) {
    const startLine = mdText.slice(0, m.index).split('\n').length;
    blocks.push({ source: m[1], startLine });
  }
  return blocks;
}

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
    try {
      const r = await mermaid.parse(source);
      console.log(`[VALID] ${tag} (${r.diagramType})`);
    } catch (e) {
      hasInvalid = true;
      const msg = String(e.message || e).split('\n').slice(0, 8).join('\n        ');
      console.log(`[INVALID] ${tag}\n        ${msg}`);
    }
  }
}

process.exit(hasInvalid ? 1 : 0);
