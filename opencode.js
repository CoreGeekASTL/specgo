/**
 * Spec-go 的 OpenCode 插件入口。
 * 1. config hook：注册 skills 目录，让 opencode 发现 9 个 spec-* skill（无需软链或手动配置）
 * 2. messages.transform hook：把 bootstrap.md 注入第一条 user message
 *
 * bootstrap.md 由 scripts/generate-bootstrap.mjs 预生成，skill 内容变更后重跑生成脚本即可。
 * 注入到 user message 而非 system，避免 system 每轮重复造成的 token 膨胀与多 system 消息对部分模型的破坏。
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOTSTRAP_PATH = path.join(__dirname, 'bootstrap.md');
const SKILLS_DIR = path.resolve(__dirname, 'skills');
const MARKER = 'SPEC_GO_BOOTSTRAP';

// 模块级缓存：bootstrap.md 在会话中不变，首次读盘后缓存
let _cache = undefined;

const getBootstrap = () => {
  if (_cache !== undefined) return _cache;
  if (!fs.existsSync(BOOTSTRAP_PATH)) { _cache = null; return null; }
  _cache = fs.readFileSync(BOOTSTRAP_PATH, 'utf8');
  return _cache;
};

/** @type {import('@opencode-ai/plugin').Plugin} */
const SpecGoPlugin = async () => {
  return {
    // 注册 skills 目录，让 opencode 发现所有 spec-* skill
    // （opencode 标准扫描路径是 ~/.config/opencode/skills 与 .opencode/skills，
    //   本插件 skills 在子目录，须靠 config hook 注册才能被发现）
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(SKILLS_DIR)) {
        config.skills.paths.push(SKILLS_DIR);
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
