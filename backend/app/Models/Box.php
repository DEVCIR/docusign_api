<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Box extends Model
{
    protected $fillable = [
        'document_id',
        'type',
        'field_type',
        'top',
        'left',
        'required',
        'width',
        'height',
        'is_expanded'
    ];

    protected $casts = [
        'required' => 'boolean',
        'is_expanded' => 'boolean'
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
