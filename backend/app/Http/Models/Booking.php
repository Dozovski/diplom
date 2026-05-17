<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = ['car_id','name','phone','email','date_from','date_to','comment','status'];
    protected $casts = ['date_from'=>'date','date_to'=>'date'];
    public function car() { return $this->belongsTo(Car::class); }
}
