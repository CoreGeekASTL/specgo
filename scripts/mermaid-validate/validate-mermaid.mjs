#!/usr/bin/env node
// validate-mermaid.mjs — 本地校验 mermaid 图是否能被正确解析渲染
//
// 三级逻辑（agent 只需跑这一条命令，装依赖与降级全自动）：
//   1. 检测 scripts/node_modules 下 mermaid + linkedom 可用 → 官方解析器真解析（parsed）
//   2. 依赖缺失 → npm install，30 秒硬超时，超时/失败不重试
//   3. 仍不可用 → 降级 validate-mermaid-lite.mjs 语法红线校验（syntax-only，零依赖）
//
// 用法：node validate-mermaid.mjs <xxx.mmd|xxx.md> [...]
// 退出码：0 全部 VALID；1 存在 INVALID；2 参数错误

import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { extractBlocks, validateFiles as validateFilesLite } from './validate-mermaid-lite.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('用法: node validate-mermaid.mjs <xxx.mmd|xxx.md> [...]');
  process.exit(2);
}

// 尝试加载 mermaid + linkedom（依赖已安装时成功）
async function loadMermaid() {
  try {
    const { parseHTML } = await import('linkedom');
    const { window } = parseHTML('<!DOCTYPE html><html><body></body></html>');
    global.window = window;
    global.document = window.document;
    Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
    return (await import('mermaid')).default;
  } catch {
    return null;
  }
}

// npm install，30 秒硬超时，超时/失败均不重试
function tryInstall() {
  return new Promise((resolve) => {
    console.error('[SETUP] 依赖缺失，尝试 npm install（30 秒超时，失败不重试）...');
    let child;
    try {
      child = spawn('npm', ['install', '--no-audit', '--no-fund'], {
        cwd: __dirname,
        stdio: 'inherit',
        timeout: 30000,
      });
    } catch {
      resolve(false);
      return;
    }
    child.on('error', () => resolve(false));
    child.on('close', (code, signal) => {
      if (signal === 'SIGTERM') console.error('[SETUP] npm install 超过 30 秒，已终止');
      resolve(code === 0);
    });
  });
}

let mermaid = await loadMermaid();
if (!mermaid && await tryInstall()) {
  mermaid = await loadMermaid();
}

if (!mermaid) {
  // 降级：零依赖语法红线校验
  console.error('[FALLBACK] 依赖不可用，降级为语法红线校验（syntax-only）');
  const hasInvalid = validateFilesLite(files);
  if (!hasInvalid) {
    console.log('[提示] 本次为语法级校验（syntax-only），非完整解析；允许交付但须在交付说明中标注，联网后请执行 cd <skill目录>/scripts && npm install 并重新验证');
  }
  process.exit(hasInvalid ? 1 : 0);
}

// 完整解析模式
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
      console.log(`[VALID] ${tag} (${r.diagramType}, parsed)`);
    } catch (e) {
      hasInvalid = true;
      const msg = String(e.message || e).split('\n').slice(0, 8).join('\n        ');
      console.log(`[INVALID] ${tag}\n        ${msg}`);
    }
  }
}

process.exit(hasInvalid ? 1 : 0);
