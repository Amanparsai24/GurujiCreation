<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\Order;
use Illuminate\Http\Request;

class DesignController extends Controller
{
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
