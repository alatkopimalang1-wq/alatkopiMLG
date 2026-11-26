<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('equipment_bundle_slots', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('slot_type')->constrained('categories')->nullOnDelete();
            $table->decimal('discount_percent', 5, 2)->default(0)->after('category_id');
        });
    }

    public function down(): void
    {
        Schema::table('equipment_bundle_slots', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
            $table->dropColumn('discount_percent');
        });
    }
};
