<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admin User
        User::firstOrCreate(
            ['phone' => '9876543210'],
            [
                'name' => 'Admin Owner',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email' => 'admin@guruji.com'
            ]
        );

        // Create Vendors
        User::firstOrCreate(
            ['phone' => '9876543211'],
            [
                'name' => 'Laser Cut Vendor 1',
                'password' => Hash::make('password'),
                'role' => 'vendor',
                'email' => 'vendor1@guruji.com'
            ]
        );
        User::firstOrCreate(
            ['phone' => '9876543212'],
            [
                'name' => 'UV Print Vendor 2',
                'password' => Hash::make('password'),
                'role' => 'vendor',
                'email' => 'vendor2@guruji.com'
            ]
        );

        // 2. Create Categories
        $categories = [
            ['name' => 'Acrylic Boards', 'slug' => 'acrylic-boards', 'is_featured' => true],
            ['name' => 'CNC Work', 'slug' => 'cnc-work', 'is_featured' => true],
            ['name' => 'Name Plates', 'slug' => 'name-plates', 'is_featured' => true],
            ['name' => 'Key Chains', 'slug' => 'key-chains', 'is_featured' => true],
            ['name' => 'Frames', 'slug' => 'frames', 'is_featured' => true],
            ['name' => 'Photo Frames', 'slug' => 'photo-frames', 'is_featured' => true],
            ['name' => 'Custom Products', 'slug' => 'custom-products', 'is_featured' => true],
        ];

        foreach ($categories as $catData) {
            $category = Category::firstOrCreate(['slug' => $catData['slug']], $catData);
            
            // Seed some dummy products for each category
            if ($catData['slug'] === 'acrylic-boards') {
                Product::firstOrCreate(['name' => 'Premium LED Acrylic Board'], [
                    'category_id' => $category->id,
                    'description' => 'High-quality glowing LED acrylic board perfect for shop signages. Fully customizable with your brand name.',
                    'base_price' => 2500.00,
                    'customizable' => true,
                    'image' => 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?auto=format&fit=crop&q=80&w=800',
                    'status' => 'active'
                ]);
                Product::firstOrCreate(['name' => 'Clear Acrylic Display Board'], [
                    'category_id' => $category->id,
                    'description' => 'Standard clear acrylic board for notices and menus.',
                    'base_price' => 800.00,
                    'customizable' => true,
                    'image' => 'https://images.unsplash.com/photo-1620242562473-05c08ff6ecf6?auto=format&fit=crop&q=80&w=800',
                    'status' => 'active'
                ]);
            }
            
            if ($catData['slug'] === 'cnc-work') {
                Product::firstOrCreate(['name' => 'Wooden CNC Wall Art'], [
                    'category_id' => $category->id,
                    'description' => 'Intricate CNC cut wooden mandala art for your living room.',
                    'base_price' => 1500.00,
                    'customizable' => true,
                    'image' => 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800',
                    'status' => 'active'
                ]);
                Product::firstOrCreate(['name' => 'CNC Cut MDF Partition'], [
                    'category_id' => $category->id,
                    'description' => 'Beautifully designed MDF partition for home or office decor.',
                    'base_price' => 4500.00,
                    'customizable' => true,
                    'image' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
                    'status' => 'active'
                ]);
            }

            if ($catData['slug'] === 'name-plates') {
                Product::firstOrCreate(['name' => 'Golden Acrylic Name Plate'], [
                    'category_id' => $category->id,
                    'description' => 'Elegant golden text on black acrylic for your home entrance.',
                    'base_price' => 650.00,
                    'customizable' => true,
                    'image' => 'https://images.unsplash.com/photo-1582293361543-fa6bb8c6b7cb?auto=format&fit=crop&q=80&w=800',
                    'status' => 'active'
                ]);
                Product::firstOrCreate(['name' => 'Wooden Engraved Name Plate'], [
                    'category_id' => $category->id,
                    'description' => 'Classic wooden engraved name plate with a natural finish.',
                    'base_price' => 850.00,
                    'customizable' => true,
                    'image' => 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&q=80&w=800',
                    'status' => 'active'
                ]);
            }

            if ($catData['slug'] === 'key-chains') {
                Product::firstOrCreate(['name' => 'Custom Photo Key Chain'], [
                    'category_id' => $category->id,
                    'description' => 'Print your custom photo or logo on a durable acrylic key chain.',
                    'base_price' => 150.00,
                    'customizable' => true,
                    'image' => 'https://images.unsplash.com/photo-1584448574163-149b1a5113bd?auto=format&fit=crop&q=80&w=800',
                    'status' => 'active'
                ]);
                Product::firstOrCreate(['name' => 'Laser Cut Wood Key Chain'], [
                    'category_id' => $category->id,
                    'description' => 'Personalized laser cut wooden keychain in any shape.',
                    'base_price' => 120.00,
                    'customizable' => true,
                    'image' => 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=800',
                    'status' => 'active'
                ]);
            }

            if ($catData['slug'] === 'frames') {
                Product::firstOrCreate(['name' => 'Custom Spotify Plaque'], [
                    'category_id' => $category->id,
                    'description' => 'Acrylic Spotify plaque with your favorite song and photo.',
                    'base_price' => 499.00,
                    'customizable' => true,
                    'image' => 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=800',
                    'status' => 'active'
                ]);
            }
            
            if ($catData['slug'] === 'photo-frames') {
                Product::firstOrCreate(['name' => 'Personalized LED Photo Frame'], [
                    'category_id' => $category->id,
                    'description' => 'Glowing LED photo frame to showcase your memories beautifully.',
                    'base_price' => 1200.00,
                    'customizable' => true,
                    'image' => 'https://images.unsplash.com/photo-1554188248-986adbb7329d?auto=format&fit=crop&q=80&w=800',
                    'status' => 'active'
                ]);
            }

            if ($catData['slug'] === 'custom-products') {
                Product::firstOrCreate(['name' => 'Neon Sign Board'], [
                    'category_id' => $category->id,
                    'description' => 'Fully customized Neon light signs for your cafe or room.',
                    'base_price' => 3500.00,
                    'customizable' => true,
                    'image' => 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?auto=format&fit=crop&q=80&w=800',
                    'status' => 'active'
                ]);
            }
        }

        // 3. Create Design Templates
        $mockCanvasJson = json_encode([
            "version" => "6.0.0",
            "objects" => [
                [
                    "type" => "i-text",
                    "text" => "GURUJI CREATION",
                    "left" => 150,
                    "top" => 100,
                    "fill" => "#000000",
                    "fontFamily" => "Outfit",
                    "fontSize" => 50
                ]
            ]
        ]);
        
        \App\Models\DesignTemplate::firstOrCreate(['name' => 'Basic Shop Board'], [
            'canvas_data' => $mockCanvasJson,
            'is_active' => true
        ]);

        \App\Models\DesignTemplate::firstOrCreate(['name' => 'Elegant Name Plate'], [
            'canvas_data' => $mockCanvasJson,
            'is_active' => true
        ]);
    }
}
