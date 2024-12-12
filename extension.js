const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    askForApiKey();

    let showDataList = vscode.commands.registerCommand('auto-unit-test.showMyTask', async () => {
        await showMyTask();
    });

    context.subscriptions.push(showDataList);
}

async function askForApiKey() {
    const config = vscode.workspace.getConfiguration('auto-unit-test');
    let apiKey = config.get('apiKey');

    if (!apiKey) {
        const input = await vscode.window.showInputBox({
            placeHolder: 'Masukan API KEY',
            prompt: 'API KEY wajib isi'
        });

        if (input) {
            await vscode.workspace.getConfiguration('auto-unit-test').update('apiKey', input, vscode.ConfigurationTarget.Global);
        } else {
            vscode.window.showErrorMessage('API KEY wajib ada');
        }
    } else {
        vscode.window.showInformationMessage('API KEY saat ini');
    }
}

async function showMyTask() {
    const dataList = [
        'Tugas membuat fitur login user',
        'Tugas membuat fitur registrasi user',
        'Tugas membuat fitur update profil user',
        'Tugas membuat fitur upload gambar',
        'Tugas membuat fitur reset password',
        'Tugas membuat fitur delete komentar',
    ];
    const selectedItem = await vscode.window.showQuickPick(dataList, {
        placeHolder: 'Pilih tugas yang akan dilaporkan'
    })
    if (selectedItem) {
        await selectCode();
    } else {
        vscode.window.showInformationMessage('Tidak ada yang dipilih');
    }
}

function getFileType(document) {
    const openedFileType = document.uri.fsPath.split('.').pop();
    return openedFileType;
}

function isController(fileName, code) {
    const regexController = /controller/i;
    const regexPublicFunction = /public\s+function/i;

    return (
        regexController.test(fileName) ||
        (code && (regexController.test(code) || regexPublicFunction.test(code)))
    );
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

async function executeController(code, outputChannel) {
    try {
        const methodRegex = /public\s+function\s+(\w+)\s*\([^)]*\)/g;
        const methods = [];
        let match;

        while ((match = methodRegex.exec(code)) !== null) {
            methods.push(match[1]);
        }

        for (const methodName of methods) {
            try {
                const testCode = generateControllerTest(code, methodName);

                await runPHPUnitTest(testCode, outputChannel);
            } catch (error) {
                outputChannel.appendLine(`Error testing ${methodName}: ${error.message}`);
            }
        }
    } catch (error) {
        outputChannel.appendLine(`Error in executeController: ${error.message}`);
        throw error;
    }
}

function generateControllerTest(controllerCode, methodName) {
    const classMatch = controllerCode.match(/class\s+(\w+)\s+extends/);
    const className = classMatch ? classMatch[1] : 'UnknownController';

    const methodMatch = controllerCode.match(new RegExp(`public\\s+function\\s+${methodName}\\s*\\([^)]*\\)\\s*{[^}]*}`));
    const methodCode = methodMatch ? methodMatch[0] : '';

    const viewMatch = methodCode.match(/return\s+view\s*\(\s*["']([^"']+)["']/);
    const viewName = viewMatch ? viewMatch[1] : '';

    let testCode = `<?php

namespace Tests\\Feature;

use Tests\\TestCase;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;
use App\\Http\\Controllers\\${className};

class TemporaryTest extends TestCase
{    
    public function test_can_access_${methodName}()
    {
        $response = $this->get(route('${methodName}'));

        $response->assertStatus(200);`;

    if (viewName) {
        testCode += `
        $response->assertViewIs('${viewName}');`;
    }

    testCode += `
    }
}`;

    return testCode;
}

function createUserFactory() {
    const factoryContent = `
<?php

namespace Database\\Factories;

use App\\Models\\User;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition()
    {
        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => bcrypt('password'), // default password
        ];
    }
}
`;

    // Tentukan lokasi file
    const filePath = path.join(vscode.workspace.rootPath, 'database', 'factories', 'UserFactory.php');

    // Buat file
    fs.writeFile(filePath, factoryContent, (err) => {
        if (err) {
            vscode.window.showErrorMessage('Error creating file: ' + err.message);
        } else {
            vscode.window.showInformationMessage('UserFactory.php created successfully!');
        }
    });
}


async function runPHPUnitTest(testCode, outputChannel) {
    try {
        // Mendapatkan folder workspace yang aktif
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found');
        }

        // Mengambil path root project
        const projectRoot = workspaceFolders[0].uri.fsPath;

        // Menyiapkan direktori dan file untuk test
        const testDir = path.join(projectRoot, 'tests', 'Feature');
        const testFile = path.join(testDir, 'TemporaryTest.php');

        // Membuat direktori tests/Feature jika belum ada
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }

        // Menulis file test sementara
        fs.writeFileSync(testFile, testCode);
        outputChannel.appendLine('Unit Test dijalankan:');
        outputChannel.appendLine(testCode);

        // Menjalankan test menggunakan Promise
        return new Promise((resolve, reject) => {
            // Cek apakah sistem operasi Windows
            const isWindows = process.platform === 'win32';
            let command;

            // Menyiapkan perintah sesuai sistem operasi
            if (isWindows) {
                command = `cd /d "${projectRoot}" && .\\vendor\\bin\\phpunit "${testFile}"`;
            } else {
                command = `cd "${projectRoot}" && ./vendor/bin/phpunit "${testFile}"`;
            }

            // Menjalankan perintah PHPUnit
            exec(command, (error, stdout, stderr) => {
                if (stdout) outputChannel.appendLine(stdout);
                if (stderr) outputChannel.appendLine(stderr);

                // Membersihkan file test sementara
                try {
                    fs.unlinkSync(testFile);
                    outputChannel.appendLine('File test sementara telah dibersihkan');
                } catch (cleanupError) {
                    outputChannel.appendLine(`Peringatan: Tidak dapat membersihkan file test: ${cleanupError.message}`);
                }

                // Menangani hasil eksekusi
                if (error) {
                    outputChannel.appendLine(`Eksekusi test gagal: ${error.message}`);
                    reject(error);
                } else {
                    outputChannel.appendLine('Test berhasil dijalankan');
                    resolve();
                }
            });
        });
    } catch (error) {
        outputChannel.appendLine(`Error dalam runPHPUnitTest: ${error.message}`);
        throw error;
    }
}

async function selectCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    const fileType = getFileType(editor.document);
    const analyzedCode = analyzeCode(selectedText, fileType);
    if (!selectedText) {
        vscode.window.showErrorMessage('Tidak ada code yang akan dilaporkan');
        return;
    }

    const escapedText = escapeHtml(selectedText);

    const panel = vscode.window.createWebviewPanel(
        'createTestPanel',
        'Laporan Tugas',
        vscode.ViewColumn.One,
        {}
    );

    panel.webview.html = getWebviewContent(escapedText, fileType, analyzedCode);
}

function getWebviewContent(code, fileType, codeType) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Webview</title>
        <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #007ACC; }
        </style>
    </head>
    <body>
	<h1>Laporan Tugas</h1>
		<pre>File Type ${fileType}</pre>
		<pre>Code Type ${codeType}</pre>
        <pre><code>${code}</code></pre>
    </body>
    </html>`;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
