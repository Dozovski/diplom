export const CAR_PHOTOS_BY_NAME = {
  "BMW 520d": ["/img/BMW520d/vidsbokybmw.jpg", "/img/BMW520d/vidsperedibmw.jpg", "/img/BMW520d/interierbmw.jpg", "/img/BMW520d/vidzadibmw.jpg"],
  "Mercedes-Benz C200": ["/img/MercedesC200/interiermers.jpg", "/img/MercedesC200/vidsperedimerc.jpg", "/img/MercedesC200/vidsbokymerc.jpg", "/img/MercedesC200/vidszadimers.jpg"],
  "Audi A4": ["/img/AudiA4/interieraudi.jpg", "/img/AudiA4/vidsperedi.jpg", "/img/AudiA4/vidsbokyaudi.jpg", "/img/AudiA4/vidszadiaudi.jpg"],
  "Volkswagen Polo": ["/img/VolkswagenPolo/interierpolo.jpg", "/img/VolkswagenPolo/vidsperedipolo.jpg", "/img/VolkswagenPolo/vidsbokypolo.jpg", "/img/VolkswagenPolo/vidszadipolo.jpg"],
  "Toyota Camry": ["/img/ToyotaCamry/interiercamry.jpg", "/img/ToyotaCamry/vidsperedicamry.jpg", "/img/ToyotaCamry/vidsbokycamry.jpg", "/img/ToyotaCamry/vidszadicamry.jpg"],
  "Kia Rio": ["/img/KiaRio/interierkia.jpg", "/img/KiaRio/vidsperedikia.jpg", "/img/KiaRio/vidsbokykia.jpg", "/img/KiaRio/vidszadi.jpg"],
  "Hyundai Sonata": ["/img/HyundaiSonata/interiersonata.jpg", "/img/HyundaiSonata/vidsperedisonata.jpg", "/img/HyundaiSonata/vidsbokysonata.jpg", "/img/HyundaiSonata/vidszadisonata.jpg"],
  "Range Rover Evoque": ["/img/RangeRover/interierrange.jpg", "/img/RangeRover/vidsperedirange.jpg", "/img/RangeRover/vidsbokyrange.jpg", "/img/RangeRover/vidszadirange.jpg"],
  "Škoda Octavia": ["/img/SkodaOctavia/interierskoda.jpg", "/img/SkodaOctavia/vidsperediskoda.jpg", "/img/SkodaOctavia/vidsbokyskoda.jpg", "/img/SkodaOctavia/vidszadiskoda.jpg"],
};

export const CAR_PHOTOS = new Proxy({}, {
  get(_, id) {
    return undefined;
  }
});

export const getCarPhotos = (car) => {
  if (!car) return [];
  return CAR_PHOTOS_BY_NAME[car.name] || CAR_PHOTOS_BY_NAME[Object.keys(CAR_PHOTOS_BY_NAME).find(k => k.toLowerCase() === car.name?.toLowerCase())] || [];
};

export const PHOTO_LABELS = ["Интерьер", "Вид спереди", "Вид сбоку", "Вид сзади"];

export const CATEGORIES = ["Все", "Эконом", "Комфорт", "Бизнес", "Премиум"];

export const CAR_CATALOG = [
  { name: "BMW 520d", category: "Бизнес", year: 2023, seats: 5, transmission: "Автомат", fuel: "Дизель", engine: "2.0L Turbo", hp: 190, price: 120, lat: 53.9045, lng: 27.5615, address: "пр. Независимости, 31", description: "Элегантный бизнес-седан с превосходным комфортом и динамикой." },
  { name: "Mercedes-Benz C200", category: "Бизнес", year: 2022, seats: 5, transmission: "Автомат", fuel: "Бензин", engine: "1.5L Turbo", hp: 204, price: 140, lat: 53.8934, lng: 27.5479, address: "ул. Немига, 12", description: "Роскошный седан с передовыми технологиями." },
  { name: "Audi A4", category: "Бизнес", year: 2023, seats: 5, transmission: "Автомат", fuel: "Бензин", engine: "2.0 TFSI", hp: 204, price: 130, lat: 53.9108, lng: 27.5888, address: "ул. Сурганова, 57", description: "Спортивная элегантность и технологичность." },
  { name: "Volkswagen Polo", category: "Эконом", year: 2022, seats: 5, transmission: "Механика", fuel: "Бензин", engine: "1.6 MPI", hp: 110, price: 55, lat: 53.8772, lng: 27.5145, address: "ул. Притыцкого, 83", description: "Надёжный и экономичный городской автомобиль." },
  { name: "Toyota Camry", category: "Комфорт", year: 2023, seats: 5, transmission: "Автомат", fuel: "Бензин", engine: "2.5L", hp: 200, price: 95, lat: 53.9201, lng: 27.5769, address: "пр. Машерова, 11", description: "Легендарная надёжность Toyota." },
  { name: "Kia Rio", category: "Эконом", year: 2021, seats: 5, transmission: "Автомат", fuel: "Бензин", engine: "1.6L", hp: 123, price: 45, lat: 53.8618, lng: 27.6742, address: "пр. Партизанский, 150", description: "Популярный и доступный автомобиль." },
  { name: "Hyundai Sonata", category: "Комфорт", year: 2022, seats: 5, transmission: "Автомат", fuel: "Бензин", engine: "2.5L", hp: 180, price: 85, lat: 53.9350, lng: 27.6510, address: "ул. Богдановича, 155", description: "Стильный седан с просторным салоном." },
  { name: "Range Rover Evoque", category: "Премиум", year: 2023, seats: 5, transmission: "Автомат", fuel: "Дизель", engine: "2.0L D200", hp: 200, price: 200, lat: 53.9050, lng: 27.5520, address: "ул. Интернациональная, 25", description: "Премиальный кроссовер с безупречным стилем." },
  { name: "Škoda Octavia", category: "Комфорт", year: 2022, seats: 5, transmission: "Автомат", fuel: "Дизель", engine: "2.0 TDI", hp: 150, price: 75, lat: 53.8890, lng: 27.5960, address: "ул. Козлова, 7", description: "Практичный и вместительный автомобиль." },
];