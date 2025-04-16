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
let shell = vscode.env.shell.toLowerCase();

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "vscode-extension-sidebar-html" is now active!');

	// Check if PowerShell history configuration is already set
	const alreadySet = context.globalState.get<boolean>('historyConfigured');
	if (!alreadySet && (shell.includes('powershell') || shell.includes('pwsh'))) {
		ensurePowerShellHistoryBehavior().then(success => {
			if (success) {
				context.globalState.update('historyConfigured', true);
			}
		});
	}

	// Register the custom sidebar view
	const sidebarProvider = new CustomSidebarViewProvider(
		context.extensionUri,
		sendCommandsToTerminal
	);

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
	let historyFilePath: string | undefined;

	if (shell.includes('bash')) {
		// Linux/Mac: Bash history
		for (const terminal of vscode.window.terminals) {
			terminal.sendText('history -a')
		}

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
			.filter(line => line.trim() !== '' && line!=='history -a')
			.reverse()
			.slice(0, N);
	} catch (error) {
		console.error(`Failed to read history: ${error}`);
		return [];
	}
}

export function sendCommandsToTerminal(commands: string[]) {
	logAndHitTerminal.show();

	for (let command of commands) {
		logAndHitTerminal.sendText(command)
	}
	if (shell.includes('bash')) {
		logAndHitTerminal.sendText(`history -a`)
	}
}

function ensurePowerShellHistoryBehavior(): Promise<boolean> {
	return new Promise(resolve => {
		const profilePath = path.join(os.homedir(), 'Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1');
		const historyLine = `Set-PSReadLineOption -HistorySaveStyle SaveIncrementally -HistorySavePath (Get-PSReadLineOption).HistorySavePath`;

		vscode.window.showInformationMessage(
			"Do you want to enable real-time PowerShell command history saving?",
			"Yes", "No"
		).then(answer => {
			if (answer === "Yes") {
				try {
					if (!fs.existsSync(profilePath)) {
						fs.mkdirSync(path.dirname(profilePath), { recursive: true });
						fs.writeFileSync(profilePath, '', 'utf-8');
					}

					const currentContent = fs.readFileSync(profilePath, 'utf-8');

					if (!currentContent.includes(historyLine)) {
						fs.appendFileSync(profilePath, `\n${historyLine}\n`, 'utf-8');
						vscode.window.showInformationMessage("✅ PowerShell profile updated. Restart your terminal to apply changes.");
					} else {
						vscode.window.showInformationMessage("ℹ️ History saving is already enabled.");
					}

					resolve(true);
				} catch (error) {
					vscode.window.showErrorMessage("Failed to update PowerShell profile: " + error);
					resolve(false);
				}
			} else {
				vscode.window.showInformationMessage("Skipped enabling PowerShell history saving.");
				resolve(false);
			}
		});
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
