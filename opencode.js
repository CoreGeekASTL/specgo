/**
 * Specgo 的 OpenCode 插件入口。
 * 1. config hook：注册 skills 目录，让 opencode 发现 7 个独立 skill（spec-analyze / spec-requirement-audit / spec-story-design / spec-code-generate / spec-report / spec-update / mermaid-validate，无需软链或手动配置）
 * 2. config hook：把 commands/ 下的子流程命令桩内联注册到 config.command（不落盘、不碰用户配置目录；只 spec-analyze 的 17 个子流程有命令，顶层 skill 无命令）
 * 3. messages.transform hook：把 bootstrap.md 注入第一条 user message
 *
 * bootstrap.md 由 scripts/generate-bootstrap.mjs 预生成，skill 内容变更后重跑生成脚本即可。
 * 命令桩由 scripts/generate-commands.mjs 预生成，子流程增删后重跑生成脚本即可。
 * 注入到 user message 而非 system，避免 system 每轮重复造成的 token 膨胀与多 system 消息对部分模型的破坏。
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOTSTRAP_PATH = path.join(__dirname, 'bootstrap.md');
const SKILLS_DIR = path.resolve(__dirname, 'skills');
const COMMANDS_DIR = path.resolve(__dirname, 'commands');
const MARKER = 'SPEC_GO_BOOTSTRAP';

// 模块级缓存：bootstrap.md 与命令桩在会话中不变，首次读盘后缓存
let _cache = undefined;
let _cmdCache = undefined;

const getBootstrap = () => {
  if (_cache !== undefined) return _cache;
  if (!fs.existsSync(BOOTSTRAP_PATH)) { _cache = null; return null; }
  _cache = fs.readFileSync(BOOTSTRAP_PATH, 'utf8');
  return _cache;
};

// 读取插件内 commands/*.md 命令桩，解析为 opencode config.command 条目：
// frontmatter 的 description 作命令描述，正文作 template；解析失败的桩跳过。
const getCommands = () => {
  if (_cmdCache !== undefined) return _cmdCache;
  _cmdCache = {};
  let files;
  try {
    files = fs.readdirSync(COMMANDS_DIR).filter((f) => f.endsWith('.md'));
  } catch { return _cmdCache; }
  for (const f of files) {
    try {
      const content = fs.readFileSync(path.join(COMMANDS_DIR, f), 'utf8');
      const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (!m) continue;
      const desc = (m[1].match(/^description:\s*(.+)$/m) || [])[1];
      const template = m[2].trim();
      if (!template) continue;
      _cmdCache[f.replace(/\.md$/, '')] = desc ? { template, description: desc } : { template };
    } catch { /* 忽略单个桩失败 */ }
  }
  return _cmdCache;
};

/** @type {import('@opencode-ai/plugin').Plugin} */
const SpecGoPlugin = async () => {
  return {
    // 注册 skills 目录与内联命令：
    // - skills：opencode 标准扫描路径是 ~/.config/opencode/skills 与 .opencode/skills，
    //   本插件 skills 在子目录，须靠 config hook 注册才能被发现；
    //   子流程文件不叫 SKILL.md 且在 references/ 下，不会被发现为独立 skill
    // - command：子流程命令桩内联注册（template/description），不写用户配置目录；
    //   用户已在 opencode.json 自定义同名命令时尊重用户定义，不覆盖
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(SKILLS_DIR)) {
        config.skills.paths.push(SKILLS_DIR);
      }
      const commands = getCommands();
      if (Object.keys(commands).length) {
        config.command = config.command || {};
        for (const [name, cmd] of Object.entries(commands)) {
          if (!(name in config.command)) config.command[name] = cmd;
        }
      }
    },

    // 把 bootstrap 注入第一条 user message
    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrap();
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find(m => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;
      // 防重复：已含标记则跳过
      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes(MARKER))) return;
      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    },
  };
};

export { SpecGoPlugin };
export default SpecGoPlugin;
