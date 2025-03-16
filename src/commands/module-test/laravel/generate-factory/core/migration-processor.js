const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const FactoryGenerator = require('../factory/factory-generator');
const WorkspaceChecker = require('../../../../../utils/check-workspace');

class MigrationProcessor {
    constructor() {
        this.workspace = new WorkspaceChecker();
        this.factory = new FactoryGenerator();
    }

    async getFileNameMigration(modelNames) {
        if (this.workspace.checkWorkspace()) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const projectRoot = workspaceFolders[0].uri.fsPath;
            const migrationDir = path.join(projectRoot, 'database', 'migrations');

            return new Promise((resolve, reject) => {
                fs.readdir(migrationDir, (err, files) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Error reading migration folder: ${err.message}`);
                        return reject(err);
                    }

                    const modelMigrationPairs = [];
                    files.forEach(file => {
                        modelNames.forEach(model => {
                            if (file.toLowerCase().includes(model.toLowerCase())) {
                                modelMigrationPairs.push({ model, file });
                            }
                        });
                    });

                    resolve(modelMigrationPairs);
                });
            });
        } else {
            vscode.window.showErrorMessage('No workspace folder found');
            return [];
        }
    }

    async readMigrationFiles(migrationFile) {
        if (this.workspace.checkWorkspace()) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const projectRoot = workspaceFolders[0].uri.fsPath;
            const migrationPath = path.join(projectRoot, 'database', 'migrations', migrationFile);

            return new Promise((resolve, reject) => {
                fs.readFile(migrationPath, 'utf8', (err, data) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Error reading migration file: ${err.message}`);
                        return reject(err);
                    }

                    const migrationAttributes = data.match(/(\$table->\w+\(['"]\w+['"].*\);)/g);
                    resolve(migrationAttributes || []);
                });
            });
        } else {
            vscode.window.showErrorMessage('No workspace folder found');
            return [];
        }
    }

    async processMigrationAttributes(modelNames) {
        try {
            const modelMigrationPairs = await this.getFileNameMigration(modelNames);
            const readMigrationResponses = await Promise.all(modelMigrationPairs.map(pair => this.readMigrationFiles(pair.file)));

            readMigrationResponses.forEach((atribut, index) => {
                const modelName = modelMigrationPairs[index].model;
                this.factory.createFactoryFile(modelName, atribut);
            });
        } catch (error) {
            console.error('Error processing migration attributes:', error);
            vscode.window.showErrorMessage('An error occurred while processing migration attributes.');
        }
    }
}

module.exports = MigrationProcessor;
