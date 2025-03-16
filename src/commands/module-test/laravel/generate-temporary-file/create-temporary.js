const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const WorkspaceChecker = require('../../../../utils/check-workspace');

class TemporaryFileModule {
    constructor() {
        this.workspace = new WorkspaceChecker();
    }

    createTemporaryFile(content) {
        if (this.workspace.checkWorkspace()) {
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
}

module.exports = TemporaryFileModule;
