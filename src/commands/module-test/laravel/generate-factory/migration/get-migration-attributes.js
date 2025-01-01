const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const { createFactoryFile } = require('../factory/create-factory-file');
const { checkWorkspace } = require('../../../../../utils/check-workspace');

async function getFileNameMigration(modelNames) {
    if (checkWorkspace()) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const projectRoot = workspaceFolders[0].uri.fsPath;
        const migrationDir = path.join(projectRoot, 'database', 'migrations');

        return new Promise((resolve, reject) => {
            fs.readdir(migrationDir, (err, files) => {
                if (err) {
                    vscode.window.showErrorMessage(`Error reading migration folder: ${err.message}`);
                    return reject(err);
                }

                const migrationFiles = files.filter(file => {
                    return modelNames.some(model => file.toLowerCase().includes(model.toLowerCase()));
                });

                if (migrationFiles.length > 0) {
                    // vscode.window.showInformationMessage(`Migration files found: ${migrationFiles.join(', ')}`);
                } else {
                    vscode.window.showInformationMessage('No migration files found for the given model names.');
                }

                resolve(migrationFiles);
            });
        });
    } else {
        vscode.window.showErrorMessage('No workspace folder found');
        return [];
    }
}

async function readMigrationFiles(migrationFile) {
    if (checkWorkspace) {
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
                if (migrationAttributes) {
                    // vscode.window.showInformationMessage(`Migration attributes found: ${migrationAttributes.join(', ')}`);
                    resolve(migrationAttributes);
                } else {
                    vscode.window.showInformationMessage('No migration attributes found in the migration file.');
                    resolve([]);
                }
            });
        });

    } else {
        vscode.window.showErrorMessage('No workspace folder found');
        return [];
    }
}

async function processMigrationAttributes(modelNames) {
    try {
        const migrationFiles = await getFileNameMigration(modelNames);

        const readMigrationResponses = await Promise.all(migrationFiles.map(file => readMigrationFiles(file)));
        readMigrationResponses.forEach((atribut, index) => {
            vscode.window.showInformationMessage(`Kembalian read migration function untuk ${migrationFiles[index]}: ${atribut.join(', ')}`);
            createFactoryFile(modelNames[index], atribut);
        });
    } catch (error) {
        console.error('Error processing migration attributes:', error);
        vscode.window.showErrorMessage('An error occurred while processing migration attributes.');
    }
}



module.exports = { processMigrationAttributes };