const vscode = require('vscode');
const CodeSelector = require('../selector/code-selector');

class TaskService {
    constructor() {
        this.codeSelector = new CodeSelector();
    }

    async showTaskByProject(id) {
        const apiKey = vscode.workspace.getConfiguration('auto-unit-test').get('apiKey');
        const apiUrl = `http://127.0.0.1:8000/api/task/project/${id}`;

        vscode.window.showInformationMessage(apiUrl);

        try {
            const response = await fetch(apiUrl, {
                headers: {
                    'API-Key': apiKey,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error(`Response Status: ${response.status}`);
            }

            const result = await response.json();
            const data = result.data;

            const projectList = data.map(item => item.title);
            const selectedItem = await vscode.window.showQuickPick(projectList, {
                placeHolder: 'Pilih tugas yang akan dilaporkan'
            });

            if (selectedItem) {
                await this.codeSelector.selectCode();
            } else {
                vscode.window.showInformationMessage('Tidak ada yang dipilih');
            }
        } catch (error) {
            vscode.window.showErrorMessage(error.message);
            console.error(error.message);
        }
    }
}

module.exports = TaskService;
