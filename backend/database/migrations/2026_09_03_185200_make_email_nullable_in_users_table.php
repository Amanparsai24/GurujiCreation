<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            DB::statement('ALTER TABLE users MODIFY email VARCHAR(255) NULL;');
        } catch (\Throwable $e) {
            try {
                DB::statement('ALTER TABLE users CHANGE COLUMN email email VARCHAR(255) NULL;');
            } catch (\Throwable $ex) {
                // Ignore if already nullable
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
