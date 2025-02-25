<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SignatureController;

use App\Http\Controllers\DocumentController;

// Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::get('/user', [AuthController::class, 'user']);
Route::delete('/user/{id}', [UserController::class, 'destroy']);
Route::put('user/{id}', [UserController::class, 'update']);
Route::post('/admin/login/', [AuthController::class, 'admin_login']);
Route::post('/user/login/', [AuthController::class, 'user_login']);

Route::get('/storage/documents/{filename}', [DocumentController::class, 'getDocument']);

Route::get('/documents/public/{id}/{emailParam}/{tokenParam}', [DocumentController::class, 'showDocumentPublic']);
Route::post('/user/documents/{documentId}/public/submit', [DocumentController::class, 'submitDocumentUserPublic']);
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Create
    Route::post('/upload-file', [DocumentController::class, 'uploadFile']);
    Route::post('/documents/{documentId}/submit', [DocumentController::class, 'submitDocument']);
    Route::post('/documents/{documentId}/submitToEmail', [DocumentController::class, 'submitToEmail']);

    Route::post('/save-signature', [SignatureController::class, 'store']);
    Route::get('/get-signatures', [SignatureController::class, 'index']);
    // End Create

    Route::post('/documents/{documentId}/editDocument', [DocumentController::class, 'editDocument']);


    // List
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::get('/documents/{id}', [DocumentController::class, 'showDocument']);
    // End List
    
    
    Route::get('/submissions', [DocumentController::class, 'showSubmissions']); // Fetch all submissions
    Route::get('/submissions/{documentId}/{userId}', [DocumentController::class, 'showDocumentSubmissionsuser2']); // Fetch submissions for a specific document
    Route::get('/submissions/{documentId}/email/{email}', [DocumentController::class, 'showDocumentSubmissionsuser3']); // Fetch submissions for a specific document
    
    // Route::post('/register', [AuthController::class, 'register']);
    Route::get('/user/documents/', [DocumentController::class, 'user_index']);
    Route::get('/documents/pending/{id}', [DocumentController::class, 'showDocumentPending']);

    

    Route::delete('/documents/{id}', [DocumentController::class, 'deleteDocument']);
    Route::post('/user/documents/{documentId}/submit', [DocumentController::class, 'submitDocumentUser']);
    Route::post('/documents/{documentId}/submit2', [DocumentController::class, 'submitDocument2']);
    Route::get('/user/submissions', [DocumentController::class, 'showSubmissionsuser']); // Fetch all submissions
    Route::get('/submissions/{documentId}', [DocumentController::class, 'showDocumentSubmissions']); // Fetch submissions for a specific document
    Route::get('/user/submissions/{documentId}', [DocumentController::class, 'showDocumentSubmissionsuser']); // Fetch submissions for a specific document
});
Route::options('/storage/{path}', function () {
    return response()->json();
});
