const vscode = require('vscode');
const TaskService = require('./task-service');

class ProjectService {
    constructor() {
        this.taskService = new TaskService();
        this.apiKey = vscode.workspace.getConfiguration('auto-unit-test').get('apiKey');
        this.apiUrl = 'http://127.0.0.1:8000/api/project/user/4';
    }

    async showProject() {
        try {
            const response = await fetch(this.apiUrl, {
                headers: {
                    'API-Key': this.apiKey,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error(`Response Status: ${response.status}`);
            }

            const result = await response.json();
            const data = result.data;

            const projectList = data.map(project => ({
                label: `${project.name} (${project.type})`,
                id: project.project_id
            }));

            const selectedItem = await vscode.window.showQuickPick(projectList, {
                placeHolder: 'Pilih Proyek yang akan dilaporkan'
            });

            if (selectedItem) {
                this.taskService.showTaskByProject(selectedItem.id);
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
