<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,jpg,png,webp,svg|max:5120', // Max 5MB
            'folder' => 'nullable|string|in:designs,products,avatars,payments,categories',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $folder = $request->input('folder', 'uploads');
            
            // Store the file publicly
            $path = $file->store($folder, 'public');
            
            return response()->json([
                'message' => 'File uploaded successfully',
                'url' => Storage::url($path),
                'path' => $path
            ], 201);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }
}
