const vscode = require('vscode');

class WorkspaceChecker {
    checkWorkspace() {
        return !!vscode.workspace.workspaceFolders;
    }
}

module.exports = WorkspaceChecker;
