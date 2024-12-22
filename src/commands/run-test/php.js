const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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

module.exports = { runPHPUnitTest };