import * as vscode from "vscode";
import { getAllHistory, getFavorites, saveFavorites } from "./extension";

export class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vscodeSidebar.openview";
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _sendCommands: (commands: string[]) => void,
    private readonly _context: vscode.ExtensionContext
  ) {}
  

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext<unknown>,
    _token: vscode.CancellationToken
  ): void | Thenable<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this.getHtmlContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(message => {
      if (message.command === "requestData") {
          const count = message.count || 5;
          const all = getAllHistory(message.count || 5);
          const favorites = getFavorites(this._context);
  
          const dedupedRest = all.filter((cmd: any) => !favorites.includes(cmd));
          webviewView.webview.postMessage({
              command: "sendData",
              data: [...favorites, ...dedupedRest],
              favorites
          });
      }
      if (message.command === "runSelectedCommands") {
        const commands: string[] = message.data;
        this._sendCommands(commands);
      }
  
      if (message.command === "addFavorite") {
          const favorites = getFavorites(this._context);
          if (!favorites.includes(message.data)) {
              saveFavorites(this._context, [...favorites, message.data]);
          }
      }
  
      if (message.command === "removeFavorite") {
          const favorites = getFavorites(this._context);
          saveFavorites(this._context, favorites.filter((f: any) => f !== message.data));
      }
  });
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "main.js")
    );
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "vscode.css")
    );
    const stylesheetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "main.css")
    );
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleResetUri}" rel="stylesheet">
  <link href="${styleVSCodeUri}" rel="stylesheet">
  <link href="${stylesheetUri}" rel="stylesheet">
</head>
<body>
  <section class="wrapper">
    <div class="container">
      <h2 class="subtitle">Command History</h2>
<div class="dropdown-wrapper">
  <label for="history-count">Show Last</label>
  <select id="history-count">
    <option value="5" selected>5</option>
    <option value="10">10</option>
    <option value="20">20</option>
    <option value="40">40</option>
    <option value="all">all</option>
  </select>  <label>commands</label>
  <br><input type="text" id="search-box" placeholder="Search commands..." />
</div>
<ul class="checkboxes" id="history-list"></ul>
      <button id="run-button">Run Selected</button>
    </div>
  </section>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
