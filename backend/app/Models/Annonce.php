<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Annonce extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'price',
        'brand',
        'model',
        'model_year',
        'mileage',
        'fuel_type',
        'transmission',
        'fiscal_power',
        'car_condition',
        'status',
        'city',
        'doors',
        'origin',
        'first_hand',
        'options',
    ];

    protected $casts = [
        'options'     => 'array',
        'first_hand'  => 'boolean',
        'price'       => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(Image::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }
}
