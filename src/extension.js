const vscode = require('vscode');

const { askForApiKey } = require('./commands/module-test/api/ask-api-key');
const { showProject } = require('./commands/show-project');

const { selectCode } = require('./commands/select-code');
const { getModelFileNames } = require('./commands/module-test/laravel/generate-factory/model/get-filename-model');
const { createTemporaryFile } = require('./commands/module-test/laravel/generate-temporary-file/create-temporary');
const { runUnitTestLaravel } = require('./commands/module-test/laravel/auto-test/running-unit-test');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    askForApiKey();

    let showDataList = vscode.commands.registerCommand('auto-unit-test.showProject', async () => {
        await showProject();
    });

    let testController = vscode.commands.registerCommand('auto-unit-test.testController', async () => {
        selectCode();
    });

    let generateFactoryFile = vscode.commands.registerCommand('auto-unit-test.generateFactoryFile', async () => {
        await getModelFileNames();
    });

    let runTestLaravel = vscode.commands.registerCommand('auto-unit-test.runTestLaravel', async () => {
        runUnitTestLaravel();
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
