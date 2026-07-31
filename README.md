# Specgo

面向存量代码仓的规格化分析 skill 体系。包含 12 个 spec skill 和一段 bootstrap 注入指令，让 coding agent 在做代码仓分析类任务前，先加载对应 skill、按统一格式产出文档资产到 `docs/` 下；并能依据 story 设计文档直接生成代码。

## 组成

```
specgo/
├── opencode.js              # OpenCode 插件入口（package.json 的 main）
├── bootstrap.md             # 注入指令（由 scripts/generate-bootstrap.mjs 生成，勿手改）
├── skills/                  # 12 个 skill（每个一个目录，内含 SKILL.md）
├── hooks/                   # Claude Code SessionStart hook
│   ├── hooks.json           # hook 注册（SessionStart → run-hook.cmd session-start）
│   ├── run-hook.cmd         # 跨平台 wrapper（Windows 走 Git Bash，Unix 直接 exec）
│   └── session-start        # 读 bootstrap.md，输出 additionalContext JSON
├── scripts/
│   └── generate-bootstrap.mjs  # 从 skills/*/SKILL.md frontmatter 重新生成 bootstrap.md
├── plugin.json              # OpenCode 插件清单
└── .claude-plugin/          # Claude Code 插件与 marketplace 清单
    ├── plugin.json
    └── marketplace.json
```

## 工作原理

两个平台都只做两件事：**让 agent 发现 skills/ 下的 skill**、**会话启动时注入 bootstrap.md**（内容是一段"做分析任务前必须先加载对应 skill"的指令 + 12 个 skill 的索引）。

- **OpenCode**：`opencode.js` 的 `config` hook 把 `skills/` 注册进 `config.skills.paths`；`experimental.chat.messages.transform` hook 把 bootstrap 注入第一条 user message（注入 user message 而非 system message，避免每轮重复消耗 token）。
- **Claude Code**：`hooks/hooks.json` 在 SessionStart 执行 `session-start` 脚本，把 bootstrap 作为 `additionalContext` 输出；`skills/` 目录由 Claude Code 插件机制自动发现。

bootstrap.md 是预生成文件，由 `scripts/generate-bootstrap.mjs` 从各 skill 的 frontmatter description 生成。改了任何 skill 后必须重跑该脚本，否则注入的索引是旧的。

## 安装到 OpenCode

在 `opencode.json`（全局 `~/.config/opencode/opencode.json` 或项目根 `./opencode.json`）的 `plugin` 数组中加入**本插件的包目录路径**：

```json
{
  "plugin": ["/绝对路径/specgo"]
}
```

注意：

- 路径必须是**包目录**（含 `package.json` 的目录），不是 `opencode.js` 文件路径。OpenCode 读 `package.json` 的 `main` 字段定位入口。
- 用全局配置时建议写绝对路径；项目级配置可用相对配置文件的路径。
- 配置在启动时加载一次，**保存后需退出并重启 OpenCode**生效。

## 安装到 Claude Code

两步：注册本地 marketplace，再安装插件。

```
/plugin marketplace add /绝对路径/specgo
/plugin install specgo@specgo
```

注意：

- SessionStart hook 依赖 bash。Windows 上需要安装 Git Bash（`hooks/run-hook.cmd` 会自动查找 `C:\Program Files\Git\bin\bash.exe` 或 PATH 中的 bash）。
- 安装后重启 Claude Code 生效。

## 验证安装

重启后确认两点：

1. skill 列表中出现 11 个 `spec-` 开头的 skill 和 1 个 `specgo` skill（OpenCode 中可查看可用 skill；Claude Code 中 `/plugin` 查看已装插件）
2. 会话启动时 bootstrap 已注入：直接问 agent "你有哪些 spec skill"，应能列出下表 12 个

## 内含 skill

| 分类 | Skill | 作用 | 产出 |
|------|-------|------|------|
| 结构 | spec-structure-analyze | 代码仓结构摸底 | `docs/structure/`：mermaid 依赖图 + 模块说明表 |
| 接口（入站） | spec-interface-analyze | 对外接口盘点（HTTP 路由/RPC/消息订阅/IDL） | `docs/interface/`：README + 功能域子文档 |
| 接口（出站） | spec-external-call-analyze | 出站调用盘点（HTTP/RPC client、MQ 生产端、SDK） | `docs/external-call/`：README + 按下游服务归类子文档 |
| 功能 | spec-feature-analyze | 对外接口按业务功能归纳 | `docs/story/`：feature-*.md（L1 多彩建模 + L2 结构地图 + L3 AI 编码指南 + 外部文档引用） |
| 关键类 | spec-key-class-analyze | 关键类识别与职责凝练 | `docs/key-class/README.md`：单文件单表（类名/类的职责，职责 38 字内） |
| 数据结构 | spec-data-structure-analyze | 关键数据结构识别与按类型分组 | `docs/data-structure/`：README + 按类型分篇 |
| 框架 | spec-framework-usage-analyze | 基础框架使用模式分析 | `docs/framework-usage/`：每框架一篇使用指导 |
| 需求审核 | spec-logic-audit | 多彩建模 + 设计要素（时序图/验收用例/接口）完备性校验 | 建模 HTML；可选输出规范功能实现设计 md |
| 图验证 | spec-mermaid-diagram | mermaid 语法红线 + 本地渲染验证 | 含图产出物跑 validate-mermaid.mjs 全部 VALID |
| 设计 | spec-story-design | 需求文档 → story 设计文档 | `docs/story/` + `docs/develop-task/`（抛弃式编码辅助文档） |
| 资产维护 | spec-asset-refresh | 基于 MR diff 识别七类资产变化，增量刷新 | 刷新上述全部 `docs/` 资产，人工审核定稿 |
| 代码生成 | specgo | 只读 story 设计文档 + 同名关联 develop-task 任务文档 + 被引用文档，不自主探索，直接生成代码 | 按修改文件清单落地的代码 + 验证命令结果 |

推荐全链路顺序：structure → interface → external-call → feature → key-class → data-structure → framework-usage →（有需求时）logic-audit → mermaid-diagram → story-design → specgo →（MR 后）asset-refresh。每步也可单独触发。

## 修改 skill 后如何更新

skill 内容在 `skills/<名称>/SKILL.md`。任一 skill 的 frontmatter description 变更后，重新生成 bootstrap 并重启 agent：

```bash
cd /路径/specgo
bun scripts/generate-bootstrap.mjs    # 或 node scripts/generate-bootstrap.mjs
```

只改 SKILL.md 正文（frontmatter 没变）时 bootstrap 无需重新生成，但 Claude Code 需重装或重启才能读到新 skill 内容。

## 卸载

- OpenCode：从 `opencode.json` 的 `plugin` 数组移除条目，重启
- Claude Code：`/plugin uninstall specgo@specgo`

## 许可证

MIT License。
