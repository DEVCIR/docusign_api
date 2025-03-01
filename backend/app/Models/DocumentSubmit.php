<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentSubmit extends Model
{
    use HasFactory;
    protected $table = 'document_submit';

    protected $fillable = [
        'document_id',
        'email',
        'user_id',
        'data',
        'type',
        'status',
        'pdfpath',
    ];

    protected $casts = [
        'data' => 'array', // This will cast the JSON field into a PHP array
    ];
    public function document()
    {
        return $this->belongsTo(Document::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
