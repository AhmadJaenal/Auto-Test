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
function activate(context) {
    const apiKeyHandler = new ApiKeyHandler();
    const projectService = new ProjectService();
    const codeSelector = new CodeSelector();
    const modelFileReader = new ModelFileReader();
    const unitTestManager = new UnitTestManager();

    const testOpenAi = new TestOpenAI();


    apiKeyHandler.askForApiKey();

    let updateApiKey = vscode.commands.registerCommand('auto-unit-test.updateApiKey', async () => {
        apiKeyHandler.updateApiKey();
    });

    let showDataList = vscode.commands.registerCommand('auto-unit-test.showProject', async () => {
        await projectService.showProject();
    });

    let testController = vscode.commands.registerCommand('auto-unit-test.testController', async () => {
        codeSelector.selectCode({isApiController: false});
    });

    let textApiController = vscode.commands.registerCommand('auto-unit-test.testApiController', async () => {
        codeSelector.selectCode({isApiController: true});
    });

    let generateFactoryFile = vscode.commands.registerCommand('auto-unit-test.generateFactoryFile', async () => {
        await modelFileReader.getModelFileNames();
    });

    let runTestLaravel = vscode.commands.registerCommand('auto-unit-test.runTestLaravel', async () => {
        unitTestManager.runUnitTestLaravel();
    });

    let openAI = vscode.commands.registerCommand('auto-unit-test.testOpenAi', async () => {
        testOpenAi.requestOpenAI();
    });


    context.subscriptions.push(updateApiKey);
    context.subscriptions.push(showDataList);
    context.subscriptions.push(testController);
    context.subscriptions.push(generateFactoryFile);
    context.subscriptions.push(runTestLaravel);
    context.subscriptions.push(textApiController);

    context.subscriptions.push(openAI);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
