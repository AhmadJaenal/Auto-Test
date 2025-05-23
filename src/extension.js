const vscode = require('vscode');

const ApiKeyHandler = require('./commands/module-test/api/api-key-handler');
const ProjectService = require('./commands/services/project-service');

const CodeSelector = require('./commands/selector/code-selector');
const ModelFileReader = require('./commands/module-test/laravel/generate-factory/core/model-file-reader');
const UnitTestManager = require('./commands/module-test/auto-test/unit-test-manager');

const TestOpenAI = require('./commands/test');

/**
 * @param {vscode.ExtensionContext} context
 */


class Main {
    constructor(context) {
        this.context = context;

        this.apiKeyHandler = new ApiKeyHandler();
        this.projectService = new ProjectService();
        this.codeSelector = new CodeSelector();
        this.modelFileReader = new ModelFileReader();
        this.unitTestManager = new UnitTestManager();
        this.testOpenAi = new TestOpenAI();
    }

    registerCommands() {
        this.apiKeyHandler.askForApiKey();

        this.register('auto-unit-test.updateApiKey', () => {
            this.apiKeyHandler.updateApiKey();
        });

        this.register('auto-unit-test.showProject', async () => {
            await this.projectService.showProject();
        });

        this.register('auto-unit-test.testController', async () => {
            this.codeSelector.selectCode({ isApiController: false });
        });

        this.register('auto-unit-test.testApiController', async () => {
            this.codeSelector.selectCode({ isApiController: true });
        });

        this.register('auto-unit-test.generateFactoryFile', async () => {
            await this.modelFileReader.getModelFileNames();
        });

        this.register('auto-unit-test.runTestLaravel', () => {
            this.unitTestManager.runUnitTestLaravel();
        });

        this.register('auto-unit-test.testOpenAi', () => {
            this.testOpenAi.requestOpenAI();
        });

        this.register('auto-unit-test.testDart', () => {
            this.unitTestManager.runUnitTestDart();
        });
    }

    register(commandId, callback) {
        const disposable = vscode.commands.registerCommand(commandId, callback);
        this.context.subscriptions.push(disposable);
    }
}

function activate(context) {
    const handler = new Main(context);
    handler.registerCommands();
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
