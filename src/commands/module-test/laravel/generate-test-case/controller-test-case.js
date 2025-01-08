const vscode = require('vscode');
// require('dotenv').config();

const { getWebviewContent, escapeHtml } = require('../../../web-view');
const { createTemporaryFile } = require('../generate-temporary-file/create-temporary');
const { runUnitTestLaravel } = require('../auto-test/running-unit-test');

function isController(fileName, code) {
    const regexController = /controller/i;
    const regexPublicFunction = /public\s+function/i;

    return (
        regexController.test(fileName) ||
        (code && (regexController.test(code) || regexPublicFunction.test(code)))
    );
}

function generateControllerTest(code) {
    const apiKey = '';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestData = {
        contents: [{
            parts: [{
                text: `Generate unit test code for the provided functions in the Laravel framework. The unit tests should cover a comprehensive range of test cases, including edge cases, and ensure that all expected behaviors are validated. These tests should include assertions for:

1. Proper input/output handling.
2. Validation of returned values.
3. Proper error handling.
4. Any necessary conditions specific to the function.
The unit test class should be named TemporaryTest and adhere to Laravel's conventions. The generated file must include:

1. PHP opening tag (<?php) at the start.
2. The namespace declaration: namespace Tests\Unit;.
3. The appropriate use statements for Laravel's testing framework: use Tests\TestCase;.
4. A class definition extending TestCase.
5. At least one method structured like this

                public function testMethodName()
                {
                    // Arrange: Set up the prerequisites and required input
                    // Act: Call the method being tested
                    // Assert: Use assertions to verify the expected result
                }
6. Proper formatting consistent with PSR-12 coding standards.

                The code to test is:	

                ${code}

                Ensure the output is a complete and valid PHP file. The response should begin with the <?php tag and include all necessary elements for a Laravel unit test file. Do not include any prefixed programming language indicators or annotations like php.`
            }]
        }]
    };

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const generateTestCase = data['candidates'][0]['content']['parts'][0]['text'];
            // vscode.window.showInformationMessage(`Test Case: ${generateTestCase}`);

            createTemporaryFile(generateTestCase);

            const panel = vscode.window.createWebviewPanel(
                'createTestPanel',
                'Laporan Tugas',
                vscode.ViewColumn.One,
                {}
            );

            panel.webview.html = getWebviewContent(generateTestCase, 'fileType', 'analyzedCode');

            runUnitTestLaravel();
        })
        .catch(error => {
            vscode.window.showErrorMessage(`There was a problem with the fetch operation: ${error.message}`);
        });
}

module.exports = {
    isController,
    generateControllerTest,
};