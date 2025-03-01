<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Box extends Model
{
    protected $fillable = ['document_id', 'type', 'field_type', 'top', 'left', 'required','width','height'];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}
