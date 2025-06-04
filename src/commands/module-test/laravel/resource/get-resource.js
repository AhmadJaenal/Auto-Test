const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const WorkspaceChecker = require('../../../../utils/check-workspace');

class ResourceProcessor {
    static getResourceNames(code) {
        const resourcePattern = /\b([A-Za-z0-9_]+Resource)\b/g;
        const matches = [...code.matchAll(resourcePattern)];

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
        const filePath = ResourceProcessor.getPath();
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return fileContent;
    }

    static getPathResource(code) {
        const resourceNames = ResourceProcessor.getResourceNames(code);
        const fileContent = ResourceProcessor.readFileController();

        if (!resourceNames || resourceNames.length === 0) {
            vscode.window.showInformationMessage(`Tidak ada resource ditemukan di dalam function.`);
            return null;
        }

        // vscode.window.showInformationMessage(`Resource yang ditemukan: ${resourceNames.join(', ')}`);

        const foundPaths = [];

        for (const resourceName of resourceNames) {
            const rescapedResourceName = resourceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            const resourcePattern = new RegExp(
                `use\\s+(App\\\\Http\\\\Resources(?:\\\\[A-Za-z0-9_]+)*\\\\${rescapedResourceName})\\s*;`,
                'g'
            );

            let match;
            while ((match = resourcePattern.exec(fileContent)) !== null) {
                foundPaths.push(match[1]);
            }
        }

        if (foundPaths.length > 0) {
            // vscode.window.showInformationMessage(`Semua path resource ditemukan: ${foundPaths.join(', ')}`);
            return foundPaths;
        }

        vscode.window.showInformationMessage(`Tidak ada path resource ditemukan untuk resource: ${resourceNames.join(', ')}`);
        return null;
    }

    static extractFunction(code) {
        const match = code.match(/public function toArray\(\s*Request\s*\$request\)\s*:\s*array\s*\{\s*return\s*\[\s*([\s\S]*?)\s*\];\s*\}/);
        if (!match) return null;

        return match[0];
    }


    readResourceFile(code) {
        const resourcePaths = ResourceProcessor.getPathResource(code);
        if (!resourcePaths || resourcePaths.length === 0) {
            vscode.window.showErrorMessage('Tidak ada path resource ditemukan.');
            return [];
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder found');
            return [];
        }

        const projectRoot = workspaceFolders[0].uri.fsPath;

        for (const resourceNamespace of resourcePaths) {
            const relativePath = resourceNamespace
                .replace(/^App\\/, '')        // hapus prefix App\
                .replace(/\\/g, path.sep)     // ganti \ dengan /
                + '.php';

            const fullPath = path.join(projectRoot, 'app', relativePath);

            if (fs.existsSync(fullPath)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    // vscode.window.showInformationMessage(`Isi file: ${fullPath}`);
                    const attributes = ResourceProcessor.extractFunction(content);
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

module.exports = ResourceProcessor;
