<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\Order;
use Illuminate\Http\Request;

class DesignController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([], 401);
        }

        return response()->json(Design::with('product')->where('user_id', $user->id)->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'canvas_data' => 'required|string',
            'preview_image_url' => 'required|string'
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $design = Design::create([
            'user_id' => $user->id,
            'product_id' => $request->product_id,
            'canvas_data' => $request->canvas_data,
            'preview_image_url' => $request->preview_image_url,
            'status' => 'pending'
        ]);

        return response()->json($design->load('product'), 201);
    }

    public function updateStatus(Request $request, Design $design)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected'
        ]);

        $design->update(['status' => $request->status]);

        // If a design is approved, and it belongs to an order, we might want to update the order status
        if ($request->status === 'approved') {
            // Find orders containing this design (via order_items)
            $orders = Order::whereHas('items', function($query) use ($design) {
                $query->where('design_id', $design->id);
            })->get();

            foreach ($orders as $order) {
                if ($order->status === 'pending') {
                    $order->update(['status' => 'design_approved']);
                }
            }
        }

        return response()->json($design);
    }
}
