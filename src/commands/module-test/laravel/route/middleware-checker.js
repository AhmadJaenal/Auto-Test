const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const WorkspaceChecker = require('../../../../utils/check-workspace');

class MiddlewareChecker {
    /**
     * Mengecek middleware yang ada pada sebuah route dan seluruh group.
     * @param {string} checkedSingleRoute satu baris code route dari laravel
     * @param {string} data seluruh isi file routes (web.php)
     * @returns {Promise<string>} Daftar middleware yang ditemukan (dipisah koma)
     */
    static async checkMiddleware(checkedSingleRoute, data) {
        try {
            let middlewaresFound = [];

            // vscode.window.showInformationMessage(`route yang akan di test ${checkedSingleRoute}`);

            const routeMiddlewarePattern = /->middleware\s*\(\s*(\[[^\)]*\]|'[^']*'|"[^"]*")\s*\)/g;
            let matchedRoute;

            while ((matchedRoute = routeMiddlewarePattern.exec(checkedSingleRoute)) !== null) {
                let raw = matchedRoute[1].trim();

                // Jika array, misalnya ['auth', 'verified']
                if (raw.startsWith('[') && raw.endsWith(']')) {
                    raw = raw.slice(1, -1); // hapus tanda kurung siku
                    const names = raw.split(',').map(t => t.replace(/['"\s]/g, '').trim()).filter(Boolean);
                    middlewaresFound.push(...names);
                } else {
                    // Satuan: 'auth' atau "auth"
                    middlewaresFound.push(raw.replace(/['"]/g, '').trim());
                }
            }

            // vscode.window.showInformationMessage(`Route yang akan dicari: ${checkedSingleRoute}`);

            // ---- 2. Cek seluruh group middleware ----
            // Route::middleware(['guest', 'web'])->group(function () { ... });
            const groupPattern = /Route::middleware\s*\(\s*(\[.*?\]|'[^']*'|"[^"]*")\s*\)\s*->group\s*\(\s*function\s*\([^\)]*\)\s*\{\s*/gs;
            let groupMatch;

            while ((groupMatch = groupPattern.exec(data)) !== null) {
                let groupMiddlewareRaw = groupMatch[1];
                // get nama middleware di group
                groupMiddlewareRaw = groupMiddlewareRaw.replace(/[\[\]'" ]/g, '');
                let groupMiddlewares = groupMiddlewareRaw.split(',').filter(Boolean);

                // Cari isi blok function group
                let groupStart = groupMatch.index + groupMatch[0].length - 1;
                let braceCount = 1;
                let groupEnd = groupStart;
                while (braceCount > 0 && groupEnd < data.length - 1) {
                    groupEnd++;
                    if (data[groupEnd] === '{') braceCount++;
                    else if (data[groupEnd] === '}') braceCount--;
                }
                let groupCodeBlock = data.slice(groupStart + 1, groupEnd);

                // Apakah checkedSingleRoute ada dalam group ini?
                if (groupCodeBlock.includes(checkedSingleRoute)) {
                    middlewaresFound.push(...groupMiddlewares);
                }
            }

            // ---- 3. Unikkan hasil (hilangkan duplikat) ----
            middlewaresFound = [...new Set(middlewaresFound)].filter(Boolean);

            if (middlewaresFound.length > 0) {
                vscode.window.showInformationMessage(`Middleware ditemukan: ${middlewaresFound.join(', ')}`);
                return middlewaresFound.join(', ');
            } else {
                vscode.window.showInformationMessage(`Middleware tidak ditemukan untuk route: ${checkedSingleRoute}`);
                return '';
            }
        } catch (error) {
            console.error('Error checking middleware:', error);
            vscode.window.showErrorMessage('An error occurred while checking middleware.');
            return false;
        }
    }

    executeCheckMiddleware(route) {
        const workspace = new WorkspaceChecker();
        if (workspace.checkWorkspace()) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const projectRoot = workspaceFolders[0].uri.fsPath;
            const routeFilePath = path.join(projectRoot, 'routes', 'web.php');

            return new Promise((resolve, reject) => {
                fs.readFile(routeFilePath, 'utf8', (err, data) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Error reading route file: ${err.message}`);
                        return reject(err);
                    }
                    resolve(MiddlewareChecker.checkMiddleware(route, data));
                });
            });
        }
    }
}

module.exports = MiddlewareChecker;