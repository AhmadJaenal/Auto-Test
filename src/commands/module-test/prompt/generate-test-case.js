const { OpenAI } = require('openai');
const vscode = require('vscode');
const TemporaryFile = require('../temporary-file/create-temporary');
const ApiKeyHandler = require('../api/api-key-handler');

class GenerateTestModule {
    async generateUnitTest({ code, type = "function", resource = null, request = null, attributeMigration = null, modelName = null, attributesModelDart = null, framework = null, context, views = null }) {
        const apiKeyHandler = new ApiKeyHandler();
        const temporary = new TemporaryFile();

        const apiKey = await apiKeyHandler.getOpenAIKey(context);
        if (!apiKey) {
            vscode.window.showErrorMessage('API Key OpenAI belum dipasang. Silakan pasang API Key terlebih dahulu.');
            return;
        }

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        let prompt = '';

        switch (framework) {
            case 'laravel':
                switch (type) {
                    case 'function':
                        prompt = ` 
Anda adalah seorang SOFTWARE TESTER profesional.
Tugas Anda adalah membuat skenario uji dengan mencari kelemahan atau potensi bug(error) dari kode yang di uji kemudian membuatkan kode unit test-nya menggunakan Mockery, agar dapat dimengerti dan dijalankan oleh programmer pemula.

Tujuan 
Buat kode unit test terhadap potongan kode function controller di bawah ini.
Kode yang harus diuji: ${code}

PENTING: 
- Pada model ${modelName} terdapat beberapa atribut migration yaitu ${attributeMigration}. 

Daftar path view yang TERDAFTAR di sistem
- Views yang ada pada proyek ini yaitu ${views}

Ketika kode controller memanggil fungsi view('some.path'), maka:

- Jika path TERDAFTAR dalam dalam sistem:
Tulis mock sebagai:
View::shouldReceive('make')
    ->once()
    ->with('path', [...], []) // Isi dengan path yang terdaftar
    ->andReturn('test_view');

$this->assertEquals('test_view', $response);

- Jika view TIDAK TERDAFTAR dalam sistem, maka:
Contoh untuk view tidak valid:
View::shouldReceive('make')
    ->once()
    ->with('NAMA_VIEW_YANG_SALAH', [], []) // Berbeda dari controller
    ->andReturn('test_view');

$this->assertEquals('test_view', $response); 

ATURAN MOCK:
1. **Mock expectation (shouldReceive)**: Gunakan HANYA atribut dari migration: ${attributeMigration}
2. **Mock controller class**: Salin persis kode asli tanpa perubahan apapun, termasuk typo dan kesalahan

Contoh Mock expectation yang BENAR:
$foodMock->shouldReceive('create')
->withArgs(function ($input) {  
    return $input['url_img'] === 'storage/image/123456.jpg' // Gunakan atribut migration (url_img), bukan dari kode (url_imf)
        && $input['food'] === $mockRequest->food
        && isset($input['created_at']);
})

Contoh Mock dengan mengembalikan halaman yang benar
public function test_login_return_view()
{
    View::shouldReceive('make')
        ->once()
        ->with('auth.login', [], []) 
        // Jika nama view pada controller TIDAK terdaftar di sistem,
        // maka parameter di .with() HARUS dibuat berbeda dengan yang ada pada controller
        // agar unit test gagal (mengindikasikan view salah).
        // Sebaliknya, jika nama view pada controller TERDAFTAR di sistem,
        // maka parameter di .with() HARUS SAMA PERSIS agar unit test berhasil.
        ->andReturn('test_view');

    // Mock Controller: salin PERSIS kode asli yang diuji, TIDAK boleh diperbaiki walau ada typo/kesalahan
    $controller = new class {
        public function about()
        {
            return view("landingPage.pages.about");
        }
    };

    $response = $controller->login();

    // Assertion: pastikan hasil sama 'test_view' (dari mock View::make)
    $this->assertEquals('test_view', $response);
}

ATURAN & FORMAT:
1. Nama class test harus: TemporaryTest
2. Semua test menggunakan Mockery
3. Seluruh pengujian dibuat dalam bentuk fungsi-fungsi public function test_*()
4. Jangan menyertakan komentar atau penjelasan — hanya kode PHP test lengkap
5. Tidak perlu output tambahan apapun selain kode
6. Pada saat membuat Mock kode yang akan di uji tidak boleh terdapat perubahan, harus sesuai dengan kode yang diterima 

CAKUPAN TEST WAJIB (minimal 4 test jika memungkinkan):
1. Test berhasil menambahkan data pada database
2. Test gagal menyimpan data (misalnya karena save() tidak dipanggil atau return false)
3. Test validasi error atau exception
4. Test pemanggilan fungsi tanpa parameter

KETENTUAN TAMBAHAN
1. Gunakan teknik mocking penuh (Mockery) untuk semua dependency eksternal (seperti Auth, View, Redirect, Request, dll)
2. Jika terdapat pemanggilan terhadap library/helper eksternal, buat mock function-nya jika belum tersedia, kecuali untuk Str, Hash, dan UUID maka gunakan nilai secara eksplisit. Berikut contohnya:
    Kode yang akan diuji
    $validated['short_description'] = Str::of($validated['description'])->limit(100);

    Maka kode unit test bisa seperti berikut
    $validated['short_description'] = "lorem ipsum";

3. Gunakan pattern dan struktur test seperti pada contoh di bawah ini
STRUKTUR FILE
Semua kode test harus berada dalam 1 file class berikut ini:

<?php
namespace Tests\\Feature;

use Tests\\TestCase;
use Mockery;
use Illuminate\\Support\\Facades\\Auth;
use Illuminate\\Support\\Facades\\Redirect;
use Illuminate\\Support\\Facades\\View;

class TemporaryTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // Kode uji
}

4. Kode yang dibuat mengikuti contoh-contoh unit test berikut

// Test: Login dipanggil, return view login
public function test_login_return_view()
{
    View::shouldReceive('make')
        ->once()
        ->with('auth.login', [], []) 
        ->andReturn('test_view');

    $controller = new class {
        public function about()
        {
            return view("landingPage.pages.about");
        }
    };

    $response = $controller->login();
    $this->assertEquals('test_view', $response);
}

// Test return view dengan alamat yang salah
public function test_about_return_view_fail_wrong_view_name()
{
    View::shouldReceive('make')
        ->once()
        ->with('landingPage.pages.abaut', [], [])
        ->andReturn('wrong_view');

    $controller = new class {
        public function about()
        {
            return view("landingPage.pages.about");
        }
    };

    $result = $controller->about();

    $this->assertEquals('wrong_view', $result);
}

// Test: User sudah login, redirect ke dashboard (berhasil login)
public function test_login_user_already_logged_in_redirects_to_dashboard()
{
    // Mock Auth::check() return true
    Auth::shouldReceive('check')
        ->once()
        ->andReturn(true);

    // Mock Redirect::to('dashboard')
    Redirect::shouldReceive('to')
        ->with('dashboard')
        ->andReturn('redirect_dashboard');

    $controller = new class {
        public function login() {
            if (Auth::check()) {
                return Redirect::to('dashboard');
            } else {
                return View::make('dashboard.pages.auth.login');
            }
        }
    };

    $result = $controller->login();

    $this->assertEquals('redirect_dashboard', $result);
}

// Test: User belum login, return view login (gagal login)
public function test_login_user_not_logged_in_returns_login_view()
{
    // Mock Auth::check() return false
    Auth::shouldReceive('check')
        ->once()
        ->andReturn(false);

    // Mock View::make
    View::shouldReceive('make')
        ->with('dashboard.pages.auth.login')
        ->andReturn('login_view');

    $controller = new class {
        public function login() {
            if (Auth::check()) {
                return Redirect::to('dashboard');
            } else {
                return View::make('dashboard.pages.auth.login');
            }
        }
    };

    $result = $controller->login();

    $this->assertEquals('login_view', $result);
}

// Test: login dipanggil tanpa parameter (tanpa parameter)
public function test_login_without_parameters_works_well()
{
    Auth::shouldReceive('check')
        ->once()
        ->andReturn(false);

    View::shouldReceive('make')
        ->with('dashboard.pages.auth.login')
        ->andReturn('login_view');

    $controller = new class {
        public function login() {
            if (Auth::check()) {
                return Redirect::to('dashboard');
            } else {
                return View::make('dashboard.pages.auth.login');
            }
        }
    };

    // Tidak ada parameter dikirim ke login()
    $result = $controller->login();

    $this->assertEquals('login_view', $result);
}

// Test: Untuk pengujian yang menggunakan database, gunakan Mockery untuk memmock Eloquent Model
public function test_add_menu_success()
{
    // Buat mock request dengan method validate bawaan
    // Atribut mock request harus mengikuti atribut yang terdapat pada validate dalam kode yang di uji, jika atribut tidak harus menyebabkan error
    $mockRequest = new class {
        public $image;
        public $food;
        public $desc;

        public function __construct()
        {
            $this->image = new class {
                public function extension()
                {
                    return 'jpg';
                }
                public function storeAs($folder, $name, $driver)
                {
                    return 'image/123456789.jpg';
                }
            };
            $this->food = 'Ayam Bakar';
            $this->desc = 'Lezat dan gurih';
        }

        public function validate($rules)
        {
            // Simulasi validasi berhasil
            return [
                'image' => $this->image,
                'food' => $this->food,
                'desc' => $this->desc,
            ];
        }
    };

    // Mock Eloquent Model
    $foodMock = Mockery::mock();
    $foodMock->shouldReceive('create')
        ->once()
        ->withArgs(function ($input) use ($mockRequest) {
            return $input['url_img'] === 'storage/image/123456789.jpg'
                && $input['food_name'] === $mockRequest->food
                && $input['desc'] === $mockRequest->desc
                && isset($input['created_at'])
                && isset($input['updated_at']);
        })
        ->andReturnTrue();

    // Mock Redirect
    $mockRedirectResponse = Mockery::mock();
    $mockRedirectResponse->shouldReceive('with')
        ->with('success', 'Menu uploaded successfully.')
        ->andReturn('redirect_success');

    Redirect::shouldReceive('back')->once()->andReturn($mockRedirectResponse);

    // Controller anon class
    $controller = new class($foodMock) {
        protected $food;
        public function __construct($food)
        {
            $this->food = $food;
        }

        public function addMenu($request)
        {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'food' => 'required|string|max:255',
                'desc' => 'required|string',
            ]);

            $imageName = time() . '.' . $request->image->extension();
            $path = $request->image->storeAs('image', $imageName, 'public');
            $imageUrl = "storage/" . $path;

            try {
                $this->food->create([
                    'url_img' => $imageUrl,
                    'food_name' => $request->food, // Atribut $request->food seharusnya mengikuti atribut yang ada pada validate, jadi jika terdapat perbedaan unit test harus error
                    'desc' => $request->desc,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return Redirect::back()->with('success', 'Menu uploaded successfully.');
            } catch (\Throwable $th) {
                return Redirect::back()->with('failed', 'Failed to upload Menu.');
            }
        }
    };

    // Jalankan test
    $result = $controller->addMenu($mockRequest);

    $this->assertEquals('redirect_success', $result);
}


5. Gunakan use Tests\\TestCase dan import TestCase pada bagian atas kode test.
6. Perhatikan penggunaan tanda ::, sebaiknya mengikuti contoh berikut:
    
    Redirect::shouldReceive('back')->once()->andReturn($mockRedirectResponse);

    Auth::shouldReceive('check')
            ->once()
            ->andReturn(false);

    View::shouldReceive('make')
                ->with('dashboard.pages.auth.login')
                ->andReturn('login_view');

    Untuk mock jangan menggunakan :: tetapi gunakan ->, berikut contohnya:
    $foodMock->shouldReceive('create')->once()->withArgs(function ($input) {
    })->andReturnTrue();

    $mockRedirectResponse->shouldReceive('with')
        ->with('success', 'Menu uploaded successfully.')
        ->andReturn('redirect_success');

CATATAN TAMBAHAN
Jika kode program yang di tes menggunakan library tambahan, maka buatkan helpernya. 
Berikut contoh kode unit test dengan pembuatan helper
public function test_authentication_successful_login_redirect_to_dashboard()
{
    if (!function_exists('notify')) {
        function notify()
        {
            return new class {
                public function success($message, $title = null) {}
                public function error($message, $title = null) {}
            };
        }
    }

    $request = Request::create('/login', 'POST', [
        'email' => 'ahmad@gmail.com',
        'password' => 'rahasia'
    ]);

    Auth::shouldReceive('attempt')
        ->once()
        ->with([
            'email' => 'ahmad@gmail.com',
            'password' => 'rahasia'
        ])
        ->andReturn(true);

    Route::get('/dashboard', function () {
        return 'Dashboard';
    })->name('dashboard.index');

    $controller = new AuthController();
    $response = $controller->authenticate($request);

    $this->assertInstanceOf(RedirectResponse::class, $response);
    $this->assertTrue($response->isRedirect(route('dashboard.index')));
}
`;
                        break;
                    case "api function":
                        prompt = `
Anda adalah seorang SOFTWARE TESTER profesional.
Tugas Anda adalah membuat kode unit test sederhana menggunakan Mockery, agar dapat dimengerti dan dijalankan oleh programmer pemula.

Tujuan 
Buat kode unit test terhadap potongan kode function controller di bawah ini.
${code}

${request ? `Kode ini memerlukan atribut berikut agar dapat berjalan dengan benar: ${request}` : ''}

${resource ? `Kode ini mengharapkan atribut berikut ada dalam hasil: ${resource}` : ''}
                            
ATURAN & FORMAT:
1. Nama class test harus: TemporaryTest
2. Semua test menggunakan Mockery
3. Seluruh pengujian dibuat dalam bentuk fungsi-fungsi public function test_*()
4. Jangan menyertakan komentar atau penjelasan — hanya kode PHP test lengkap
5. Tidak perlu output tambahan apapun selain kode

CAKUPAN TEST WAJIB (minimal 4 test jika memungkinkan):
1. Test berhasil
2. Test gagal
3. Test validasi error atau exception
4. Test tanpa parameter

KETENTUAN TAMBAHAN
1. Gunakan teknik mocking penuh (Mockery) untuk semua dependency eksternal (seperti Auth, View, Redirect, Request, dll)
2. Jika terdapat pemanggilan terhadap library/helper eksternal, buat mock function-nya jika belum tersedia, kecuali untuk Str, Hash, dan UUID maka gunakan nilai secara eksplisit. Berikut contohnya:
    Kode yang akan diuji
    $validated['short_description'] = Str::of($validated['description'])->limit(100);

    Maka kode unit test bisa seperti berikut
    $validated['short_description'] = "lorem ipsum";

3. Gunakan pattern dan struktur test seperti pada contoh di bawah ini
STRUKTUR FILE
Semua kode test harus berada dalam 1 file class berikut ini:

<?php
namespace Tests\\Feature;

use Tests\\TestCase;
use Mockery;
use Illuminate\\Support\\Facades\\Auth;
use Illuminate\\Support\\Facades\\Redirect;
use Illuminate\\Support\\Facades\\View;

class TemporaryTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_login_user_already_logged_in_redirects_to_dashboard()
    {
      // Tempat kode test
    }

    public function test_login_user_not_logged_in_returns_login_view()
    {
        // Tempat kode test
    }

    public function test_login_without_parameters_works_well()
    {
        // Tempat kode test
    }

    public function test_add_menu_success()
    {
        // Tempat kode test
    }
}

4. Kode yang dibuat mengikuti contoh-contoh unit test berikut

//Test: User sudah masuk, diarahkan ke halaman dashboard (login berhasil)
public function test_login_success()
{
    $mockRequest = Mockery::mock(LoginRequest::class);
    $mockRequest->shouldReceive('validate')->once()->andReturn([
        'email' => 'user@gmail.com',
        'password' => 'rahasia',
    ]);

    $userMock = Mockery::mock();
    $userMock->id = 1;
    $userMock->email = 'user@gmail.com';
    $userMock->password = bcrypt('rahasia');
    $userMock->token = null;
    $userMock->shouldReceive('save')->once();

    Hash::shouldReceive('check')
        ->once()
        ->with('rahasia', $userMock->password)
        ->andReturn(true);

    $userQueryBuilderMock = Mockery::mock();
    $userQueryBuilderMock->shouldReceive('first')
        ->once()
        ->andReturn($userMock);

    $userModelMock = Mockery::mock();
    $userModelMock->shouldReceive('where')
        ->once()
        ->with('email', 'user@gmail.com')
        ->andReturn($userQueryBuilderMock);

    $userResourceMock = Mockery::mock(UserResource::class, [$userMock])->makePartial();
    $this->instance(UserResource::class, $userResourceMock);

    $controller = new class($userModelMock) {
        protected $user;
        public function __construct($user)
        {
            $this->user = $user;
        }
        public function login($request)
        {
            $data = $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required', 'string'],
            ]);
            $user = $this->user->where('email', $data['email'])->first();
            if (!$user || !Hash::check($data['password'], $user->password)) {
                throw new HttpResponseException(response([
                    "status" => false,
                    "errors" => [
                        "message" => [
                            "email or password wrong"
                        ]
                    ]
                ], 401));
            }
            $user->token = 'fake-uuid-1234';
            $user->save();
            return new UserResource($user);
        }
    };

    $result = $controller->login($mockRequest);

    $this->assertInstanceOf(UserResource::class, $result);
}

// Test: User sudah login, redirect ke dashboard (berhasil login)
public function test_login_user_already_logged_in_redirects_to_dashboard()
{
    // Mock Auth::check() return true
    Auth::shouldReceive('check')
        ->once()
        ->andReturn(true);

    // Mock Redirect::to('dashboard')
    Redirect::shouldReceive('to')
        ->with('dashboard')
        ->andReturn('redirect_dashboard');

    $controller = new class {
        public function login() {
            if (Auth::check()) {
                return Redirect::to('dashboard');
            } else {
                return View::make('dashboard.pages.auth.login');
            }
        }
    };

    $result = $controller->login();

    $this->assertEquals('redirect_dashboard', $result);
}

// Test: Login gagal karena email atau password salah
public function test_login_failed_wrong_password()
{
    $mockRequest = Mockery::mock(LoginRequest::class);
    $mockRequest->shouldReceive('validate')->once()->andReturn([
        'email' => 'user@gmail.com',
        'password' => 'salah',
    ]);

    $userMock = Mockery::mock();
    $userMock->id = 1;
    $userMock->email = 'user@gmail.com';
    $userMock->password = bcrypt('rahasia');
    $userMock->token = null;

    Hash::shouldReceive('check')
        ->once()
        ->with('salah', $userMock->password)
        ->andReturn(false);

    $userQueryBuilderMock = Mockery::mock();
    $userQueryBuilderMock->shouldReceive('first')
        ->once()
        ->andReturn($userMock);

    $userModelMock = Mockery::mock();
    $userModelMock->shouldReceive('where')
        ->once()
        ->with('email', 'user@gmail.com')
        ->andReturn($userQueryBuilderMock);

    $controller = new class($userModelMock) {
        protected $user;
        public function __construct($user)
        {
            $this->user = $user;
        }
        public function login($request)
        {
            $data = $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required', 'string'],
            ]);
            $user = $this->user->where('email', $data['email'])->first();
            if (!$user || !Hash::check($data['password'], $user->password)) {
                throw new HttpResponseException(response([
                    "status" => false,
                    "errors" => [
                        "message" => [
                            "email or password wrong"
                        ]
                    ]
                ], 401));
            }
            $user->token = 'fake-uuid-1234';
            $user->save();
            return new UserResource($user);
        }
    };

    $this->expectException(HttpResponseException::class);
    $controller->login($mockRequest);
}

// Test: login dipanggil tanpa parameter (tanpa parameter)
public function test_login_validation_exception()
{
    $mockRequest = Mockery::mock(LoginRequest::class);
    $mockRequest->shouldReceive('validate')
        ->once()
        ->andThrow(new HttpResponseException(response([
            "status" => false,
            "errors" => [
                "message" => [
                    "validation error"
                ]
            ]
        ], 422)));

    $userModelMock = Mockery::mock();

    $controller = new class($userModelMock) {
        protected $user;
        public function __construct($user)
        {
            $this->user = $user;
        }
        public function login($request)
        {
            $data = $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required', 'string'],
            ]);
            $user = $this->user->where('email', $data['email'])->first();
            if (!$user || !Hash::check($data['password'], $user->password)) {
                throw new HttpResponseException(response([
                    "status" => false,
                    "errors" => [
                        "message" => [
                            "email or password wrong"
                        ]
                    ]
                ], 401));
            }
            $user->token = 'fake-uuid-1234';
            $user->save();
            return new UserResource($user);
        }
    };

    $this->expectException(HttpResponseException::class);
    $controller->login($mockRequest);
}

// Test: Untuk pengujian yang fetch data dari database, gunakan Mockery untuk memmock Eloquent Model
public function test_get_classrooms_success()
{
    // Mock data hasil dari ClassRoom::all()
    $mockClassrooms = collect([
        (object)['id' => 1, 'name' => 'Kelas A'],
        (object)['id' => 2, 'name' => 'Kelas B'],
    ]);

    // Mock ClassRoom model dan method all()
    $classRoomModelMock = Mockery::mock();
    $classRoomModelMock->shouldReceive('all')->once()->andReturn($mockClassrooms);

    // Mock ClassRoomResource::collection()
    $mockResourceCollection = ['formatted_classroom_data'];
    $classRoomResourceMock = Mockery::mock('alias:' . \App\Http\Resources\ClassRoomResource::class);
    $classRoomResourceMock->shouldReceive('collection')
        ->once()
        ->with($mockClassrooms)
        ->andReturn($mockResourceCollection);

    // Controller dengan dependency injection ClassRoom model
    $controller = new class($classRoomModelMock) {
        protected $classRoom;

        public function __construct($classRoom)
        {
            $this->classRoom = $classRoom;
        }

        public function get(Request $request)
        {
            $classRooms = $this->classRoom->all();

            return response()->json([
                'data' => \App\Http\Resources\ClassRoomResource::collection($classRooms)
            ], 200);
        }
    };

    // Jalankan controller
    $mockRequest = Mockery::mock(Request::class);
    $response = $controller->get($mockRequest);

    // Assert response
    $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $response);
    $this->assertEquals(200, $response->getStatusCode());

    $responseData = $response->getData(true);
    $this->assertEquals(['formatted_classroom_data'], $responseData['data']);
}

// Test: Untuk pengujian yang fetch data tanpa parameter, gunakan Mockery untuk memmock Eloquent Model
public function test_show_classroom_without_id()
{
    // Model dan resource tetap di-mock walaupun tidak akan dipakai
    $classRoomModelMock = Mockery::mock();

    // Controller
    $controller = new class($classRoomModelMock) {
        protected $classRoom;
        public function __construct($classRoom)
        {
            $this->classRoom = $classRoom;
        }
        // Tergantung logic-mu: jika parameter tidak diberikan, error manual
        public function show($id = null)
        {
            if (empty($id)) {
                return response()->json([
                    'errors' => [
                        "message" => [
                            "id is required"
                        ]
                    ]
                ], 400);
            }

            // Perilaku lain (tidak terpakai di test ini)
        }
    };

    // Jalankan tanpa id (null)
    $response = $controller->show(null);

    // Assert: sesuai error yg diharapkan
    $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $response);
    $this->assertEquals(400, $response->getStatusCode());

    $responseData = $response->getData(true);
    $this->assertSame([
        'errors' => [
            "message" => [
                "id is required"
            ]
        ]
    ], $responseData);
}

public function test_get_classrooms_success()
{
    // Mock data hasil dari ClassRoom::all()
    $mockClassrooms = collect([
        (object)['id' => 1, 'name' => 'Kelas A'],
        (object)['id' => 2, 'name' => 'Kelas B'],
    ]);

    // Mock ClassRoom model dan method all()
    $classRoomModelMock = Mockery::mock();
    $classRoomModelMock->shouldReceive('all')->once()->andReturn($mockClassrooms);

    // Mock ClassRoomResource::collection()
    $mockResourceCollection = ['formatted_classroom_data'];
    $classRoomResourceMock = Mockery::mock('alias:' . \App\Http\Resources\ClassRoomResource::class);
    $classRoomResourceMock->shouldReceive('collection')
        ->once()
        ->with($mockClassrooms)
        ->andReturn($mockResourceCollection);

    // Controller dengan dependency injection ClassRoom model
    $controller = new class($classRoomModelMock) {
        protected $classRoom;

        public function __construct($classRoom)
        {
            $this->classRoom = $classRoom;
        }

        public function get(Request $request)
        {
            $classRooms = $this->classRoom->all();

            return response()->json([
                'data' => \App\Http\Resources\ClassRoomResource::collection($classRooms)
            ], 200);
        }
    };

    // Jalankan controller
    $mockRequest = Mockery::mock(Request::class);
    $response = $controller->get($mockRequest);

    // Assert response
    $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $response);
    $this->assertEquals(200, $response->getStatusCode());

    $responseData = $response->getData(true);
    $this->assertEquals(['formatted_classroom_data'], $responseData['data']);
}

public function test_show_classroom_success()
{
    $mockId = 1;

    // Mock data classroom yang seharusnya dikembalikan (biasanya Eloquent Model)
    $mockClassroom = (object)[
        'id' => $mockId,
        'name' => 'Kelas A',
    ];

    // Mock query builder untuk ClassRoom::where() -> first()
    $queryBuilderMock = Mockery::mock();
    $queryBuilderMock->shouldReceive('first')->once()->andReturn($mockClassroom);

    // Mock model ClassRoom (bukan alias, supaya bisa dependency inject)
    $classRoomModelMock = Mockery::mock();
    $classRoomModelMock->shouldReceive('where')->once()->with('id', $mockId)->andReturn($queryBuilderMock);

    // Mock resource (alias) agar static call intercepted
    $mockResourceResult = ['id' => 1, 'name' => 'Kelas A'];
    $classRoomResourceMock = Mockery::mock('alias:' . \App\Http\Resources\ClassRoomResource::class);
    $classRoomResourceMock->shouldReceive('make')
        ->once()
        ->with($mockClassroom)
        ->andReturn($mockResourceResult);

    // Controller anonim, DI model mock
    $controller = new class($classRoomModelMock) {
        protected $classRoom;

        public function __construct($classRoom)
        {
            $this->classRoom = $classRoom;
        }

        public function show($id)
        {
            $classRoom = $this->classRoom->where('id', $id)->first();

            if (!$classRoom) {
                return response()->json([
                    'errors' => [
                        "message" => [
                            "not found"
                        ]
                    ]
                ], 404);
            }

            // Gunakan method statis ClassRoomResource::make()
            return response()->json([
                'data' => \App\Http\Resources\ClassRoomResource::make($classRoom)
            ], 200);
        }
    };

    // Eksekusi controller
    $response = $controller->show($mockId);

    // Assert
    $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $response);
    $this->assertEquals(200, $response->getStatusCode());
    $responseData = $response->getData(true);
    $this->assertEquals(['id' => 1, 'name' => 'Kelas A'], $responseData['data']);
}

public function test_show_classroom_not_found()
{
    $mockId = 99;

    // Query builder mock untuk where()->first() return null
    $queryBuilderMock = Mockery::mock();
    $queryBuilderMock->shouldReceive('first')->once()->andReturn(null);

    // Mock model ClassRoom
    $classRoomModelMock = Mockery::mock();
    $classRoomModelMock->shouldReceive('where')
        ->once()
        ->with('id', $mockId)
        ->andReturn($queryBuilderMock);

    // Tidak perlu mock resource, karena resource tidak akan dipanggil jika data null

    // Controller
    $controller = new class($classRoomModelMock) {
        protected $classRoom;
        public function __construct($classRoom)
        {
            $this->classRoom = $classRoom;
        }
        public function show($id)
        {
            $classRoom = $this->classRoom->where('id', $id)->first();

            if (!$classRoom) {
                return response()->json([
                    'errors' => [
                        "message" => [
                            "not found"
                        ]
                    ]
                ], 404);
            }

            // Tidak akan dieksekusi jika data null
            return response()->json([
                'data' => \App\Http\Resources\ClassRoomResource::make($classRoom)
            ], 200);
        }
    };

    // Jalankan controller
    $response = $controller->show($mockId);

    // Assert
    $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $response);
    $this->assertEquals(404, $response->getStatusCode());

    $responseData = $response->getData(true);
    $this->assertSame([
        'errors' => [
            "message" => [
                "not found"
            ]
        ]
    ], $responseData);
}

public function test_show_classroom_without_id()
{
    // Model dan resource tetap di-mock walaupun tidak akan dipakai
    $classRoomModelMock = Mockery::mock();

    // Controller
    $controller = new class($classRoomModelMock) {
        protected $classRoom;
        public function __construct($classRoom)
        {
            $this->classRoom = $classRoom;
        }
        // Tergantung logic-mu: jika parameter tidak diberikan, error manual
        public function show($id = null)
        {
            if (empty($id)) {
                return response()->json([
                    'errors' => [
                        "message" => [
                            "id is required"
                        ]
                    ]
                ], 400);
            }

            // Perilaku lain (tidak terpakai di test ini)
        }
    };

    // Jalankan tanpa id (null)
    $response = $controller->show(null);

    // Assert: sesuai error yg diharapkan
    $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $response);
    $this->assertEquals(400, $response->getStatusCode());

    $responseData = $response->getData(true);
    $this->assertSame([
        'errors' => [
            "message" => [
                "id is required"
            ]
        ]
    ], $responseData);
}

5. Gunakan use Tests\\TestCase dan import TestCase pada bagian atas kode test.
6. Perhatikan penggunaan tanda ::, sebaiknya mengikuti contoh berikut:
$classRoomModelMock = Mockery::mock();

Auth::shouldReceive('check')
        ->once()
        ->andReturn(false);


Untuk mock jangan menggunakan :: tetapi gunakan ->, berikut contohnya:
$classRoomResourceMock->shouldReceive('make')
        ->once()
        ->with($mockClassroom)
        ->andReturn($mockResourceResult);

$queryBuilderMock->shouldReceive('first')->once()->andReturn($mockClassroom);


$classRoomResourceMock->shouldReceive('collection')
        ->once()
        ->with($mockClassrooms)
        ->andReturn($mockResourceCollection);
                        `;
                        break;
                    default:
                        vscode.window.showErrorMessage('Kode tidak termasuk function');
                        break;
                }
                break;
            case 'flutter':
                switch (type) {
                    case 'dart function':
                        prompt = `
Anda adalah seorang SOFTWARE TESTER profesional.
Tugas Anda adalah membuat kode unit test sederhana menggunakan Mockito, agar dapat dimengerti dan dijalankan oleh programmer pemula.

Tujuan 
Buat kode unit test terhadap potongan kode function di bawah ini.
${code}

${attributesModelDart ? `Attribut yang digunakan pada model yaitu sebagai berikut:\n ${attributesModelDart} \nSilakan sesuaikan data pada test dengan atribut tersebut.` : ''}
                            
ATURAN & FORMAT:
1. Nama method harus: main
2. Semua test menggunakan Mockito
3. Seluruh pengujian dibuat dalam bentuk fungsi-fungsi public function test()
4. Jangan menyertakan komentar atau penjelasan — hanya kode Dart test lengkap
5. Tidak perlu output tambahan apapun selain kode

CAKUPAN TEST WAJIB (minimal 4 test):
1. Test berhasil
2. Test gagal
3. Test validasi error atau exception
4. Test tanpa parameter

KETENTUAN TAMBAHAN
1. Gunakan teknik mocking penuh (Mockito) untuk semua dependency eksternal 
2. Jika terdapat pemanggilan terhadap library/helper eksternal, buat mock function-nya jika belum tersedia
3. Gunakan pattern dan struktur test seperti pada contoh di bawah ini:
4. Kode yang dibuat mengikuti contoh-contoh unit test berikut
group('ClassroomController', () {
    late MockClient mockClient;
    late ClassroomController controller;

    setUp(() {
      mockClient = MockClient();
      controller = ClassroomController(client: mockClient);
    });

    test('fetchClassrooms returns list of Classroom if status code is 200',
        () async {
      final fakeJson = jsonEncode({
        'data': [
          {
            'id': 1,
            'name': 'Kelas A',
            'code': 'KA123',
            'capacity': 30,
            'description': 'Deskripsi kelas A',
            'teacher_id': 10,
            'start_date': '2025-01-01',
            'end_date': '2025-06-30',
          },
        ]
      });

      when(mockClient.get(Uri.parse(\${URLs.baseURL}\${URLs.classrooms}')))
          .thenAnswer((_) async => http.Response(fakeJson, 200));

      final result = await controller.fetchClassrooms();

      expect(result, isA<List<Classroom>>());
      expect(result.length, 1);
      expect(result.first.name, 'Kelas A');
      expect(result.first.code, 'KA123');
      expect(result.first.description, 'Deskripsi kelas A');
      expect(result.first.teacherId, 10);
    });

    test('fetchClassrooms throws Exception if status code is not 200',
        () async {
      when(mockClient.get(Uri.parse('\${URLs.baseURL}\${URLs.classrooms}')))
          .thenAnswer((_) async => http.Response('Not found', 404));

      expect(() async => await controller.fetchClassrooms(), throwsException);
    });
  });

STRUKTUR FILE
Semua kode test harus berada dalam 1 file class berikut ini:
import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'package:school_app/controllers/classroom_controller.dart';
import 'package:school_app/models/classroom.dart';
import 'package:school_app/api/urls.dart';

import 'temporary_test.mocks.dart';

@GenerateMocks([http.Client])
void main() {
  group('ClassroomController', () {
    late MockClient mockClient;
    late ClassroomController controller;

    setUp(() {
      mockClient = MockClient();
      controller = ClassroomController(client: mockClient);
    });

    test('fetchClassrooms returns list of Classroom if status code is 200',
        () async {
      final fakeJson = jsonEncode({
        'data': [
          {
            'id': 1,
            'name': 'Kelas A',
            'code': 'KA123',
            'capacity': 30,
            'description': 'Deskripsi kelas A',
            'teacher_id': 10,
            'start_date': '2025-01-01',
            'end_date': '2025-06-30',
          },
        ]
      });

      when(mockClient.get(Uri.parse('\${URLs.baseURL}\${URLs.classrooms}')))
          .thenAnswer((_) async => http.Response(fakeJson, 200));

      final result = await controller.fetchClassrooms();

      expect(result, isA<List<Classroom>>());
      expect(result.length, 1);
      expect(result.first.name, 'Kelas A');
      expect(result.first.code, 'KA123');
      expect(result.first.description, 'Deskripsi kelas A');
      expect(result.first.teacherId, 10);
    });

    test('fetchClassrooms throws Exception if status code is not 200',
        () async {
      when(mockClient.get(Uri.parse('\${URLs.baseURL}\${URLs.classrooms}')))
          .thenAnswer((_) async => http.Response('Not found', 404));

      expect(() async => await controller.fetchClassrooms(), throwsException);
    });
  });
}
                        `;
                        break;

                    default:
                        vscode.window.showErrorMessage('Kode tidak termasuk function');
                        break;
                }
                break;
            default:
                vscode.window.showErrorMessage('Ekstensi tidak didukung untuk generate unit test.');
                break;
        }

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3
            });

            const cleanResponse = GenerateTestModule.cleanApiResponse(response.choices[0].message.content);

            vscode.window.showInformationMessage('Sedang membuat file unit test!');
            temporary.createTemporaryFile({ selectedText: code, unitTestCode: cleanResponse, framework: framework, context: context });
        } catch (error) {
            vscode.window.showErrorMessage(`Terjadi error ${error.message}`);
        }
    }

    static cleanApiResponse(response) {
        const match = response.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
        return match ? match[1].trim() : '';
    }

}

module.exports = GenerateTestModule;
