const vscode = require('vscode');
const { OpenAI } = require('openai');
const ApiKeyHandler = require('../module-test/api/api-key-handler');

class ReportService {
    async generateUnitTestReport(code, resultUnitTest, context) {
        const apiKeyHandler = new ApiKeyHandler();
        const apiKey = await apiKeyHandler.getOpenAIKey(context);
        if (!apiKey) {
            vscode.window.showInformationMessage('API Key OpenAI belum dipasang. Silakan pasang API Key terlebih dahulu.');
            return;
        }

        const openai = new OpenAI({
            apiKey: apiKey
        });

        const prompt = `
        Anda berperan sebagai seorang QA Engineer profesional.

        Berikut ini adalah potongan kode program yang perlu Anda analisis:
        ${code}

        Kode tersebut telah melalui proses pengujian, dan berikut adalah hasil dari unit test yang dijalankan:
        ${resultUnitTest}

        Tugas:
        1. Menganalisis kode program berdasarkan best practice pemrograman dan keterbacaan.
        2. Menganalisis kesalahan logika atau potensi bug dalam kode tersebut.
        3. Menganalisis hasil unit test: apakah pengujian mencakup kasus yang tepat, dan apakah hasilnya sesuai harapan.
        4. Mengidentifikasi kelemahan pada kode program dan/atau hasil pengujiannya.
        6. Memberikan rekomendasi perbaikan yang konkret dan teknis, baik pada sisi kode maupun pengujian.

        Format laporan yang harus Anda gunakan:
        1. Berikan ringkasan singkat mengenai status kode dan pengujian.
        2. Jelaskan kualitas kode, potensi bug, readability, dan kemungkinan improvement.
        3. Analisis hasil unit test, validitas, serta hasil yang dicapai.
        4. Berikan saran teknis yang jelas. Bila perlu, sertakan contoh perbaikan kode.
        5. Simpulkan apakah kode tersebut dapat dianggap stabil/siap digunakan atau memerlukan revisi lebih lanjut.

        Gunakan gaya bahasa profesional dan langsung pada poin penting, dengan fokus pada kualitas dan kejelasan analisis.

        ATURAN & FORMAT:
        1. Berikan jawaban tanpa tambahan katakter *-# dan lainya
        2. Tulisan menggunakan ukuran font yang sama
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-4.1',
            messages: [
                { role: 'user', content: prompt }
            ],
        });

        const report = response.choices[0].message.content;

        const panel = vscode.window.createWebviewPanel(
            'CyberTest',
            'CyberTest',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
            }
        );

        function getWebviewContent(report) {
            return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>Laporan Unit Test</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 2rem;
                        background-color: #f9f9f9;
                    }

                    h1 {
                        color: #333;
                    }

                    .report-container {
                        background-color: #fff;
                        border: 1px solid #ccc;
                        padding: 1rem;
                        margin-top: 1rem;
                        border-radius: 8px;
                        white-space: pre-wrap;
                        font-family: Consolas, monospace;
                        font-size: 0.95rem;
                        color: #222;
                    }

                    button {
                        margin-top: 2rem;
                        padding: 0.5rem 1rem;
                        background-color: #007acc;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }

                    button:hover {
                        background-color: #005f99;
                    }

                    pre.fixed-result {
                        margin-top: 2rem;
                        padding: 1rem;
                        background-color: #eef;
                        border: 1px solid #99c;
                        border-radius: 6px;
                        white-space: pre-wrap;
                    }
                </style>
            </head>
            <body>
                <h1>Laporan Hasil Unit Test</h1>

                <div class="report-container">${report}</div>
            </body>
            </html>
            `;
        }

        panel.webview.html = getWebviewContent(report);
    }

    static calculateGrade(testResult, framework) {
        if (framework === 'laravel') {
            const regex = /(\d+)\s+passed/;
            const passedMatch = testResult.match(regex);

            const failedRegex = /(\d+)\s+failed/;
            const failedMatch = testResult.match(failedRegex);

            const passedCount = passedMatch ? parseInt(passedMatch[1], 10) : 0;
            const failedCount = failedMatch ? parseInt(failedMatch[1], 10) : 0;

            const totalTests = failedCount + passedCount;
            const score = totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 0;

            return score;
        } else if (framework === 'flutter') {
            if (testResult.includes('Compilation failed') || testResult.includes('[E]')) {
                return 0;
            }

            const testLines = testResult.match(/^.*?\+\d+/gm);
            const lastLine = testResult.trim().split('\n').pop();

            let totalTests = 0;
            let passedCount = 0;

            if (lastLine.includes('All tests passed')) {
                totalTests = testLines ? testLines.length : 0;
                passedCount = totalTests;
            } else {
                const passedRegex = /\+\d+/g;
                const matches = testResult.match(passedRegex);
                passedCount = matches ? matches.length : 0;

                const totalRegex = /\+(\d+)\s*(-\d+)?:/;
                const totalMatch = testResult.match(totalRegex);
                totalTests = totalMatch ? parseInt(totalMatch[1], 10) + (totalMatch[2] ? Math.abs(parseInt(totalMatch[2])) : 0) : passedCount;
            }

            const score = totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 0;
            return score;
        } else {
            throw new Error('Unsupported framework: ' + framework);
        }
    }


    async redirectToWeb(code, resultUnitTest, framework) {
        const grade = ReportService.calculateGrade(resultUnitTest, framework);
        vscode.window.showInformationMessage(`Nilai yang didapat ${grade}`);

        const apiKeyHandler = new ApiKeyHandler();
        const key = await apiKeyHandler.getKeyWeb();
        if (!key) {
            vscode.window.showErrorMessage('API KEY belum ada, silakan masukkan API key terlebih dahulu');
            return;
        }

        const data = {
            apiKey: key,
            grade: grade,
            code: code,
            resultUnitTest: resultUnitTest,
        };

        const url = `https://ahmadjaenal.web.id/buat-laporan?&${new URLSearchParams(data).toString()}`;
        await vscode.env.openExternal(vscode.Uri.parse(url));
    }
}

module.exports = ReportService;
