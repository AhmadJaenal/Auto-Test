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
            vscode.window.showErrorMessage('Tidak ada key yang dimasukan');
        }
    }

    async checkInputKey(key) {
        try {
            const response = await fetch('https://ahmadjaenal.web.id/api/check-key', {
                method: 'GET',
                headers: {
                    'X-API-Key': key,
                    'Content-Type': 'application/json'
                }
            });

            vscode.window.showInformationMessage(`${key} sedang diperiksa...`);

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
            vscode.window.showErrorMessage(`Terjadi error: ${error}`);
            // vscode.window.showErrorMessage('Terjadi kesalahan, silakan coba lagi nanti');
        }
    }

    async updateKey(key) {
        const config = vscode.workspace.getConfiguration('auto-unit-test');
        await config.update('apiKey', key, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('API KEY berhasil disimpan!');
    }

    async getKeyWeb() {
        const config = vscode.workspace.getConfiguration('auto-unit-test');
        let apiKey = config.get('apiKey');
        return apiKey;
    }

    async deleteKey() {
        const config = vscode.workspace.getConfiguration('auto-unit-test');
        await config.update('apiKey', ' ', vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('API KEY berhasil dihapus!');
    }


    async inputKeyOpenAI(context) {
        const key = await vscode.window.showInputBox({
            placeHolder: 'Masukan key Open AI',
            prompt: 'Key Open AI wajib diisi'
        }
        );

        if (key) {
            ApiKeyHandler.saveOpenAIKey({ context: context, key: key });
        }
        else {
            vscode.window.showInformationMessage('API Key Open AI wajib diisi');
        }
    }

    static async saveOpenAIKey({ context, key }) {
        const secretStorage = context.secrets;
        await secretStorage.store('openAIKey', key);
        vscode.window.showInformationMessage('API KEY berhasil disimpan!');
    }

    async getOpenAIKey(context) {
        const secretStorage = context.secrets;
        const key = await secretStorage.get('openAIKey');
        if (key) {
            return key;
        } else {
            vscode.window.showInformationMessage('API Key Open AI tidak ditemukan, silakan masukkan kembali.');
            return null;
        }
    }
}

module.exports = ApiKeyHandler;
