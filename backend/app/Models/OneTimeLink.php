<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OneTimeLink extends Model
{
    protected $table = "one_time_links";
    use HasFactory;

    protected $fillable = ['token', 'used', 'email', 'updated_at', 'created_at'];
}
