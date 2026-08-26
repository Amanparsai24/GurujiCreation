<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;

// Auth Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/debug-error', function() {
    try {
        $dbs = \Illuminate\Support\Facades\DB::select('SHOW DATABASES');
        return response()->json(['status' => 'Connected!', 'databases' => $dbs]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
    }
});

Route::get('/seed', function() {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true]);
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        return response()->json(['status' => 'Database Migrated Fresh and Seeded Successfully!']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
    }
});

// Public Product, Category & Template Routes
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('products', ProductController::class)->only(['index', 'show']);
Route::get('orders/track', [OrderController::class, 'trackOrder']); // Public order tracking
Route::post('orders', [OrderController::class, 'store']); // Public for guest checkout
Route::post('contact', [\App\Http\Controllers\ContactController::class, 'store']); // Public contact us
Route::get('design-templates', [\App\Http\Controllers\DesignTemplateController::class, 'index']);
Route::post('upload', [\App\Http\Controllers\UploadController::class, 'store']);
Route::get('settings', [\App\Http\Controllers\SettingController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth Protected User Routes
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Customer Orders (View own orders)
    Route::apiResource('orders', OrderController::class)->only(['index', 'show']);
    
    // Notifications
    Route::get('notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::put('notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    
    // Admin Routes
    Route::prefix('admin')->group(function () {
        // Admin Product & Category Management
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
        
        // Admin Order Management
        Route::apiResource('orders', OrderController::class)->except(['store']);
        
        // Admin Contacts
        Route::get('contacts', [\App\Http\Controllers\ContactController::class, 'index']);
        Route::put('contacts/{contact}', [\App\Http\Controllers\ContactController::class, 'update']);

        // Admin Settings
        Route::post('settings', [\App\Http\Controllers\SettingController::class, 'update']);
        
        // Admin Users (Customers & Vendors)
        Route::get('users', [\App\Http\Controllers\UserController::class, 'index']);
        Route::post('users', [\App\Http\Controllers\UserController::class, 'store']);
        Route::put('users/{user}/role', [\App\Http\Controllers\UserController::class, 'updateRole']);
        Route::delete('users/{user}', [\App\Http\Controllers\UserController::class, 'destroy']);
        
        // Admin Designs
        Route::put('designs/{design}/status', [\App\Http\Controllers\DesignController::class, 'updateStatus']);
    });
});
