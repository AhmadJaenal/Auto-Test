const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const WorkspaceChecker = require('../../../../utils/check-workspace');

class MiddlewareChecker {
    static async checkMiddleware(route, data) {
        try {
            const middlewarePattern = new RegExp(`->middleware\\(\\s*['"]([^'"]+)['"]\\s*\\)`, 'g');

            const groupMiddlewarePattern = new RegExp(
                `Route::middleware\\(([^)]*)\\)\\s*->group\\(\\s*function\\s*\\(\\)\\s*{`,
                'g'
            );

            let match;
            const middlewaresFound = [];
            const middlewareGroup = [];

            while ((match = middlewarePattern.exec(route)) !== null) {
                middlewaresFound.push(match[1]);
            }

            vscode.window.showInformationMessage(`Route yang akan dicari ${route}`)

            while ((match = groupMiddlewarePattern.exec(data)) !== null) {
                const startIndex = match.index;
                let braceCount = 0;
                let endIndex = startIndex;
                let started = false;

                for (let i = startIndex; i < data.length; i++) {
                    const char = data[i];

                    if (char === '{') {
                        braceCount++;
                        started = true;
                    } else if (char === '}') {
                        braceCount--;
                        if (braceCount === 0 && started) {
                            endIndex = i + 1;
                            break;
                        }
                    }
                }

                
                let afterBlockIndex = endIndex;
                while (afterBlockIndex < data.length && data[afterBlockIndex] !== ';') {
                    afterBlockIndex++;
                }
                afterBlockIndex++;

                const fullGroupCode = data.slice(startIndex, afterBlockIndex);
                const middlewareName = match[1];
            
                if (fullGroupCode.includes(route)) {
                    middlewaresFound.push(middlewareName); 
                }
            
                middlewareGroup.push(fullGroupCode);
            }

            if (middlewaresFound.length > 0) {
                vscode.window.showInformationMessage(`Middleware ditemukan: ${middlewaresFound.join(', ')}`);
                return middlewaresFound.join(', ');
            } else {
                vscode.window.showInformationMessage(`Middleware tidak ditemukan untuk route: ${route}`);
                return middlewaresFound.join(', ');
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
