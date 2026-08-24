<?php

namespace App\Http\Controllers;

use App\Models\DesignTemplate;
use Illuminate\Http\Request;

class DesignTemplateController extends Controller
{
    public function index()
    {
        $templates = DesignTemplate::where('is_active', true)->get();
        return response()->json($templates);
    }
}
