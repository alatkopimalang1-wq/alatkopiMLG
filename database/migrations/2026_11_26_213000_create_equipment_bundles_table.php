<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment_bundles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('banner_image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('equipment_bundle_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_bundle_id')->constrained('equipment_bundles')->cascadeOnDelete();
            $table->string('title');
            $table->string('slot_type', 20)->default('selectable'); // selectable, free
            $table->boolean('is_optional')->default(false);
            $table->unsignedInteger('quantity')->default(1);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('equipment_bundle_slot_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_bundle_slot_id')->constrained('equipment_bundle_slots')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->decimal('bundle_price', 14, 2)->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment_bundle_slot_items');
        Schema::dropIfExists('equipment_bundle_slots');
        Schema::dropIfExists('equipment_bundles');
    }
};
