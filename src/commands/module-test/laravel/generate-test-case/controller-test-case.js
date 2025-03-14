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

function generateControllerTest(code, middleware, route) {
    const apiKey = 'AIzaSyDxsVF-a_js4PhWguZbU3P8KRel1FHrUjU';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestData = {
        contents: [{
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
}
`
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