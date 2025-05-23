const vscode = require('vscode');
class ApiKeyHandler {
    async updateApiKey() {
        const config = vscode.workspace.getConfiguration('auto-unit-test');
        let apiKey = config.get('apiKey');

        const input = await vscode.window.showInputBox({
            placeHolder: 'Masukkan API KEY',
            prompt: 'API KEY wajib diisi'
        });

        if (input) {
            const response = await fetch('http://localhost:8000/api/check-key', {
                method: 'GET',
                headers: {
                    'X-API-Key': input,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.status == 401) {
                vscode.window.showInformationMessage('Key tidak terdaftar pada sistem');
            }

            if (response.status == 200) {
                await config.update('apiKey', input, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('API KEY berhasil diperbarui!');
            }

        } else {
            vscode.window.showErrorMessage('API KEY wajib ada');
        }
    }

    async askForApiKey() {
        const config = vscode.workspace.getConfiguration('auto-unit-test');
        let apiKey = config.get('apiKey');

        if (!apiKey) {
            const input = await vscode.window.showInputBox({
                placeHolder: 'Masukkan API KEY',
                prompt: 'API KEY wajib diisi'
            });

            if (input) {
                try {
                    await config.update('apiKey', input, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage('API KEY berhasil disimpan!');
                } catch (error) {
                    vscode.window.showErrorMessage('Gagal menyimpan API KEY: ' + error.message);
                }
            } else {
                vscode.window.showErrorMessage('API KEY wajib ada');
            }
        } else {
            vscode.window.showInformationMessage('API KEY saat ini: ' + apiKey);
        }
    }
}

module.exports = ApiKeyHandler;
