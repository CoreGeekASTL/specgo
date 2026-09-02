# Specgo 安装指导

本文指导如何将 specgo 插件安装到 OpenCode 或 Claude Code。specgo 是面向存量代码仓的四分类资产治理 skill 体系（6 个主 skill：spec-analyze 资产分析（承载 17 个子流程，含资产质量审核）、spec-update 资产刷新、spec-requirement-audit 需求审核（看文档+看代码）、spec-story-design story 设计、spec-code-generate 代码生成与测试、spec-report 总结报告 + 1 个横切工具 skill：mermaid-validate 图校验 + 17 个斜杠命令），详细功能见 [README.md](./README.md)。

## 0. 前置要求

| 平台 | 要求 |
|------|------|
| OpenCode | 无额外依赖（插件入口 `opencode.js` 为零依赖 ESM 模块） |
| Claude Code | 需要 bash（SessionStart hook 依赖）。Windows 上需安装 Git Bash，`hooks/run-hook.cmd` 会自动查找 `C:\Program Files\Git\bin\bash.exe` 或 PATH 中的 bash |
| 通用 | 修改 skill 后重生成 bootstrap 需 Node.js 或 Bun（仅插件维护者需要，使用方不需要） |

## 1. 获取插件

将插件仓库克隆到本机任意位置（记为 `/绝对路径/specgo`）：

```bash
git clone https://github.com/CoreGeekASTL/specgo.git
```

> 路径必须是**包目录**（含 `package.json` 的目录），不是 `opencode.js` 文件路径。OpenCode 读 `package.json` 的 `main` 字段定位入口。

## 2. 安装到 OpenCode

在 `opencode.json` 的 `plugin` 数组中加入插件的包目录路径：

- 全局配置：`~/.config/opencode/opencode.json`（建议写绝对路径，所有项目生效）
- 项目配置：项目根 `./opencode.json`（可用相对配置文件的路径，仅本项目生效）

```json
{
  "plugin": ["/绝对路径/specgo"]
}
```

注意：配置在启动时加载一次，**保存后需退出并重启 OpenCode** 生效。

## 3. 安装到 Claude Code

两步：注册本地 marketplace，再安装插件。

```
/plugin marketplace add /绝对路径/specgo
/plugin install specgo@specgo
```

安装后**重启 Claude Code** 生效。

## 4. 验证安装

重启后确认两点：

1. **skill 已发现**：OpenCode 查看可用 skill 列表；Claude Code 用 `/plugin` 查看已装插件。应出现 **7 个独立 skill**：`spec-analyze`、`spec-update`、`spec-requirement-audit`、`spec-story-design`、`spec-code-generate`、`spec-report`、`mermaid-validate`（17 个子流程在 spec-analyze 的 `references/subflows/` 下，不出现在 skill 列表属正常）
2. **子流程命令已注册**：输入 `/` 应能看到 17 个子流程命令（如 `/arch-structure-model-analyze`、`/asset-audit`）。Claude Code 由插件 `commands/` 原生提供；OpenCode 由 `opencode.js` 的 config hook 内联注册（`config.command`，不写任何用户配置文件）
3. **bootstrap 已注入**：直接问 agent "你有哪些资产分析能力"，应能列出 skill 及 spec-analyze 的子流程（如 `arch-structure-model-analyze`、`biz-interface-analyze` 等）

## 5. 更新插件

插件使用方升级只需：

```bash
cd /绝对路径/specgo
git pull
```

然后重启 OpenCode / Claude Code（Claude Code 必要时重装插件）。

## 6. 修改 skill 后如何更新（插件维护者）

主 skill 内容在 `skills/<skill>/SKILL.md`；子流程在 `skills/spec-analyze/references/subflows/<子流程名>.md`，其依赖文件在同级 `references/assets/`。

- **skill 的 frontmatter description 变更后**，必须重新生成 bootstrap 并重启 agent，否则注入的 skill 索引是旧的：

```bash
cd /绝对路径/specgo
bun scripts/generate-bootstrap.mjs    # 或 node scripts/generate-bootstrap.mjs
```

- **子流程增删或 frontmatter description 变更后**，必须重新生成命令桩（OpenCode 侧重启时由 opencode.js 自动同步）：

```bash
bun scripts/generate-commands.mjs     # 或 node scripts/generate-commands.mjs
```

只改正文（frontmatter 没变）时 bootstrap 与命令桩均无需重新生成，但 Claude Code 需重装或重启才能读到新内容。

## 7. 卸载

- **OpenCode**：从 `opencode.json` 的 `plugin` 数组移除条目，重启即可（命令为内存内联注册，无残留文件）
- **Claude Code**：`/plugin uninstall specgo@specgo`

## 8. 常见问题

| 问题 | 原因与解决 |
|------|-----------|
| OpenCode 装完看不到 skill | 路径写成了 `opencode.js` 文件路径——必须写包目录；或改完配置没重启 |
| skill 列表只有 7 个、看不到子流程 | 正常现象——子流程不是独立 skill，用 `/子流程名` 命令触发或由 spec-analyze 路由加载；顶层 skill 无命令，直接说人话即可触发 |
| 子流程斜杠命令没出现 | Claude Code：确认插件已安装并重启；OpenCode：重启即可（config hook 内联注册），若自定义 opencode.json 里有同名 `command` 条目会以用户定义为准 |
| bootstrap 没有注入 | 注入发生在会话第一条 user message，开**新会话**验证；检查插件目录下 `bootstrap.md` 存在 |
| Claude Code Windows 上报 hook 错误 | 缺 bash——安装 Git Bash，并确认 `C:\Program Files\Git\bin\bash.exe` 存在或 bash 在 PATH 中 |
| 改了 skill 但 agent 行为没变 | skill frontmatter 变了要重跑 `scripts/generate-bootstrap.mjs`；子流程增删/描述变更要重跑 `scripts/generate-commands.mjs`；Claude Code 侧需重装或重启 |
