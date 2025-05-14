const vscode = require('vscode');
const path = require('path');

class WorkspaceChecker {
    checkWorkspace() {
        return !!vscode.workspace.workspaceFolders;
    }

    detectLanguageOrFramework() {
        const activeTextEditor = vscode.window.activeTextEditor;
       
        if(activeTextEditor) {
            const filePath = activeTextEditor.document.uri.fsPath;
            const fileExtension = path.extname(filePath).toLowerCase();

            switch(fileExtension) {
                case '.dart':
                    return 'Dart';
                case '.php':
                    return 'PHP';
                default:
                    return 'Bahasa pemrograman tidak terdeteksi';
            }
        }
    }
}

module.exports = WorkspaceChecker;
