<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    // Define the table associated with the model (optional if table name is not the plural form of model name)
    protected $table = 'documents';

    // Specify the fillable fields that can be mass-assigned
    protected $fillable = [
        'name',
        'path',
        'type',
        'user_id',
        'input_boxes',
        'signature_boxes'
    ];

    // Cast JSON fields to arrays
    protected $casts = [
        'input_boxes' => 'array',
        'signature_boxes' => 'array',
    ];

    // Define the relationship to the User model (Assuming the document belongs to a user)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function boxes(): HasMany
    {
        return $this->hasMany(Box::class);
    }

    public function documentSubmissions()
    {
        return $this->hasMany(DocumentSubmit::class);
    }
}
