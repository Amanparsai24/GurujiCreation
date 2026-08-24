<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index()
    {
        return response()->json(Contact::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'message' => 'required|string',
        ]);

        $contact = Contact::create($request->all());

        return response()->json($contact, 201);
    }

    public function update(Request $request, Contact $contact)
    {
        $request->validate([
            'status' => 'required|string|in:read,unread',
        ]);

        $contact->update(['status' => $request->status]);

        return response()->json($contact);
    }
}
