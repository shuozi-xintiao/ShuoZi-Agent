<p align="center">
  <h1>硕兹 Agent &mdash; ShuoZi Agent</h1>
  <p>ShuoZi OS 原生 AI 智能层 &bull; Built by ShuoZi Labs</p>
</p>

<p align="center">
  <a href="https://github.com/shuozi-xintiao/ShuoZi-Agent/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License: MIT"></a>
  <a href="https://github.com/shuozi-xintiao/ShuoZi-Agent"><img src="https://img.shields.io/badge/Built%20by-ShuoZi%20Labs-blueviolet?style=for-the-badge" alt="Built by ShuoZi Labs"></a>
</p>

---

**ShuoZi Agent** 是 ShuoZi OS 的原生 AI 智能层——一个具备持续学习能力的自主 AI Agent。它跨会话积累记忆、从经验中自动提炼技能、能调度子 Agent 并行工作、支持定时任务无人值守运行。

无论你用什么模型——OpenAI、Anthropic、DeepSeek、本地模型，或未来 ShuoZi 自研模型——都能即插即用。在终端、桌面 GUI、Telegram 等多平台上无缝衔接。

---

## 核心能力

| 能力 | 说明 |
|------|------|
| **持续学习** | 自动从任务中提炼技能（Skills），经验越用越丰富 |
| **跨会话记忆** | 记住你的偏好、环境、习惯，越用越懂你 |
| **多平台** | 终端 CLI / 桌面 GUI / Telegram / Discord / Slack 等 |
| **定时任务** | 内置 Cron 调度器，自动化日报、备份、巡检 |
| **子 Agent 并行** | 隔离上下文，多任务并行推进 |
| **模型无关** | DeepSeek / OpenAI / Anthropic / 本地模型 / 未来 ShuoZi 模型皆可 |

## 快速开始

```bash
# 一行安装（Windows PowerShell）
iex (irm https://shuozi.ai/install.ps1)

# 启动交互对话
shuozi

# 指定模型
shuozi chat --model deepseek-chat --provider deepseek
```

## 桌面端

ShuoZi Agent 附带完整的 Electron 桌面应用，Windows / macOS / Linux 全平台支持。

```bash
cd apps/desktop
npm install
npm run dev        # 开发模式
npm run dist:win   # 打包 Windows 安装包
```

## 许可证

MIT License
