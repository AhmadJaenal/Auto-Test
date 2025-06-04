const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const WorkspaceChecker = require('../../../utils/check-workspace');
const UnitTestManager = require('../auto-test/unit-test-manager');
const OutputChannelChecker = require('../../../utils/check-ouput');

class TemporaryFile {
    constructor() {
        this.unitTestManager = new UnitTestManager();
    }

    createTemporaryFile({ unitTestCode = null, selectedText = null, framework = null }) {
        const workspaceChecker = new WorkspaceChecker();
        const outputChannelChecker = new OutputChannelChecker('CyberTest - Temporary File');


        if (workspaceChecker.checkWorkspace()) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const projectRoot = workspaceFolders[0].uri.fsPath;

            outputChannelChecker.showOutputChannel();

            let temporaryDir = '';
            let temporaryPath = '';

            switch (framework) {
                case 'laravel':
                    temporaryDir = path.join(projectRoot, 'tests', 'Feature');
                    temporaryPath = path.join(temporaryDir, 'TemporaryTest.php');
                    break;
                case 'flutter':
                    temporaryDir = path.join(projectRoot, 'test');
                    temporaryPath = path.join(temporaryDir, 'temporary_test.dart');
                    break;
                default:
                    vscode.window.showErrorMessage('File test tidak didukung untuk framework ini');
                    break;
            }

            if (!fs.existsSync(temporaryDir)) {
                fs.mkdirSync(temporaryDir, { recursive: true });
            }

            fs.writeFile(temporaryPath, unitTestCode, (err) => {
                if (err) {
                    vscode.window.showInformationMessage('Terjadi kesalahan saat membuat file test');
                } else {
                    vscode.window.showInformationMessage('File Test berhasil dibuat');
                    this.unitTestManager.runUnitTest({ framework: framework });
                }
            });
        }
    }
}

module.exports = TemporaryFile;
