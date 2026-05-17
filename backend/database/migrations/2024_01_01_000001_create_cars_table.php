<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('category', ['Эконом','Комфорт','Бизнес','Премиум']);
            $table->integer('year');
            $table->integer('seats')->default(5);
            $table->enum('transmission', ['Автомат','Механика']);
            $table->enum('fuel', ['Бензин','Дизель','Электро','Гибрид']);
            $table->string('engine');
            $table->integer('hp');
            $table->integer('price'); // BYN в сутки
            $table->decimal('lat', 10, 6);
            $table->decimal('lng', 10, 6);
            $table->string('address');
            $table->boolean('available')->default(true);
            $table->decimal('rating', 2, 1)->default(0);
            $table->integer('trips')->default(0);
            $table->text('description')->nullable();
            $table->json('photos')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
