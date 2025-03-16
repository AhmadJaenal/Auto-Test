const vscode = require('vscode');

const ApiKeyHandler = require('./commands/module-test/api/api-key-handler');
const ProjectManager = require('./commands/project-manager');

const CodeSelector = require('./commands/code-selector');
const ModelFileReader = require('./commands/module-test/laravel/generate-factory/core/model-file-reader');
const UnitTestManager = require('./commands/module-test/auto-test/unit-test-manager');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const apiKeyHandler = new ApiKeyHandler();
    const projectManager = new ProjectManager();
    const codeSelector = new CodeSelector();
    const modelFileReader = new ModelFileReader();
    const unitTestManager = new UnitTestManager();


    apiKeyHandler.askForApiKey();

    let showDataList = vscode.commands.registerCommand('auto-unit-test.showProject', async () => {
        await projectManager.showProject();
    });

    let testController = vscode.commands.registerCommand('auto-unit-test.testController', async () => {
        codeSelector.selectCode();
    });

    let generateFactoryFile = vscode.commands.registerCommand('auto-unit-test.generateFactoryFile', async () => {
        await modelFileReader.getModelFileNames();
    });

    let runTestLaravel = vscode.commands.registerCommand('auto-unit-test.runTestLaravel', async () => {
        unitTestManager.runUnitTestLaravel();
    });

    context.subscriptions.push(showDataList);
    context.subscriptions.push(testController);
    context.subscriptions.push(generateFactoryFile);
    context.subscriptions.push(runTestLaravel);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
