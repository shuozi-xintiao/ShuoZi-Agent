## 安装 ShuoZi Agent

### Windows

**PowerShell（推荐）：**

```powershell
# 1. 克隆仓库
git clone https://github.com/shuozi-xintiao/ShuoZi-Agent.git
cd ShuoZi-Agent

# 2. 安装 Python 依赖（需要 Python 3.11+）
uv sync

# 3. 启动
uv run shuozi
```

**桌面 GUI：**

```powershell
cd apps/desktop
npm install
npm run dev          # 开发模式直接启动
# npm run dist:win   # 打包成 ShuoZiAgent-Setup.exe
```

---

### macOS

```bash
# 1. 克隆仓库
git clone https://github.com/shuozi-xintiao/ShuoZi-Agent.git
cd ShuoZi-Agent

# 2. 安装依赖
uv sync

# 3. 启动
uv run shuozi
```

**桌面 GUI：**

```bash
cd apps/desktop
npm install
npm run dev          # 开发模式
# npm run dist:mac   # 打包成 ShuoZiAgent.dmg
```

---

### Linux

```bash
# 1. 克隆仓库
git clone https://github.com/shuozi-xintiao/ShuoZi-Agent.git
cd ShuoZi-Agent

# 2. 安装依赖
uv sync

# 3. 启动
uv run shuozi
```

**桌面 GUI：**

```bash
cd apps/desktop
npm install
npm run dev           # 开发模式
# npm run dist:linux  # 打包成 AppImage / deb / rpm
```

---

### 配置模型

首次运行后，设置你的模型提供商：

```bash
# 设置 API Key
export DEEPSEEK_API_KEY=你的key

# 或用其他模型
export OPENAI_API_KEY=你的key
export ANTHROPIC_API_KEY=你的key

# 交互式选择模型
uv run shuozi model
```

### 环境要求

| 依赖 | 版本 |
|------|------|
| Python | 3.11+ |
| Node.js（桌面端） | 20.19+ 或 22.12+ |
| uv | 最新版 |
| Git | 任意 |
