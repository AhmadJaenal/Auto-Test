const { runPHPUnitTest } = require('../../run-test/laravel/laravel');

function isController(fileName, code) {
    const regexController = /controller/i;
    const regexPublicFunction = /public\s+function/i;

    return (
        regexController.test(fileName) ||
        (code && (regexController.test(code) || regexPublicFunction.test(code)))
    );
}


async function executeController(code, outputChannel) {
    try {
        const methodRegex = /public\s+function\s+(\w+)\s*\([^)]*\)/g;
        const methods = [];
        let match;

        while ((match = methodRegex.exec(code)) !== null) {
            methods.push(match[1]);
        }

        for (const methodName of methods) {
            try {
                const testCode = generateControllerTest(code, methodName);

                await runPHPUnitTest(testCode, outputChannel);
            } catch (error) {
                outputChannel.appendLine(`Error testing ${methodName}: ${error.message}`);
            }
        }
    } catch (error) {
        outputChannel.appendLine(`Error in executeController: ${error.message}`);
        throw error;
    }
}

function generateControllerTest(controllerCode, methodName) {
    const classMatch = controllerCode.match(/class\s+(\w+)\s+extends/);
    const className = classMatch ? classMatch[1] : 'UnknownController';

    const methodMatch = controllerCode.match(new RegExp(`public\\s+function\\s+${methodName}\\s*\\([^)]*\\)\\s*{([^}]*)}`));
    const methodCode = methodMatch ? methodMatch[1] : '';

    const viewMatch = methodCode.match(/return\s+view\s*\(\s*["']([^"']+)["']/);
    const viewName = viewMatch ? viewMatch[1] : '';

    // Mencari model yang dipanggil dalam method
    const modelMatch = methodCode.match(/(\w+)::(first|create|find|where)/);
    const modelName = modelMatch ? modelMatch[1] : null;

    let testCode = `<?php

namespace Tests\\Feature;

use Tests\\TestCase;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;
use App\\Http\\Controllers\\${className};`;

    // Jika model ditemukan, tambahkan use statement untuk model tersebut
    if (modelName) {
        testCode += `
use App\\Models\\${modelName};`;
    }

    testCode += `

class TemporaryTest extends TestCase
{    
    use RefreshDatabase;

    public function test_${methodName}()
    {
        $contact = ${modelName ? `${modelName}::factory()->create();` : '// No model found for factory'};

        $response = $this->get(route('${methodName}'));
        $response->assertStatus(200);

        if (viewName) {
            $response->assertViewIs('${viewName}');
        }

        // assert return 
        $response->assertViewHas('contact', function ($viewContact) use ($contact) {
            return $viewContact->id === $contact->id;
        });
    }

    public function test_${methodName}_NoContact()
    {
        $response = $this->get(route('${methodName}'));

        // Memastikan status respons
        $response->assertStatus(200);

        if (viewName) {
            $response->assertViewIs('${viewName}');
        }

        // Memastikan tidak ada data kontak yang dikembalikan
        $response->assertViewHas('contact', null);
    }
}`;

    return testCode;
}

module.exports = {
    isController,
    executeController,
};