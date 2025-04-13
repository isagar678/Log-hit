// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import { CustomSidebarViewProvider } from './customSidebarViewProvider';
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let logAndHitTerminal = vscode.window.createTerminal({
	name: 'Log-N-Hit'
});

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
			vscode.window.showInformationMessage("🔹Welcome to Log-N-Hit made by Sagar!");
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
	let shell = vscode.env.shell.toLowerCase();
	let historyFilePath: string | undefined;

	if (shell.includes('bash')) {
		// Linux/Mac: Bash history
		historyFilePath = path.join(os.homedir(), '.bash_history');

	} else if (shell.includes('powershell') || shell.includes('pwsh')) {
		// Windows: PowerShell history
		logAndHitTerminal.sendText(`Import-Module PSReadLine`)
		historyFilePath = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'PowerShell', 'PSReadline', 'ConsoleHost_history.txt');
	} else {
		console.warn(`Unknown shell: ${vscode.env.shell}`);
		return [];
	}

	try {
		return fs.readFileSync(historyFilePath, 'utf-8')
			.split(/\r?\n/)
			.filter(line => line.trim() !== '')
			.reverse()
			.slice(0, N);
	} catch (error) {
		console.error(`Failed to read history: ${error}`);
		return [];
	}
}

export function sendCommandsToTerminal(commands:string[]) {
	logAndHitTerminal.show();

	for (let command of commands) {
		logAndHitTerminal.sendText(command)
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
