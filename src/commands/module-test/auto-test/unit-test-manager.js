const vscode = require('vscode');
const { exec } = require('child_process');
const ReportService = require('../../services/report-service');
class UnitTestManager {
    runUnitTestLaravel(code) {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error('No workspace folder found');
            }

            const projectRoot = workspaceFolders[0].uri.fsPath;
            const outputChannel = vscode.window.createOutputChannel('Laravel Unit Test');
            outputChannel.show();
            outputChannel.appendLine('Menjalankan unit test dengan php artisan...');

            const command = `cd "${projectRoot}" && php artisan test --filter=TemporaryTest`;

            exec(command, (error, stdout = '', stderr = '') => {
                if (stdout) {
                    outputChannel.appendLine(stdout);
                }
                if (stderr) {
                    outputChannel.appendLine(stderr);
                }

                const report = new ReportService();
                const output = stdout + stderr;

                if (output) {
                    report.generateUnitTestReport(code, output);
                }

                report.redirectToWeb(output);

                outputChannel.appendLine(
                    error
                        ? `Eksekusi test gagal: ${error.message}`
                        : 'Test berhasil dijalankan'
                );
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Error dalam runUnitTest: ${error.message}`);
        }
    }

    runUnitTestDart(code) {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error('No workspace folder found');
            }

            const projectRoot = workspaceFolders[0].uri.fsPath;
            const outputChannel = vscode.window.createOutputChannel('Flutter Unit Test');
            outputChannel.show();
            outputChannel.appendLine('Menjalan unit test dart...');

            const command = `cd "${projectRoot}" && flutter test test/temporary_test.dart`;

            exec(command, (error, stdout, stderr) => {
                if (stdout) outputChannel.appendLine(stdout);
                if (stderr) outputChannel.appendLine(stderr);

                report.redirectToWeb(output);

                const report = new ReportService();
                const output = stdout + stderr;

                if (output) {
                    report.generateUnitTestReport(code, output);
                }

                report.redirectToWeb(output);

                if (error) {
                    outputChannel.appendLine(`Eksekusi test gagal: ${error.message}`);
                } else {
                    outputChannel.appendLine('Test telah selesai');
                }
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Error dalam runUnitTest: ${error.message}`);
        }
    }
}

module.exports = UnitTestManager;