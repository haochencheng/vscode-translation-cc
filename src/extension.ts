import * as vscode from "vscode";
import axios from "axios";
import crypto from "crypto";

interface Translator {
  translate(text: string, source: string, target: string): Promise<string>;
}

class GoogleTranslator implements Translator {
  constructor(private apiKey: string) {}

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
  constructor(private apiKey: string, private apiUrl: string) {}

  async translate(text: string, source: string, target: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("DeepL API key is not configured.");
    }

    const params: Record<string, string> = {
      text,
      target_lang: target
    };

    if (source && source !== "auto") {
      params.source_lang = source;
    }

    const response = await axios.post(this.apiUrl, new URLSearchParams(params), {
      headers: {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const translated = response.data?.translations?.[0]?.text;
    if (!translated) {
      throw new Error("DeepL translation failed.");
    }

    return translated;
  }
}

class YoudaoTranslator implements Translator {
  constructor(private appKey: string, private appSecret: string) {}

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
      from: source || "auto",
      to: target,
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

async function translateAndShow(text: string): Promise<void> {
  const config = vscode.workspace.getConfiguration("translation-cc");
  const source = config.get<string>("sourceLanguage", "auto");
  const target = config.get<string>("targetLanguage", "zh-CN");
  const translator = getTranslator(config);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Translating...",
      cancellable: false
    },
    async () => {
      const translated = await translator.translate(text, source, target);
      await vscode.window.showInformationMessage(translated, { modal: true });
    }
  );
}

export function activate(context: vscode.ExtensionContext): void {
  const translateSelection = vscode.commands.registerCommand(
    "translation-cc.translateSelection",
    async () => {
      const editor = vscode.window.activeTextEditor;
      const selectionText = editor?.document.getText(editor.selection).trim();

      if (!selectionText) {
        vscode.window.showWarningMessage("No text selected.");
        return;
      }

      try {
        await translateAndShow(selectionText);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        vscode.window.showErrorMessage(message);
      }
    }
  );

  const translateInput = vscode.commands.registerCommand(
    "translation-cc.translateInput",
    async () => {
      const input = await vscode.window.showInputBox({
        prompt: "Enter text to translate",
        ignoreFocusOut: true
      });

      if (!input) {
        return;
      }

      try {
        await translateAndShow(input);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        vscode.window.showErrorMessage(message);
      }
    }
  );

  context.subscriptions.push(translateSelection, translateInput);
}

export function deactivate(): void {}
