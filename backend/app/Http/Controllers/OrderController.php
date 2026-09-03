<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user && $user->role === 'customer') {
            return response()->json(Order::with(['user', 'items.product', 'items.design'])->where('user_id', $user->id)->latest()->get());
        }
        return response()->json(Order::with(['user', 'items.product', 'items.design'])->latest()->get());
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
            'guest_password' => 'required_without:user_id|string|min:6',
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
        $token = null;
        $user = null;

        if (!$userId) {
            $user = \App\Models\User::where('phone', $request->guest_phone)->first();

            if ($user) {
                // User exists, check password
                if (!\Illuminate\Support\Facades\Hash::check($request->guest_password, $user->password)) {
                    return response()->json(['message' => 'Account exists with this phone number. Incorrect password.'], 401);
                }
            } else {
                // Create new user
                $user = \App\Models\User::create([
                    'name' => $request->guest_name,
                    'phone' => $request->guest_phone,
                    'password' => \Illuminate\Support\Facades\Hash::make($request->guest_password),
                    'role' => 'customer'
                ]);
            }

            $userId = $user->id;
            $token = $user->createToken('auth_token')->plainTextToken;
        }

        $order = Order::create([
            'user_id' => $userId,
            'total_amount' => $request->total_amount,
            'shipping_address' => $request->shipping_address,
            'payment_status' => $request->payment_status,
            'payment_proof_url' => $request->payment_proof_url
        ]);

        foreach ($request->items as $item) {
            $designId = $item['design_id'] ?? null;
            
            if (empty($designId) && !empty($item['local_design_data']) && !empty($item['local_design_data']['canvas_data'])) {
                $design = \App\Models\Design::create([
                    'user_id' => $userId,
                    'product_id' => $item['product_id'],
                    'canvas_data' => $item['local_design_data']['canvas_data'],
                    'preview_image_url' => $item['local_design_data']['preview_image_url'],
                    'status' => 'pending'
                ]);
                $designId = $design->id;
            }

            $order->items()->create([
                'product_id' => $item['product_id'],
                'design_id' => $designId,
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        $response = [
            'order' => $order->load('items')
        ];

        if ($token && $user) {
            $response['token'] = $token;
            $response['user'] = $user;
        }

        return response()->json($response, 201);
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
