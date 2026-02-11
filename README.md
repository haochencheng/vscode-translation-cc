# Translation CC

Translate selected text or input text with Google, DeepL, or Youdao.

## Features

- Translate selection via command or right-click
- Translate input text via command
- Modal popup shows translated text without changing the original
- Configurable provider and API credentials
- Progress notification during translation

## Commands

- Translate Selection
- Translate Input

## Keybinding

- `Ctrl+Shift+T` (macOS uses `Cmd+Shift+T`) for translating selection

## Configuration

- `translation-cc.provider`: `google` | `deepl` | `youdao`
- `translation-cc.sourceLanguage`: e.g. `auto`, `en`, `zh-CN`
- `translation-cc.targetLanguage`: e.g. `zh-CN`, `en`
- `translation-cc.google.apiKey`
- `translation-cc.deepl.apiKey`
- `translation-cc.deepl.apiUrl`
- `translation-cc.youdao.appKey`
- `translation-cc.youdao.appSecret`

## Provider Notes

- Google Translation API requires an API key.
- DeepL Free uses `https://api-free.deepl.com/v2/translate`.
- Youdao uses v3 signature.

## Usage

1. Select text in the editor.
2. Right-click and choose "Translate Selection", or use the keybinding.
3. A modal popup displays the translated text.

## Acknowledgement

Inspired by other translation extensions in the VS Code ecosystem.
