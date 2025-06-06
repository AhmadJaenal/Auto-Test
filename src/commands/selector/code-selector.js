const vscode = require('vscode');
const GenerateTestModule = require('../module-test/prompt/generate-test-case');
const ResourceProcessor = require('../module-test/laravel/resource/get-resource');
const RequestProcessor = require('../module-test/laravel/request/get-request');

const WorkspaceChecker = require('../../utils/check-workspace');
const PathImportDart = require('../module-test/flutter/get-path-import');
const ApiKeyHandler = require('../module-test/api/api-key-handler');
const MigrationProcessor = require('../module-test/laravel/migration/migration-processor');
const OutputChannelChecker = require('../../utils/check-ouput');

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
        const migrationProcessor = new MigrationProcessor();
        const apiKeyHandler = new ApiKeyHandler();
        const keyIsReady = await apiKeyHandler.checkKey();

        if (keyIsReady === false) {
            vscode.window.showErrorMessage('API KEY belum ada, silakan masukkan API KEY terlebih dahulu');
            return;
        }

        const createUnitTest = new GenerateTestModule();
        const resourceProcessor = new ResourceProcessor();
        const requestProcessor = new RequestProcessor();
        const outputChannelChecker = new OutputChannelChecker('CyberTest - Unit Test');

        const framework = CodeSelector.getExtNameWorkspace();

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

        outputChannelChecker.showOutputChannel();

        switch (framework) {
            case 'laravel':
                if (!isApiController) {
                    if (isFunction) {
                        const modelName = CodeSelector.getUsedModels(selectedText);
                        const modelMigrationPairs = await migrationProcessor.getFileNameMigration(modelName);

                        const atribut = await Promise.all(modelMigrationPairs.map(pair => migrationProcessor.readMigrationFiles(pair.file)));

                        createUnitTest.generateUnitTest({ code: selectedText, modelName: modelName, attributeMigration: atribut, type: 'function', framework: framework });
                        vscode.window.showInformationMessage(`Sedang membuat kode unit test!`);
                    }

                    if (!isFunction) {
                        vscode.window.showErrorMessage('Kode yang dipilih bukan merupakan fungsi dalam controller');
                        return;
                    }
                }

                if (isApiController) {
                    const attributesResource = resourceProcessor.readResourceFile(selectedText);
                    const attributesRequest = requestProcessor.readRequestFile(selectedText);

                    createUnitTest.generateUnitTest({ code: selectedText, resource: attributesResource, request: attributesRequest, type: "api function", framework: framework });
                }
                break;
            case 'flutter':
                if (CodeSelector.isFunctionDart(selectedText)) {
                    const pathImport = new PathImportDart();

                    const modelName = CodeSelector.getModelInFunction(selectedText);
                    try {
                        const code = pathImport.readFileModel(modelName);
                        const attributes = pathImport.getAtributModel(code);
                        createUnitTest.generateUnitTest({ code: selectedText, attributesModelDart: attributes, type: "dart function", framework: framework });
                    } catch (error) {
                        vscode.window.showErrorMessage(`terjadi kesalahan ${error}`);
                    }
                }
                break;
            default:
                vscode.window.showErrorMessage('Untuk bahasa pemrograman ini belum tersedia fitur unit test');
                break;
        }
    }
}

module.exports = CodeSelector;