const vscode = require('vscode');

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
    const apiKey = "AIzaSyBP8imrZDdIdBc-Qs7i59Wh3OYSy8XF4LI";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestData = {
        contents: [{
            parts: [{
                text: `Generate unit test code for the provided functions. The unit tests should cover the full range of possible test cases, 
                including edge cases, and ensure that all expected behavior is tested. These tests should 
                include assertions for proper input/output handling, validation of returned values, proper error handling, 
                and any necessary conditions specific to the function. The unit tests should be structured like this:

                public function testMethodName()
                {
                    // Arrange: Set up the prerequisites and required input
                    // Act: Call the method being tested
                    // Assert: Use assertions to verify the expected result
                }

                The code to test is:	

                ${code}

                Return only the unit test code, ensuring that there are no language tags or annotations like php 
                at the beginning of the response. The response should strictly begin with the unit test class definition 
                or the relevant PHP code block, without any prefixed programming language indicators.`
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