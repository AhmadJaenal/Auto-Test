const vscode = require('vscode');

class ReportService {
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
            apiKey: 'dfhdjfhdjfd',
            report: report
        };

        const url = `http://127.0.0.1:8000/buat-laporan?${new URLSearchParams(data).toString()}`;
        await vscode.env.openExternal(vscode.Uri.parse(url));
    }
}

module.exports = ReportService;
