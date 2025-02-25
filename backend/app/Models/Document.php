<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    // Define the table associated with the model (optional if table name is not the plural form of model name)
    protected $table = 'documents';

    // Specify the fillable fields that can be mass-assigned
    protected $fillable = [
        'name',
        'input_boxes',
        'signature_boxes',
        'status',
        'user_id',
        'type',
        'path'
    ];

    // Cast JSON fields to arrays
    protected $casts = [
        'input_boxes' => 'array',
        'signature_boxes' => 'array',
    ];

    // Define the relationship to the User model (Assuming the document belongs to a user)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function boxes()
    {
        return $this->hasMany(Box::class);
    }

    public function documentSubmissions()
{
    return $this->hasMany(DocumentSubmit::class);
}
}
