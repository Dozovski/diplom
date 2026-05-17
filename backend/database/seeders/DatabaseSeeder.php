<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Автомобили ──
        $cars = [
            ['name'=>'BMW 520d','category'=>'Бизнес','year'=>2023,'seats'=>5,'transmission'=>'Автомат','fuel'=>'Дизель','engine'=>'2.0L Turbo','hp'=>190,'price'=>120,'lat'=>53.9045,'lng'=>27.5615,'address'=>'пр. Независимости, 31','available'=>true,'rating'=>4.8,'trips'=>124,'description'=>'Элегантный бизнес-седан с превосходным комфортом и динамикой.','photos'=>json_encode(['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=500&fit=crop'])],
            ['name'=>'Mercedes-Benz C200','category'=>'Бизнес','year'=>2022,'seats'=>5,'transmission'=>'Автомат','fuel'=>'Бензин','engine'=>'1.5L Turbo','hp'=>204,'price'=>140,'lat'=>53.8934,'lng'=>27.5479,'address'=>'ул. Немига, 12','available'=>true,'rating'=>4.9,'trips'=>98,'description'=>'Роскошный седан с передовыми технологиями.','photos'=>json_encode(['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1563339007-6914d7c15805?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=500&fit=crop'])],
            ['name'=>'Audi A4','category'=>'Бизнес','year'=>2023,'seats'=>5,'transmission'=>'Автомат','fuel'=>'Бензин','engine'=>'2.0 TFSI','hp'=>204,'price'=>130,'lat'=>53.9108,'lng'=>27.5888,'address'=>'ул. Сурганова, 57','available'=>true,'rating'=>4.7,'trips'=>87,'description'=>'Спортивная элегантность и технологичность.','photos'=>json_encode(['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=500&fit=crop'])],
            ['name'=>'Volkswagen Polo','category'=>'Эконом','year'=>2022,'seats'=>5,'transmission'=>'Механика','fuel'=>'Бензин','engine'=>'1.6 MPI','hp'=>110,'price'=>55,'lat'=>53.8772,'lng'=>27.5145,'address'=>'ул. Притыцкого, 83','available'=>true,'rating'=>4.5,'trips'=>213,'description'=>'Надёжный и экономичный городской автомобиль.','photos'=>json_encode(['https://images.unsplash.com/photo-1471479917193-f00955256257?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&h=500&fit=crop'])],
            ['name'=>'Toyota Camry','category'=>'Комфорт','year'=>2023,'seats'=>5,'transmission'=>'Автомат','fuel'=>'Бензин','engine'=>'2.5L','hp'=>200,'price'=>95,'lat'=>53.9201,'lng'=>27.5769,'address'=>'пр. Машерова, 11','available'=>false,'rating'=>4.6,'trips'=>156,'description'=>'Легендарная надёжность Toyota.','photos'=>json_encode(['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&h=500&fit=crop'])],
            ['name'=>'Kia Rio','category'=>'Эконом','year'=>2021,'seats'=>5,'transmission'=>'Автомат','fuel'=>'Бензин','engine'=>'1.6L','hp'=>123,'price'=>45,'lat'=>53.8618,'lng'=>27.6742,'address'=>'пр. Партизанский, 150','available'=>true,'rating'=>4.3,'trips'=>301,'description'=>'Популярный и доступный автомобиль.','photos'=>json_encode(['https://images.unsplash.com/photo-1549317661-bd32c8ce0abb?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&h=500&fit=crop'])],
            ['name'=>'Hyundai Sonata','category'=>'Комфорт','year'=>2022,'seats'=>5,'transmission'=>'Автомат','fuel'=>'Бензин','engine'=>'2.5L','hp'=>180,'price'=>85,'lat'=>53.9350,'lng'=>27.6510,'address'=>'ул. Богдановича, 155','available'=>true,'rating'=>4.4,'trips'=>178,'description'=>'Стильный седан с просторным салоном.','photos'=>json_encode(['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop'])],
            ['name'=>'Range Rover Evoque','category'=>'Премиум','year'=>2023,'seats'=>5,'transmission'=>'Автомат','fuel'=>'Дизель','engine'=>'2.0L D200','hp'=>200,'price'=>200,'lat'=>53.9050,'lng'=>27.5520,'address'=>'ул. Интернациональная, 25','available'=>true,'rating'=>4.9,'trips'=>42,'description'=>'Премиальный кроссовер.','photos'=>json_encode(['https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1519245659620-e859806a8d7b?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&h=500&fit=crop'])],
            ['name'=>'Škoda Octavia','category'=>'Комфорт','year'=>2022,'seats'=>5,'transmission'=>'Автомат','fuel'=>'Дизель','engine'=>'2.0 TDI','hp'=>150,'price'=>75,'lat'=>53.8890,'lng'=>27.5960,'address'=>'ул. Козлова, 7','available'=>true,'rating'=>4.5,'trips'=>190,'description'=>'Практичный и вместительный автомобиль.','photos'=>json_encode(['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop','https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=500&fit=crop'])],
        ];

        foreach ($cars as $car) {
            DB::table('cars')->insert(array_merge($car, [
                'created_at' => now(), 'updated_at' => now(),
            ]));
        }

        // ── Отзывы ──
        $reviews = [
            ['name'=>'Александр К.','text'=>'Отличный сервис! Машина была чистая и полностью заправлена.','rating'=>5],
            ['name'=>'Мария П.','text'=>'Арендовала BMW на выходные — всё прошло отлично. Рекомендую!','rating'=>5],
            ['name'=>'Дмитрий В.','text'=>'Быстрая обработка заявки, вежливый персонал.','rating'=>4],
            ['name'=>'Екатерина С.','text'=>'Хороший выбор машин по адекватным ценам.','rating'=>5],
        ];
        foreach ($reviews as $r) {
            DB::table('reviews')->insert(array_merge($r, [
                'created_at' => now(), 'updated_at' => now(),
            ]));
        }

        echo "✅ Seeded: 9 cars, 4 reviews\n";
    }
}
