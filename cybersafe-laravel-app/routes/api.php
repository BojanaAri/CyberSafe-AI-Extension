<?php

use App\Http\Controllers\AnalyzeController;
use App\Http\Controllers\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/analyze', [AnalyzeController::class, 'analyze']);
Route::get('/scrape', [AnalyzeController::class, 'scrape']);
Route::post('/report', [ReportController::class, 'store']);
