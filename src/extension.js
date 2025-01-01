const vscode = require('vscode');

const { askForApiKey } = require('./commands/module-test/api/ask-api-key');
const { showProject } = require('./commands/show-project');

const { selectCode } = require('./commands/select-code');
const { getModelFileNames } = require('./commands/module-test/laravel/generate-factory/model/get-filename-model');
const { createTemporaryFile } = require('./commands/module-test/laravel/generate-temporary-file/create-temporary');


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

    // let generateTemporaryFile = vscode.commands.registerCommand('auto-unit-test.createTemporaryFile', async () => {
    //     await createTemporaryFile('Hello World!');
    // });

    context.subscriptions.push(showDataList);
    context.subscriptions.push(testController);
    context.subscriptions.push(generateFactoryFile);
    // context.subscriptions.push(generateTemporaryFile);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
