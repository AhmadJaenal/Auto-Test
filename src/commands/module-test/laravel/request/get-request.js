const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const WorkspaceChecker = require('../../../../utils/check-workspace');

class RequestProcessor {
    static getRequestNames(code) {
        const requestPattern = /\b([A-Za-z0-9_]+Request)\b(?!\s*\()/g;
        const matches = [...code.matchAll(requestPattern)];

        const names = matches.map(m => m[1]);

        return [...new Set(names)];
    }

    static getPath() {
        const workspaceChecker = new WorkspaceChecker();

        if (workspaceChecker.checkWorkspace) {
            const activeTextEditor = vscode.window.activeTextEditor;
            if (activeTextEditor) {
                const filePath = activeTextEditor.document.uri.fsPath;
                return filePath;
            }
        }
    }

    static readFileController() {
        const filePath = RequestProcessor.getPath();
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return fileContent;
    }

    static getPathRequest(code) {
        const requestNames = RequestProcessor.getRequestNames(code);
        const fileContent = RequestProcessor.readFileController();

        if (!requestNames || requestNames.length === 0) {
            vscode.window.showInformationMessage(`Tidak ada request ditemukan di dalam function.`);
            return null;
        }

        const foundPaths = [];

        for (const requestName of requestNames) {
            const rescapedRequestName = requestName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            const requestPattern = new RegExp(
                `use\\s+(App\\\\Http\\\\Requests(?:\\\\[A-Za-z0-9_]+)*\\\\${rescapedRequestName})\\s*;`,
                'g'
            );

            let match;
            while ((match = requestPattern.exec(fileContent)) !== null) {
                foundPaths.push(match[1]);
            }
        }

        if (foundPaths.length > 0) {
            // vscode.window.showInformationMessage(`Semua path request ditemukan: ${foundPaths.join(', ')}`);
            return foundPaths;
        }

        vscode.window.showInformationMessage(`Tidak ada path request ditemukan untuk request: ${requestNames.join(', ')}`);
        return null;
    }


    static extractRules(code) {
        const match = code.match(/public function rules\(\)\s*:\s*array\s*\{\s*return\s*\[\s*([\s\S]*?)\s*\];\s*\}/);
        if (!match) return null;

        return match[0];
    }

    readRequestFile(code) {
        const requestPaths = RequestProcessor.getPathRequest(code);
        if (!requestPaths || requestPaths.length === 0) {
            vscode.window.showErrorMessage('Tidak ada path request ditemukan.');
            return [];
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder found');
            return [];
        }

        const projectRoot = workspaceFolders[0].uri.fsPath;

        for (const requestNamespace of requestPaths) {
            const relativePath = requestNamespace
                .replace(/^App\\/, '')        // hapus prefix App\
                .replace(/\\/g, path.sep)     // ganti \ dengan /
                + '.php';

            const fullPath = path.join(projectRoot, 'app', relativePath);

            if (fs.existsSync(fullPath)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const attributes = RequestProcessor.extractRules(content);
                    // vscode.window.showInformationMessage(`Atribut : ${attributes}`)
                    return attributes;
                } catch (err) {
                    vscode.window.showErrorMessage(`Gagal membaca file:\n${fullPath}\n\n${err.message}`);
                    return [];
                }
            } else {
                vscode.window.showWarningMessage(`File tidak ditemukan: ${fullPath}`);
            }
        }
        return [];
    }
}

module.exports = RequestProcessor;
