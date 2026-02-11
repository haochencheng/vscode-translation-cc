import * as vscode from "vscode";
import axios from "axios";
import * as crypto from "crypto";

console.log("Translation-selected: File loaded");

interface Translator {
  translate(text: string, source: string, target: string): Promise<string>;
}

class GoogleTranslator implements Translator {
  constructor(private readonly apiKey: string) {}

  async translate(text: string, source: string, target: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Google API key is not configured.");
    }

    const params: Record<string, string> = {
      q: text,
      target,
      key: this.apiKey
    };

    if (source && source !== "auto") {
      params.source = source;
    }

    const response = await axios.post(
      "https://translation.googleapis.com/language/translate/v2",
      null,
      { params }
    );

    const translated = response.data?.data?.translations?.[0]?.translatedText;
    if (!translated) {
      throw new Error("Google translation failed.");
    }

    return translated;
  }
}

class DeepLTranslator implements Translator {
  constructor(private readonly apiKey: string, private readonly apiUrl: string) {}

  async translate(text: string, source: string, target: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("DeepL API key is not configured.");
    }

    // DeepL uses uppercase language codes and specific formats
    const targetLang = this.mapLanguageCode(target);

    const body: Record<string, unknown> = {
      text: [text],
      target_lang: targetLang
    };

    if (source && source !== "auto") {
      body.source_lang = this.mapLanguageCode(source);
    }

    const response = await axios.post(this.apiUrl, body, {
      headers: {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        "Content-Type": "application/json"
      }
    });

    const translated = response.data?.translations?.[0]?.text;
    if (!translated) {
      throw new Error("DeepL translation failed.");
    }

    return translated;
  }

  private mapLanguageCode(code: string): string {
    // DeepL uses uppercase codes with specific mappings
    const map: Record<string, string> = {
      "zh-cn": "ZH-HANS",
      "zh-tw": "ZH-HANT",
      "en": "EN",
      "en-us": "EN-US",
      "en-gb": "EN-GB",
      "pt": "PT-PT",
      "pt-br": "PT-BR",
      "nb": "NB",
    };
    const lower = code.toLowerCase();
    return map[lower] || code.split("-")[0].toUpperCase();
  }
}

class YoudaoTranslator implements Translator {
  constructor(private readonly appKey: string, private readonly appSecret: string) {}

  private mapLanguageCode(code: string): string {
    // Youdao uses specific language codes
    const map: Record<string, string> = {
      "zh-cn": "zh-CHS",
      "zh-tw": "zh-CHT",
      "en": "en",
      "ja": "ja",
      "ko": "ko",
      "fr": "fr",
      "de": "de",
      "es": "es",
      "pt": "pt",
      "pt-br": "pt",
      "ru": "ru",
      "it": "it",
      "nl": "nl",
      "pl": "pl",
      "ar": "ar",
      "th": "th",
      "vi": "vi",
      "id": "id",
      "ms": "ms",
      "tr": "tr",
    };
    const lower = code.toLowerCase();
    return map[lower] || code.toLowerCase();
  }

  async translate(text: string, source: string, target: string): Promise<string> {
    if (!this.appKey || !this.appSecret) {
      throw new Error("Youdao appKey/appSecret are not configured.");
    }

    const salt = Date.now().toString();
    const curtime = Math.floor(Date.now() / 1000).toString();
    const input = this.truncate(text);
    const signStr = this.appKey + input + salt + curtime + this.appSecret;
    const sign = crypto.createHash("sha256").update(signStr).digest("hex");

    const params = new URLSearchParams({
      q: text,
      from: source === "auto" ? "auto" : this.mapLanguageCode(source),
      to: this.mapLanguageCode(target),
      appKey: this.appKey,
      salt,
      sign,
      signType: "v3",
      curtime
    });

    const response = await axios.post("https://openapi.youdao.com/api", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const translated = response.data?.translation?.[0];
    if (!translated) {
      const errorCode = response.data?.errorCode || "unknown";
      throw new Error(`Youdao translation failed (errorCode=${errorCode}).`);
    }

    return translated;
  }

  private truncate(text: string): string {
    if (text.length <= 20) {
      return text;
    }

    return text.slice(0, 10) + text.length + text.slice(-10);
  }
}

function getTranslator(config: vscode.WorkspaceConfiguration): Translator {
  const provider = config.get<string>("provider", "google");

  if (provider === "deepl") {
    const apiKey = config.get<string>("deepl.apiKey", "");
    const apiUrl = config.get<string>("deepl.apiUrl", "https://api-free.deepl.com/v2/translate");
    return new DeepLTranslator(apiKey, apiUrl);
  }

  if (provider === "youdao") {
    const appKey = config.get<string>("youdao.appKey", "");
    const appSecret = config.get<string>("youdao.appSecret", "");
    return new YoudaoTranslator(appKey, appSecret);
  }

  const apiKey = config.get<string>("google.apiKey", "");
  return new GoogleTranslator(apiKey);
}

type Logger = (message: string) => void;

async function translateText(text: string, log: Logger): Promise<string> {
  const config = vscode.workspace.getConfiguration("translate-selected");
  const source = config.get<string>("sourceLanguage", "auto");
  const target = config.get<string>("targetLanguage", "zh-CN");
  const translator = getTranslator(config);
  const provider = config.get<string>("provider", "google");

  log(`Translate start | provider=${provider} source=${source} target=${target}`);
  log(`Text length=${text.length} preview="${formatPreview(text)}"`);

  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Translating...",
      cancellable: false
    },
    async () => {
      // Split text by newlines to preserve line structure
      const lines = text.split("\n");
      // If single line, translate directly to save requests
      if (lines.length === 1) {
        const translated = await translator.translate(text, source, target);
        log(`Translate success | length=${translated.length}`);
        return translated;
      }

      // If multiple lines, translate line-by-line to maintain 1-to-1 mapping
      const translatedLines = await Promise.all(
        lines.map(async (line) => {
          if (!line.trim()) {
            return "";
          }
          try {
            return await translator.translate(line, source, target);
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            log(`Line translation failed: "${line.substring(0, 30)}" error=${msg}`);
            throw e; // Propagate error instead of silently returning original
          }
        })
      );

      const result = translatedLines.join("\n");
      log(`Translate success (multi-line) | lines=${lines.length} total_length=${result.length}`);
      return result;
    }
  );
}

function formatInlineText(
  text: string,
  originalLineCount: number
): { displayText: string; lineCount: number; collapsed: boolean } {
  // Format translation to match original text line count
  const translatedLines = text.replace(/\r\n/g, "\n").split("\n");
  
  // Use original text line count for positioning
  const lineCount = originalLineCount;

  return {
    displayText: translatedLines.join("\n"),
    lineCount,
    collapsed: false
  };
}

function getWrapColumns(editor: vscode.TextEditor): number {
  const visible = editor.visibleRanges[0];
  if (!visible) {
    return 80;
  }

  const maxLine = Math.max(visible.start.line, visible.end.line);
  let maxCols = 0;
  for (let line = visible.start.line; line <= maxLine; line += 1) {
    const text = editor.document.lineAt(line).text;
    maxCols = Math.max(maxCols, text.length);
  }

  return Math.max(40, Math.min(120, maxCols || 80));
}

function getMaxLines(editor: vscode.TextEditor): number {
  const visible = editor.visibleRanges[0];
  if (!visible) {
    return 6;
  }

  const visibleLines = Math.max(1, visible.end.line - visible.start.line + 1);
  return Math.max(3, Math.min(10, Math.floor(visibleLines * 0.35)));
}

function wrapLineWithIndent(line: string, maxCols: number): string[] {
  if (!line) {
    return [""];
  }

  const match = line.match(/^(\s+)/);
  const indent = match ? match[1] : "";
  const content = indent ? line.slice(indent.length) : line;
  const available = Math.max(10, maxCols - indent.length);
  const result: string[] = [];

  if (content.length <= available) {
    return [line];
  }

  let remaining = content;
  let isFirst = true;
  while (remaining.length > 0) {
    const chunk = remaining.slice(0, available);
    remaining = remaining.slice(available);
    result.push(isFirst ? `${indent}${chunk}` : `${indent}${chunk}`);
    isFirst = false;
  }

  return result;
}

function formatPreview(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= 80) {
    return normalized;
  }

  return `${normalized.slice(0, 80)}...`;
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack || error.message;
  }

  return String(error);
}

export function activate(context: vscode.ExtensionContext): void {
  console.log('Congratulations, your extension "translate-selected" is now active!');
  vscode.window.showInformationMessage("Extension 'Translate-selected' is now active!");
  const outputChannel = vscode.window.createOutputChannel("Translation CC");
  const log: Logger = (message: string) => {
    const time = new Date().toISOString();
    outputChannel.appendLine(`[${time}] ${message}`);
  };
  const decorationType = vscode.window.createTextEditorDecorationType({});
  let decorationTimer: NodeJS.Timeout | undefined;
  let displayTime: number | undefined;
  let activeDecoration:
    | { editor: vscode.TextEditor; range: vscode.Range; selection: vscode.Selection }
    | undefined;

  const clearInlineTranslation = (reason: string): void => {
    if (!activeDecoration) {
      return;
    }

    activeDecoration.editor.setDecorations(decorationType, []);
    activeDecoration = undefined;
    displayTime = undefined;

    if (decorationTimer) {
      clearTimeout(decorationTimer);
      decorationTimer = undefined;
    }

    log(`Inline translation cleared | reason=${reason}`);
  };

  const isSameSelection = (a: vscode.Selection, b: vscode.Selection): boolean =>
    a.active.isEqual(b.active) && a.anchor.isEqual(b.anchor);

  const showInlineTranslation = (
    editor: vscode.TextEditor,
    range: vscode.Range,
    originalText: string,
    translated: string
  ): void => {
    const originalLines = originalText.replace(/\r\n/g, "\n").split("\n");
    const translatedLines = translated.replace(/\r\n/g, "\n").split("\n");
    const lineCount = originalLines.length;

    // Visual width: CJK / fullwidth / emoji = 2 cols, others = 1 col
    const visualWidth = (str: string): number => {
      let w = 0;
      for (const ch of str) {
        const cp = ch.codePointAt(0) ?? 0;
        if (
          (cp >= 0x1100 && cp <= 0x115F) ||
          (cp >= 0x2E80 && cp <= 0x303E) ||
          (cp >= 0x3040 && cp <= 0x33BF) ||
          (cp >= 0x3400 && cp <= 0x4DBF) ||
          (cp >= 0x4E00 && cp <= 0x9FFF) ||
          (cp >= 0xA000 && cp <= 0xA4CF) ||
          (cp >= 0xAC00 && cp <= 0xD7AF) ||
          (cp >= 0xF900 && cp <= 0xFAFF) ||
          (cp >= 0xFE30 && cp <= 0xFE6F) ||
          (cp >= 0xFF01 && cp <= 0xFF60) ||
          (cp >= 0xFFE0 && cp <= 0xFFE6) ||
          (cp >= 0x20000 && cp <= 0x2FA1F) ||
          (cp >= 0x1F000 && cp <= 0x1FFFF)
        ) {
          w += 2;
        } else {
          w += 1;
        }
      }
      return w;
    };

    // Build display lines with prefix
    const rawLines: string[] = [];
    let maxVW = 0;
    for (let i = 0; i < lineCount; i++) {
      const line = translatedLines[i] || "";
      const prefix = i === 0 ? " 🌐  " : "     ";
      const displayLine = `${prefix}${line}`;
      rawLines.push(displayLine);
      const vw = visualWidth(displayLine);
      if (vw > maxVW) {
        maxVW = vw;
      }
    }

    // Target visual width = longest line + 3 spaces padding
    const targetVW = maxVW + 3;

    // Pad each line with spaces so all reach the same visual width
    const uniformLines = rawLines.map((line) => {
      const gap = targetVW - visualWidth(line);
      return gap > 0 ? line + " ".repeat(gap) : line;
    });

    // Fixed CSS width in ch units (1ch = width of '0' in monospace = 1 ASCII col)
    const fixedWidthCh = targetVW;

    const decorations: vscode.DecorationOptions[] = [];
    // Neutral dark background matching GitLens annotation style
    const bg = "#252526";

    // Create per-line decorations – seamless block, no gaps
    for (let i = 0; i < lineCount; i++) {
      const lineNum = range.start.line + i;
      const anchorPos = new vscode.Position(lineNum, 0);
      const anchorRange = new vscode.Range(anchorPos, anchorPos);

      const isTop = (i === 0);
      const isBottom = (i === lineCount - 1);

      const radiusTL = isTop ? "3px" : "0";
      const radiusTR = isTop ? "3px" : "0";
      const radiusBR = isBottom ? "3px" : "0";
      const radiusBL = isBottom ? "3px" : "0";

      // Subtle border only on outer edges
      const borderTop = isTop ? "1px solid #3c3c3c" : "none";
      const borderBottom = isBottom ? "1px solid #3c3c3c" : "none";
      const borderLeft = "1px solid #3c3c3c";
      const borderRight = "1px solid #3c3c3c";

      // Move block above the selection
      const transformY = `calc(-1 * (${lineCount} * 100% + 30px))`;

      const decorationStyle =
        `border-radius: ${radiusTL} ${radiusTR} ${radiusBR} ${radiusBL}; ` +
        `padding: 0 0 0 4px; ` +
        `width: ${fixedWidthCh}ch; ` +
        `border-top: ${borderTop}; border-bottom: ${borderBottom}; ` +
        `border-left: ${borderLeft}; border-right: ${borderRight}; ` +
        "font-style: normal; font-weight: 400; " +
        "line-height: inherit; font-size: inherit; font-family: inherit; " +
        `position: absolute; display: inline-block; white-space: pre; ` +
        `transform: translateY(${transformY}); height: 100%; box-sizing: border-box; ` +
        "margin: 0; overflow: hidden;";

      decorations.push({
        range: anchorRange,
        renderOptions: {
          before: {
            contentText: uniformLines[i],
            backgroundColor: bg,
            color: "#cccccc",
            textDecoration: decorationStyle
          }
        }
      });
    }

    editor.setDecorations(decorationType, decorations);
    activeDecoration = { editor, range, selection: editor.selection };
    displayTime = Date.now();
    log(
      `Inline translation displayed | anchor=${range.start.line}:${range.start.character} lines=${lineCount} collapsed=false`
    );

    if (decorationTimer) {
      clearTimeout(decorationTimer);
    }

    decorationTimer = setTimeout(() => {
      clearInlineTranslation("timeout");
    }, 8000);
  };

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((event) => {
      if (!activeDecoration) {
        return;
      }

      // Protection period: ignore selection changes within 500ms of display
      if (displayTime && Date.now() - displayTime < 500) {
        return;
      }

      if (event.textEditor !== activeDecoration.editor) {
        clearInlineTranslation("selection-change-editor");
        return;
      }

      if (!isSameSelection(event.selections[0], activeDecoration.selection)) {
        clearInlineTranslation("selection-change");
      }
    }),
    vscode.window.onDidChangeActiveTextEditor(() => {
      clearInlineTranslation("active-editor-change");
    }),
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (!activeDecoration) {
        return;
      }

      if (event.document === activeDecoration.editor.document) {
        clearInlineTranslation("text-input");
      }
    })
  );

  const runTranslateSelection = async (): Promise<void> => {
    outputChannel.show(true);
    log("Translate Selection invoked.");
    const editor = vscode.window.activeTextEditor;
    const selectionText = editor?.document.getText(editor.selection).trim();

    if (!selectionText) {
      vscode.window.showWarningMessage("No text selected.");
      return;
    }

    try {
      const translated = await translateText(selectionText, log);
      log(`Translate Selection translated | length=${translated.length}`);
      if (editor) {
        const range = editor.selection.isEmpty
          ? new vscode.Range(editor.selection.active, editor.selection.active)
          : editor.selection;
        showInlineTranslation(editor, range, selectionText, translated);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log("Translate Selection failed.");
      log(formatError(error));
      vscode.window.showErrorMessage(message);
    }
  };

  const translateSelection = vscode.commands.registerCommand(
    "translate-selected.translateSelection",
    runTranslateSelection
  );

  const translateSelectionAlias = vscode.commands.registerCommand(
    "extension.translateText",
    runTranslateSelection
  );

  const translateInput = vscode.commands.registerCommand(
    "translate-selected.translateInput",
    async () => {
      outputChannel.show(true);
      log("Translate Input invoked.");
      const input = await vscode.window.showInputBox({
        prompt: "Enter text to translate",
        ignoreFocusOut: true
      });

      if (!input) {
        return;
      }

      try {
        const translated = await translateText(input, log);

        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const range = new vscode.Range(editor.selection.active, editor.selection.active);
          showInlineTranslation(editor, range, input, translated);
        } else {
          vscode.window.setStatusBarMessage(translated, 8000);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        log("Translate Input failed.");
        log(formatError(error));
        vscode.window.showErrorMessage(message);
      }
    }
  );

  context.subscriptions.push(
    outputChannel,
    decorationType,
    translateSelection,
    translateSelectionAlias,
    translateInput
  );
}

export function deactivate(): void {
  void 0;
}
