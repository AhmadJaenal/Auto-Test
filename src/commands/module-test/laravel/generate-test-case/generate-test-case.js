const { OpenAI } = require('openai');
const vscode = require('vscode');
const TemporaryFileModule = require('../generate-temporary-file/create-temporary');
const UnitTestManager = require('../../auto-test/unit-test-manager');

class GenerateTestModule {
    constructor() {
        this.temporary = new TemporaryFileModule();
        this.unitTest = new UnitTestManager();
    }
    async generateUnitTest({ code, type = "controller", route = null, prefix = null, middleware = null, migration = null, resource = null, isLaravel = false, isDart = false, tableName = [] }) {
        const openai = new OpenAI({
            apiKey: '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',
        });

        let prompt = '';

        if (isLaravel) {
            switch (type) {
                case "controller":
                    prompt = `
Anda adalah seorang SOFTWARE TESTER profesional.
Tugas Anda adalah membuat kode unit test sederhana menggunakan Mockery, agar dapat dimengerti dan dijalankan oleh programmer pemula.

Tujuan 
Buat kode unit test terhadap potongan kode controller di bawah ini.
${code}

${resource ? 'Data resource yang digunakan memiliki atribut sebagai berikut:\n${atribut}\nSilakan sesuaikan data pada test dengan atribut tersebut.' : ''}
                            
ATURAN & FORMAT:
1. "Nama class test harus: TemporaryTest"
2. "Semua test menggunakan Mockery"
3. "Seluruh pengujian dibuat dalam bentuk fungsi-fungsi public function test_*()"
4. "Jangan menyertakan komentar atau penjelasan — hanya kode PHP test lengkap"
5. "Tidak perlu output tambahan apapun selain kode"

CAKUPAN TEST WAJIB (minimal 4 test):
1. Test berhasil
2. Test gagal
3. Test validasi error atau exception
4. Test tanpa parameter

KETENTUAN TAMBAHAN
1. Gunakan teknik mocking penuh (Mockery) untuk semua dependency eksternal (seperti Auth, View, Redirect, Request, dll)
2. Jika terdapat pemanggilan terhadap library/helper eksternal, buat mock function-nya jika belum tersedia
3. Gunakan pattern dan struktur test seperti pada contoh di bawah ini:
4. Kode yang dibuat mengikuti contoh-contoh unit test berikut
5. Jangan menggunakan PHPUnit, gunakan use Tests\\TestCase;

public function test_login_return_view()
{
    View::shouldReceive('make')
        ->once()
        ->with('auth.login')
        ->andReturn('test_view');

    $controller = new class extends AuthController {
        public function login()
        {
            return View::make('auth.login');
        }
    };

    $response = $controller->login();

    $this->assertEquals('test_view', $response);
}

STRUKTUR FILE
Semua kode test harus berada dalam 1 file class berikut ini:
<?php

use PHPUnit\Framework\TestCase;
use Mockery;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\View;

class TemporaryTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // 1. Test: User sudah login, redirect ke dashboard (berhasil)
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

    // 2. Test: User belum login, return view login (gagal login)
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

    // 3. Test: login dipanggil tanpa parameter (tanpa parameter)
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

    // 4. Test: Validasi/Exception pada Auth::check() (validasi/error)
    public function test_login_auth_check_throws_exception()
    {
        Auth::shouldReceive('check')
            ->once()
            ->andReturn('dashboard');

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
        $this->assertEquals('dashboard', $result);
    }

    // 4. Test: Pengujian tidak menggunakan database, jadi gunakan cara berikut
    public function test_add_menu_success()
    {
        // Mock Request dan validasi
        $mockRequest = Mockery::mock(Request::class);
        $mockRequest->shouldReceive('validate')->once()->andReturnTrue();

        // Mock Image dengan extension dan storeAs
        $mockImage = Mockery::mock();
        $mockImage->shouldReceive('extension')->once()->andReturn('jpg');
        $mockImage->shouldReceive('storeAs')->once()->with('image', Mockery::type('string'), 'public')->andReturn('image/123456789.jpg');

        $mockRequest->image = $mockImage;
        $mockRequest->food_name = 'Nasi Goreng';
        $mockRequest->desc = 'Enak sekali';

        // Buat fungsi Now() yang mengembalikan objek Carbon
        if (!function_exists('Now')) {
            function Now()
            {
                return Carbon::parse('2024-01-01 00:00:00');
            }
        }

        $expectedData = [
            'url_img' => 'storage/image/123456789.jpg',
            'food_name' => 'Nasi Goreng',
            'desc' => 'Enak sekali',
            'created_at' => Now(),
            'updated_at' => Now(),
        ];

        // Mock Food sebagai objek biasa (bukan alias)
        $foodMock = Mockery::mock();
        $foodMock->shouldReceive('create')->once()->with(Mockery::on(function ($arg) use ($expectedData) {
            return
                $arg['url_img'] === $expectedData['url_img']
                && $arg['food_name'] === $expectedData['food_name']
                && $arg['desc'] === $expectedData['desc']
                && $arg['created_at'] instanceof Carbon
                && $arg['updated_at'] instanceof Carbon;
        }))->andReturnTrue();

        // Mock Redirect facade
        $mockRedirectResponse = Mockery::mock();
        $mockRedirectResponse->shouldReceive('with')
            ->with('success', 'Menu uploaded successfully.')
            ->andReturn('redirect_success');

        Redirect::shouldReceive('back')->once()->andReturn($mockRedirectResponse);

        // Controller dengan dependency injection Food mock
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
                    'food_name' => 'required|string|max:255',
                    'desc' => 'required|string',
                ]);

                $imageName = time() . '.' . $request->image->extension();
                $path = $request->image->storeAs('image', $imageName, 'public');

                try {
                    $this->food->create([
                        'url_img' => "storage/{$path}",
                        'food_name' => $request->food_name,
                        'desc' => $request->desc,
                        'created_at' => Now(),
                        'updated_at' => Now(),
                    ]);

                    return Redirect::back()->with('success', 'Menu uploaded successfully.');
                } catch (\Throwable $th) {
                    return Redirect::back()->with('failed', 'Failed to upload Menu.');
                }
            }
        };

        $result = $controller->addMenu($mockRequest);

        $this->assertEquals('redirect_success', $result);
    }
}

CATATAN TAMBAHAN
Jika terdapat object yang digunakan seperti str, hash, uuid maka gunakan nilai secara eksplitit 
berikut contohnya, pada kode ini terdapat kode Str
$validated['short_description'] = Str::of($validated['description'])->limit(100);

Maka kode unit test bisa seperti berikut
$validated['short_description'] = "lorem ipsum";

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

public function test_dashboard_returns_view_with_user()
{
    $mockUser = Mockery::mock(User::class);

    Auth::shouldReceive('user')
        ->once()
        ->andReturn($mockUser);

    View::shouldReceive('make') 
        ->once()
        ->withArgs(function ($viewName, $data) use ($mockUser) {
            return $viewName === 'dashboard.pages.index' &&
                isset($data['user']) &&
                $data['user'] === $mockUser;
        })
        ->andReturn(Mockery::mock(ViewInstance::class));

    $controller = new DashboardController();
    $response = $controller->dashboard();

    $this->assertInstanceOf(ViewInstance::class, $response);
}


public function testActionLoginSuccess()
{
    // Mocking request data
    $request = Request::create('/test', 'POST', [
        'email' => 'user@example.com',
        'password' => 'secret'
    ]);

    // Mock Auth::attempt agar mengembalikan true
    Auth::shouldReceive('attempt')
        ->once()
        ->with([
            'email' => 'user@example.com',
            'password' => 'secret'
        ])
        ->andReturn(true);

    $controller = new \App\Http\Controllers\AuthController();
    $response = $controller->actionLogin($request);

    $this->assertEquals('http://localhost/dashboard', $response->getTargetUrl());
}

public function test_actionLogin_failed_back_with_error()
{
    $mockRequest = Mockery::mock(Request::class);
    $mockRequest->shouldReceive('validate')->once()->andReturn([
        'email' => 'wrong@example.com',
        'password' => 'wrongpass',
    ]);

    Auth::shouldReceive('attempt')->once()->andReturn(false);

    $mockSessionStore = Mockery::mock(Store::class);
    $mockSessionStore->shouldReceive('flash')
        ->once()
        ->with('failed', 'Email or password is wrong');

    $this->app->instance('session.store', $mockSessionStore);

    $controller = new \App\Http\Controllers\AuthController();

    $response = $controller->actionLogin($mockRequest);

    $this->assertInstanceOf(RedirectResponse::class, $response);

    $this->assertTrue($response->isRedirection());
}

public function test_actionLogin_validation_fails_if_email_and_password_empty()
{
    $this->expectException(ValidationException::class);

    $mockRequest = Mockery::mock(Request::class);
    $mockRequest->shouldReceive('validate')
        ->once()
        ->andThrow(ValidationException::withMessages([
            'email' => ['The email field is required.'],
            'password' => ['The password field is required.'],
        ]));

    $controller = new \App\Http\Controllers\AuthController();

    $controller->actionLogin($mockRequest);
}

protected function tearDown(): void
{
    \Mockery::close();
    parent::tearDown();
}

public function test_dashboard_returns_view_with_user()
{
    $mockUser = Mockery::mock(User::class);

    Auth::shouldReceive('user')
        ->once()
        ->andReturn($mockUser);

    View::shouldReceive('make')
        ->once()
        ->withArgs(function ($viewName, $data) use ($mockUser) {
            return $viewName === 'dashboard.pages.index' &&
                isset($data['user']) &&
                $data['user'] === $mockUser;
        })
        ->andReturn(Mockery::mock(ViewInstance::class));

    $controller = new DashboardController();
    $response = $controller->dashboard();

    $this->assertInstanceOf(ViewInstance::class, $response);
}

public function test_action_login_success()
{
    $request = Request::create('/test', 'POST', [
        'email' => 'user@example.com',
        'password' => 'secret'
    ]);

    Auth::shouldReceive('attempt')
        ->once()
        ->with([
            'email' => 'user@example.com',
            'password' => 'secret'
        ])
        ->andReturn(true);

    $controller = new \App\Http\Controllers\AuthController();
    $response = $controller->actionLogin($request);

    $this->assertEquals('http://localhost/dashboard', $response->getTargetUrl());
}

public function test_actionLogin_failed_back_with_error()
{
    $mockRequest = Mockery::mock(Request::class);
    $mockRequest->shouldReceive('validate')->once()->andReturn([
        'email' => 'wrong@example.com',
        'password' => 'wrongpass',
    ]);

    Auth::shouldReceive('attempt')->once()->andReturn(false);

    $mockSessionStore = Mockery::mock(Store::class);
    $mockSessionStore->shouldReceive('flash')
        ->once()
        ->with('failed', 'Email or password is wrong');

    $this->app->instance('session.store', $mockSessionStore);

    $controller = new \App\Http\Controllers\AuthController();

    $response = $controller->actionLogin($mockRequest);

    $this->assertInstanceOf(RedirectResponse::class, $response);

    $this->assertTrue($response->isRedirection());
}

public function test_actionLogin_validation_fails_if_email_and_password_empty()
{
    $this->expectException(ValidationException::class);

    $mockRequest = Mockery::mock(Request::class);
    $mockRequest->shouldReceive('validate')
        ->once()
        ->andThrow(ValidationException::withMessages([
            'email' => ['The email field is required.'],
            'password' => ['The password field is required.'],
        ]));

    $controller = new \App\Http\Controllers\AuthController();

    $controller->actionLogin($mockRequest);
}

public function test_addImage_failure()
{
    // Setup yang mirip seperti di atas, tetapi mensimulasikan kondisi gagal
    $mockRequest = Mockery::mock(Request::class);
    $mockRequest->shouldReceive('validate')->andThrow(new \Exception('Validation failed'));

    $mockRedirectResponse = Mockery::mock(RedirectResponse::class);
    $mockRedirectResponse->shouldReceive('with')
        ->once()
        ->with('failed', 'Failed to upload image.')
        ->andReturnSelf();

    $mockRedirect = Mockery::mock();
    $mockRedirect->shouldReceive('back')->andReturn($mockRedirectResponse);
    app()->instance('redirect', $mockRedirect);

    $controller = new \App\Http\Controllers\GalleryDashboardController();
    $result = $controller->addImage($mockRequest);

    $this->assertInstanceOf(RedirectResponse::class, $result);
}

public function test_addImage_validation_fail_throws_exception()
{
    $mockRequest = Mockery::mock(Request::class);
    $mockRequest->shouldReceive('validate')->once()->andThrow(new \Exception("Validation failed"));

    $response = Mockery::mock(RedirectResponse::class);
    $response->shouldReceive('with')->once()->with('failed', 'Failed to upload image.')->andReturnSelf();

    app()->instance('redirect', Mockery::mock()->shouldReceive('back')->andReturn($response)->getMock());

    $controller = new GalleryDashboardController();

    $result = $controller->addImage($mockRequest);

    $this->assertInstanceOf(RedirectResponse::class, $result);
}

public function test_login_user_already_logged_in_redirects_to_dashboard()
{
    Auth::shouldReceive('check')
        ->once()
        ->andReturn(true);

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

public function test_login_user_not_logged_in_returns_login_view()
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

    $result = $controller->login();

    $this->assertEquals('login_view', $result);
}

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
`;
                    break;
                case "model":
                    prompt = "";
                case "apiController":
                    prompt = `
Anda adalah seorang SOFTWARE TESTER profesional.
Tugas Anda adalah membuat kode unit test sederhana menggunakan Mockery, agar dapat dimengerti dan dijalankan oleh programmer pemula.

Tujuan 
Buat kode unit test terhadap potongan kode API controller di bawah ini.
${code}

${resource ? 'Data resource yang digunakan memiliki atribut sebagai berikut:\n${atribut}\nSilakan sesuaikan data pada test dengan atribut tersebut.' : ''}
                            
ATURAN & FORMAT:
1. "Nama class test harus: TemporaryTest"
2. "Semua test menggunakan Mockery"
3. "Seluruh pengujian dibuat dalam bentuk fungsi-fungsi public function test_*()"
4. "Jangan menyertakan komentar atau penjelasan — hanya kode PHP test lengkap"
5. "Tidak perlu output tambahan apapun selain kode"

CAKUPAN TEST WAJIB (minimal 4 test):
1. Test berhasil
2. Test gagal
3. Test validasi error atau exception
4. Test tanpa parameter

KETENTUAN TAMBAHAN
1. Gunakan teknik mocking penuh (Mockery) untuk semua dependency eksternal (seperti Auth, View, Redirect, Request, dll)
2. Jika terdapat pemanggilan terhadap library/helper eksternal, buat mock function-nya jika belum tersedia
3. Gunakan pattern dan struktur test seperti pada contoh di bawah ini:
4. Kode yang dibuat mengikuti contoh-contoh unit test berikut
5. Jangan menggunakan PHPUnit, gunakan use Tests\\TestCase;
6. Jangan mencoba me-mock suatu class dengan Mockery apabila class tersebut sudah dimuat oleh Laravel sebelum mock dibuat.

Berikut contoh kode test yang bisa anda ikuti
public function test_login_success()
{
    // Mock request dan validasi
    $mockRequest = Mockery::mock(LoginRequest::class);
    $mockRequest->shouldReceive('validate')->once()->andReturn([
        'email' => 'user@gmail.com',
        'password' => 'rahasia',
    ]);

    // Mock User model (buat sebagai dependency, bukan facade/alias)
    $userMock = Mockery::mock();
    $userMock->id = 1;
    $userMock->email = 'user@gmail.com';
    $userMock->password = bcrypt('rahasia');
    $userMock->token = null;
    $userMock->shouldReceive('save')->once();

    // Mock Hash::check
    Hash::shouldReceive('check')
        ->once()
        ->with('rahasia', $userMock->password)
        ->andReturn(true);

    // Mock User query builder (User::where()->first())
    $userQueryBuilderMock = Mockery::mock();
    $userQueryBuilderMock->shouldReceive('first')
        ->once()
        ->andReturn($userMock);

    // Tidak perlu sebagai static alias, gunakan dependency injection pada controller:
    $userModelMock = Mockery::mock();
    $userModelMock->shouldReceive('where')
        ->once()
        ->with('email', 'user@gmail.com')
        ->andReturn($userQueryBuilderMock);

    // Mock UserResource (atau gunakan partial)
    $userResourceMock = Mockery::mock(UserResource::class, [$userMock])->makePartial();
    $this->instance(UserResource::class, $userResourceMock);

    // Controller dengan dependency injection
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


STRUKTUR FILE
Semua kode test harus berada dalam 1 file class berikut ini:
<?php

namespace Tests\Feature;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Mockery;
use Tests\TestCase;
use Illuminate\Support\Facades\Str;

class AuthMockTest extends TestCase
{
    use WithFaker;

    public function test_login_success()
    {
        // Mock request dan validasi
        $mockRequest = Mockery::mock(LoginRequest::class);
        $mockRequest->shouldReceive('validate')->once()->andReturn([
            'email' => 'user@gmail.com',
            'password' => 'rahasia',
        ]);

        // Mock User model (buat sebagai dependency, bukan facade/alias)
        $userMock = Mockery::mock();
        $userMock->id = 1;
        $userMock->email = 'user@gmail.com';
        $userMock->password = bcrypt('rahasia');
        $userMock->token = null;
        $userMock->shouldReceive('save')->once();

        // Mock Hash::check
        Hash::shouldReceive('check')
            ->once()
            ->with('rahasia', $userMock->password)
            ->andReturn(true);

        // Mock User query builder (User::where()->first())
        $userQueryBuilderMock = Mockery::mock();
        $userQueryBuilderMock->shouldReceive('first')
            ->once()
            ->andReturn($userMock);

        // Tidak perlu sebagai static alias, gunakan dependency injection pada controller:
        $userModelMock = Mockery::mock();
        $userModelMock->shouldReceive('where')
            ->once()
            ->with('email', 'user@gmail.com')
            ->andReturn($userQueryBuilderMock);

        // Mock UserResource (atau gunakan partial)
        $userResourceMock = Mockery::mock(UserResource::class, [$userMock])->makePartial();
        $this->instance(UserResource::class, $userResourceMock);

        // Controller dengan dependency injection
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

    public function test_logout_success()
    {
        // Mock user model
        $userMock = Mockery::mock();
        $userMock->shouldReceive('save')->once();
        $userMock->token = 'some-token';

        // Mock Auth::user()
        Auth::shouldReceive('user')->once()->andReturn($userMock);

        // Controller anonim dengan dependency injection
        $controller = new class {
            public function logout(): \Illuminate\Http\JsonResponse
            {
                $user = \Illuminate\Support\Facades\Auth::user();
                $user->token = null;
                $user->save();

                return response()->json([
                    "message" => "Logout success",
                    "data" => true,
                ])->setStatusCode(200);
            }
        };

        // Panggil method logout
        $response = $controller->logout();

        // Uji responsenya
        $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $response);
        $this->assertEquals(200, $response->status());

        $responseData = $response->getData(true);

        $this->assertEquals("Logout success", $responseData['message']);
        $this->assertTrue($responseData['data']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}

                            `;
                    break;
                default:
                    prompt = '';
            }

        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4.1',
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature: 0.3
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


// public function test_login_user_already_logged_in_redirects_to_dashboard()
//     {
//         Auth::shouldReceive('check')
//             ->once()
//             ->andReturn(true);

//         Redirect::shouldReceive('to')
//             ->with('dashboard')
//             ->andReturn('redirect_dashboard');

//         $controller = new class {
//             public function login() {
//                 if (Auth::check()) {
//                     return Redirect::to('dashboard');
//                 } else {
//                     return View::make('dashboard.pages.auth.login');
//                 }
//             }
//         };

//         $result = $controller->login();

//         $this->assertEquals('redirect_dashboard', $result);
//     }

//     public function test_login_user_not_logged_in_returns_login_view()
//     {
//         Auth::shouldReceive('check')
//             ->once()
//             ->andReturn(false);

//         View::shouldReceive('make')
//             ->with('dashboard.pages.auth.login')
//             ->andReturn('login_view');

//         $controller = new class {
//             public function login() {
//                 if (Auth::check()) {
//                     return Redirect::to('dashboard');
//                 } else {
//                     return View::make('dashboard.pages.auth.login');
//                 }
//             }
//         };

//         $result = $controller->login();

//         $this->assertEquals('login_view', $result);
//     }

//     public function test_login_without_parameters_works_well()
//     {
//         Auth::shouldReceive('check')
//             ->once()
//             ->andReturn(false);

//         View::shouldReceive('make')
//             ->with('dashboard.pages.auth.login')
//             ->andReturn('login_view');

//         $controller = new class {
//             public function login() {
//                 if (Auth::check()) {
//                     return Redirect::to('dashboard');
//                 } else {
//                     return View::make('dashboard.pages.auth.login');
//                 }
//             }
//         };

//         // Tidak ada parameter dikirim ke login()
//         $result = $controller->login();

//         $this->assertEquals('login_view', $result);
//     }

//     public function test_login_auth_check_throws_exception()
//     {
//         Auth::shouldReceive('check')
//             ->once()
//             ->andThrow(new Exception('Auth Check Failed'));

//         $controller = new class {
//             public function login() {
//                 if (Auth::check()) {
//                     return Redirect::to('dashboard');
//                 } else {
//                     return View::make('dashboard.pages.auth.login');
//                 }
//             }
//         };

//         $this->expectException(Exception::class);
//         $this->expectExceptionMessage('Auth Check Failed');

//         $controller->login();
//     }