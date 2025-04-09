// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import { CustomSidebarViewProvider } from './customSidebarViewProvider';
import * as os from 'os'
import * as fs from 'fs'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "vscode-extension-sidebar-html" is now active!');

	const sidebarProvider = new CustomSidebarViewProvider(
		context.extensionUri,
		sendCommandsToTerminal
	);

	// Register the custom sidebar view
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			CustomSidebarViewProvider.viewType,
			sidebarProvider
		)
	);

	// Command: when the menu/title of the extension is clicked
	context.subscriptions.push(
		vscode.commands.registerCommand("vscodeSidebar.menu.view", () => {
			vscode.window.showInformationMessage("🔹 Extension menu clicked!");
		})
	);

	// Command: open the sidebar view manually
	context.subscriptions.push(
		vscode.commands.registerCommand("vscodeSidebar.openview", () => {
			vscode.window.showInformationMessage(
				'Command "Sidebar View [vscodeSidebar.openview]" executed.'
			);
		})
	);
}

export function getAllHistory(N: number): string[] {
	let historyDir;
	if ((vscode.env.shell).split('/').at(-1) === 'bash') {
		historyDir = `${os.homedir()}/.bash_history`;
	} else {
		console.warn('You are in a windows system');
		return [];
	}

	return fs.readFileSync(historyDir, 'utf-8')
		.split(/\r?\n/)
		.reverse()
		.slice(0, N);
}

export function sendCommandsToTerminal(commands:string[]) {
	let logAndHitTerminal = vscode.window.createTerminal({
		name: 'Log-N-Hit'
	});

	logAndHitTerminal.show();

	for (let i = 0; i < commands.length; i++) {
		logAndHitTerminal.sendText(commands[i])
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
