const vscode = require('vscode');
const { exec } = require('child_process');
const { redirectToWeb } = require('../../../web-view');

async function runUnitTestLaravel() {
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

        exec(command, (error, stdout, stderr) => {
            if (stdout) outputChannel.appendLine(stdout);
            if (stderr) outputChannel.appendLine(stderr);

            const testResults = parseTestOutput(stdout);
            const formattedResults = formatTestResults(testResults);

            redirectToWeb(formattedResults);

            if (error) {
                outputChannel.appendLine(`Eksekusi test gagal: ${error.message}`);
            } else {
                outputChannel.appendLine('Test berhasil dijalankan');
            }
        });

    } catch (error) {
        vscode.window.showErrorMessage(`Error dalam runUnitTest: ${error.message}`);
    }
}

function parseTestOutput(output) {
    const lines = output.split('\n');
    const results = [];
    let currentTest = null;

    for (const line of lines) {
        if (line.includes('Tests\\')) {
            const match = line.match(/(\w+)\s+(Tests\\[\w\\]+)/);
            if (match) {
                currentTest = {
                    status: match[1],
                    class: match[2],
                    tests: []
                };
                results.push(currentTest);
            }
        } else if (line.trim().startsWith('✓') || line.trim().startsWith('⨯')) {
            const isSuccess = line.trim().startsWith('✓');
            const match = line.match(/[✓⨯]\s+([\w\s]+)(?:\s+)(\d+\.\d+s)/);

            if (match && currentTest) {
                currentTest.tests.push({
                    name: match[1].trim(),
                    passed: isSuccess,
                    time: match[2]
                });
            }
        }
    }

    return results;
}

function formatTestResults(results) {
    let formatted = '<h2>Test Results</h2><ul>';
    results.forEach(test => {
        formatted += `<li><strong>${test.status}</strong> - <em>${test.class}</em><ul>`;
        test.tests.forEach(t => {
            formatted += `<li>${t.name}: ${t.passed ? '✔️' : '❌'} (${t.time})</li>`;
        });
        formatted += '</ul></li>';
    });
    formatted += '</ul>';
    return formatted;
}

module.exports = {
    runUnitTestLaravel
};