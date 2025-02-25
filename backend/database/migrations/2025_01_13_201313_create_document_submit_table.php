<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDocumentSubmitTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('document_submit', function (Blueprint $table) {
            $table->id(); // Auto-incrementing primary key
            $table->unsignedBigInteger('document_id'); // Foreign key for documents
            $table->unsignedBigInteger('user_id'); // Foreign key for users
            $table->json('data'); // JSON field to store the form data
            $table->string('status')->default('pending'); // Status of the submission
            $table->timestamps(); // Created at and Updated at timestamps

            // You can add foreign key constraints if needed
            $table->foreign('document_id')->references('id')->on('documents')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('document_submit');
    }
}
