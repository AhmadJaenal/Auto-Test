const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const WorkspaceChecker = require('../../../../utils/check-workspace');

class TemporaryFileModule {
    constructor() {
        this.workspace = new WorkspaceChecker();
    }
    createTemporaryFileLaravel(content) {
        if (this.workspace.checkWorkspace()) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const projectRoot = workspaceFolders[0].uri.fsPath;
            const temporaryDir = path.join(projectRoot, 'tests', 'Feature');
            const temporaryPath = path.join(temporaryDir, 'TemporaryTest.php');

            if (!fs.existsSync(temporaryDir)) {
                fs.mkdirSync(temporaryDir, { recursive: true });
            }

            fs.writeFile(temporaryPath, content, (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                } else {
                    vscode.window.showInformationMessage('File sementara berhasil dibuat: ' + temporaryPath);
                    console.log(`File sementara berhasil dibuat: ${temporaryPath}`);
                }
            });
        } else {
            console.error('Workspace tidak valid.');
        }
    }
    
    createTemporaryFileDart(content) {
        if (this.workspace.checkWorkspace()) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const projectRoot = workspaceFolders[0].uri.fsPath;
            const temporaryDir = path.join(projectRoot, 'test');
            const temporaryPath = path.join(temporaryDir, 'temporary_test.dart');

            if (!fs.existsSync(temporaryDir)) {
                fs.mkdirSync(temporaryDir, { recursive: true });
            }

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
