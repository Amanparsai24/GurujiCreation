<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            return response()->json(Conversation::with(['customer', 'messages' => function($q) {
                $q->latest()->limit(1);
            }])->get());
        } else {
            return response()->json(Conversation::with(['admin', 'messages' => function($q) {
                $q->latest()->limit(1);
            }])->where('customer_id', $user->id)->get());
        }
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        // Ensure a conversation doesn't already exist for this customer
        $conversation = Conversation::firstOrCreate([
            'customer_id' => $user->role === 'admin' ? $request->customer_id : $user->id
        ]);

        return response()->json($conversation, 201);
    }

    public function show(Conversation $conversation)
    {
        return response()->json($conversation->load(['customer', 'admin', 'messages.sender']));
    }
}
