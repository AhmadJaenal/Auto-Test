const vscode = require('vscode');
const path = require('path');
const { exec } = require('child_process');
const { checkWorkspace } = require('../../../../utils/check-workspace');

function runUnitTestLaravel() {
    if (!checkWorkspace()) {
        vscode.window.showInformationMessage('Workspace tidak valid.');
        console.error('Workspace tidak valid.');
        return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showInformationMessage('Tidak ada folder workspace yang aktif.');
        console.error('Tidak ada folder workspace yang aktif.');
        return;
    }

    const projectRoot = workspaceFolders[0].uri.fsPath;
    const testFeatureDir = path.join(projectRoot, 'tests', 'Feature', 'TemporaryTest.php');

    // Running unit test with php artisan
    const command = `php artisan test ${testFeatureDir}`;

    exec(command, { cwd: projectRoot }, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Error: ${stderr}`);
            console.error(`Error: ${error.message}`);
            return;
        }

        // Debug with console.log
        const outputChannel = vscode.window.createOutputChannel('Laravel Unit Test');
        outputChannel.show();
        outputChannel.appendLine(stdout);
        outputChannel.appendLine('Unit test selesai.');
    });
}

module.exports = { runUnitTestLaravel };