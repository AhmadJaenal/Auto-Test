const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const WorkspaceChecker = require('../../../../utils/check-workspace');

class RouteChecker {
    getFunctionName(code) {
        const match = code.match(/function\s+([a-zA-Z_]\w*)/);
        return match ? match[1] : null;
    }

    readControllerName() {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const fileName = activeEditor.document.fileName;
            return path.basename(fileName, path.extname(fileName));
        } else {
            vscode.window.showErrorMessage('No active editor found.');
            return null;
        }
    }

    checkRoute(functionCode) {
        const workspace = new WorkspaceChecker();

        if (workspace.checkWorkspace()) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const projectRoot = workspaceFolders[0].uri.fsPath;
            const routeFilePath = path.join(projectRoot, 'routes', 'web.php');

            const functionName = RouteChecker.getFunctionName(functionCode);
            const controllerName = RouteChecker.readControllerName();

            if (controllerName) {
                const routeNamePattern = new RegExp(`Route::(get|post|put|delete)\\(\\s*['"]([^'"]+)['"]\\s*,\\s*\\[${controllerName}::class,\\s*['"]${functionName}['"]\\s*\\](?:\\s*->name\\(['"]([^'"]+)['"]\\))?`, 'g');

                return new Promise((resolve, reject) => {
                    fs.readFile(routeFilePath, 'utf8', (err, data) => {
                        if (err) {
                            vscode.window.showErrorMessage(`Error reading route file: ${err.message}`);
                            return reject(err);
                        }

                        const routes = [];
                        let match;
                        while ((match = routeNamePattern.exec(data)) !== null) {
                            routes.push(match[0]);
                        }

                        if (routes.length > 0) {
                            vscode.window.showInformationMessage(`Route ditemukan ${routes}`);
                            resolve(routes);
                        } else {
                            vscode.window.showErrorMessage(`No routes found for method '${functionName}' in controller '${controllerName}'.`);
                            resolve([]);
                        }
                    });
                });
            } else {
                vscode.window.showErrorMessage('Controller name could not be retrieved.');
                return Promise.resolve([]);
            }
        } else {
            vscode.window.showErrorMessage('No workspace folder found.');
            return Promise.resolve([]);
        }
    }
}

module.exports = RouteChecker;
