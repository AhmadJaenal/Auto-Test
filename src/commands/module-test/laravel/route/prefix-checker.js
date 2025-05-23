const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const WorkspaceChecker = require('../../../../utils/check-workspace');

class PrefixChecker {
    /**
     * @param {string} checkedSingleRoute satu baris kode route
     * @param {string} data seluruh isi file
     * @returns {Promise<string>} Prefix yang ditemukan (dipisah koma jika lebih dari satu)
     */
    static async checkPrefix(checkedSingleRoute, data) {
        try {
            let prefixesFound = [];

            // 1. Deteksi prefix chaining langsung di 1 baris route
            const routePrefixPattern = /Route::prefix\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
            let matchedDirect;
            while ((matchedDirect = routePrefixPattern.exec(checkedSingleRoute)) !== null) {
                prefixesFound.push(matchedDirect[1]);
            }

            // 2. Deteksi prefix dalam route group
            const groupPattern = /Route::prefix\s*\(\s*(['"])(.*?)\1\s*\)(->middleware\s*\(.*?\))?\s*->group\s*\(\s*function\s*\([^\)]*\)\s*\{\s*([\s\S]*?)\s*\}\s*\);/gs;
            let groupMatch;
            while ((groupMatch = groupPattern.exec(data)) !== null) {
                const prefixValue = groupMatch[2];
                const groupBlock = groupMatch[4];

                if (groupBlock.includes(checkedSingleRoute)) {
                    prefixesFound.push(prefixValue);
                }
            }

            // Hapus duplikat
            prefixesFound = [...new Set(prefixesFound)].filter(Boolean);

            if (prefixesFound.length > 0) {
                vscode.window.showInformationMessage(`Prefix ditemukan: ${prefixesFound.join(', ')}`);
            } else {
                vscode.window.showInformationMessage('Prefix tidak ditemukan.');
            }
            return prefixesFound.join(', ');
        } catch (error) {
            console.error('Error checking prefix:', error);
            vscode.window.showErrorMessage('Terjadi kesalahan saat mencari prefix.');
            return '';
        }
    }

    /**
     * Menjalankan pengecekan prefix untuk 1 baris route tertentu
     * @param {string} route satu baris route
     * @returns {Promise<string>}
     */
    executeCheckPrefix(route) {
        const workspace = new WorkspaceChecker();
        if (workspace.checkWorkspace()) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const projectRoot = workspaceFolders[0].uri.fsPath;
            const routeFilePath = path.join(projectRoot, 'routes', 'web.php');
            return new Promise((resolve, reject) => {
                fs.readFile(routeFilePath, 'utf8', (err, data) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Gagal membaca file route: ${err.message}`);
                        return reject(err);
                    }
                    resolve(PrefixChecker.checkPrefix(route, data));
                });
            });
        } else {
            vscode.window.showErrorMessage('Workspace tidak tersedia.');
            return Promise.resolve('');
        }
    }
}

module.exports = PrefixChecker;
