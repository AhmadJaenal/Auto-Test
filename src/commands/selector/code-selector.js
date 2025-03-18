const vscode = require('vscode');
const ControllerTestModule = require('../module-test/laravel/generate-test-case/controller-test-case');
const RouteChecker = require('../module-test/laravel/route/route-checker');
const MiddlewareChecker = require('../module-test/laravel/route/middleware-checker');

class CodeSelector {
    async selectCode() {
        const controllerTestModule = new ControllerTestModule();
        const routeChecker = new RouteChecker();
        const middlewareChecker = new MiddlewareChecker();

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('Pilih kode yang akan di test!');
            return;
        }

        const selectedText = editor.document.getText(selection);
      

        try {
            const route = await routeChecker.checkRoute(selectedText);
            const middleware = await middlewareChecker.executeCheckMiddleware(route);
            controllerTestModule.generateControllerTest(selectedText, middleware, route);
        } catch (error) {
            console.error('Error in processing:', error);
        }
    }
}

module.exports = CodeSelector;