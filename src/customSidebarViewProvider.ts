import * as vscode from "vscode";
import { getAllHistory } from "./extension";

export class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vscodeSidebar.openview";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri,
     private readonly _sendCommands: (commands: string[]) => void
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // Set the HTML content
    webviewView.webview.html = this.getHtmlContent(webviewView.webview);

    // Send the data to the webview after it's ready
    const allFileContents = getAllHistory(10);

    webviewView.webview.onDidReceiveMessage(message => {
      if (message.command === "requestData") {
        webviewView.webview.postMessage({
          command: "sendData",
          data: allFileContents
        });
      }
      if (message.command === "runSelectedCommands") {
        const commands: string[] = message.data;
        this._sendCommands(commands); // this will call sendCommandsToTerminal from extension.ts
      }
      
    });
  }


  private getHtmlContent(webview: vscode.Webview): string {
    // Get the local path to main script run in the webview,
    // then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "main.js")
    );

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "vscode.css")
    );

    // Same for stylesheet
    const stylesheetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "main.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link href="${styleResetUri}" rel="stylesheet">
  <link href="${styleVSCodeUri}" rel="stylesheet">
  <link href="${stylesheetUri}" rel="stylesheet">
</head>
<body>
  <section class="wrapper">
    <div class="container">
      <h2 class="subtitle">Command History</h2>
      <ul id="history-list"></ul>
      <button id="run-button">Run Selected</button>
    </div>
  </section>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const selectedCommands = [];

    vscode.postMessage({ command: "requestData" });

    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "sendData") {
        const list = document.getElementById("history-list");
        message.data.forEach((cmd, index) => {
          const li = document.createElement("li");
          li.innerHTML = \`
            <input type="checkbox" id="cmd_\${index}" data-cmd="\${cmd}">
            <label for="cmd_\${index}">\${cmd}</label>
          \`;
          list.appendChild(li);

          const checkbox = li.querySelector("input");
          checkbox.addEventListener("change", (e) => {
            const command = e.target.getAttribute("data-cmd");
            if (e.target.checked) {
              selectedCommands.push(command);
            } else {
              const idx = selectedCommands.indexOf(command);
              if (idx > -1) selectedCommands.splice(idx, 1);
            }
          });
        });
      }
    });

    document.getElementById("run-button").addEventListener("click", () => {
      vscode.postMessage({
        command: "runSelectedCommands",
        data: selectedCommands
      });
    });
  </script>
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
