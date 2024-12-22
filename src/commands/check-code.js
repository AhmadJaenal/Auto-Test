const vscode = require('vscode');

const { createUserFactory } = require('./module-test/create-factory');
const { isController, executeController } = require('./module-test/create-test-controller');



function getFileType(document) {
    const openedFileType = document.uri.fsPath.split('.').pop();
    return openedFileType;
}

async function analyzeCode(code, fileName) {
    if (isController(fileName, code)) {
        vscode.window.showInformationMessage('Code berikut adalah:', isController(fileName, code));
        const outputChannel = vscode.window.createOutputChannel('Laravel Code Analyzer');
        outputChannel.show();
        executeController(code, outputChannel);

        createUserFactory();
    } else {
        vscode.window.showInformationMessage('Code tidak terdeteksi');
    }
}

module.exports = {
    getFileType,
    analyzeCode,
};
