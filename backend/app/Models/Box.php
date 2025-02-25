<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Box extends Model
{
    protected $fillable = ['document_id', 'type', 'field_type', 'top', 'left', 'required'];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}
