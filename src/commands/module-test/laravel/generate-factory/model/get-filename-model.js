const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const { processMigrationAttributes } = require('../migration/get-migration-attributes');

async function getModelFileNames() {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found');
            return [];
        }

        const projectRoot = workspaceFolders[0].uri.fsPath;
        const modelsDir = path.join(projectRoot, 'app', 'Models');

        fs.readdir(modelsDir, (err, files) => {
            if (err) {
                vscode.window.showErrorMessage(`Error membaca folder Models: ${err.message}`);
                return [];
            }

            const modelNames = files
                .filter(file => file.endsWith('.php'))
                .map(file => file.replace('.php', ''));

                processMigrationAttributes(modelNames);

            if (modelNames.length > 0) {
                vscode.window.showInformationMessage(`Model files found: ${modelNames.join(', ')}`);
            } else {
                vscode.window.showInformationMessage('No model files found in the Models folder.');
            }

            return modelNames;
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Error reading model files: ${error.message}`);
    }
}

module.exports = { getModelFileNames };