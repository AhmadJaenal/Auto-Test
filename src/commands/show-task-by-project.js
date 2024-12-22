const vscode = require('vscode');

const { selectCode } = require('./select-code');

async function showTaskByProject(id) {
    const apiKey = vscode.workspace.getConfiguration('auto-unit-test').get('apiKey');
    const apiUrl = `http://127.0.0.1:8000/api/task/project/${id}`;

    vscode.window.showInformationMessage(`http://127.0.0.1:8000/api/task/project/${id}`);

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'API-Key': apiKey,
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            throw new Error(`Response Status test: ${response.status}`)
        }
        const result = await response.json();
        const data = result.data;

        const projectList = data.map(item => `${item.title}`);
        const selectedItem = await vscode.window.showQuickPick(projectList, {
            placeHolder: 'Pilih tugas yang akan dilaporkan'
        })

        if (selectedItem) {
            await selectCode();
        } else {
            vscode.window.showInformationMessage('Tidak ada yang dipilih');
        }

    } catch (error) {
        vscode.window.showErrorMessage(error.message);
        console.error(error.message);
    }
}

module.exports = { showTaskByProject };