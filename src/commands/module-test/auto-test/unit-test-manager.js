const vscode = require('vscode');
const { exec } = require('child_process');
const ReportService = require('../../services/report-service');
const ApiKeyHandler = require('../api/api-key-handler');
const OutputChannelChecker = require('../../../utils/check-ouput');

class UnitTestManager {
    async runUnitTest(code, context, framework) {
        const apiKeyHandler = new ApiKeyHandler();
        const outputChannelChecker = new OutputChannelChecker('CyberTest - Unit Test');

        const keyIsReady = await apiKeyHandler.getKeyWeb();

        if (keyIsReady === false) {
            vscode.window.showErrorMessage('API KEY belum ada, silakan masukkan API KEY terlebih dahulu');
            return;
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found');
        }

        const projectRoot = workspaceFolders[0].uri.fsPath;
        outputChannelChecker.showOutputChannel();

        try {
            const driveLetter = projectRoot.slice(0, 2);
            let command;

            switch (framework) {
                case 'laravel':
                    outputChannelChecker.appendLine('Menjalankan unit test dengan php artisan');
                    command = `${driveLetter} && cd "${projectRoot}" && php artisan test --filter=TemporaryTest`;
                    break;
                case 'flutter':
                    outputChannelChecker.appendLine('Menjalankan unit test dengan flutter run.');
                    command = `${driveLetter} && cd "${projectRoot}" && flutter pub run build_runner build && flutter test test/temporary_test.dart`;
                    break;
                default:
                    break;
            }

            exec(command, (error, stdout = '', stderr = '') => {
                if (stdout) {
                    outputChannelChecker.appendLine(stdout);
                }
                if (stderr) {
                    outputChannelChecker.appendLine(stderr);
                }

                const report = new ReportService();
                const output = stdout + stderr;

                if (output) {
                    report.generateUnitTestReport(code, output, context);
                    vscode.window.showInformationMessage('Membuat laporan unit test...');
                }

                report.redirectToWeb(code, output);

                vscode.window.showInformationMessage('Proses unit test selesai');
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error dalam runUnitTest: ${error.message}`);
        }
    }
}

module.exports = UnitTestManager;