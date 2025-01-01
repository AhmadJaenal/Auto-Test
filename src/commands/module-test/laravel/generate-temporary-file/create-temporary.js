const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const { checkWorkspace } = require('../../../../utils/check-workspace');

function createTemporaryFile(content) {
    if (checkWorkspace()) {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        const projectRoot = workspaceFolders[0].uri.fsPath;
        const temporaryDir = path.join(projectRoot, 'tests', 'Feature');
        const temporaryPath = path.join(temporaryDir, 'TemporaryTest.php');

        // Create directory if not exists
        if (!fs.existsSync(temporaryDir)) {
            fs.mkdirSync(temporaryDir, { recursive: true });
        }

        // Create file
        fs.writeFile(temporaryPath, content, (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log(`File sementara berhasil dibuat: ${temporaryPath}`);
            }
        });

    } else {
        console.error('Workspace tidak valid.');
    }
}

module.exports = { createTemporaryFile };