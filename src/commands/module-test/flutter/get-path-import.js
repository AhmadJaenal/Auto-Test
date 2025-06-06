const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

class PathImportDart {
  getActiveFilePath() {
    const editor = vscode.window.activeTextEditor;

    if (editor && editor.document) {
      const filePath = editor.document.uri.fsPath;
      return filePath;
    } else {
      vscode.window.showWarningMessage('No active file is open.');
    }
  }

  readFileModel(modelName) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const projectRoot = workspaceFolders[0].uri.fsPath;
      const modelDir = path.join(projectRoot, 'lib/models/', `${modelName}.dart`);
      vscode.window.showInformationMessage('Workspace path: ' + modelDir);

      try {
        const code = fs.readFileSync(modelDir, 'utf8');
        // vscode.window.showInformationMessage(`Code file model: ${code}`);
        return code;
      } catch (err) {
        vscode.window.showErrorMessage(`Error reading file: ${err.message}`);
        return null;
      }
    } else {
      vscode.window.showErrorMessage('No workspace folder found');
      return null;
    }
  }

  getAtributModel(code) {
    // vscode.window.showInformationMessage(`Code model yang diterima: ${code}`);

    // Regex untuk mengambil nama atribut
    const regex = /['"](\w+)['"]/g;
    const attributes = [];
    let match;

    // Mencari semua atribut
    while ((match = regex.exec(code)) !== null) {
      attributes.push(match[1]); // Menyimpan nama atribut
    }

    vscode.window.showInformationMessage(`Atribut yang ditemukan: ${attributes.join(', ')}`);

    return attributes;
  }

}

module.exports = PathImportDart;