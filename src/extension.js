const vscode = require('vscode');

const ApiKeyHandler = require('./commands/module-test/api/api-key-handler');
const CodeSelector = require('./commands/selector/code-selector');
const UnitTestManager = require('./commands/module-test/auto-test/unit-test-manager');
/**
 * @param {vscode.ExtensionContext} context
 */


class Main {
    constructor(context) {
        this.context = context;

        this.apiKeyHandler = new ApiKeyHandler();
        this.codeSelector = new CodeSelector();
        this.unitTestManager = new UnitTestManager();
    }

    registerCommands() {
        this.apiKeyHandler.askForApiKey();

        this.register('auto-unit-test.updateApiKey', () => {
            this.apiKeyHandler.updateApiKey();
        });

        this.register('auto-unit-test.testController', async () => {
            this.codeSelector.selectCode({ isApiController: false });
        });

        this.register('auto-unit-test.testApiController', async () => {
            this.codeSelector.selectCode({ isApiController: true });
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
