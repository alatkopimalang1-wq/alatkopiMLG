<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'is_preorder')) {
                $table->boolean('is_preorder')->default(false)->after('is_new');
            }
            if (! Schema::hasColumn('products', 'preorder_dp_percent')) {
                $table->unsignedTinyInteger('preorder_dp_percent')->default(100)->after('is_preorder');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('products', 'is_preorder')) {
                $columns[] = 'is_preorder';
            }
            if (Schema::hasColumn('products', 'preorder_dp_percent')) {
                $columns[] = 'preorder_dp_percent';
            }
            if (! empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
