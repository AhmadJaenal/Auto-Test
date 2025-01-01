const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const { checkWorkspace } = require('../../../../../utils/check-workspace');

/**
 * @param {string} modelName
 * @param {string} atribut
 */

function generateFactoryAttributes(atribut) {
    const regex = /['"]([^'"]*)['"]/g;
    const matches = [];
    let match;

    while ((match = regex.exec(atribut)) !== null) {
        matches.push(match[1]); 
    }

    // Create factory attributes
    const factoryAttributes = matches.map(attr => {
        return `'${attr}' => fake()->${attr === 'password' ? 'password()' : 'text()'},`;
    });

    const result = `return [
        ${factoryAttributes.map(attr => `        ${attr}`).join('\n')}
    ];`;

    return result;
    
}

async function createFactoryFile(modelName, atribut) {
    if (checkWorkspace()) {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        // Get path workspace directory
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
        ${generateFactoryAttributes(atribut)}
    }
}
`;

        // Check directory factory
        if (!fs.existsSync(factoryDir)) {
            fs.mkdirSync(factoryDir, { recursive: true });
        }

        // create factory file
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


module.exports = { createFactoryFile };
