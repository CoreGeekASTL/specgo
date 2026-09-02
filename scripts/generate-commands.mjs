/**
 * 扫描 skills/<主skill>/references/subflows/<子流程>.md，从 frontmatter 取 description，
 * 生成 commands/<子流程名>.md 命令桩（Claude Code 原生发现；OpenCode 由 opencode.js 物化分发）。
 * 子流程变更后重跑：node scripts/generate-commands.mjs
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(PLUGIN_ROOT, 'skills');
const COMMANDS_DIR = path.join(PLUGIN_ROOT, 'commands');

// 与 generate-bootstrap.mjs 同一套 frontmatter 解析（保持两脚本解析行为一致）
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

// 汇总全部子流程：[{ main, name, description }]
const subflows = [];
for (const main of fs.readdirSync(SKILLS_DIR, { withFileTypes: true })) {
  if (!main.isDirectory() || main.name.startsWith('.')) continue;
  const subDir = path.join(SKILLS_DIR, main.name, 'references', 'subflows');
  if (!fs.existsSync(subDir)) continue;
  for (const f of fs.readdirSync(subDir)) {
    if (!f.endsWith('.md')) continue;
    const name = f.replace(/\.md$/, '');
    const fm = parseFrontmatter(fs.readFileSync(path.join(subDir, f), 'utf8'));
    subflows.push({ main: main.name, name, description: fm.description || '(无 description)' });
  }
}
subflows.sort((a, b) => (a.name < b.name ? -1 : 1));

fs.mkdirSync(COMMANDS_DIR, { recursive: true });

// 清理已不存在子流程对应的旧桩（只动带本插件标记的文件）
const MARKER = 'generated-by: specgo';
const expected = new Set(subflows.map((s) => `${s.name}.md`));
for (const f of fs.readdirSync(COMMANDS_DIR)) {
  if (!f.endsWith('.md') || expected.has(f)) continue;
  const p = path.join(COMMANDS_DIR, f);
  if (fs.readFileSync(p, 'utf8').includes(MARKER)) {
    fs.unlinkSync(p);
    console.log(`清理旧桩: commands/${f}`);
  }
}

// 生成/覆盖命令桩
for (const { main, name, description } of subflows) {
  const stub = `---
description: ${description.split('\n')[0]}
---

<!-- ${MARKER} -->
加载 ${main} skill，按其「子流程路由表」执行子流程 ${name}。
`;
  fs.writeFileSync(path.join(COMMANDS_DIR, `${name}.md`), stub);
  console.log(`生成: commands/${name}.md (${main})`);
}
console.log(`共 ${subflows.length} 个命令桩`);
