<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // For admin, return all orders. For customer, we'd normally filter by user_id
        return response()->json(Order::with(['user', 'items.product'])->latest()->get());
    }

    public function trackOrder(Request $request)
    {
        $request->validate([
            'phone' => 'required|string'
        ]);

        $user = \App\Models\User::where('phone', $request->phone)->first();

        if (!$user) {
            return response()->json(['message' => 'No orders found for this phone number'], 404);
        }

        $orders = Order::with(['items.product'])->where('user_id', $user->id)->latest()->get();

        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'guest_name' => 'required_without:user_id|string',
            'guest_phone' => 'required_without:user_id|string',
            'total_amount' => 'required|numeric',
            'shipping_address' => 'required|string',
            'payment_status' => 'required|string',
            'payment_proof_url' => 'required|string',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
        ]);

        $userId = $request->user_id;

        if (!$userId) {
            $user = \App\Models\User::firstOrCreate(
                ['phone' => $request->guest_phone],
                [
                    'name' => $request->guest_name,
                    'email' => 'guest_' . time() . '@guruji.com',
                    'password' => \Illuminate\Support\Facades\Hash::make('password'),
                    'role' => 'customer'
                ]
            );
            $userId = $user->id;
        }

        $order = Order::create([
            'user_id' => $userId,
            'total_amount' => $request->total_amount,
            'shipping_address' => $request->shipping_address,
            'payment_status' => $request->payment_status,
            'payment_proof_url' => $request->payment_proof_url
        ]);

        foreach ($request->items as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'design_id' => $item['design_id'] ?? null,
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        return response()->json($order->load('items'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        return response()->json($order->load(['user', 'items.product', 'items.design']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'string',
            'payment_status' => 'string',
        ]);

        $order->update($request->all());

        return response()->json($order);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $order->delete();
        return response()->json(null, 204);
    }
}
