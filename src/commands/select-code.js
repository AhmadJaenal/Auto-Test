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

    const promise = checkRoute(selectedText);
    promise.then(route => {
        // Pastikan route adalah objek yang perlu diubah menjadi string
        const routeString = JSON.stringify(route); // atau metode lain sesuai kebutuhan
        
        const middlewarePromise = executeCheckMiddleware(routeString);
        
        middlewarePromise.then(middleware => {
            generateControllerTest(selectedText, middleware, routeString);
        }).catch(error => {
            console.error('Error in executeCheckMiddleware:', error);
        });
    }).catch(error => {
        console.error('Error in checkRoute:', error);
    });

    // generateControllerTest(selectedText, middleware);
}

module.exports = { selectCode };