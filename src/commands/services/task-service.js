const vscode = require('vscode');
const CodeSelector = require('../selector/code-selector');

class TaskService {
    async showTaskByProject(id) {

        const codeSelector = new CodeSelector();
        const apiKey = vscode.workspace.getConfiguration('auto-unit-test').get('apiKey');
        const apiUrl = `http://127.0.0.1:8000/api/project/${id}/tasks`;

        vscode.window.showInformationMessage(apiUrl);

        try {
            const response = await fetch(apiUrl, {
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error(`Response Code: ${response.status}`);
            }

            const result = await response.json();
            const data = result.data;

            const taskList = data.map(task => ({
                label: task.title,
                id: task.id
            }));

            const selectedItem = await vscode.window.showQuickPick(taskList, {
                placeHolder: 'Pilih tugas yang akan dibuatkan laporannya'
            });

            if (selectedItem) {
                await codeSelector.selectCode();
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
