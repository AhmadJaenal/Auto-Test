const vscode = require('vscode');

const { showTaskByProject } = require('./show-task-by-project');

async function showProject() {
    const apiKey = vscode.workspace.getConfiguration('auto-unit-test').get('apiKey');
    const apiUrl = 'http://127.0.0.1:8000/api/project/user/4';

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

        const projectList = data.map(project => {
            return {
                label: `${project.name} (${project.type})`,
                id: project.project_id
            };
        });

        const selectedItem = await vscode.window.showQuickPick(projectList, {
            placeHolder: 'Pilih Proyek yang akan dilaporkan',
            onDidChangeSelection: (project) => {
            }
        });

        if (selectedItem) {
            showTaskByProject(selectedItem.id);
        } else {
            vscode.window.showInformationMessage('Tidak ada yang dipilih');
        }

    } catch (error) {
        vscode.window.showErrorMessage(error.message);
        console.error(error.message);
    }
}

module.exports = { showProject };