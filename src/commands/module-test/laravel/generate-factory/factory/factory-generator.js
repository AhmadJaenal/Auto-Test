const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const WorkspaceChecker = require('../../../../../utils/check-workspace');

class FactoryGenerator {
    generateFactoryAttributes(atribut) {
        const regex = /['"]([^'"]*)['"]/g;
        const matches = [];
        let match;

        while ((match = regex.exec(atribut)) !== null) {
            matches.push(match[1]);
        }

        const factoryAttributes = matches.map(attr => {
            return `'${attr}' => fake()->${attr === 'password' ? 'password()' : 'text()'},`;
        });

        return `return [
        ${factoryAttributes.map(attr => `        ${attr}`).join('\n')}
    ];`;
    }

    async createFactoryFile(modelName, atribut) {
        const workspace = new WorkspaceChecker();
        if (workspace.checkWorkspace()) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const projectRoot = workspaceFolders[0].uri.fsPath;
            const factoryDir = path.join(projectRoot, 'database', 'factories');
            const factoryFileName = `${modelName}Factory.php`;
            const factoryFilePath = path.join(factoryDir, factoryFileName);

            const factoryContent = `<?php

namespace Database\\Factories;

use App\\Models\\${modelName};
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

class ${modelName}Factory extends Factory
{
    protected $model = ${modelName}::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        ${this.generateFactoryAttributes(atribut)}
    }
}`;

            if (!fs.existsSync(factoryDir)) {
                fs.mkdirSync(factoryDir, { recursive: true });
            }

            try {
                fs.writeFileSync(factoryFilePath, factoryContent);
                vscode.window.showInformationMessage(`Factory file created: ${factoryFileName}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Error creating factory file: ${error.message}`);
            }
        } else {
            vscode.window.showErrorMessage('No workspace folder found');
        }
    }
}

module.exports = FactoryGenerator;