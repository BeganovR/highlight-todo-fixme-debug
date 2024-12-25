// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	console.log('The "Highlight TODO, FIXME, DEBUG" extension is now active!');

	// Keywords to highlight
	const keywords = ['TODO', 'FIXME', 'DEBUG'];
	const decorationTypes = keywords.reduce((acc, keyword) => {
		acc[keyword] = vscode.window.createTextEditorDecorationType({
			backgroundColor: keyword === 'TODO' ? 'rgba(255, 223, 186, 0.3)' :
				keyword === 'FIXME' ? 'rgba(255, 186, 186, 0.3)' :
					'rgba(186, 225, 255, 0.3)',
			borderRadius: '3px'
		});
		return acc;
	}, {});

	function updateDecorations() {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const text = editor.document.getText();

		keywords.forEach(keyword => {
			const regex = new RegExp(`\\b${keyword}\\b`, 'g');
			const matches = [];
			let match;
			while ((match = regex.exec(text)) !== null) {
				const startPos = editor.document.positionAt(match.index);
				const endPos = editor.document.positionAt(match.index + match[0].length);
				matches.push({ range: new vscode.Range(startPos, endPos) });
			}
			editor.setDecorations(decorationTypes[keyword], matches);
		});
	}

	// Listeners for document and editor changes
	vscode.window.onDidChangeActiveTextEditor(updateDecorations, null, context.subscriptions);
	vscode.workspace.onDidChangeTextDocument(updateDecorations, null, context.subscriptions);

	// Trigger decorations on activation
	updateDecorations();

	// Register the search command
	const searchCommand = vscode.commands.registerCommand('highlight-todo-fixme-debug.searchKeywords', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const text = editor.document.getText();
		const results = keywords.map(keyword => {
			const regex = new RegExp(`\\b${keyword}\\b`, 'g');
			const matches = [];
			let match;
			while ((match = regex.exec(text)) !== null) {
				const startPos = editor.document.positionAt(match.index);
				matches.push({ keyword, line: startPos.line + 1, text: match[0] });
			}
			return matches;
		}).flat();

		if (results.length > 0) {
			const message = results.map(r => `${r.keyword} on line ${r.line}: ${r.text}`).join('\n');
			vscode.window.showInformationMessage(message);
		} else {
			vscode.window.showInformationMessage('No keywords found.');
		}
	});

	context.subscriptions.push(searchCommand);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
