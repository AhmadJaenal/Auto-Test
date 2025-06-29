const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class GetViews {
    static getPathViews(code) {
        const regexPattern = /return\s+view\(['"]([^'"]+)['"](?:,\s*compact\(['"]([^'"]+)['"]\))?\)/g;
        const views = [];
        let match;

        while ((match = regexPattern.exec(code)) !== null) {
            views.push(match[1]);
        }

        return views;
    }

    static updatePath(pathViews) {
        const views = [];
        for (const pathView of pathViews) {
            const outputString = pathView.replace(/\./g, '/') + '.blade.php';
            views.push(outputString);
        }
        return views;
    }

    static fileExists(filePath) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showInformationMessage('Tidak ada folder dalam workspace.');
            return false;
        }

        const projectRoot = workspaceFolders[0].uri.fsPath;
        // Pastikan menambahkan 'resources/views/' sebelum filePath
        const fullPath = path.join(projectRoot, 'resources', 'views', filePath);
        // vscode.window.showInformationMessage(`full path ${fullPath}`);
        return fs.existsSync(fullPath);
    }

    readFileController(code) {
        const pathViews = GetViews.getPathViews(code);
        const finalPaths = GetViews.updatePath(pathViews);
        const results = [];

        for (const finalPath of finalPaths) {
            const exists = GetViews.fileExists(finalPath);
            const status = exists ? 'file view terdaftar pada proyek jadi unit test harus berhasil' : 'file view tidak terdaftar pada project jadi unit test ';
            results.push([finalPath, status]);
        }

        return results; 
    }
}

module.exports = GetViews;