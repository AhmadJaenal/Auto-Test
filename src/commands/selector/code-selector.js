const vscode = require('vscode');
const ControllerTestModule = require('../module-test/laravel/generate-test-case/controller-test-case');
const RouteChecker = require('../module-test/laravel/route/route-checker');
const MiddlewareChecker = require('../module-test/laravel/route/middleware-checker');

class CodeSelector {
    constructor() {
        this.controllerTest = new ControllerTestModule();
        this.routeChecker = new RouteChecker();
        this.middlewareChecker = new MiddlewareChecker();
    }

    async selectCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        try {
            const route = await this.routeChecker.checkRoute(selectedText);
            const routeString = JSON.stringify(route);
            const middleware = await this.middlewareChecker.executeCheckMiddleware(routeString);
            this.controllerTest.generateControllerTest(selectedText, middleware, routeString);
        } catch (error) {
            console.error('Error in processing:', error);
        }
    }
}

module.exports = CodeSelector;