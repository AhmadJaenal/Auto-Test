const vscode = require('vscode');

const { generateControllerTest } = require('./module-test/laravel/generate-test-case/controller-test-case');

async function selectCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    generateControllerTest(selectedText);
}

module.exports = { selectCode };