// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import { CustomSidebarViewProvider } from './customSidebarViewProvider';
import * as os from 'os'
import * as fs from 'fs'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Console diagnostic information (console.log) and errors (console.error)
	// Will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-extension-sidebar-html" is active!');

	const provider = new CustomSidebarViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			CustomSidebarViewProvider.viewType,
		  provider
		)
	  );

	  context.subscriptions.push(
		vscode.commands.registerCommand("vscodeSidebar.menu.view", () => {
		  const message = "Menu/Title of extension is clicked !";
		  vscode.window.showInformationMessage(message);
		})
	  );

	// Command has been defined in the package.json file
	// Provide the implementation of the command with registerCommand
	// CommandId parameter must match the command field in package.json
	let openWebView = vscode.commands.registerCommand('vscodeSidebar.openview', () => {
		// Display a message box to the user
		vscode.window.showInformationMessage('Command " Sidebar View [vscodeSidebar.openview] " called.');
	});

	context.subscriptions.push(openWebView);
}

export function getAllHistory(N: number): string[] {
	const os = require('os');
	const fs = require('fs');

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


// this method is called when your extension is deactivated
export function deactivate() {}
