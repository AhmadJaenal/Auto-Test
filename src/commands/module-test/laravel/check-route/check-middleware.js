const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const { checkWorkspace } = require('../../../../utils/check-workspace');


function hasMiddleware(route) {
    return route.includes('middleware');
}

async function checkMiddleware(route, data) {
    try {
        const middlewarePattern = /->middleware\(\s*['"]([^'"]+)['"]\s*\)/g;
        const groupMiddlewarePattern = /Route::middleware\(\s*['"]([^'"]+)['"]\)\s*->group\(\s*function\s*\(\)\s*{([^]*)}/g; // Menggunakan [^]* untuk menangkap blok penuh
        const methodPattern = /(Route::(get|post|put|delete|patch|options)\s*\(\s*['"]([^'"]+)['"]\s*,)/g;

        let match;
        const middlewaresFound = [];

        // Langsung cek middleware di route
        while ((match = middlewarePattern.exec(route)) !== null) {
            middlewaresFound.push(match[1]); // Simpan middleware yang ditemukan
        }

        // Jika tidak ditemukan middleware langsung, periksa grup middleware
        if (middlewaresFound.length === 0) {
            let groupMatch;
            while ((groupMatch = groupMiddlewarePattern.exec(data)) !== null) {
                const middlewareGroup = groupMatch[1];
                const groupRoutes = groupMatch[2];

                // Cek semua route dalam grup
                let innerMatch;
                while ((innerMatch = methodPattern.exec(groupRoutes)) !== null) {
                    const groupRoute = innerMatch[3]; // Ambil route dari grup

                    // Periksa jika route yang diberikan ada dalam grup
                    if (route.includes(groupRoute)) {
                        middlewaresFound.push(middlewareGroup); // Simpan middleware grup
                    }
                }
            }
        }

        // Tampilkan hasil
        if (middlewaresFound.length > 0) {
            vscode.window.showInformationMessage(`Middleware ditemukan: ${middlewaresFound.join(', ')}`);
            return middlewaresFound.join(', ');
        } else {
            vscode.window.showInformationMessage(`${route} yang dicari tidak ditemukan`);
            return middlewaresFound.join(', ');
        }
    } catch (error) {
        console.error('Error checking middleware:', error);
        vscode.window.showErrorMessage('An error occurred while checking middleware.');
        return false;
    }
}
function executeCheckMiddleware(route) {
    if (checkWorkspace()) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const projectRoot = workspaceFolders[0].uri.fsPath;
        const routeFilePath = path.join(projectRoot, 'routes', 'web.php');

        return new Promise((resolve, reject) => {
            fs.readFile(routeFilePath, 'utf8', (err, data) => {
                if (err) {
                    vscode.window.showErrorMessage(`Error reading route file: ${err.message}`);
                    return reject(err);
                }

                resolve(checkMiddleware(route, data));
            });
        });
    }
}

module.exports = { executeCheckMiddleware };

