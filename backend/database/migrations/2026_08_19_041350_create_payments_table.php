<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('payment_method'); // e.g. qr_upload, stripe, razorpay
            $table->decimal('amount', 10, 2);
            $table->string('transaction_id')->nullable();
            $table->string('status')->default('pending'); // pending, verified, failed
            $table->string('proof_url')->nullable(); // for offline payment
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
