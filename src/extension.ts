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
		sendCommandsToTerminal,
		context
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

export function getFavorites(context:any) {
    return context.globalState.get('favorites', []);
}

export function saveFavorites(context:any, favorites:any) {
    return context.globalState.update('favorites', favorites);
}

function readAllLinesUnique(filePath: string, N?: number): string[] {
	const lines = fs.readFileSync(filePath, 'utf8')
		.split(/\r?\n/)
		.map(l => l.trim())
		.filter(Boolean);

	const seen = new Set<string>();
	const unique: string[] = [];

	for (const line of lines) {
		if (!seen.has(line)) {
			seen.add(line);
			unique.push(line);
		}
	}

	if (typeof N === 'number') {
		return unique.slice(-N).reverse();
	}else{
		unique.reverse()
	}

	return unique;
}


export function getAllHistory(N: number | string): string[] {
	let historyFilePath: string | undefined;
	const shell = vscode.env.shell.toLowerCase();

	if (shell.includes('bash')) {
		historyFilePath = path.join(os.homedir(), '.bash_history');
	} else if (shell.includes('powershell') || shell.includes('pwsh')) {
		historyFilePath = path.join(
			os.homedir(),
			'AppData',
			'Roaming',
			'Microsoft',
			'Windows',
			'PowerShell',
			'PSReadline',
			'ConsoleHost_history.txt'
		);
	} else {
		console.warn(`Unknown shell: ${vscode.env.shell}`);
		return [];
	}

	if (!historyFilePath || !fs.existsSync(historyFilePath)) {
		console.warn(`History file not found: ${historyFilePath}`);
		return [];
	}

	try {
		const count = typeof N === 'string' ? parseInt(N) : N;
		if (!isNaN(count)) {
			return readAllLinesUnique(historyFilePath, count);
		} else {
			return readAllLinesUnique(historyFilePath);
		}
	} catch (error) {
		console.error(`Failed to read history file: ${error}`);
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
					vscode.window.terminals[0]?.sendText(`Import-Module PSReadLine`);

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
