const vscode = require('vscode');
const GenerateTestModule = require('../module-test/laravel/generate-test-case/generate-test-case');

const RouteChecker = require('../module-test/laravel/route/route-checker');
const MiddlewareChecker = require('../module-test/laravel/route/middleware-checker');

const ReadArtibutFactoryFile = require('../selector/core/read-atribut-factory-file');

class CodeSelector {

    static isFunction(code) {
        const functionPattern = /public\s+function\s+\w+\s*\(/;
        return functionPattern.test(code);
    }

    static isModel(code) {
        const modelPattern = /class\s+\w+\s+extends\s+Model/;
        return modelPattern.test(code);
    }

    static isMigration(code) {
        const migrationPattern = /Schema::create\s*\(\s*'[^']+'\s*,\s*function\s*\(\s*Blueprint\s+\$table\s*\)\s*\{/;
        return migrationPattern.test(code);
    }
    async selectCode() {
        const createUnitTest = new GenerateTestModule();

        const routeChecker = new RouteChecker();
        const middlewareChecker = new MiddlewareChecker();
        const readArtibutFactoryFile = new ReadArtibutFactoryFile();

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

        const isFunction = CodeSelector.isFunction(selectedText);
        const isModel = CodeSelector.isModel(selectedText);
        const isMigration = CodeSelector.isMigration(selectedText);

        if (!isFunction && !isModel && !isMigration) {
            vscode.window.showErrorMessage('Kode yang dipilih bukan merupakan fungsi dalam controller, model atau migration.');
            return;
        }

        if (isFunction) {
            const route = await routeChecker.checkRoute(selectedText);
            const middleware = await middlewareChecker.executeCheckMiddleware(route);
            createUnitTest.generateUnitTest({ code: selectedText, middleware: middleware, route: route });
        }

        if (isModel) {
            readArtibutFactoryFile.getArtributFactory(selectedText)
                .then(attributes => {
                    vscode.window.showInformationMessage(`Hasil dari atribut factory ${attributes}`);
                    createUnitTest.generateUnitTest({ code: selectedText });
                })
                .catch(error => {
                    console.error('Error retrieving attributes:', error.message);
                });
        }

        if (isMigration) {
            createUnitTest.generateUnitTest(selectedText);
        }
    }
}

module.exports = CodeSelector;