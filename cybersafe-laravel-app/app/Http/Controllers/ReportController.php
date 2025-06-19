<?php

namespace App\Http\Controllers;


use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string',
            'flagged_text' => 'required|string',
            'reason' => 'nullable|string|max:1000',
            ]);

        Report::create([
            'content_type' => $request->content_type,
            'flagged_text' => $request->flagged_text,
            'reason' => $request->reason
        ]);

        return response()->json(['message' => 'Report submitted. Thank you.'], 200);
    }
}
