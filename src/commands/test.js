const { OpenAI } = require('openai');
const vscode = require('vscode');
class TestOpenAI {

    async requestOpenAI() {
        try {
            const openai = new OpenAI({
                apiKey: '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',
            });

            const response = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: 'Tolong katakan halo' }],
            });

            // Menampilkan hasil ke dalam VSCode
            vscode.window.showInformationMessage(response.choices[0].message.content);
        } catch (error) {
            console.error("Error:", error);
            vscode.window.showErrorMessage('Error calling OpenAI API.');
        }
    }
}


module.exports = TestOpenAI;
