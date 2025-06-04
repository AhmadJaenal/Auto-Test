const vscode = require('vscode');
class ApiKeyHandler {
    async inputKey() {
        const key = await vscode.window.showInputBox({
            placeHolder: 'Masukkan API KEY',
            prompt: 'API KEY wajib diisi'
        });

        if (key) {
            this.checkInputKey(key);
        } else {
            vscode.window.showErrorMessage('API KEY wajib ada');
        }
    }
    
    async checkInputKey(key) {

        try {
            const response = await fetch('http://localhost:8000/api/check-key', {
                method: 'GET',
                headers: {
                    'X-API-Key': key,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status == 200) {
                await this.updateKey(key);
            }

            if (response.status == 401) {
                vscode.window.showInformationMessage('Key tidak terdaftar pada sistem');
            }
            if (response.status == 500) {
                vscode.window.showInformationMessage('Terjadi kesalahan');
            }
        } catch (error) {
            vscode.window.showErrorMessage('Terjadi kesalahan, silakan coba lagi nanti');
        }
    }
    
    async updateKey(key) {
        const config = vscode.workspace.getConfiguration('auto-unit-test');
        await config.update('apiKey', key, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('API KEY berhasil disimpan!');
    }

    async checkKey() {
        const config = vscode.workspace.getConfiguration('auto-unit-test');
        let apiKey = config.get('apiKey');
        return apiKey !== ' ';
    }

    async deleteKey() {
        const config = vscode.workspace.getConfiguration('auto-unit-test');
        await config.update('apiKey', ' ', vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('API KEY berhasil dihapus!');
    }
}

module.exports = ApiKeyHandler;
