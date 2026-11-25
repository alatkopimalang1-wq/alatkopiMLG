<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('marketplace_product_mappings', function (Blueprint $table) {
            if (! Schema::hasColumn('marketplace_product_mappings', 'marketplace_status')) {
                $table->string('marketplace_status')->default('ACTIVATE')->after('sync_status')->index();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketplace_product_mappings', function (Blueprint $table) {
            if (Schema::hasColumn('marketplace_product_mappings', 'marketplace_status')) {
                $table->dropColumn('marketplace_status');
            }
        });
    }
};
