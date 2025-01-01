const vscode = require('vscode');
function checkWorkspace() {
    return !!vscode.workspace.workspaceFolders;
}

module.exports = { checkWorkspace };