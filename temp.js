const vscode = require('vscode');
const os = require('os')
const fs = require('fs')
import { CustomSidebarViewProvider } from './customSidebarViewProvider';
/**
* @param {vscode.ExtensionContext} context
*/
function activate(context) {
    console.log('Extension activated: log-N-hit');
    const sidebarProvider = new SidebarProvider(context.extensionUri);

    let disposable = vscode.commands.registerCommand('log-and-hit.hit', function () {
        vscode.window.showInformationMessage('Hello from log-N-hit!');
        console.log('Command hit executed');
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "myextension-sidebar",
            sidebarProvider
        )
    );

    let hugoTerminal = vscode.window.createTerminal({
        name: 'Log-N-Hit'
    });

    hugoTerminal.show();

    const allFileContents = getAllHistory(10)

    for (let i = 0; i < allFileContents.length; i++) {
        hugoTerminal.sendText(allFileContents[i])
    }

}



function deactivate() { }


function getAllHistory(N) {
    let historyDir
    if ((vscode.env.shell).split('/').at(-1) === 'bash') {
        historyDir = `${os.homedir()}/.bash_history`
    }
    else {
        console.warn('You are in a windows system')
        return
    }

    return fs.readFileSync(historyDir, 'utf-8')
        .split(/\r?\n/)
        .reverse()
        .slice(0, N);
}


module.exports = {
    activate,
    deactivate
};
