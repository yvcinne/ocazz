<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    use HasFactory;

    protected $fillable = [
        'annonce_id',
        'url',
    ];

    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }
}
