const { runPHPUnitTest } = require('../run-test/php');

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

    const methodMatch = controllerCode.match(new RegExp(`public\\s+function\\s+${methodName}\\s*\\([^)]*\\)\\s*{[^}]*}`));
    const methodCode = methodMatch ? methodMatch[0] : '';

    const viewMatch = methodCode.match(/return\s+view\s*\(\s*["']([^"']+)["']/);
    const viewName = viewMatch ? viewMatch[1] : '';

    let testCode = `<?php

namespace Tests\\Feature;

use Tests\\TestCase;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;
use App\\Http\\Controllers\\${className};

class TemporaryTest extends TestCase
{    
    public function test_can_access_${methodName}()
    {
        $response = $this->get(route('${methodName}'));

        $response->assertStatus(200);`;

    if (viewName) {
        testCode += `
        $response->assertViewIs('${viewName}');`;
    }

    testCode += `
    }
}`;

    return testCode;
}

module.exports = {
    isController,
    executeController,
};