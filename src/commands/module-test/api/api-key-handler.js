const vscode = require('vscode');

class ApiKeyHandler {
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
