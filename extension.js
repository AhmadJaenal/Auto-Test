const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let showDataList = vscode.commands.registerCommand('auto-unit-test.showMyTask', async () => {
		await showMyTask();
	});

	let selectedText = vscode.commands.registerCommand('auto-unit-test.selectedCode', async () => {
		await selectCode();
	})

	context.subscriptions.push(showDataList);
	context.subscriptions.push(selectedText);
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
		placeHolder: 'Select an item'
	})
	if (selectedItem) {
		vscode.window.showInformationMessage(`You selected: ${selectedItem}`);
	} else {
		vscode.window.showInformationMessage('No item selected');
	}
}

async function selectCode() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor found');
		return;
	}

	const selection = editor.selection;
	const selectedText = editor.document.getText(selection);
	if (!selectedText) {
		vscode.window.showErrorMessage('No text selected');
		return;
	}
	vscode.window.showInformationMessage(`Selected text:${selectedText}`);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
