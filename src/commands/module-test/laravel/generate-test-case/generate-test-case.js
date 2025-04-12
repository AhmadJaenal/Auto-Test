const vscode = require('vscode');
const TemporaryFileModule = require('../generate-temporary-file/create-temporary');
const UnitTestManager = require('../../auto-test/unit-test-manager');

class GenerateTestModule {
    constructor() {
        this.temporary = new TemporaryFileModule();
        this.unitTest = new UnitTestManager();
    }

    generateUnitTest({ code, type = "controller", route, middleware, migration, atribut }) {
        const apiKey = 'AIzaSyDxsVF-a_js4PhWguZbU3P8KRel1FHrUjU';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        let promptRequest;

        switch (type) {
            case "controller":
                promptRequest = {
                    contents: [{
                        parts: [{
                            text: `Saya adalah seorang programmer pemula yang sedang belajar mengenai unit test. Tolong bantu saya membuat kode unit test yang bersih, sederhana, dan terstruktur menggunakan framework Laravel versi 11. Unit test ini harus mencakup semua kemungkinan logika dan kondisi yang muncul dalam kode yang akan diuji, serta ditulis dalam gaya **terstruktur dan berbasis logika kode**.

                                    Ikuti pendekatan berikut dalam menyusun kode:
                                    - **Langkah 1**: Setup data dan autentikasi (jika ada middleware).
                                    - **Langkah 2**: Jalankan aksi sesuai route dan logika dalam controller.
                                    - **Langkah 3**: Lakukan validasi hasil menggunakan assertion PHPUnit.
                                    - **Langkah 4**: Periksa semua kemungkinan skenario (berhasil, gagal validasi, error, akses tidak sah).
                                    - **Langkah 5**: Ulangi proses ini untuk setiap skenario dengan pemisahan fungsi test yang jelas.
                                    - Tuliskan setiap fungsi test berdasarkan **struktur kode dan logika sistem yang sebenarnya**, seolah-olah Anda sedang berpikir dalam bentuk kode (*chain-of-code*).

                                    ### Berikut adalah kode yang akan diuji:
                                    ${code}

                                    ${middleware ? `Code tersebut menggunakan middleware auth: ${middleware}.` : ''}

                                    ### Route-nya adalah sebagai berikut:
                                    ${route}

                                    ### Kriteria hasil unit test:
                                    1. Gunakan PHPUnit terbaru (Laravel 11).
                                    2. Class unit test bernama 'TemporaryTest'.
                                    3. Test harus mencakup semua skenario logika:
                                    - Skenario sukses
                                    - Skenario validasi gagal
                                    - Skenario error tak terduga (bukan error database)
                                    - Skenario akses tidak diizinkan (jika ada middleware)
                                    4. Model dan Factory sesuai dengan yang digunakan dalam code controller.
                                    5. Impor semua model yang digunakan di bagian atas ('use App\Models\NamaModel;').
                                    6. Hindari penggunaan mock object.
                                    7. Jangan beri komentar, penjelasan, atau tag bahasa apa pun.
                                    8. Kode harus langsung bisa dipakai di file test tanpa perlu penyesuaian tambahan dan hilangkan tag bahasa pemrograman seperi php, dart, flutter dan lainya.

                                    ### Contoh unit test yang ingin ditiru:
                                    _(kode ini berfungsi sebagai referensi struktur dan gaya penulisan)_

                                    public function testDeleteNewsSuccess()
                                    {
                                        $user = User::factory()->create();
                                        $this->actingAs($user);

                                        News::factory()->create([
                                            'url_img' => 'public/image/sample.jpg',
                                        ]);

                                        $news = News::first();

                                        Storage::fake('public');
                                        Storage::put('public/image/sample.jpg', 'content');

                                        $this->assertDatabaseHas('news', ['id' => $news->id]);
                                        $response = $this->post(route('deleteNews', $news->id));

                                        $this->assertDatabaseMissing('news', ['id' => $news->id]);
                                        Storage::disk('public')->assertMissing('image/sample.jpg');

                                        $response->assertSessionHas('success', 'Data Berhasil Dihapus');
                                    }
                                    `
                        }]
                    }]
                };

                break;

            case "migration":
                promptRequest = {
                    content: [{
                        parts: [{
                            text: `Saya adalah seorang programmer pemula yang sedang belajar mengenai unit test. Tolong buatkan code unit test menggunakan framework Laravel versi 11. Tujuan dari unit test ini adalah mencakup semua kemungkinan skenario (success, failure, error handling, dll.), tetapi tetap sederhana, mudah dipahami, dan langsung dapat dijalankan tanpa penyesuaian tambahan.
        
        Code yang akan diuji adalah sebagai berikut:
        
        ${code}
        
        ${middleware ? `Code tersebut menggunakan middleware auth: ${middleware}.` : ''}
        
        Route nya adalah sebagai berikut
        ${route}
        
        Kriteria hasil unit test yang diharapkan:
        
        1. Hasil unit test berbentuk code PHP yang sesuai dengan PHPUnit versi terbaru.
        2. Class unit test bernama TemporaryTest.
        3. Semua skenario kemungkinan pada code harus tercakup dalam test case, seperti:
            - Kondisi berhasil
            - Validasi gagal
            - Akses tidak diizinkan (jika ada middleware)
            - Error yang mungkin terjadi, kecuali test case database error
        4. Nama model dan factory harus mengikuti yang digunakan pada code.
        5. Tidak perlu komentar atau penjelasan tambahan dalam kode unit test.
        6. Semua model dan factory yang dibutuhkan sudah tersedia, jadi anda tinggal mendefinisikan saja.
        7. Buat code unit test sesederhana mungkin, agar tidak dimengerti oleh programmer pemula.
        
        Output yang dihasilkan harus berupa:
        
            - Hanya code unit test tanpa penjelasan apa pun.
            - Tidak ada penjelasan tentang cara penggunaannya.
            - Kode siap ditempatkan dalam file test langsung tanpa pembersihan lebih lanjut.
            - Tidak ada tag bahasa pemrograman dalam kode, seperti php, python, dll.
        
        Catatan:
        Jika dalam code unit test yang dihasilkan terdapat penggunaaan Model maka model tersebut harus sudah diimport juga.
        Contoh: $user = User::factory()->create();, maka diatasnya harus ada use App\Models\User;, dan hindari penggunaan $user = \App\Models\User::factory()->create(); secara langsung.
        
        Hindari penggunaan mock object dalam code unit test yang dihasilkan.
        
        Hasilkan code unit test sesuai dengan contoh code unit test berikut:
        public function testDeleteNewsSuccess()
        {
            $user = User::factory()->create();
            $this->actingAs($user);
        
            News::factory()->create([
                'url_img' => 'public/image/sample.jpg',
            ]);
        
            $news = News::first();
        
            Storage::fake('public');
            Storage::put('public/image/sample.jpg', 'content');
        
            $this->assertDatabaseHas('news', ['id' => $news->id]);
            $response = $this->post(route('deleteNews', $news->id));
        
            $this->assertDatabaseMissing('news', ['id' => $news->id]);
            Storage::disk('public')->assertMissing('image/sample.jpg');
        
            $response->assertSessionHas('success', 'Data Berhasil Dihapus');
        }`
                        }]
                    }]
                };
                break;

            case "model":
                {
                    promptRequest = {
                        content: [{
                            parts: [{
                                text: ""
                            }]
                        }]
                    }
                }
                break

            default:
                vscode.window.showErrorMessage("Jenis Kode tidak terdeteksi");
                return;
        }

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(promptRequest)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const generateTestCase = data['candidates'][0]['content']['parts'][0]['text'];
                const cleanResponse = GenerateTestModule.cleanApiResponse(generateTestCase);
                this.temporary.createTemporaryFile(cleanResponse);
                this.unitTest.runUnitTestLaravel();
            })
            .catch(error => {
                vscode.window.showErrorMessage(`There was a problem with the fetch operation: ${error.message}`);
            });
    }

    static cleanApiResponse(response) {
        return response
            .replace(/```php/g, '')
            .replace(/```/g, '')
            .trim();
    }
}

module.exports = GenerateTestModule;
