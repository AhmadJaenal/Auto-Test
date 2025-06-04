const vscode = require('vscode');
const { OpenAI } = require('openai');

class ReportService {
    async generateUnitTestReport( resultUnitTest) {
        const openai = new OpenAI({
            apiKey: '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'
        });

        const prompt = `
        Anda berperan sebagai seorang Software Tester profesional.

        Berikut ini adalah potongan kode program yang perlu Anda analisis:
        ${code}

        Kode tersebut telah melalui proses pengujian, dan berikut adalah hasil dari unit test yang dijalankan:
        ${resultUnitTest}

        Tugas Anda adalah:

        1. Menganalisis kode program berdasarkan best practice pemrograman dan keterbacaan.
        2. Menganalisis hasil unit test: apakah pengujian mencakup kasus yang tepat, dan apakah hasilnya sesuai harapan.
        3. Mengidentifikasi kelemahan pada kode program dan/atau hasil pengujiannya.
        4. Memberikan rekomendasi perbaikan yang konkret dan teknis, baik pada sisi kode maupun pengujian.

        Format laporan yang harus Anda gunakan:

        1. Ringkasan Eksekutif
        Berikan ringkasan singkat mengenai status kode dan pengujian.

        2. Analisis Kode
        Jelaskan kualitas kode, potensi bug, readability, dan kemungkinan improvement.

        3. Analisis Hasil Unit Test
        Tinjau cakupan test, validitas, serta hasil yang dicapai.

        4. Rekomendasi Perbaikan
        Berikan saran teknis yang jelas, disertai justifikasi. Bila perlu, sertakan contoh perbaikan kode.

        5. Kesimpulan
        Simpulkan apakah kode tersebut dapat dianggap stabil/siap digunakan atau memerlukan revisi lebih lanjut.

        Gunakan gaya bahasa profesional dan langsung pada poin, dengan fokus pada kualitas dan kejelasan analisis.
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
            'sampleWebview',
            'My Webview Panel',
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

            <button onclick="sayHello()">Klik Saya</button>

            <script>
                function sayHello() {
                alert("Hello from inside Webview!");
                }
            </script>
            </body>
            </html>
        `;
        }
    }

    async redirectToWeb(resultUnitTest) {
        const report = `
            <h2><strong>LAPORAN HASIL KINERJA PENGEMBANGAN FITUR [Nama Fitur]</strong></h2>
            <h2>
                <strong>Nomor Dokumen:</strong> [Isi Nomor Dokumen] <br>
                <strong>Tanggal:</strong> [Isi Tanggal] <br>
                <strong>Nama Pengembang:</strong> [Isi Nama] <br>
                <strong>Divisi:</strong> [Isi Divisi] <br>
                <strong>Proyek:</strong> [Nama Proyek/Aplikasi] <br>
                <strong>Versi:</strong> [Versi Aplikasi/Fitur] <br>
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
            <p>Bagian ini menjelaskan detail teknis implementasi, termasuk cuplikan kode yang dibuat.</p>

            <h3><strong>3.1. Kode Implementasi</strong></h3>
            <p>📌 Tambahkan bagian ini sesuai dengan kode yang digunakan dalam fitur.</p>

            <h4>📌 Kode Registrasi Pengguna (<code>authController.js</code>)</h4>
            <pre>
                <code>
                    // Contoh kode registrasi pengguna
                    const bcrypt = require('bcrypt');
                    const User = require('../models/User');

                    exports.register = async (req, res) => {
                        const { email, password } = req.body;
                        const hashedPassword = await bcrypt.hash(password, 10);
                        const user = await User.create({ email, password: hashedPassword });

                        res.status(201).json({ message: "Registrasi berhasil", user });
                    };
                </code>
            </pre>
            <br>

            <h2><strong>4. PENGUJIAN UNIT TEST</strong></h2>
            <p>Bagian ini berisi pengujian fitur yang telah dikembangkan.</p>

            <h3><strong>4.1. Kode Pengujian</strong></h3>
            <p>📌 Tambahkan kode unit test yang digunakan</p>
            <pre>
                <code>
                    // Contoh kode pengujian unit menggunakan Jest
                    const request = require('supertest');
                    const app = require('../app');

                    describe("Testing Registrasi Pengguna", () => {
                        it("Registrasi sukses dengan data valid", async () => {
                            const response = await request(app)
                                .post('/api/auth/register')
                                .send({ email: "test@example.com", password: "password123" });

                            expect(response.status).toBe(201);
                            expect(response.body.message).toBe("Registrasi berhasil");
                        });
                    });
                </code>
            </pre>
            <br>

            <h2><strong>5. HASIL PENGUJIAN</strong></h2>
            <p>Bagian ini berisi tabel hasil pengujian.</p>
            ${resultUnitTest}
            <br>

            <h2><strong>6. ANALISIS DAN EVALUASI</strong></h2>
            <p>Bagian ini menganalisis hasil pengujian dan memberikan insight lebih lanjut.</p>

            <p>✏️ <strong>Contoh Pengisian:</strong></p>
            <p>Berdasarkan hasil pengujian, fitur telah <strong>berjalan sesuai spesifikasi</strong>. 
            Tidak ditemukan error besar dalam pengujian, tetapi ada beberapa catatan:</p>
            
            <ul>
                <li><strong>Perlu peningkatan validasi input</strong> untuk mencegah penyalahgunaan.</li>
                <li><strong>Keamanan autentikasi dapat ditingkatkan</strong> dengan enkripsi tambahan.</li>
            </ul>
        `;

        const data = {
            apiKey: 'e2714f8565f136bef2e499f68df3b434f785a4c5fc6f25b07168968b69ce3f14',
            report: report
        };

        const url = `http://127.0.0.1:8000/buat-laporan?&${new URLSearchParams(data).toString()}`;
        await vscode.env.openExternal(vscode.Uri.parse(url));
    }
}

module.exports = ReportService;
