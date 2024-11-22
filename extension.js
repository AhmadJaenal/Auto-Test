const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let showDataList = vscode.commands.registerCommand('auto-unit-test.showMyTask', async () => {
		await showMyTask();
	});
	context.subscriptions.push(showDataList);
}

async function showMyTask() {
	const dataList = [
		'Tugas membuat fitur login user',
		'Tugas membuat fitur registrasi user',
		'Tugas membuat fitur update profil user',
		'Tugas membuat fitur upload gambar',
		'Tugas membuat fitur reset password',
		'Tugas membuat fitur delete komentar',
	];
	const selectedItem = await vscode.window.showQuickPick(dataList, {
		placeHolder: 'Pilih tugas yang akan dilaporkan'
	})
	if (selectedItem) {
		await selectCode();
	} else {
		vscode.window.showInformationMessage('Tidak ada yang dipilih');
	}
}

function getFileType(document) {
	const openedFileType = document.uri.fsPath.split('.').pop();
	return openedFileType;
}

async function selectCode() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor found');
		return;
	}

	const selection = editor.selection;
	const selectedText = editor.document.getText(selection);
	const fileType = getFileType(editor.document);
	if (!selectedText) {
		vscode.window.showErrorMessage('Tidak ada code yang akan dilaporkan');	
		return;
	}

	const escapedText = escapeHtml(selectedText);

	const panel = vscode.window.createWebviewPanel(
		'createTestPanel', 
		'Laporan Tugas',
		vscode.ViewColumn.One, 
		{}
	);

	panel.webview.html = getWebviewContent(escapedText, fileType);
}



function getWebviewContent(code, fileType) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Webview</title>
        <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #007ACC; }
        </style>
    </head>
    <body>
        <h1>Laporan Tugas</h1>
        <pre><code>${code}</code></pre>
        <pre>File Type ${fileType}</pre>
    </body>
    </html>`;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
