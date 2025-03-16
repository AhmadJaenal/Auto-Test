const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const MigrationProcessor = require('./migration-processor');

class ModelFileReader {
    constructor() {
        this.migration = new MigrationProcessor();
    }

    async getModelFileNames() {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder found');
                return [];
            }

            const projectRoot = workspaceFolders[0].uri.fsPath;
            const modelsDir = path.join(projectRoot, 'app', 'Models');

            return new Promise((resolve, reject) => {
                fs.readdir(modelsDir, (err, files) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Error membaca folder Models: ${err.message}`);
                        return reject(err);
                    }

                    const modelNames = files
                        .filter(file => file.endsWith('.php'))
                        .map(file => file.replace('.php', ''));

                    this.migration.processMigrationAttributes(modelNames);

                    if (modelNames.length > 0) {
                        vscode.window.showInformationMessage(`Model files found: ${modelNames.join(', ')}`);
                    } else {
                        vscode.window.showInformationMessage('No model files found in the Models folder.');
                    }

                    resolve(modelNames);
                });
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error reading model files: ${error.message}`);
        }
    }
}

module.exports = ModelFileReader;
