<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    protected $fillable = [
        'name','category','year','seats','transmission','fuel','engine','hp',
        'price','lat','lng','address','available','rating','trips','description','photos',
    ];
    protected $casts = [
        'available'=>'boolean','rating'=>'float','price'=>'integer',
        'photos'=>'array','lat'=>'float','lng'=>'float',
    ];
    public function bookings() { return $this->hasMany(Booking::class); }
}
