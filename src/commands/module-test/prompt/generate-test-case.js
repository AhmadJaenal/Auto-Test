const { OpenAI } = require('openai');
const vscode = require('vscode');
const TemporaryFileModule = require('../temporary-file/create-temporary');
const UnitTestManager = require('../auto-test/unit-test-manager');
class GenerateTestModule {
    constructor() {
        this.temporary = new TemporaryFileModule();
        this.unitTest = new UnitTestManager();
    }
    async generateUnitTest({ code, type = "controller", resource = null, request = null, attributeMigration = null, modelName = null, attributesModelDart = null, framework = null }) {
        const openai = new OpenAI({
            apiKey: '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',
        });

        let prompt = '';

        switch (framework) {
            case 'laravel':
                switch (type) {
                    case 'function':

                        prompt = `
Anda adalah seorang SOFTWARE TESTER profesional.
Tugas Anda adalah membuat kode unit test sederhana menggunakan Mockery, agar dapat dimengerti dan dijalankan oleh programmer pemula.

Tujuan 
Buat kode unit test terhadap potongan kode function controller di bawah ini.
${code}

${attributeMigration ? `Pada model ${modelName} terdapat beberapa atribut yaitu ${attributeMigration}` : ''}
                            
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

// Test: Login dipanggil, return view login
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
    // Fake data request (pakai stdClass, bukan facade Request)
    $mockRequest = new \stdClass();
    $mockRequest->image = new class {
        public function extension()
        {
            return 'jpg';
        }
        public function storeAs($folder, $name, $driver)
        {
            return 'image/123456789.jpg';
        }
    };
    $mockRequest->food_name = 'Nasi Goreng';
    $mockRequest->desc = 'Enak sekali';

    // Eloquent Model create DI-mock
    $foodMock = Mockery::mock();
    $foodMock->shouldReceive('create')->once()->withArgs(function ($input) {
        return $input['url_img'] === 'storage/image/123456789.jpg'
            && $input['food_name'] === 'Nasi Goreng'
            && $input['desc'] === 'Enak sekali'
            && $input['created_at'] instanceof Carbon
            && $input['updated_at'] instanceof Carbon;
    })->andReturnTrue();

    // Mock Redirect
    $mockRedirectResponse = Mockery::mock();
    $mockRedirectResponse->shouldReceive('with')
        ->with('success', 'Menu uploaded successfully.')
        ->andReturn('redirect_success');

    Redirect::shouldReceive('back')->once()->andReturn($mockRedirectResponse);

    $controller = new class($foodMock) {
        protected $food;
        public function __construct($food)
        {
            $this->food = $food;
        }

        public function addMenu($request)
        {
            $imageName = time() . '.' . $request->image->extension();
            $path = $request->image->storeAs('image', $imageName, 'public');

            $this->food->create([
                'url_img' => "storage/{$path}",
                'food_name' => $request->food_name,
                'desc' => $request->desc,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return Redirect::back()->with('success', 'Menu uploaded successfully.');
        }
    };

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

        const response = await openai.chat.completions.create({
            model: 'gpt-4.1',
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature: 0.3
        });

        const cleanResponse = GenerateTestModule.cleanApiResponse(response.choices[0].message.content);

        vscode.window.showInformationMessage('Sedang membuat file unit test!');
        this.temporary.createTemporaryFile({ selectedText: code, unitTestCode: cleanResponse, framework: framework });
    }

    static cleanApiResponse(response) {
        const match = response.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
        return match ? match[1].trim() : '';
    }

}

module.exports = GenerateTestModule;
