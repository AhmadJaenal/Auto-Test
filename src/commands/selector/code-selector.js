const vscode = require('vscode');
const GenerateTestModule = require('../module-test/laravel/generate-test-case/generate-test-case');

const RouteChecker = require('../module-test/laravel/route/route-checker');
const MiddlewareChecker = require('../module-test/laravel/route/middleware-checker');

const MigrationProcessor = require('../module-test/laravel/generate-factory/core/migration-processor');
const ResourceProcessor = require('../module-test/laravel/resource/get-resource');

const WorkspaceChecker = require('../../utils/check-workspace');
const PathImportDart = require('../module-test/flutter/get-path-import');
const ModelFileReader = require('../module-test/laravel/generate-factory/core/model-file-reader');

class CodeSelector {
    static isFunctionDart(code) {
        const functionPattern = /(\w+\s*\(.*?\)\s*{)/g;
        return functionPattern.test(code);
    }

    static getModelInFunction(code) {
        const modelPattern = /(\b\w+)\s*\.fromJson\s*\(/g;
        const match = modelPattern.exec(code);

        if (match) {
            return match[1].toLowerCase();
        }
        return null;
    }

    static getExtNameWorkspace() {
        const workSpaceFolder = new WorkspaceChecker();
        const extName = workSpaceFolder.detectLanguageOrFramework();
        return extName;
    }

    static isFunctionLaravel(code) {
        const functionPattern = /public\s+function\s+\w+\s*\(/;
        return functionPattern.test(code);
    }

    static getLaravelModelName(code) {
        const modelPattern = /class\s+([a-zA-Z0-9_]+)\s+extends\s+Model/;
        const match = code.match(modelPattern);

        if (match) {
            return match[1];
        }
        return null;
    }


    static getUsedModels(code) {
        const modelUsagePattern = /\b([A-Z][a-zA-Z0-9_]*)::/g;
        const models = [];
        let match;

        while ((match = modelUsagePattern.exec(code)) !== null) {
            models.push(match[1]);
        }
        
        return [...new Set(models)];
    }

    async selectCode({ isApiController = false }) {
        const createUnitTest = new GenerateTestModule();
        const migrationProcessor = new MigrationProcessor();
        const resourceProcessor = new ResourceProcessor();
        const modelFileReader = new ModelFileReader();

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            // return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('Pilih kode yang akan di test!');
            // return;
        }

        const selectedText = editor.document.getText(selection);

        const isFunction = CodeSelector.isFunctionLaravel(selectedText);

        const extName = CodeSelector.getExtNameWorkspace();
        switch (extName) {
            case 'PHP':
                if (!isApiController) {
                    if (isFunction) {
                        const modelName = CodeSelector.getUsedModels(selectedText);
                        const modelMigrationPairs = await migrationProcessor.getFileNameMigration(modelName);

                        const atribut = await Promise.all(modelMigrationPairs.map(pair => migrationProcessor.readMigrationFiles(pair.file)));
                        createUnitTest.generateUnitTest({ code: selectedText, isLaravel: true, modelName: modelName, attributeMigration: atribut });
                    }

                    if (!isFunction) {
                        vscode.window.showErrorMessage('Kode yang dipilih bukan merupakan fungsi dalam controller');
                        return;
                    }
                }

                if (isApiController) {
                    // const route = await routeChecker.checkRoute({ functionCode: selectedText, isApiController: true });
                    // const middleware = await middlewareChecker.executeCheckMiddleware(route);
                    // const modelTableList = await modelFileReader.getTabelDatabaseFromModel();
                    const attributes = resourceProcessor.readResourceFile(selectedText);

                    createUnitTest.generateUnitTest({ code: selectedText, atribut: attributes, type: "apiController", isLaravel: true });
                }
                break;
            case 'Dart':
                if (CodeSelector.isFunctionDart(selectedText)) {
                    const pathImport = new PathImportDart();

                    const modelName = CodeSelector.getModelInFunction(selectedText);

                    // vscode.window.showInformationMessage(`Active file path: ${workspaceActivePath}`);

                    // const contentFile = pathImport.readActiveWorkspace(workspaceActivePath);

                    try {
                        const code = pathImport.readFileModel(modelName);
                        const attributes = pathImport.getAtributModel(code);
                        createUnitTest.generateUnitTest({ code: selectedText, attributes: attributes, type: "dart Controller", isDart: true });

                        // vscode.window.(showInformationMessage`Atribut yang didapat ${attributes}`);
                    } catch (error) {
                        vscode.window.showErrorMessage(`terjadi kesalahan ${error}`);
                    }
                }
                break;
            default:
                vscode.window.showErrorMessage('Fitur untuk bahasa atau framework ini belum tersedia');
                break;
        }
    }
}

module.exports = CodeSelector;