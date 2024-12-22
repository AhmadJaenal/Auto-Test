const vscode = require('vscode');

const { askForApiKey } = require('./commands/ask-api-key');
const { showProject } = require('./commands/show-project');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    askForApiKey();

    let showDataList = vscode.commands.registerCommand('auto-unit-test.showProject', async () => {
        await showProject();
    });

    context.subscriptions.push(showDataList);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
