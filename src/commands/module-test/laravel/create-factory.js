const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function createUserFactory() {
    const factoryContent = `
<?php

namespace Database\\Factories;

use App\\Models\\User;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition()
    {
        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => bcrypt('password'), // default password
        ];
    }
}
`;

    // Tentukan lokasi file
    const filePath = path.join(vscode.workspace.rootPath, 'database', 'factories', 'UserFactory.php');

    fs.writeFile(filePath, factoryContent, (err) => {
        if (err) {
            vscode.window.showErrorMessage('Error creating file: ' + err.message);
        } else {
            vscode.window.showInformationMessage('UserFactory.php created successfully!');
        }
    });
}

module.exports = { createUserFactory };