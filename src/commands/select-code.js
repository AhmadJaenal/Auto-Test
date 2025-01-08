const vscode = require('vscode');

const { generateControllerTest } = require('./module-test/laravel/generate-test-case/controller-test-case');
const { checkRoute } = require('./module-test/laravel/check-route/route');
const { executeCheckMiddleware } = require('./module-test/laravel/check-route/check-middleware');

async function selectCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);


    // checkRoute(selectedText);
    executeCheckMiddleware(selectedText);
    // generateControllerTest(selectedText);
}

module.exports = { selectCode };