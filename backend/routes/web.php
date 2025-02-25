<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\DocumentController;
use Illuminate\Support\Facades\Artisan;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great! 
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/my/documents/{filename}', [DocumentController::class, 'getDocument']);
Route::get('/test', [DocumentController::class, 'sendMail']);

Route::get('/csrf-token', function () {
    return response()->json(['csrfToken' => csrf_token()]);
});


Route::options('/my/documents/{filename}', function () {
    return response()->json([], 200, [
        'Access-Control-Allow-Origin' => 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3002,https://docusign.devcir.co,http://docusign.devcir.co,https://userdocusign.devcir.co,http://userdocusign.devcir.co',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-API-Key',
    ]);
});

Route::get('/clear-cache', function () {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    Artisan::call('view:clear');
    
    return 'Cache, config, route, and view cleared successfully!';
});


Route::get('/storage-link', function () {
    Artisan::call('storage:link');
    return 'Storage link created successfully!';
});
