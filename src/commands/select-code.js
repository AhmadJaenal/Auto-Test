const vscode = require('vscode');

const { getWebviewContent, escapeHtml } = require('./web-view');
const { getFileType, analyzeCode } = require('./check-code');

async function selectCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    const fileType = getFileType(editor.document);
    const analyzedCode = analyzeCode(selectedText, fileType);
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

    panel.webview.html = getWebviewContent(escapedText, fileType, analyzedCode);
}

module.exports = { selectCode };