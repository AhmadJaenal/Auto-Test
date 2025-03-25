const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const WorkspaceChecker = require('../../../utils/check-workspace');

class ReadArtibutFactoryFile {
    static getClassName(code) {
        const match = code.match(/class\s+(\w+)/);
        if (match && match[1]) {
            return match[1];
        }
        return '';
    }

    static extractFactoryDefinition(fileContent) {
        const match = fileContent.match(/function\s+definition\s*\(\)\s*{[^]*?return\s*\[(.*?)\];/s);
        if (match && match[1]) {
            return match[0]; // Mengembalikan potongan kode penuh
        }
        return '';
    }

    static extractAttributes(definition) {
        const attributes = [];
        const attributeRegex = /'([^']+)'/g; // Regex untuk mencari atribut dalam tanda kutip
        let match;

        while ((match = attributeRegex.exec(definition)) !== null) {
            attributes.push(match[1]); // Menyimpan nama atribut
        }

        return attributes;
    }

    async getArtributFactory(modelCode) {
        vscode.window.showInformationMessage(`code yang dikirim ${modelCode}`);
        const workspaceChecker = new WorkspaceChecker();
        if (!workspaceChecker.checkWorkspace()) {
            throw new Error('No workspace folder found');
        }

        try {
            const modelName = ReadArtibutFactoryFile.getClassName(modelCode);
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const factoryFilePath = this.findFactoryFile(modelName, workspaceFolders);

            // Memeriksa apakah file ditemukan
            if (!factoryFilePath) {
                throw new Error(`Factory file not found for model: ${modelName}`);
            }

            // Membaca file factory
            const fileContent = fs.readFileSync(factoryFilePath, 'utf8');
            const factoryDefinition = ReadArtibutFactoryFile.extractFactoryDefinition(fileContent);

            if (!factoryDefinition) {
                throw new Error('Factory definition not found in file');
            }

            const attributes = ReadArtibutFactoryFile.extractAttributes(factoryDefinition);
            console.log('Attributes:', attributes);
            return attributes;

        } catch (error) {
            vscode.window.showErrorMessage(`Error in processing: ${error.message}`);
            console.error('Error:', error.message);
        }
    }

    findFactoryFile(modelName, folders) {
        for (const folder of folders) {
            const factoryFilePath = path.join(folder.uri.fsPath, 'database', 'factories', `${modelName}Factory.php`);
            if (fs.existsSync(factoryFilePath)) {
                return factoryFilePath; // Mengembalikan path jika file ditemukan
            }
        }
        return null; // Mengembalikan null jika file tidak ditemukan
    }
}

module.exports = ReadArtibutFactoryFile;
