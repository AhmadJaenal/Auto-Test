const vscode = require('vscode');
const TaskService = require('./task-service');

class ProjectService {
    
    async showProject() {
        const taskService = new TaskService();
        const apiKey = vscode.workspace.getConfiguration('auto-unit-test').get('apiKey');
        const apiUrl = 'http://127.0.0.1:8000/api/projects/by-user';
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

            const projectList = data.map(project => ({
                label: project.name,
                id: project.id
            }));

            const selectedItem = await vscode.window.showQuickPick(projectList, {
                placeHolder: 'Pilih Proyek'
            });

            if (selectedItem) {
                taskService.showTaskByProject(selectedItem.id);
                vscode.window.showInformationMessage(`Proyek ${selectedItem.id} dipilih`);
            } else {
                vscode.window.showInformationMessage('Tidak ada yang dipilih');
            }
        } catch (error) {
            vscode.window.showErrorMessage(error.message);
            console.error(error.message);
        }
    }
}

module.exports = ProjectService;
