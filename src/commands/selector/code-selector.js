const vscode = require('vscode');
const GenerateTestModule = require('../module-test/laravel/generate-test-case/generate-test-case');

const RouteChecker = require('../module-test/laravel/route/route-checker');
const MiddlewareChecker = require('../module-test/laravel/route/middleware-checker');

// const ReadArtibutFactoryFile = require('../selector/core/read-atribut-factory-file');
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
            // vscode.window.showInformationMessage(`Model name found: ${match[1]}`);
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

    static isModelLaravel(code) {
        const modelPattern = /class\s+\w+\s+extends\s+Model/;
        return modelPattern.test(code);
    }

    static getLaravelModelName(code) {
        const modelPattern = /class\s+([a-zA-Z0-9_]+)\s+extends\s+Model/;
        const match = code.match(modelPattern);

        if (match) {
            return match[1];
        }
        return null;
    }

    async selectCode({ isApiController = false }) {
        const createUnitTest = new GenerateTestModule();
        const routeChecker = new RouteChecker();
        const middlewareChecker = new MiddlewareChecker();
        const migrationProcessor = new MigrationProcessor();
        const resourceProcessor = new ResourceProcessor();
        const modelFileReader = new ModelFileReader();

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('Pilih kode yang akan di test!');
            return;
        }

        const selectedText = editor.document.getText(selection);

        const isFunction = CodeSelector.isFunctionLaravel(selectedText);
        const isModel = CodeSelector.isModelLaravel(selectedText);

        const extName = CodeSelector.getExtNameWorkspace();
        switch (extName) {
            case 'PHP':
                if (!isApiController) {
                    if (isFunction) {
                        const route = await routeChecker.checkRoute({ functionCode: selectedText });
                        const middleware = await middlewareChecker.executeCheckMiddleware(route);
                        const modelTableList = await modelFileReader.getTabelDatabaseFromModel();
                        // createUnitTest.generateUnitTest({ code: selectedText, route: route, isLaravel: true, tableName: modelTableList, middleware: middleware});
                    }
                    
                    if (isModel) {
                        const modelsName = CodeSelector.getLaravelModelName();
                        
                        const modelMigrationPairs = await migrationProcessor.getFileNameMigration([modelsName]);
                        const atribut = await Promise.all(modelMigrationPairs.map(pair => migrationProcessor.readMigrationFiles(pair.file)));
                        createUnitTest.generateUnitTest({ type: "model", code: selectedText, atribut: atribut });
                    }
                    
                    if (!isFunction && !isModel) {
                        vscode.window.showErrorMessage('Kode yang dipilih bukan merupakan fungsi dalam controller, model atau migration.');
                        return;
                    }
                }

                if (isApiController) {
                    const route = await routeChecker.checkRoute({ functionCode: selectedText , isApiController: true});
                    const middleware = await middlewareChecker.executeCheckMiddleware(route);
                    const modelTableList = await modelFileReader.getTabelDatabaseFromModel();
                    const attributes = resourceProcessor.readResourceFile(selectedText);
                    
                    // createUnitTest.generateUnitTest({ code: selectedText, middleware: middleware, route: route, atribut: attributes, type: "apiController", isLaravel: true, tableName: modelTableList });
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
                        // createUnitTest.generateUnitTest({ code: selectedText, atribut: attributes, type: "controller", isDart: true });

                        // vscode.window.(showInformationMessage`Atribut yang didapat ${attributes}`);
                    } catch (error) {
                        vscode.window.showErrorMessage(`terjadi kesalahan ${error}`);
                    }
                    // vscode.window.showInformationMessage(`Path ${workspaceActivePath}`);
                    // vscode.window.showInformationMessage(`Content file ${contentFile}`);
                    // vscode.window.showInformationMessage(`Model file path ${modelPath}`);
                }
                break;
            default:
                vscode.window.showErrorMessage('Fitur untuk bahasa atau framework ini belum tersedia');
                break;
        }
    }
}

module.exports = CodeSelector;