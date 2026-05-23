<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ParcelController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;

// Public
Route::get('/stats',                         [ParcelController::class, 'stats']);
Route::get('/parcels/track/{code}',          [ParcelController::class, 'track']);
Route::post('/parcels/{id}/confirm-reception',[ParcelController::class, 'confirmReception']);

// Auth
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/parcels',               [ParcelController::class, 'index']);
    Route::post('/parcels',              [ParcelController::class, 'store']);
    Route::patch('/parcels/{id}/status', [ParcelController::class, 'updateStatus']);
    Route::patch('/parcels/{id}/assign', [ParcelController::class, 'assign']);

    Route::get('/driver/parcels',        [ParcelController::class, 'driverParcels']);
    Route::get('/users/drivers',         [UserController::class,   'drivers']);

    Route::get('/admin/users',           [AdminController::class, 'users']);
    Route::delete('/admin/users/{id}',   [AdminController::class, 'deleteUser']);
});
