# Translate-selected

[English](#english) | [中文](#中文)

---

<a id="english"></a>

## English

> Translate selected text inline in VS Code. Supports [**Google Translate**](https://docs.cloud.google.com/translate/docs/reference/rest), [**DeepL**](https://www.deepl.com/), and [**Youdao (有道)**](https://ai.youdao.com/) translation providers.

### ✨ Features

- **Inline Translation** — Translation appears as a floating overlay above the selected text, without modifying the original content
- **Multi-line Support** — Select multiple lines and get line-by-line translation with uniform rectangular background
- **Right-click Context Menu** — Select text → right-click → "Translate Selected"
- **Keyboard Shortcut** — Quick translation with a single keystroke
- **Input Translation** — Translate any text via an input box (no selection needed)
- **Multiple Providers** — Switch between [Google](https://docs.cloud.google.com/translate/docs/reference/rest), [DeepL](https://www.deepl.com/), and [Youdao](https://ai.youdao.com/) freely
- **36 Languages** — Searchable dropdown for source/target language selection
- **Auto-dismiss** — Translation overlay automatically clears after 8 seconds, or when you type/move cursor

### 📦 Installation

Search for `Translate-selected` in the VS Code Extensions Marketplace and click **Install**.

- Or download directly from the VS Code Marketplace: [Translate-selected on Marketplace](https://marketplace.visualstudio.com/items?itemName=CliffHao.translate-selected) （可通过此链接下载插件）

### 🚀 Usage

#### Translate Selected Text

1. Select text in the editor
2. Use one of the following methods:
   - **Keyboard shortcut**: `Ctrl+Shift+T` (Windows/Linux) or `Cmd+4` (macOS)
   - **Right-click** → select **"Translate Selected"**
   - **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`) → type **"Translate Selected"**
3. The translation appears as a floating overlay above the selected text

#### Translate Input Text

1. Open **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type **"Translate Input"**
3. Enter the text you want to translate in the input box
4. The translation appears inline at the cursor position

### ⌨️ Keyboard Shortcuts

| Shortcut | Platform | Command |
|---|---|---|
| `Ctrl+Shift+T` | Windows / Linux | Translate Selected |
| `Cmd+4` | macOS | Translate Selected |

### ⚙️ Configuration

Open **Settings** (`Ctrl+,` / `Cmd+,`) and search for `translate-selected`.

#### General

| Setting | Default | Description |
|---|---|---|
| `translate-selected.provider` | `google` | Translation provider: `google`, `deepl`, or `youdao` |
| `translate-selected.sourceLanguage` | `auto` | Source language (searchable dropdown, supports 36 languages) |
| `translate-selected.targetLanguage` | `zh-CN` | Target language (searchable dropdown, supports 36 languages) |

#### [Google Translate](https://docs.cloud.google.com/translate/docs/reference/rest)

| Setting | Default | Description |
|---|---|---|
| `translate-selected.google.apiKey` | `""` | Google Cloud Translation API key ([Get one here](https://console.cloud.google.com/apis/credentials)) |

#### [DeepL](https://www.deepl.com/)

| Setting | Default | Description |
|---|---|---|
| `translate-selected.deepl.apiKey` | `""` | DeepL API authentication key ([Get one here](https://www.deepl.com/pro-api)) |
| `translate-selected.deepl.apiUrl` | `https://api-free.deepl.com/v2/translate` | API endpoint. Use `https://api.deepl.com/v2/translate` for DeepL Pro |

#### [Youdao (有道)](https://ai.youdao.com/)

| Setting | Default | Description |
|---|---|---|
| `translate-selected.youdao.appKey` | `""` | Youdao application key ([Apply here](https://ai.youdao.com/console/)) |
| `translate-selected.youdao.appSecret` | `""` | Youdao application secret |

### 🌍 Supported Languages

Chinese (Simplified), Chinese (Traditional), English, Japanese, Korean, French, German, Spanish, Portuguese, Portuguese (Brazil), Russian, Italian, Dutch, Polish, Arabic, Thai, Vietnamese, Indonesian, Malay, Turkish, Ukrainian, Czech, Danish, Finnish, Greek, Hungarian, Swedish, Norwegian, Romanian, Slovak, Bulgarian, Estonian, Latvian, Lithuanian, Slovenian, Croatian

### 📝 Provider Notes

| Provider | Website | Notes |
|---|---|---|
| **Google** | [cloud.google.com](https://docs.cloud.google.com/translate/docs/reference/rest) | Requires a Google Cloud Translation API key. Supports `auto` source detection. |
| **DeepL** | [deepl.com](https://www.deepl.com/) | Free tier uses `api-free.deepl.com`. Language codes are automatically mapped (e.g. `zh-CN` → `ZH-HANS`). |
| **Youdao** | [ai.youdao.com](https://ai.youdao.com/) | Uses v3 signature. Language codes are automatically mapped (e.g. `zh-CN` → `zh-CHS`). |

---

<a id="中文"></a>

## 中文

> 在 VS Code 中内联翻译选中的文本。支持 [**Google 翻译**](https://docs.cloud.google.com/translate/docs/reference/rest)、[**DeepL**](https://www.deepl.com/) 和 [**有道翻译**](https://ai.youdao.com/) 三大翻译服务。

### ✨ 功能特性

- **内联翻译** — 翻译结果以浮动覆盖层显示在选中文本上方，不会修改原始内容
- **多行支持** — 选中多行文本，逐行翻译，背景统一为整齐的矩形
- **右键菜单** — 选中文本 → 右键 → "Translate Selected"
- **快捷键** — 一键快速翻译
- **输入翻译** — 通过输入框翻译任意文本（无需选中）
- **多引擎切换** — 自由切换 [Google](https://docs.cloud.google.com/translate/docs/reference/rest)、[DeepL](https://www.deepl.com/)、[有道](https://ai.youdao.com/)
- **36 种语言** — 可搜索的下拉菜单选择源语言/目标语言
- **自动消失** — 翻译结果 8 秒后自动清除，或在输入/移动光标时立即清除

### 📦 安装

在 VS Code 扩展市场中搜索 `Translate-selected`，点击 **安装** 即可。

### 🚀 使用方法

#### 翻译选中文本

1. 在编辑器中选中文本
2. 使用以下任一方式：
   - **快捷键**：`Ctrl+Shift+T`（Windows/Linux）或 `Cmd+4`（macOS）
   - **右键** → 选择 **"Translate Selected"**
   - **命令面板**（`Ctrl+Shift+P` / `Cmd+Shift+P`）→ 输入 **"Translate Selected"**
3. 翻译结果将以浮动覆盖层显示在选中文本上方

#### 翻译输入文本

1. 打开 **命令面板**（`Ctrl+Shift+P` / `Cmd+Shift+P`）
2. 输入 **"Translate Input"**
3. 在输入框中输入要翻译的文本
4. 翻译结果将显示在光标位置

### ⌨️ 快捷键

| 快捷键 | 平台 | 命令 |
|---|---|---|
| `Ctrl+Shift+T` | Windows / Linux | 翻译选中文本 |
| `Cmd+4` | macOS | 翻译选中文本 |

### ⚙️ 配置说明

打开 **设置**（`Ctrl+,` / `Cmd+,`），搜索 `translate-selected`。

#### 通用设置

| 设置项 | 默认值 | 说明 |
|---|---|---|
| `translate-selected.provider` | `google` | 翻译引擎：`google`、`deepl` 或 `youdao` |
| `translate-selected.sourceLanguage` | `auto` | 源语言（可搜索下拉菜单，支持 36 种语言） |
| `translate-selected.targetLanguage` | `zh-CN` | 目标语言（可搜索下拉菜单，支持 36 种语言） |

#### [Google 翻译](https://docs.cloud.google.com/translate/docs/reference/rest)

| 设置项 | 默认值 | 说明 |
|---|---|---|
| `translate-selected.google.apiKey` | `""` | Google Cloud Translation API 密钥（[获取密钥](https://console.cloud.google.com/apis/credentials)） |

#### [DeepL](https://www.deepl.com/)

| 设置项 | 默认值 | 说明 |
|---|---|---|
| `translate-selected.deepl.apiKey` | `""` | DeepL API 认证密钥（[获取密钥](https://www.deepl.com/pro-api)） |
| `translate-selected.deepl.apiUrl` | `https://api-free.deepl.com/v2/translate` | API 端点。DeepL Pro 用户请使用 `https://api.deepl.com/v2/translate` |

#### [有道翻译](https://ai.youdao.com/)

| 设置项 | 默认值 | 说明 |
|---|---|---|
| `translate-selected.youdao.appKey` | `""` | 有道应用 ID（[申请地址](https://ai.youdao.com/console/)） |
| `translate-selected.youdao.appSecret` | `""` | 有道应用密钥 |

### 🌍 支持的语言

简体中文、繁体中文、英语、日语、韩语、法语、德语、西班牙语、葡萄牙语、巴西葡萄牙语、俄语、意大利语、荷兰语、波兰语、阿拉伯语、泰语、越南语、印尼语、马来语、土耳其语、乌克兰语、捷克语、丹麦语、芬兰语、希腊语、匈牙利语、瑞典语、挪威语、罗马尼亚语、斯洛伐克语、保加利亚语、爱沙尼亚语、拉脱维亚语、立陶宛语、斯洛文尼亚语、克罗地亚语

### 📝 翻译引擎说明

| 引擎 | 官网 | 说明 |
|---|---|---|
| **Google** | [cloud.google.com](https://docs.cloud.google.com/translate/docs/reference/rest) | 需要 Google Cloud Translation API 密钥，支持 `auto` 自动检测源语言 |
| **DeepL** | [deepl.com](https://www.deepl.com/) | 免费版使用 `api-free.deepl.com`，语言代码自动映射（如 `zh-CN` → `ZH-HANS`） |
| **有道** | [ai.youdao.com](https://ai.youdao.com/) | 使用 v3 签名，语言代码自动映射（如 `zh-CN` → `zh-CHS`） |

---

## �️ Development / 开发指南

### Prerequisites / 前置要求

- Node.js >= 18
- npm >= 9

### Setup / 环境搭建

```bash
# Clone the repository / 克隆仓库
git clone https://github.com/cliff/vscode-translation-cc.git
cd vscode-translation-cc

# Install dependencies / 安装依赖
npm install
```

### Scripts / 脚本说明

| Command / 命令 | Description / 说明 |
|---|---|
| `npm run dev` | Start development mode with watch (开发模式，自动监听文件变化) |
| `npm run compile` | Build production bundle (构建生产版本) |

### Development Workflow / 开发流程

1. **Start dev mode / 启动开发模式**
   ```bash
   npm run dev
   ```
   This watches for file changes and rebuilds automatically.
   自动监听文件变化并重新构建。

2. **Debug in VS Code / 在 VS Code 中调试**
   - Press `F5` to launch Extension Development Host
   - 按 `F5` 启动扩展开发宿主

3. **Build for production / 构建生产版本**
   ```bash
   npm run compile
   ```

### Publishing / 发布

```bash
# Update version / 更新版本号
npm version patch  # or minor / major

# Package vsix / 打包 vsix
npx vsce package

# Publish to marketplace / 发布到市场
npx vsce publish
```

---

## �📄 License

MIT

## 🙏 Acknowledgement

- 源码地址: https://github.com/haochencheng/vscode-translation-cc.git
