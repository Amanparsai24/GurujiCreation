<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Product::with(['category', 'images', 'variants'])->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'customizable' => 'boolean',
            'image' => 'nullable|string',
            'status' => 'string|in:active,inactive',
            'sku' => 'nullable|string|unique:products',
            'stock_quantity' => 'integer|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'video_url' => 'nullable|string',
            'images' => 'array',
            'images.*.image_url' => 'required|string',
            'images.*.is_primary' => 'boolean',
            'variants' => 'array',
            'variants.*.size' => 'nullable|string',
            'variants.*.material' => 'nullable|string',
            'variants.*.additional_price' => 'numeric|min:0',
            'variants.*.stock' => 'integer|min:0',
        ]);

        $product = Product::create($request->except(['images', 'variants']));

        if ($request->has('images')) {
            $product->images()->createMany($request->images);
        }

        if ($request->has('variants')) {
            $product->variants()->createMany($request->variants);
        }

        return response()->json($product->load(['images', 'variants']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json($product->load(['category', 'images', 'variants']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'category_id' => 'exists:categories,id',
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'base_price' => 'numeric|min:0',
            'customizable' => 'boolean',
            'image' => 'nullable|string',
            'status' => 'string|in:active,inactive',
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
            'stock_quantity' => 'integer|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'video_url' => 'nullable|string',
            'images' => 'array',
            'variants' => 'array',
        ]);

        $product->update($request->except(['images', 'variants']));

        if ($request->has('images')) {
            $product->images()->delete();
            $product->images()->createMany($request->images);
        }

        if ($request->has('variants')) {
            $product->variants()->delete();
            $product->variants()->createMany($request->variants);
        }

        return response()->json($product->load(['images', 'variants']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(null, 204);
    }
}
