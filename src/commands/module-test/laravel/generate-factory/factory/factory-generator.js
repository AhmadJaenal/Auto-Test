const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const WorkspaceChecker = require('../../../../../utils/check-workspace');

class FactoryGenerator {
    generateFactoryAttributes(attributeLines) {
        const attributes = [];

        attributeLines.forEach(line => {
            const typeMatch = line.match(/\$table->(\w+)\(["'](\w+)["']/);
            if (!typeMatch) return;

            const [_, type, name] = typeMatch;
            let fakerCode = 'text()'; // default

            switch (type) {
                case 'string':
                    const lengthMatch = line.match(/string\([^)]+,\s*(\d+)/);
                    fakerCode = lengthMatch ? `text(${lengthMatch[1]})` : 'text(100)';
                    break;
                case 'text':
                    fakerCode = 'paragraph()';
                    break;
                case 'integer':
                case 'bigInteger':
                case 'smallInteger':
                    fakerCode = 'numberBetween(1, 100)';
                    break;
                case 'boolean':
                    fakerCode = 'boolean()';
                    break;
                case 'date':
                case 'timestamp':
                case 'dateTime':
                    fakerCode = 'dateTime()';
                    break;
                case 'uuid':
                    fakerCode = 'uuid()';
                    break;
                default:
                    fakerCode = 'text()';
            }

            attributes.push(`'${name}' => fake()->${fakerCode},`);
        });

        return `return [
${attributes.map(attr => `        ${attr}`).join('\n')}
    ];`;
    }

    async createFactoryFile(modelName, attributeLines) {
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
    protected \$model = ${modelName}::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        ${this.generateFactoryAttributes(attributeLines)}
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
