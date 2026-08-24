<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('design_elements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('design_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('design_template_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('type'); // text, image, rect, circle
            $table->json('properties'); // stores color, size, position, font, etc.
            $table->integer('layer_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('design_elements');
    }
};
