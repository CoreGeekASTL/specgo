# Specgo 安装指导

本文指导如何将 specgo 插件安装到 OpenCode 或 Claude Code。specgo 是面向存量代码仓的四分类资产治理 skill 体系（arch / biz / tech / qual 四域 16 个 analyze skill + spec 系列 10 个 + mermaid-validate，共 27 个），详细功能见 [README.md](./README.md)。

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

1. **skill 已发现**：OpenCode 查看可用 skill 列表；Claude Code 用 `/plugin` 查看已装插件。应出现 27 个 skill：26 个 `spec-`/`arch-`/`biz-`/`tech-`/`qual-` 开头的 skill + `specgo` 编排 skill + `mermaid-validate`
2. **bootstrap 已注入**：直接问 agent "你有哪些资产分析 skill"，应能列出 README「内含 skill」表格中的条目（如 `arch-structure-model-analyze`、`biz-interface-analyze` 等）

## 5. 更新插件

插件使用方升级只需：

```bash
cd /绝对路径/specgo
git pull
```

然后重启 OpenCode / Claude Code（Claude Code 必要时重装插件）。

## 6. 修改 skill 后如何更新（插件维护者）

skill 内容在 `skills/<名称>/SKILL.md`。任一 skill 的 **frontmatter description** 变更后，必须重新生成 bootstrap 并重启 agent，否则注入的 skill 索引是旧的：

```bash
cd /绝对路径/specgo
bun scripts/generate-bootstrap.mjs    # 或 node scripts/generate-bootstrap.mjs
```

只改 SKILL.md 正文（frontmatter 没变）时 bootstrap 无需重新生成，但 Claude Code 需重装或重启才能读到新 skill 内容。

## 7. 卸载

- **OpenCode**：从 `opencode.json` 的 `plugin` 数组移除条目，重启
- **Claude Code**：`/plugin uninstall specgo@specgo`

## 8. 常见问题

| 问题 | 原因与解决 |
|------|-----------|
| OpenCode 装完看不到 skill | 路径写成了 `opencode.js` 文件路径——必须写包目录；或改完配置没重启 |
| bootstrap 没有注入 | 注入发生在会话第一条 user message，开**新会话**验证；检查插件目录下 `bootstrap.md` 存在 |
| Claude Code Windows 上报 hook 错误 | 缺 bash——安装 Git Bash，并确认 `C:\Program Files\Git\bin\bash.exe` 存在或 bash 在 PATH 中 |
| 改了 skill 但 agent 行为没变 | frontmatter 变了要重跑 `scripts/generate-bootstrap.mjs`；Claude Code 侧需重装或重启 |
