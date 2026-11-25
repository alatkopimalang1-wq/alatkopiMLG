<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'pos_role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('pos_role', 20)->nullable()->after('role')->index();
            });
        }

        // Initialize pos_role based on current role
        DB::table('users')->where('role', 'owner')->update(['pos_role' => 'owner']);
        DB::table('users')->where('role', 'admin')->update(['pos_role' => 'admin']);
        DB::table('users')->where('role', 'kasir')->update(['pos_role' => 'kasir', 'role' => 'none']);
        DB::table('users')->where('role', 'editor')->update(['pos_role' => 'none']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'pos_role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('pos_role');
            });
        }
    }
};
