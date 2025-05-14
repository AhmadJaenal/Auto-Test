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

    getTabelDatabaseFromModel() {
        return new Promise((resolve, reject) => {
            try {
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders) {
                    vscode.window.showErrorMessage('No workspace folder found');
                    return reject(new Error('No workspace folder found'));
                }

                const projectRoot = workspaceFolders[0].uri.fsPath;
                const modelsDir = path.join(projectRoot, 'app', 'Models');

                const tablePattern = /\$table\s*=\s*['"]([^'"]+)['"]/;
                const modelNamePattern = /class\s+(\w+)\s+extends\s+Model/;

                fs.readdir(modelsDir, (err, files) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Error reading folder Models: ${err.message}`);
                        return reject(err);
                    }

                    const modelTableList = [];
                    const fileReadPromises = files.map(file => {
                        const filePath = path.join(modelsDir, file);
                        return new Promise((resolveFile, rejectFile) => {
                            fs.readFile(filePath, 'utf8', (err, data) => {
                                if (err) {
                                    console.error(`Error reading file ${file}: ${err.message}`);
                                    return rejectFile(err);
                                }

                                const tableMatch = data.match(tablePattern);
                                const modelMatch = data.match(modelNamePattern);

                                if (modelMatch && tableMatch) {
                                    const modelName = modelMatch[1];
                                    const tableName = tableMatch[1];
                                    modelTableList.push(`${modelName} - ${tableName}`);
                                }
                                resolveFile();
                            });
                        });
                    });

                    // Tunggu semua promise file selesai
                    Promise.all(fileReadPromises)
                        .then(() => resolve(modelTableList))
                        .catch(reject);
                });
            } catch (error) {
                vscode.window.showErrorMessage(`Error reading model files: ${error.message}`);
                reject(error);
            }
        });
    }
}

module.exports = ModelFileReader;
