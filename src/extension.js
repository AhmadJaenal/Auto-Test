const vscode = require('vscode');

const { askForApiKey } = require('./commands/module-test/api/ask-api-key');
const { showProject } = require('./commands/show-project');

const { selectCode } = require('./commands/select-code');


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

    context.subscriptions.push(showDataList);
    context.subscriptions.push(testController);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
