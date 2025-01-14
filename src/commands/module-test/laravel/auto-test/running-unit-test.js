const vscode = require('vscode');
const { exec } = require('child_process');

const { getWebviewContent, escapeHtml } = require('../../../web-view');

async function runUnitTestLaravel() {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found');
        }

        const projectRoot = workspaceFolders[0].uri.fsPath;

        const outputChannel = vscode.window.createOutputChannel('Laravel Unit Test');
        outputChannel.show();
        outputChannel.appendLine('Menjalankan unit test dengan php artisan...');

        const command = `cd "${projectRoot}" && php artisan test --filter=TemporaryTest`;

        exec(command, (error, stdout, stderr) => {
            if (stdout) outputChannel.appendLine(stdout);
            if (stderr) outputChannel.appendLine(stderr);

            const panel = vscode.window.createWebviewPanel(
                'createTestPanel',
                'Laporan Tugas',
                vscode.ViewColumn.One,
                {}
            );
    
            panel.webview.html = getWebviewContent(stdout, 'fileType', 'analyzedCode');

            if (error) {
                outputChannel.appendLine(`Eksekusi test gagal: ${error.message}`);
            } else {
                outputChannel.appendLine('Test berhasil dijalankan');
            }
        });

    } catch (error) {
        vscode.window.showErrorMessage(`Error dalam runUnitTest: ${error.message}`);
    }
}

module.exports = {
    runUnitTestLaravel
};