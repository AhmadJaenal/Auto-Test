const vscode = require('vscode');

class WorkspaceChecker {
    static checkWorkspace() {
        return !!vscode.workspace.workspaceFolders;
    }
}

module.exports = WorkspaceChecker;
