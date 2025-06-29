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
        Anda berperan sebagai seorang Software Tester profesional.

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
        4. Berikan saran teknis yang jelas, disertai justifikasi. Bila perlu, sertakan contoh perbaikan kode.
        5. Simpulkan apakah kode tersebut dapat dianggap stabil/siap digunakan atau memerlukan revisi lebih lanjut.

        Gunakan gaya bahasa profesional dan langsung pada poin, dengan fokus pada kualitas dan kejelasan analisis.


        ATURAN & FORMAT:
        1. Berikan jawaban tanpa tambahan katakter *-# dan lainya
        2. Tulisan menggunakan ukuran font yang sama
        `;
        const response = await openai.chat.completions.create({
            model: 'gpt-4.1',
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature: 0.3
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

        panel.webview.html = getWebviewContent(report);

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
            </style>
            </head>
            <body>
            <h1>Laporan Hasil Unit Test</h1>

            <div class="report-container">
                ${report}
            </div>
            </body>
            </html>
        `;
        }
    }

    static calculateGrade(testResult) {
        const regex = /(\d+)\s+passed/;
        const passedMatch = testResult.match(regex);

        const failedRegex = /(\d+)\s+failed/;
        const failedMatch = testResult.match(failedRegex);

        const passedCount = passedMatch ? parseInt(passedMatch[1], 10) : 0;
        const failedCount = failedMatch ? parseInt(failedMatch[1], 10) : 0;

        const totalTests = failedCount + passedCount;
        const score = totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 0;

        return score;
    }

    async redirectToWeb(code, resultUnitTest) {
        const report = `
            <h2><strong>LAPORAN HASIL KINERJA PENGEMBANGAN FITUR [Nama Fitur]</strong></h2>
            <h2>
                <strong>Nama:</strong> [Isi Nama] <br>
                <strong>Proyek:</strong> [Nama Proyek/Aplikasi] <br>
                <strong>Teknologi yang Digunakan:</strong> [Isi Teknologi]
            </h2>
            <br>
            <h2><strong>1. PENDAHULUAN</strong></h2>
            <p>Bagian ini menjelaskan secara singkat tujuan dari laporan ini, misalnya:</p>
            <ul>
                <li>Latar belakang pengembangan fitur</li>
                <li>Fungsi utama dari fitur yang dikembangkan</li>
                <li>Pentingnya fitur ini dalam sistem</li>
            </ul>
            <br>

            <h2><strong>2. RUANG LINGKUP PEKERJAAN</strong></h2>
            <p>Bagian ini mencakup lingkup pengembangan fitur, misalnya:</p>
            <ul>
                <li>Apa saja yang telah dikembangkan?</li>
                <li>Fitur apa yang diuji?</li>
                <li>Apakah ada batasan atau ruang lingkup yang tidak masuk dalam pengembangan ini?</li>
            </ul>
            <br>

            <h2><strong>3. IMPLEMENTASI TEKNIS</strong></h2>
            <p>Bagian ini menjelaskan detail teknis implementasi, termasuk kode yang dibuat.</p>

            <p>📌 Tambahkan bagian ini sesuai dengan kode yang digunakan dalam fitur.</p>

            ${code}
            <br>

            <h2><strong>4. HASIL PENGUJIAN</strong></h2>
            <p>Bagian ini berisi tabel hasil pengujian.</p>
            ${resultUnitTest}
            <br>

            <h2><strong>5. ANALISIS DAN EVALUASI</strong></h2>
            <p>Bagian ini menganalisis hasil pengujian dan memberikan insight lebih lanjut.</p>

            <p>✏️ <strong>Contoh Pengisian:</strong></p>
            <p>Berdasarkan hasil pengujian, fitur telah <strong>berjalan sesuai spesifikasi</strong>. 
            Tidak ditemukan error besar dalam pengujian, tetapi ada beberapa catatan:</p>
            
            <ul>
                <li><strong>Perlu peningkatan validasi input</strong> untuk mencegah penyalahgunaan.</li>
                <li><strong>Keamanan autentikasi dapat ditingkatkan</strong> dengan enkripsi tambahan.</li>
            </ul>
        `;

        const grade = ReportService.calculateGrade(resultUnitTest);
        vscode.window.showInformationMessage(`Nilai yang didapat ${grade}`);

        const apiKeyHandler = new ApiKeyHandler();
        const key = await apiKeyHandler.getKeyWeb();
        if (!key) {
            vscode.window.showErrorMessage('API KEY belum ada, silakan masukkan API key terlebih dahulu');
            return;
        }

        const data = {
            apiKey: key,
            report: report,
            grade: grade
        };

        const url = `http://127.0.0.1:8000/buat-laporan?&${new URLSearchParams(data).toString()}`;
        await vscode.env.openExternal(vscode.Uri.parse(url));
    }
}

module.exports = ReportService;
