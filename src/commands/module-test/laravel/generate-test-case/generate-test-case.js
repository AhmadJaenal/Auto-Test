const { OpenAI } = require('openai');
const vscode = require('vscode');
const TemporaryFileModule = require('../generate-temporary-file/create-temporary');
const UnitTestManager = require('../../auto-test/unit-test-manager');

class GenerateTestModule {
    constructor() {
        this.temporary = new TemporaryFileModule();
        this.unitTest = new UnitTestManager();
    }
    async generateUnitTest({ code, type = "controller", route = null, middleware = null, migration = null, atribut = null, isLaravel = false, isDart = false, tableName = [] }) {
        const openai = new OpenAI({
            apiKey: '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',
        });

        let prompt = '';

        if (isLaravel) {
            switch (type) {
                case "controller":
                    prompt = `
Anda adalah seorang SOFTWARE TESTER yang sangat ahli dalam kode tes untuk bahasa pemrograman. Anda SANGAT JELI dalam membuat kode tes. Anda juga selalu DAPAT MELIHAT KELEMAHAN DARI SEBUAH KODE. Sekarang tugas ANDA adalah MEMBUAT KODE TES BERDASARKAN KODE YANG DIKIRIM TANPA HARUS MENJELASKAN APAPUN. Kode yang Anda harus buatkan tes-nya adalah kode yang bisa dimengerti oleh programmer pemula yang tidak memiliki pengalaman dalam membuat kode tes. Kode tes yang Anda buat HARUS sesederhana mungkin agar mudah dipahami oleh programmer pemula. 
HASIL yang Anda berikan akan langsung dimasukan ke dalam sebuah file tes dan dijalankan pengujian. Jadi berikan hasilnya hanya berupa kode tes agar tidak ada penyesuaian yang perlu dilakukan. Berikut adalah potongan kode CONTROLLER yang harus anda buatkan kode tes nya
${code}
${middleware ? `Code tersebut menggunakan middleware auth: ${middleware}.` : ''}
${route ? `Route kode tersebut adalah sebagai berikut: ${route}` : ''}
${code}
${middleware ? `Code tersebut menggunakan middleware auth: ${middleware}.` : ''}
${route ? `Route kode tersebut adalah sebagai berikut: ${route}` : ''}
${atribut ? `Berikut adalah artibut yang ada pada file resource, jadi sesuikan datanya dengan atribut berikut: ${atribut}` : ''}
${tableName ? `Berikut adalah nama model dan table yang digunakan pada databasenya: ${tableName}` : ''}
                            
Langkah-langkah yang harus dilakukan:
1. class dibuat dengan nama TemporaryTest
2. Kode tes yang dibuat harus mencakup berhasil, gagal, validasi, tanpa parameter
3. Buat kode tes dengan menggunakan PHPUnit
4. Buat kode tes tanpa menggunakan Mock
5. Model, Factory dan Seeder sudah tersedia dan siap digunakan, untuk penamaan model Anda dapat melihat dari kode yang dikirimkan
Contoh:
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

Dari kode yang ada anda apat menggunakan model User dan News.
6. Untuk kode yang menggunakan storage, perhatikan penamaan filenya, karena itu akan memperngaruhi hasil dari unit test
Contoh: 
public function addImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:4000',
            ]);

            $imageName = time() . '.' . $request->image->extension();
            $path = $request->image->storeAs('image', $imageName, 'public');
            $imageUrl = "storage/" . $path;

            Gallery::create([
                'url_img' => $imageUrl,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return back()->with('success', 'Image uploaded successfully.');
        } catch (\Throwable $th) {
            return back()->with('failed', 'Failed to upload image.');
        }
    }
Dari kode tersebut yang Anda harus perhatikan adalah nama file yang dirubah dan sedikit sulit.
$imageName = time() . '.' . $request->image->extension();
            $path = $request->image->storeAs('image', $imageName, 'public');
            $imageUrl = "storage/" . $path;
Kode seperti ini yang seperti ini yang harus Anda perhatikan.
7. Database harus di reset setiap test dilakukan
8. Untuk data yang membutuhkan seeder, kamu bisa memanggil seedernya, gunakan kode seperti berikut untuk setup seeder
public function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

9. Untuk semua kode tes yang Anda buat, Anda HARUS melakukan IMPORT classnya
10. Untuk kode tes yang memungkinkan akan TERJADI ERROR saat dilakukan pengujian sebaiknya Anda JANGAN MEMBUATNYA.
Tolong buat unit seperti beberapa contoh berikut agar menghasilkan kode yang konsisten
public function testDashboardSuccess()
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->get('dashboard');

        $response->assertStatus(200);

        $response->assertViewIs('dashboard.pages.index');

        $response->assertViewHas('user', $user);
    }

    public function testDashboardFailed()
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->get('dashboard-failed');

        $response->assertStatus(404);
    }

    public function testDashboardRedirect()
    {
        $response = $this->get('dashboard');

        $response->assertStatus(302);

        $response->assertRedirect('login');
    }

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

    public function testDeleteNewsNotFound()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('deleteNews', 9999));

        $response->assertSessionHas('failed', 'Data Gagal Dihapus');
    }

    public function testAddNewsSuccess()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $fakeImage = UploadedFile::fake()->image('image.jpg', 800, 600);

        $dataBaru = [
            'image' => $fakeImage,
            'title' => 'Update',
            'content' => 'Deskripsi news yang baru',
        ];

        $response = $this->post("/addNews", $dataBaru);

        $response->assertSessionHas('success', 'News uploaded successfully.');

        $this->assertDatabaseHas('news', [
            'title' => 'Update',
            'content' => 'Deskripsi news yang baru',
        ]);
    }

    public function testUpdateNewsSuccess()
    {
        $this->testAddNewsSuccess();
        $user = User::factory()->create();
        $this->actingAs($user);

        $news = News::first();
        $dataBaru = [
            'title' => 'Update',
            'content' => 'Deskripsi news yang baru',
        ];

        $response = $this->post("updateNews/{$news->id}", $dataBaru);

        $result = News::findOrFail($news->id);
        $this->assertEquals($dataBaru['title'], $result->title);

        $response->assertSessionHas('success', 'News updated successfully.');
    }
`;
                    break;
                case "model":
                    prompt = "";
                case "apiController":
                    prompt = `
Anda adalah seorang SOFTWARE TESTER yang sangat ahli dalam kode tes untuk bahasa pemrograman. Anda tidak pernah melakukan KESALAHAN DALAM MEMBUAT KODE TES. Anda juga selalu DAPAT MELIHAT KELEMAHAN DARI SEBUAH KODE. Jadi tugas ANDA HANYA MEMBUAT KODE TES BERDASARKAN KODE YANG DIKIRIM TANPA HARUS MENJELASKAN APAPUN. Kode yang Anda harus buatkan tes-nya adalah kode yang bisa dimengerti oleh programmer pemula yang tidak memiliki pengalaman dalam membuat kode tes. Kode tes yang Anda buat HARUS sesederhana mungkin agar mudah dipahami oleh programmer pemula. 
HASIL yang Anda berikan akan langsung dimasukan ke dalam sebuah file tes dan dijalankan pengujian. Jadi berikan hasilnya hanya berupa kode tes agar tidak ada penyesuaian yang perlu dilakukan. Berikut adalah potongan kode CONTROLLER SEBUAH API yang harus anda buatkan kode tes nya
${code}
${middleware ? `Code tersebut menggunakan middleware auth: ${middleware}.` : ''}
${route ? `Route kode tersebut adalah sebagai berikut: ${route}` : ''}
${atribut ? `Berikut adalah artibut yang ada pada file resource, jadi sesuikan datanya dengan atribut berikut: ${atribut}` : ''}
${tableName ? `Berikut adalah nama model dan table yang digunakan pada databasenya: ${tableName}` : ''}
                            
Langkah-langkah yang harus dilakukan:
1. class dibuat dengan nama TemporaryTest
2. Kode tes yang dibuat harus mencakup berhasil, gagal, validasi, tanpa parameter
3. Buat kode tes dengan menggunakan PHPUnit
4. Buat kode tes tanpa menggunakan Mock
5. Model, Factory dan Seeder sudah tersedia dan siap digunakan, untuk penamaan model Anda dapat melihat dari kode yang dikirimkan
Contoh:
public function show($id)
    {
        $module = ClassRoom::findorFail($id);
        if (!$module) {
            return new HttpResponseException(response()->json([
                'errors' => [
                    "message" => [
                        "not found"
                    ]
                ]
            ], 404));
        }

        return response()->json([
            'data' => new ClassRoomResource($module)
        ], 200);
    }
Dari kode yang ada anda apat menggunakan model ClassRoom.
6. Untuk kode yang menggunakan storage, perhatikan penamaan filenya, karena itu akan memperngaruhi hasil dari unit test
Contoh: 
public function addImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:4000',
            ]);

            $imageName = time() . '.' . $request->image->extension();
            $path = $request->image->storeAs('image', $imageName, 'public');
            $imageUrl = "storage/" . $path;

            Gallery::create([
                'url_img' => $imageUrl,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return back()->with('success', 'Image uploaded successfully.');
        } catch (\Throwable $th) {
            return back()->with('failed', 'Failed to upload image.');
        }
    }

Berarti untuk kode tes-nya anda harus membuat seperti berikut
$imageName = time() . '.' . $request->image->extension();
$path = $request->image->storeAs('image', $imageName, 'public');
$imageUrl = "storage/" . $path;

7. Database harus di reset setiap test dilakukan
8. Untuk data yang membutuhkan seeder, kamu bisa memanggil seedernya, gunakan kode seperti berikut untuk setup seeder
public function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

9. Untuk semua kode tes yang Anda buat, Anda HARUS melakukan IMPORT classnya
10. Untuk Reponse kode tes akan diberikan sebuah atribut sebagai informasi tambahan, tetapi untuk mencegah terjadinya error, Anda hanya perlu membuat response sesuai dengan kode inputnya
Contoh: Sebagai contoh anda diberikan sebuah atribut [‘project_id’, ‘title’, ‘desc’, ‘module‘, ‘created_at’, ‘updated_at’, ’deleted_at’, ‘author’]. Tetapi dalam proses post data yang ada hanya project_id, title, desc dan module. Maka untuk kode tes yang anda tulis Anda hanya perlu menulis sesuai data yang ada pada kode saja. Ini berguna untuk mencegah terjadinya error.
public function testAddNewTaskSuccess()
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $this->withHeaders([
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $user->token,
        ])->post('/api/task/add', [
            'project_id' => 1,
            'title' => 'Mobile Dev',
            'desc' => 'desc project',
            'module' => 'Module Dev'
        ])->assertStatus(201)
            ->assertJson([
                'data' => [
                    'project_id' => 1,
                    'title' => 'Mobile Dev',
                    'desc' => 'desc project',
                    'module' => 'Module Dev'
                ]
            ]);
    }

11. Jadi atribut yang Anda buat adalah
public function testUpdateSchoolSuccess()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $school = School::query()->limit(1)->first();
    $this->withHeaders(
        [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer '. $user->token,
        ],
    )->patch('/api/school/' . $school->id . '/update', [
        'name' => 'Update School Name'
    ])->assertStatus(200)
        ->assertJson([
            'data' => [
                'name' => 'Update School Name',
                'duration_intern' => $school->duration_intern,
            ]
        ]);
}
12. Jika api menggunakan middleware atau jenis hak akses lain, Anda bisa menggunakan seperti kode dibawah

public function testUpdateSchoolFailed()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $school = School::query()->limit(1)->first();
    $this->withHeaders(
        [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $user->token,
        ],
    )->patch('/api/school/' . $school->id + 100 . '/update', [
        'name' => 'Update School Name'
    ])->assertStatus(404)
        ->assertJson([
            'errors' => [
                'message' => 'School not found'
            ]
        ]);
}

public function testGetSchoolByIdSuccess()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $school = School::query()->limit(1)->first();
    $this->withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer ' . $user->token,
    ])->get('/api/school/' . $school->id, [])->assertStatus(200)
        ->assertJson([
            'data' => [
                'id' => $school->id,
                'name' => $school->name,
                'duration_intern' => $school->duration_intern,
            ]
        ]);
}

public function testGetSchoolByIdFailed()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $school = School::query()->limit(1)->first();
    $this->withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer ' . $user->token,
    ])->get('/api/school/' . $school->id + 100, [])->assertStatus(404)
        ->assertJson([
            'errors' => [
                'message' => 'School not found'
            ]
        ]);
}


13. Untuk kode tes yang memungkinkan akan TERJADI ERROR saat dilakukan pengujian sebaiknya Anda JANGAN MEMBUATNYA.
Contoh
public function testGetSchoolByIdSuccess()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $school = School::query()->limit(1)->first();
    $this->withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer ' . $user->token,
    ])->get('/api/school/' . $school->id, [])->assertStatus(200)
        ->assertJson([
            'data' => [
                'id' => $school->id,
                'name' => $school->name,
                'duration_intern' => $school->duration_intern,
                menambahkan parameter tambahan yang tidak Anda ketahui
            ]
        ]);
}
           
Atribut yang pada assertJson itu adalah hasil dari proses pembuatan yang telah diverifikasi keberadaanya. Jadi Anda tidak perlu membuat atribut tambahan JIKA tidak memiliki informasi atas atribut atau kode yang ANDA terima.

10. Untuk kode tes yang memungkinkan akan TERJADI ERROR saat dilakukan pengujian sebaiknya Anda JANGAN MEMBUATNYA.
Tolong buat unit seperti beberapa contoh berikut agar menghasilkan kode yang konsisten
public function testAddPresenceSuccess()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $this->withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer '. $user->token,
    ])->post('/api/presence/add', [
        'status' => 'Hadir',
        'day' => 1,
    ])->assertStatus(201)
        ->assertJson([
            'data' => [
                'user_id' => Auth::user()->id,
                'status' => 'Hadir',
                'day' => 1,
            ]
        ]);
}

public function testAddPresenceFailed()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $this->withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer '. $user->token,
    ])->post('/api/presence/add', [])->assertStatus(400)
        ->assertJson([
            'errors' => [
                'status' => [
                    'The status field is required.'
                ]
            ]
        ]);
}

public function testDeletePresenceSuccess()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $presence = Presence::query()->limit(1)->first();
    $this->withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer ' . $user->token,
    ])->delete('/api/presence/ ' . $presence->id . '/delete', [])->assertStatus(200)
        ->assertJson([
            'data' => [
                'message' => true,
            ]
        ]);
}

public function testDeletePresenceFailed()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $this->withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer ' . $user->token,
    ])->delete('/api/presence/100/delete', [])->assertStatus(404)
        ->assertJson([
            'errors' => [
                'message' => 'Presence not found',
            ]
        ]);
}

public function testGetPresenceByUserIdSuccess()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $this->withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer '. $user->token,
    ])->get('/api/presence/3/user', [])->assertStatus(200)
        ->assertJson([
            'data' => [
                [
                    'user_id' => 3,
                    'status' => 'Hadir',
                ],
                [
                    'user_id' => 3,
                    'status' => 'Sakit',
                ],
                [
                    'user_id' => 3,
                    'status' => 'Izin',
                ],
                [
                    'user_id' => 3,
                    'status' => 'Alpa',
                ],
            ]
        ]);
}

public function testGetPresenceByUserIdFailed()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $this->withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer ' . $user->token,
    ])->get('/api/presence/100/user', [])->assertStatus(404)
        ->assertJson([
            'errors' => [
                'message' => 'User not found'
            ]
        ]);
}

public function testUpdatePresenceSuccess()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $presence = Presence::query()->limit(1)->first();
    $this->withHeaders(
        [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $user->token,
        ],
    )->patch('/api/presence/' . $presence->id . '/update', [
        'status' => 'test'
    ])->assertStatus(200)
        ->assertJson([
            'data' => [
                'status' => 'test',
            ]
        ]);
}

public function testUpdatePresenceFailed()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $presence = Presence::query()->limit(1)->first();
    $this->withHeaders(
        [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $user->token,
        ],
    )->patch('/api/presence/' . $presence->id + 10 . '/update', [
        'status' => 'test'
    ])->assertStatus(404)
        ->assertJson([
            'errors' => [
                'message' => 'Presence not found'
            ]
        ]);
}
public function testAllProjectUnauthorized()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $this->withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer '. $user->token,
    ])->get('/api/project', [])->assertStatus(401)
        ->assertJson([
            'message' => 'Unauthenticated.'
        ]);
}

public function testGetProjectById()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $project = Project::first();
    $this->withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer '. . $user->token,
    ])->get('/api/project/' . $project->id, [])->assertStatus(200)
        ->assertJson([
            'data' => [
                'id' => $project->id,
                'name' => 'Tasty Food',
                'desc' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
            ]
        ]);
}

public function testGetProjectFailed()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $project = Project::first();
    $this->withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer '. . $user->token,
    ])->get('/api/project/' . $project->id + 100, [])->assertStatus(404)
        ->assertJson([
            'errors' => [
                'message' => 'Project not found'
            ]
        ]);
}

public function testAddNewProjectSuccess()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $this->withHeaders(
        [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer '. $user->token,
        ],
    )->post('/api/project/add/', [
        'name' => 'Mobile Dev',
        'desc' => 'desc project',
        'asset' => 'asset Dev'
    ])->assertStatus(201)
        ->assertJson([
            'data' => [
                'name' => 'Mobile Dev',
                'desc' => 'desc project',
                'asset' => 'asset Dev'
            ]
        ]);
}

public function testAddNewProjectFailed()
{
    $this->withHeaders(
        [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer '. $user->token,
        ],
    )->post('/api/project/add/', [
        'name' => 'Mobile Dev',
        'desc' => 'desc project',
    ])->assertStatus(400)
        ->assertJson([
            'errors' => [
                'asset' => [
                    'The asset field is required.'
                ],
            ]
        ]);
}

public function testDeleteProjectSuccess()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $project = Project::query()->limit(1)->first();
    $this->withHeaders(
        [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer '. $user->token,
        ],
    )->delete('/api/project/' . $project->id . '/delete', [])->assertStatus(200)
        ->assertJson([
            'data' => [
                'message' => true,
            ]
        ]);
}

public function testDeleteProjectFailed()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    $project = Project::query()->limit(1)->first();
    $this->withHeaders(
        [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $user->token,
        ],
    )->delete('/api/project/' . $project->id + 10 . '/delete', [])->assertStatus(404)
        ->assertJson([
            'errors' => [
                'message' => 'Project not found'
            ]
        ]);
}
                            `;
                    break;
                default:
                    prompt = '';
            }

        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4.1',
            messages: [{ role: 'user', content: prompt }],
        });

        const cleanResponse = GenerateTestModule.cleanApiResponse(response.choices[0].message.content);

        if (isLaravel) {
            vscode.window.showInformationMessage(`Hasil ${response}`);
            this.temporary.createTemporaryFileLaravel(cleanResponse);
            this.unitTest.runUnitTestLaravel();
        }

        vscode.window.showInformationMessage("Request selesai");

    }

    static cleanApiResponse(response) {
        const match = response.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
        return match ? match[1].trim() : '';
    }

}

module.exports = GenerateTestModule;
