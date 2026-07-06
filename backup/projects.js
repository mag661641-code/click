// projects.js — фиксированные проекты Click
//
// Здесь хранятся 3 проекта: СМУ, ИМП, МПЭ.
// Для каждого — пароль доступа в Click, email Яндекс.Бизнеса,
// набор городов и шаблоны окончаний постов по странам.

const crypto = require('crypto');

// ─── СПИСОК ГОРОДОВ ─────────────────────────────────────────────
// Города заданы в виде { country, name, url }. URL — это страница карточки
// Яндекс.Бизнеса. Из URL автоматически извлекается ID компании.

const SMU_CITIES = [
  // Россия (76)
  { country: 'Россия', name: 'Москва', url: 'https://yandex.ru/sprav/30074101164/p/edit/posts/' },
  { country: 'Россия', name: 'Санкт-Петербург', url: 'https://yandex.ru/sprav/188547513663/p/edit/posts/' },
  { country: 'Россия', name: 'Новосибирск', url: 'https://yandex.ru/sprav/188702920373/p/edit/posts/' },
  // (остальные города СМУ — пользователь добавит сам через UI или они уже в его localStorage)
];

const IMP_CITIES = [
  // Россия
  { country: 'Россия', name: 'Москва', url: 'https://yandex.ru/sprav/42632247/edit/posts/' },
  { country: 'Россия', name: 'Санкт-Петербург', url: 'https://yandex.ru/sprav/42594272/edit/posts/' },
  { country: 'Россия', name: 'Новосибирск', url: 'https://yandex.ru/sprav/42594334/edit/posts/' },
  { country: 'Россия', name: 'Екатеринбург', url: 'https://yandex.ru/sprav/42729544/edit/posts/' },
  { country: 'Россия', name: 'Казань', url: 'https://yandex.ru/sprav/42594378/edit/posts/' },
  { country: 'Россия', name: 'Красноярск', url: 'https://yandex.ru/sprav/42594438/edit/posts/' },
  { country: 'Россия', name: 'Нижний Новгород', url: 'https://yandex.ru/sprav/42594408/edit/posts/' },
  { country: 'Россия', name: 'Челябинск', url: 'https://yandex.ru/sprav/42594562/edit/posts/' },
  { country: 'Россия', name: 'Уфа', url: 'https://yandex.ru/sprav/42594591/edit/posts/' },
  { country: 'Россия', name: 'Самара', url: 'https://yandex.ru/sprav/42594619/edit/posts/' },
  { country: 'Россия', name: 'Ростов-на-Дону', url: 'https://yandex.ru/sprav/42594643/edit/posts/' },
  { country: 'Россия', name: 'Краснодар', url: 'https://yandex.ru/sprav/42594681/edit/posts/' },
  { country: 'Россия', name: 'Омск', url: 'https://yandex.ru/sprav/42594708/edit/posts/' },
  { country: 'Россия', name: 'Воронеж', url: 'https://yandex.ru/sprav/42594730/edit/posts/' },
  { country: 'Россия', name: 'Пермь', url: 'https://yandex.ru/sprav/42612444/edit/posts/' },
  { country: 'Россия', name: 'Волгоград', url: 'https://yandex.ru/sprav/42612731/edit/posts/' },
  { country: 'Россия', name: 'Донецк', url: 'https://yandex.ru/sprav/42756883/edit/posts/' },
  { country: 'Россия', name: 'Саратов', url: 'https://yandex.ru/sprav/42612778/edit/posts/' },
  { country: 'Россия', name: 'Тюмень', url: 'https://yandex.ru/sprav/42612881/edit/posts/' },
  { country: 'Россия', name: 'Тольятти', url: 'https://yandex.ru/sprav/42612939/edit/posts/' },
  { country: 'Россия', name: 'Махачкала', url: 'https://yandex.ru/sprav/42876820/edit/posts/' },
  { country: 'Россия', name: 'Барнаул', url: 'https://yandex.ru/sprav/42612986/edit/posts/' },
  { country: 'Россия', name: 'Ижевск', url: 'https://yandex.ru/sprav/42613032/edit/posts/' },
  { country: 'Россия', name: 'Хабаровск', url: 'https://yandex.ru/sprav/42613251/edit/posts/' },
  { country: 'Россия', name: 'Ульяновск', url: 'https://yandex.ru/sprav/42617172/edit/posts/' },
  { country: 'Россия', name: 'Иркутск', url: 'https://yandex.ru/sprav/42617220/edit/posts/' },
  { country: 'Россия', name: 'Владивосток', url: 'https://yandex.ru/sprav/42617476/edit/posts/' },
  { country: 'Россия', name: 'Ярославль', url: 'https://yandex.ru/sprav/42617506/edit/posts/' },
  { country: 'Россия', name: 'Севастополь', url: 'https://yandex.ru/sprav/42617525/edit/posts/' },
  { country: 'Россия', name: 'Ставрополь', url: 'https://yandex.ru/sprav/42617561/edit/posts/' },
  { country: 'Россия', name: 'Кемерово', url: 'https://yandex.ru/sprav/42617617/edit/posts/' },
  { country: 'Россия', name: 'Томск', url: 'https://yandex.ru/sprav/42617583/edit/posts/' },
  { country: 'Россия', name: 'Набережные Челны', url: 'https://yandex.ru/sprav/42729570/edit/posts/' },
  { country: 'Россия', name: 'Оренбург', url: 'https://yandex.ru/sprav/42617656/edit/posts/' },
  { country: 'Россия', name: 'Новокузнецк', url: 'https://yandex.ru/sprav/42729597/edit/posts/' },
  { country: 'Россия', name: 'Рязань', url: 'https://yandex.ru/sprav/42617682/edit/posts/' },
  { country: 'Россия', name: 'Чебоксары', url: 'https://yandex.ru/sprav/42729624/edit/posts/' },
  { country: 'Россия', name: 'Калининград', url: 'https://yandex.ru/sprav/42618054/edit/posts/' },
  { country: 'Россия', name: 'Пенза', url: 'https://yandex.ru/sprav/42618189/edit/posts/' },
  { country: 'Россия', name: 'Липецк', url: 'https://yandex.ru/sprav/42632891/edit/posts/' },
  { country: 'Россия', name: 'Киров', url: 'https://yandex.ru/sprav/42633008/edit/posts/' },
  { country: 'Россия', name: 'Астрахань', url: 'https://yandex.ru/sprav/42729653/edit/posts/' },
  { country: 'Россия', name: 'Тула', url: 'https://yandex.ru/sprav/42634635/edit/posts/' },
  { country: 'Россия', name: 'Сочи', url: 'https://yandex.ru/sprav/42729679/edit/posts/' },
  { country: 'Россия', name: 'Курск', url: 'https://yandex.ru/sprav/42729763/edit/posts/' },
  { country: 'Россия', name: 'Мариуполь', url: 'https://yandex.ru/sprav/42756964/edit/posts/' },
  { country: 'Россия', name: 'Сургут', url: 'https://yandex.ru/sprav/42634836/edit/posts/' },
  { country: 'Россия', name: 'Тверь', url: 'https://yandex.ru/sprav/42634872/edit/posts/' },
  { country: 'Россия', name: 'Луганск', url: 'https://yandex.ru/sprav/42757038/edit/posts/' },
  { country: 'Россия', name: 'Магнитогорск', url: 'https://yandex.ru/sprav/42729810/edit/posts/' },
  { country: 'Россия', name: 'Брянск', url: 'https://yandex.ru/sprav/42634899/edit/posts/' },
  { country: 'Россия', name: 'Якутск', url: 'https://yandex.ru/sprav/42729835/edit/posts/' },
  { country: 'Россия', name: 'Иваново', url: 'https://yandex.ru/sprav/42729854/edit/posts/' },
  { country: 'Россия', name: 'Владимир', url: 'https://yandex.ru/sprav/42634922/edit/posts/' },
  { country: 'Россия', name: 'Чита', url: 'https://yandex.ru/sprav/42729880/edit/posts/' },
  { country: 'Россия', name: 'Калуга', url: 'https://yandex.ru/sprav/42729902/edit/posts/' },
  { country: 'Россия', name: 'Белгород', url: 'https://yandex.ru/sprav/42634986/edit/posts/' },
  { country: 'Россия', name: 'Вологда', url: 'https://yandex.ru/sprav/42735068/edit/posts/' },
  { country: 'Россия', name: 'Смоленск', url: 'https://yandex.ru/sprav/42735092/edit/posts/' },
  { country: 'Россия', name: 'Курган', url: 'https://yandex.ru/sprav/42735119/edit/posts/' },
  { country: 'Россия', name: 'Архангельск', url: 'https://yandex.ru/sprav/42735187/edit/posts/' },
  { country: 'Россия', name: 'Орёл', url: 'https://yandex.ru/sprav/42735204/edit/posts/' },
  { country: 'Россия', name: 'Нижневартовск', url: 'https://yandex.ru/sprav/42735231/edit/posts/' },
  { country: 'Россия', name: 'Мурманск', url: 'https://yandex.ru/sprav/42735268/edit/posts/' },
  { country: 'Россия', name: 'Кострома', url: 'https://yandex.ru/sprav/42735295/edit/posts/' },
  { country: 'Россия', name: 'Новороссийск', url: 'https://yandex.ru/sprav/42735335/edit/posts/' },
  { country: 'Россия', name: 'Тамбов', url: 'https://yandex.ru/sprav/42735360/edit/posts/' },
  { country: 'Россия', name: 'Таганрог', url: 'https://yandex.ru/sprav/42754593/edit/posts/' },
  { country: 'Россия', name: 'Благовещенск', url: 'https://yandex.ru/sprav/42755473/edit/posts/' },
  { country: 'Россия', name: 'Великий Новгород', url: 'https://yandex.ru/sprav/42755712/edit/posts/' },
  { country: 'Россия', name: 'Сыктывкар', url: 'https://yandex.ru/sprav/42755832/edit/posts/' },
  { country: 'Россия', name: 'Абакан', url: 'https://yandex.ru/sprav/42756065/edit/posts/' },
  { country: 'Россия', name: 'Южно-Сахалинск', url: 'https://yandex.ru/sprav/42641469/edit/posts/' },
  { country: 'Россия', name: 'Мелитополь', url: 'https://yandex.ru/sprav/42757602/edit/posts/' },
  { country: 'Россия', name: 'Пятигорск', url: 'https://yandex.ru/sprav/42756187/edit/posts/' },
  { country: 'Россия', name: 'Новый Уренгой', url: 'https://yandex.ru/sprav/42756290/edit/posts/' },
  { country: 'Россия', name: 'Ноябрьск', url: 'https://yandex.ru/sprav/42756405/edit/posts/' },
  // Беларусь (6)
  { country: 'Беларусь', name: 'Минск', url: 'https://yandex.ru/sprav/41024552/edit/posts/' },
  { country: 'Беларусь', name: 'Гомель', url: 'https://yandex.ru/sprav/41026296/edit/posts/' },
  { country: 'Беларусь', name: 'Брест', url: 'https://yandex.ru/sprav/41024653/edit/posts/' },
  { country: 'Беларусь', name: 'Витебск', url: 'https://yandex.ru/sprav/41026029/edit/posts/' },
  { country: 'Беларусь', name: 'Гродно', url: 'https://yandex.ru/sprav/41026430/edit/posts/' },
  { country: 'Беларусь', name: 'Могилев', url: 'https://yandex.ru/sprav/41029471/edit/posts/' },
  // Казахстан (22)
  { country: 'Казахстан', name: 'Актау', url: 'https://yandex.ru/sprav/42777143/edit/posts/' },
  { country: 'Казахстан', name: 'Актобе', url: 'https://yandex.ru/sprav/42763400/edit/posts/' },
  { country: 'Казахстан', name: 'Алматы', url: 'https://yandex.ru/sprav/42763308/edit/posts/' },
  { country: 'Казахстан', name: 'Астана', url: 'https://yandex.ru/sprav/42763815/edit/posts/' },
  { country: 'Казахстан', name: 'Атырау', url: 'https://yandex.ru/sprav/42763374/edit/posts/' },
  { country: 'Казахстан', name: 'Жанаозен', url: 'https://yandex.ru/sprav/42783737/edit/posts/' },
  { country: 'Казахстан', name: 'Жезказган', url: 'https://yandex.ru/sprav/42783328/edit/posts/' },
  { country: 'Казахстан', name: 'Караганда', url: 'https://yandex.ru/sprav/42777373/edit/posts/' },
  { country: 'Казахстан', name: 'Кокшетау', url: 'https://yandex.ru/sprav/42876523/edit/posts/' },
  { country: 'Казахстан', name: 'Костанай', url: 'https://yandex.ru/sprav/42774859/edit/posts/' },
  { country: 'Казахстан', name: 'Кызылорда', url: 'https://yandex.ru/sprav/42875750/edit/posts/' },
  { country: 'Казахстан', name: 'Павлодар', url: 'https://yandex.ru/sprav/42763775/edit/posts/' },
  { country: 'Казахстан', name: 'Петропавловск', url: 'https://yandex.ru/sprav/42774966/edit/posts/' },
  { country: 'Казахстан', name: 'Семей', url: 'https://yandex.ru/sprav/42777335/edit/posts/' },
  { country: 'Казахстан', name: 'Талдыкорган', url: 'https://yandex.ru/sprav/42783182/edit/posts/' },
  { country: 'Казахстан', name: 'Тараз', url: 'https://yandex.ru/sprav/42777276/edit/posts/' },
  { country: 'Казахстан', name: 'Темиртау', url: 'https://yandex.ru/sprav/42875798/edit/posts/' },
  { country: 'Казахстан', name: 'Туркестан', url: 'https://yandex.ru/sprav/42875771/edit/posts/' },
  { country: 'Казахстан', name: 'Уральск', url: 'https://yandex.ru/sprav/42777230/edit/posts/' },
  { country: 'Казахстан', name: 'Усть-Каменогорск', url: 'https://yandex.ru/sprav/42763346/edit/posts/' },
  { country: 'Казахстан', name: 'Шымкент', url: 'https://yandex.ru/sprav/42774823/edit/posts/' },
  { country: 'Казахстан', name: 'Экибастуз', url: 'https://yandex.ru/sprav/42783237/edit/posts/' },
  // Узбекистан (3)
  { country: 'Узбекистан', name: 'Наманган', url: 'https://yandex.ru/sprav/42783863/edit/posts/' },
  { country: 'Узбекистан', name: 'Самарканд', url: 'https://yandex.ru/sprav/42783923/edit/posts/' },
  { country: 'Узбекистан', name: 'Ташкент', url: 'https://yandex.ru/sprav/42783818/edit/posts/' },
  // Киргизия (4)
  { country: 'Киргизия', name: 'Бишкек', url: 'https://yandex.ru/sprav/42762396/edit/posts/' },
  { country: 'Киргизия', name: 'Джалал-Абад', url: 'https://yandex.ru/sprav/42762858/edit/posts/' },
  { country: 'Киргизия', name: 'Каракол', url: 'https://yandex.ru/sprav/42763181/edit/posts/' },
  { country: 'Киргизия', name: 'Ош', url: 'https://yandex.ru/sprav/42762825/edit/posts/' },
  // Азербайджан (3)
  { country: 'Азербайджан', name: 'Баку', url: 'https://yandex.ru/sprav/42877902/edit/posts/' },
  { country: 'Азербайджан', name: 'Сумгаит', url: 'https://yandex.ru/sprav/42876612/edit/posts/' },
  { country: 'Азербайджан', name: 'Гянджа', url: 'https://yandex.ru/sprav/42923834/edit/posts/' },
  // Армения (3)
  { country: 'Армения', name: 'Ереван', url: 'https://yandex.ru/sprav/42876867/edit/posts/' },
  { country: 'Армения', name: 'Гюмри', url: 'https://yandex.ru/sprav/42876926/edit/posts/' },
  { country: 'Армения', name: 'Ванадзор', url: 'https://yandex.ru/sprav/42876973/edit/posts/' },
];

const MPE_CITIES = [
  // Россия
  { country: 'Россия', name: 'Москва', url: 'https://yandex.ru/sprav/140867501802/p/edit/posts/' },
  { country: 'Россия', name: 'Санкт-Петербург', url: 'https://yandex.ru/sprav/46921969012/p/edit/posts/' },
  { country: 'Россия', name: 'Новосибирск', url: 'https://yandex.ru/sprav/116846236337/p/edit/posts/' },
  { country: 'Россия', name: 'Екатеринбург', url: 'https://yandex.ru/sprav/120874718919/p/edit/posts/' },
  { country: 'Россия', name: 'Казань', url: 'https://yandex.ru/sprav/189687026781/p/edit/posts/' },
  { country: 'Россия', name: 'Нижний Новгород', url: 'https://yandex.ru/sprav/133909976495/p/edit/posts/' },
  { country: 'Россия', name: 'Челябинск', url: 'https://yandex.ru/sprav/210362345398/p/edit/posts/' },
  { country: 'Россия', name: 'Красноярск', url: 'https://yandex.ru/sprav/210788388746/p/edit/posts/' },
  { country: 'Россия', name: 'Омск', url: 'https://yandex.ru/sprav/154630720177/p/edit/posts/' },
  { country: 'Россия', name: 'Ростов-на-Дону', url: 'https://yandex.ru/sprav/112917938811/p/edit/posts/' },
  { country: 'Россия', name: 'Самара', url: 'https://yandex.ru/sprav/118811461588/p/edit/posts/' },
  { country: 'Россия', name: 'Уфа', url: 'https://yandex.ru/sprav/68482501329/p/edit/posts/' },
  { country: 'Россия', name: 'Воронеж', url: 'https://yandex.ru/sprav/19402359619/p/edit/posts/' },
  { country: 'Россия', name: 'Пермь', url: 'https://yandex.ru/sprav/50929527354/p/edit/posts/' },
  { country: 'Россия', name: 'Волгоград', url: 'https://yandex.ru/sprav/129938274175/p/edit/posts/' },
  { country: 'Россия', name: 'Краснодар', url: 'https://yandex.ru/sprav/99691002814/p/edit/posts/' },
  { country: 'Россия', name: 'Саратов', url: 'https://yandex.ru/sprav/239286294943/p/edit/posts/' },
  { country: 'Россия', name: 'Тюмень', url: 'https://yandex.ru/sprav/99219674768/p/edit/posts/' },
  { country: 'Россия', name: 'Тольятти', url: 'https://yandex.ru/sprav/223447148938/p/edit/posts/' },
  { country: 'Россия', name: 'Ижевск', url: 'https://yandex.ru/sprav/113694217806/p/edit/posts/' },
  { country: 'Россия', name: 'Барнаул', url: 'https://yandex.ru/sprav/201090287617/p/edit/posts/' },
  { country: 'Россия', name: 'Ульяновск', url: 'https://yandex.ru/sprav/188547513698/p/edit/posts/' },
  { country: 'Россия', name: 'Иркутск', url: 'https://yandex.ru/sprav/69649874107/p/edit/posts/' },
  { country: 'Россия', name: 'Хабаровск', url: 'https://yandex.ru/sprav/190272500997/p/edit/posts/' },
  { country: 'Россия', name: 'Владивосток', url: 'https://yandex.ru/sprav/113664142087/p/edit/posts/' },
  { country: 'Россия', name: 'Махачкала', url: 'https://yandex.ru/sprav/62574322612/p/edit/posts/' },
  { country: 'Россия', name: 'Ярославль', url: 'https://yandex.ru/sprav/83044565058/p/edit/posts/' },
  { country: 'Россия', name: 'Оренбург', url: 'https://yandex.ru/sprav/171400752610/p/edit/posts/' },
  { country: 'Россия', name: 'Томск', url: 'https://yandex.ru/sprav/205043118154/p/edit/posts/' },
  { country: 'Россия', name: 'Кемерово', url: 'https://yandex.ru/sprav/208586121178/p/edit/posts/' },
  { country: 'Россия', name: 'Новокузнецк', url: 'https://yandex.ru/sprav/23910489078/p/edit/posts/' },
  { country: 'Россия', name: 'Рязань', url: 'https://yandex.ru/sprav/148452510342/p/edit/posts/' },
  { country: 'Россия', name: 'Астрахань', url: 'https://yandex.ru/sprav/99369138790/p/edit/posts/' },
  { country: 'Россия', name: 'Набережные Челны', url: 'https://yandex.ru/sprav/216943043640/p/edit/posts/' },
  { country: 'Россия', name: 'Пенза', url: 'https://yandex.ru/sprav/232230464946/p/edit/posts/' },
  { country: 'Россия', name: 'Киров', url: 'https://yandex.ru/sprav/190462100131/p/edit/posts/' },
  { country: 'Россия', name: 'Липецк', url: 'https://yandex.ru/sprav/215373870756/p/edit/posts/' },
  { country: 'Россия', name: 'Чебоксары', url: 'https://yandex.ru/sprav/12862234874/p/edit/posts/' },
  { country: 'Россия', name: 'Калининград', url: 'https://yandex.ru/sprav/141581805285/p/edit/posts/' },
  { country: 'Россия', name: 'Тула', url: 'https://yandex.ru/sprav/58674349714/p/edit/posts/' },
  { country: 'Россия', name: 'Курск', url: 'https://yandex.ru/sprav/9745185991/p/edit/posts/' },
  { country: 'Россия', name: 'Ставрополь', url: 'https://yandex.ru/sprav/113226291416/p/edit/posts/' },
  { country: 'Россия', name: 'Улан-Удэ', url: 'https://yandex.ru/sprav/62476590298/p/edit/posts/' },
  { country: 'Россия', name: 'Тверь', url: 'https://yandex.ru/sprav/11421798768/p/edit/posts/' },
  { country: 'Россия', name: 'Магнитогорск', url: 'https://yandex.ru/sprav/20988020191/p/edit/posts/' },
  { country: 'Россия', name: 'Брянск', url: 'https://yandex.ru/sprav/118465407221/p/edit/posts/' },
  { country: 'Россия', name: 'Иваново', url: 'https://yandex.ru/sprav/158096459962/p/edit/posts/' },
  { country: 'Россия', name: 'Сочи', url: 'https://yandex.ru/sprav/64514516210/p/edit/posts/' },
  { country: 'Россия', name: 'Белгород', url: 'https://yandex.ru/sprav/17325270531/p/edit/posts/' },
  { country: 'Россия', name: 'Сургут', url: 'https://yandex.ru/sprav/29292054714/p/edit/posts/' },
  { country: 'Россия', name: 'Архангельск', url: 'https://yandex.ru/sprav/44213645510/p/edit/posts/' },
  { country: 'Россия', name: 'Владимир', url: 'https://yandex.ru/sprav/170602475376/p/edit/posts/' },
  { country: 'Россия', name: 'Нижний Тагил', url: 'https://yandex.ru/sprav/73884449686/p/edit/posts/' },
  { country: 'Россия', name: 'Чита', url: 'https://yandex.ru/sprav/46053586284/p/edit/posts/' },
  { country: 'Россия', name: 'Калуга', url: 'https://yandex.ru/sprav/63580775441/p/edit/posts/' },
  { country: 'Россия', name: 'Симферополь', url: 'https://yandex.ru/sprav/23786301496/p/edit/posts/' },
  { country: 'Россия', name: 'Якутск', url: 'https://yandex.ru/sprav/143605996086/p/edit/posts/' },
  { country: 'Россия', name: 'Волжский', url: 'https://yandex.ru/sprav/116791030858/p/edit/posts/' },
  { country: 'Россия', name: 'Саранск', url: 'https://yandex.ru/sprav/39063175305/p/edit/posts/' },
  { country: 'Россия', name: 'Смоленск', url: 'https://yandex.ru/sprav/239470067471/p/edit/posts/' },
  { country: 'Россия', name: 'Череповец', url: 'https://yandex.ru/sprav/181626660468/p/edit/posts/' },
  { country: 'Россия', name: 'Вологда', url: 'https://yandex.ru/sprav/177398750554/p/edit/posts/' },
  { country: 'Россия', name: 'Курган', url: 'https://yandex.ru/sprav/20152484434/p/edit/posts/' },
  { country: 'Россия', name: 'Владикавказ', url: 'https://yandex.ru/sprav/33304235457/p/edit/posts/' },
  { country: 'Россия', name: 'Грозный', url: 'https://yandex.ru/sprav/147778012163/p/edit/posts/' },
  { country: 'Россия', name: 'Орёл', url: 'https://yandex.ru/sprav/149516632790/p/edit/posts/' },
  { country: 'Россия', name: 'Подольск', url: 'https://yandex.ru/sprav/197265960256/p/edit/posts/' },
  { country: 'Россия', name: 'Тамбов', url: 'https://yandex.ru/sprav/229002669532/p/edit/posts/' },
  { country: 'Россия', name: 'Йошкар-Ола', url: 'https://yandex.ru/sprav/199067371697/p/edit/posts/' },
  { country: 'Россия', name: 'Мурманск', url: 'https://yandex.ru/sprav/116870880364/p/edit/posts/' },
  { country: 'Россия', name: 'Нижневартовск', url: 'https://yandex.ru/sprav/222202906485/p/edit/posts/' },
  { country: 'Россия', name: 'Новороссийск', url: 'https://yandex.ru/sprav/101518570775/p/edit/posts/' },
  { country: 'Россия', name: 'Петрозаводск', url: 'https://yandex.ru/sprav/113975994100/p/edit/posts/' },
  { country: 'Россия', name: 'Кострома', url: 'https://yandex.ru/sprav/181738717953/p/edit/posts/' },
  { country: 'Россия', name: 'Мытищи', url: 'https://yandex.ru/sprav/139360732088/p/edit/posts/' },
  { country: 'Россия', name: 'Сыктывкар', url: 'https://yandex.ru/sprav/20641386198/p/edit/posts/' },
  { country: 'Россия', name: 'Таганрог', url: 'https://yandex.ru/sprav/56723520050/p/edit/posts/' },
  { country: 'Россия', name: 'Нальчик', url: 'https://yandex.ru/sprav/162572111983/p/edit/posts/' },
  { country: 'Россия', name: 'Братск', url: 'https://yandex.ru/sprav/177489948907/p/edit/posts/' },
  { country: 'Россия', name: 'Люберцы', url: 'https://yandex.ru/sprav/242420885081/p/edit/posts/' },
  { country: 'Россия', name: 'Энгельс', url: 'https://yandex.ru/sprav/154864359593/p/edit/posts/' },
  { country: 'Россия', name: 'Ангарск', url: 'https://yandex.ru/sprav/97926765376/p/edit/posts/' },
  { country: 'Россия', name: 'Великий Новгород', url: 'https://yandex.ru/sprav/96252399787/p/edit/posts/' },
  { country: 'Россия', name: 'Псков', url: 'https://yandex.ru/sprav/55974712627/p/edit/posts/' },
  { country: 'Россия', name: 'Бийск', url: 'https://yandex.ru/sprav/66138466148/p/edit/posts/' },
  { country: 'Россия', name: 'Южно-Сахалинск', url: 'https://yandex.ru/sprav/159339437284/p/edit/posts/' },
  { country: 'Россия', name: 'Балаково', url: 'https://yandex.ru/sprav/73875979150/p/edit/posts/' },
  { country: 'Россия', name: 'Абакан', url: 'https://yandex.ru/sprav/183346596238/p/edit/posts/' },
  { country: 'Россия', name: 'Норильск', url: 'https://yandex.ru/sprav/108171069972/p/edit/posts/' },
  { country: 'Россия', name: 'Петропавловск-Камчатский', url: 'https://yandex.ru/sprav/112176996189/p/edit/posts/' },
  { country: 'Россия', name: 'Каменск-Уральский', url: 'https://yandex.ru/sprav/8388558443/p/edit/posts/' },
  { country: 'Россия', name: 'Новочеркасск', url: 'https://yandex.ru/sprav/67840627449/p/edit/posts/' },
  { country: 'Россия', name: 'Златоуст', url: 'https://yandex.ru/sprav/14202497094/p/edit/posts/' },
  { country: 'Россия', name: 'Домодедово', url: 'https://yandex.ru/sprav/164678898023/p/edit/posts/' },
  { country: 'Россия', name: 'Керчь', url: 'https://yandex.ru/sprav/134720333394/p/edit/posts/' },
  { country: 'Россия', name: 'Колпино', url: 'https://yandex.ru/sprav/60265021038/p/edit/posts/' },
  { country: 'Россия', name: 'Миасс', url: 'https://yandex.ru/sprav/63117002028/p/edit/posts/' },
  { country: 'Россия', name: 'Электросталь', url: 'https://yandex.ru/sprav/5695081782/p/edit/posts/' },
  { country: 'Россия', name: 'Коломна', url: 'https://yandex.ru/sprav/99184379670/p/edit/posts/' },
  { country: 'Россия', name: 'Майкоп', url: 'https://yandex.ru/sprav/18989744572/p/edit/posts/' },
  { country: 'Россия', name: 'Одинцово', url: 'https://yandex.ru/sprav/48752983548/p/edit/posts/' },
  { country: 'Россия', name: 'Батайск', url: 'https://yandex.ru/sprav/110254356894/p/edit/posts/' },
  { country: 'Россия', name: 'Щелково', url: 'https://yandex.ru/sprav/46455096300/p/edit/posts/' },
  { country: 'Россия', name: 'Долгопрудный', url: 'https://yandex.ru/sprav/15791955126/p/edit/posts/' },
  { country: 'Россия', name: 'Кызыл', url: 'https://yandex.ru/sprav/113696199079/p/edit/posts/' },
  { country: 'Россия', name: 'Новочебоксарск', url: 'https://yandex.ru/sprav/236170877371/p/edit/posts/' },
  { country: 'Россия', name: 'Новый Уренгой', url: 'https://yandex.ru/sprav/210389096586/p/edit/posts/' },
  { country: 'Россия', name: 'Обнинск', url: 'https://yandex.ru/sprav/204967830666/p/edit/posts/' },
  { country: 'Россия', name: 'Орехово-Зуево', url: 'https://yandex.ru/sprav/175342479695/p/edit/posts/' },
  { country: 'Россия', name: 'Первоуральск', url: 'https://yandex.ru/sprav/177621134341/p/edit/posts/' },
  { country: 'Россия', name: 'Черкесск', url: 'https://yandex.ru/sprav/135301534729/p/edit/posts/' },
  { country: 'Россия', name: 'Димитровград', url: 'https://yandex.ru/sprav/222943480750/p/edit/posts/' },
  { country: 'Россия', name: 'Жуковский', url: 'https://yandex.ru/sprav/86649139821/p/edit/posts/' },
  { country: 'Россия', name: 'Муром', url: 'https://yandex.ru/sprav/62874313659/p/edit/posts/' },
  { country: 'Россия', name: 'Артем', url: 'https://yandex.ru/sprav/2152632488/p/edit/posts/' },
  { country: 'Россия', name: 'Воткинск', url: 'https://yandex.ru/sprav/158319975655/p/edit/posts/' },
  { country: 'Россия', name: 'Ленинск-Кузнецкий', url: 'https://yandex.ru/sprav/228523456917/p/edit/posts/' },
  { country: 'Россия', name: 'Ногинск', url: 'https://yandex.ru/sprav/82226356638/p/edit/posts/' },
  { country: 'Россия', name: 'Сергиев Посад', url: 'https://yandex.ru/sprav/60085304072/p/edit/posts/' },
  { country: 'Россия', name: 'Ханты-Мансийск', url: 'https://yandex.ru/sprav/34711754231/p/edit/posts/' },
  { country: 'Россия', name: 'Элиста', url: 'https://yandex.ru/sprav/91702720898/p/edit/posts/' },
  { country: 'Россия', name: 'Воскресенск', url: 'https://yandex.ru/sprav/217629697094/p/edit/posts/' },
  { country: 'Россия', name: 'Магадан', url: 'https://yandex.ru/sprav/62051039622/p/edit/posts/' },
  { country: 'Россия', name: 'Озерск', url: 'https://yandex.ru/sprav/211426713216/p/edit/posts/' },
  { country: 'Россия', name: 'Белорецк', url: 'https://yandex.ru/sprav/183038124951/p/edit/posts/' },
  { country: 'Россия', name: 'Курганинск', url: 'https://yandex.ru/sprav/11484580554/p/edit/posts/' },
  { country: 'Россия', name: 'Анадырь', url: 'https://yandex.ru/sprav/35078679877/p/edit/posts/' },
  { country: 'Россия', name: 'Мышкин', url: 'https://yandex.ru/sprav/155072113449/p/edit/posts/' },
  { country: 'Россия', name: 'Железнодорожный', url: 'https://yandex.ru/sprav/228169465061/p/edit/posts/' },
  // Казахстан
  { country: 'Казахстан', name: 'Шымкент', url: 'https://yandex.ru/sprav/120865007406/p/edit/posts/' },
  { country: 'Казахстан', name: 'Актобе', url: 'https://yandex.ru/sprav/141871681522/p/edit/posts/' },
  { country: 'Казахстан', name: 'Караганда', url: 'https://yandex.ru/sprav/180549239338/p/edit/posts/' },
  { country: 'Казахстан', name: 'Тараз', url: 'https://yandex.ru/sprav/144687738493/p/edit/posts/' },
  { country: 'Казахстан', name: 'Семей', url: 'https://yandex.ru/sprav/245124817589/p/edit/posts/' },
  { country: 'Казахстан', name: 'Усть-Каменогорск', url: 'https://yandex.ru/sprav/7219297667/p/edit/posts/' },
  { country: 'Казахстан', name: 'Атырау', url: 'https://yandex.ru/sprav/108114535156/p/edit/posts/' },
  { country: 'Казахстан', name: 'Уральск', url: 'https://yandex.ru/sprav/110063922831/p/edit/posts/' },
  { country: 'Казахстан', name: 'Костанай', url: 'https://yandex.ru/sprav/19586704883/p/edit/posts/' },
  { country: 'Казахстан', name: 'Кызылорда', url: 'https://yandex.ru/sprav/107769173912/p/edit/posts/' },
  { country: 'Казахстан', name: 'Петропавловск', url: 'https://yandex.ru/sprav/173961783407/p/edit/posts/' },
  { country: 'Казахстан', name: 'Абай', url: 'https://yandex.ru/sprav/227868942827/p/edit/posts/' },
  // Беларусь
  { country: 'Беларусь', name: 'Минск', url: 'https://yandex.ru/sprav/49159280235/p/edit/posts/' },
];

// ─── ШАБЛОНЫ ОКОНЧАНИЙ ПОСТОВ ───────────────────────────────────
// Структура: для каждого бренда (ИМП/МПЭ) задаём
//   - contacts: контакты по странам (site / email / phone)
//   - templates: шаблон окончания для каждого типа поста
//                В шаблоне подставляются {site}, {email}, {phone} из контактов страны.
//
// Так каждый бренд может иметь свой неповторимый стиль окончаний,
// а контакты автоматически меняются по стране.

// ── КОНТАКТЫ ИМП ПО СТРАНАМ ──
const IMP_CONTACTS = {
  'Россия':      { site: 'inmetprom.ru', email: 'info@inmetprom.ru',    phone: '+7 (495) 755-36-28' },
  'Беларусь':    { site: 'inmetprom.by', email: 'minsk@inmetprom.by',   phone: '+375 (44) 588-81-48' },
  'Казахстан':   { site: 'inmetprom.kz', email: 'astana@inmetprom.kz',  phone: '+7 (700) 567-89-38' },
  'Узбекистан':  { site: 'inmetprom.uz', email: 'tashkent@inmetprom.uz',phone: '+998 (90) 818-86-83' },
  'Киргизия':    { site: 'inmetprom.kg', email: 'bishkek@inmetprom.kg', phone: '+996 (77) 631-32-78' },
  'Азербайджан': { site: 'inmetprom.az', email: 'baku@inmetprom.az',    phone: null }, // телефона нет
  'Армения':     { site: 'inmetprom.am', email: 'erevan@inmetprom.am',  phone: null }, // телефона нет
};

// ── ШАБЛОНЫ ОКОНЧАНИЙ ИМП (оригинальные форматы пользователя) ──
// Хэштеги в формате СМУ (#Поступление_БРЕНД #Полное_Название #БРЕНД #Металлопрокат).
// Исключение: «Спецпредложение» — особый набор хэштегов.
const IMP_TEMPLATES = {
  arrival: [
    'Полный каталог металлопроката доступен на нашем сайте {site}.',
    '',
    '#Поступление_ИМП #Инметпром #ИМП #Металлопрокат',
  ].join('\n'),
  shipment: [
    '{phoneLine}',
    '✉️ {email}',
    '🌏 {site}',
    '',
    '#Отгрузка_ИМП #Инметпром #ИМП #Металлопрокат',
  ].join('\n'),
  special: [
    '🌏 {site}',
    '📫 {email}',
    '{phoneSpecialLine}',
    '',
    '#СПЕЦПРЕДЛОЖЕНИЕ_ИМП #Инметпром #ИМП #Металлопрокат',
  ].join('\n'),
  info: '🔹 Ознакомиться с полным сортаментом металлопроката вы можете на нашем сайте {site}.',
  greeting: '',  // без окончания
};

// ── КОНТАКТЫ МПЭ ПО СТРАНАМ ──
const MPE_CONTACTS = {
  'Россия':    { site: 'mepen.ru', email: 'info@mepen.ru', phone: '+7 (495) 799-14-38' },
  'Казахстан': { site: 'mepen.kz', email: 'info@mepen.kz', phone: '+7 (717) 262-58-85' },
  'Беларусь':  { site: 'mepen.by', email: 'info@mepen.by', phone: '+375 (29) 643-66-60' },
};

// ── ШАБЛОНЫ ОКОНЧАНИЙ МПЭ ──
const MPE_TEMPLATES = {
  arrival: [
    'Ознакомиться с ассортиментом и оформить заказ можно на нашем сайте {site}.',
    '',
    '#Поступление_МПЭ #МетПромЭнерго #МПЭ #Металлопрокат',
  ].join('\n'),
  shipment: [
    'Ознакомиться с ассортиментом, оформить заказ и проконсультироваться с менеджерами можно на нашем сайте:',
    '',
    '🌐 {site}',
    '📩 {email}',
    '{phoneLine}',
    '',
    '#Отгрузка_МПЭ #МетПромЭнерго #МПЭ #Металлопрокат',
  ].join('\n'),
  special: [
    '💻 Сайт: {site}',
    '✉️ Заявки: {email}',
    '{phoneSpecialLineMpe}',
    '',
    '#СПЕЦПРЕДЛОЖЕНИЕ_МПЭ #МетПромЭнерго #МПЭ #Металлопрокат',
  ].join('\n'),
  info: 'Ознакомиться с ассортиментом металлопродукции и оформить заказ можно на нашем сайте {site}.',
  greeting: '',
};

// ── СБОРКА «ДИНАМИЧЕСКИХ» ENDINGS ──
// UI получит этот объект и при формировании поста для конкретной страны
// возьмёт contacts[country], templates[postType] и подставит {site}/{email}/{phone}.
const buildEndingsForBrand = (contacts, templates) => ({
  __dynamic: true,    // маркер: окончания зависят от страны
  contacts,
  templates,
});

const IMP_ENDINGS = buildEndingsForBrand(IMP_CONTACTS, IMP_TEMPLATES);
const MPE_ENDINGS = buildEndingsForBrand(MPE_CONTACTS, MPE_TEMPLATES);

// ─── ХЭШИРОВАНИЕ ПАРОЛЕЙ ─────────────────────────────────────────
const hashPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
};
const verifyPassword = (password, salt, expectedHash) => {
  return hashPassword(password, salt) === expectedHash;
};

// ─── ФИКСИРОВАННЫЕ ПРОЕКТЫ ──────────────────────────────────────
// Пароли захэшированы с фиксированной солью «click-salt-v1»,
// чтобы при сборке хэши воспроизводились одинаково.
const SALT = 'click-salt-v1-2026';
const _hash = (pw) => hashPassword(pw, SALT);

const PROJECTS = [
  {
    id: 'SMU',
    name: 'СМУ',
    fullName: 'Стальметгрупп',
    color: '#3b82f6',          // синий
    icon: '🏗',
    yandexEmail: 'stalmetural19@yandex.ru',
    loginUsername: 'SMY',
    passwordHash: _hash('1501'),
    // У СМУ используются COUNTRY_TEMPLATES из UI (старая логика по странам).
    // Города не зашиты — у пользователя уже есть в localStorage свои сохранённые.
    presetCities: null,
    endings: null,             // null = используется COUNTRY_TEMPLATES
  },
  {
    id: 'IMP',
    name: 'ИМП',
    fullName: 'Инметпром',
    color: '#10b981',          // зелёный
    icon: '🔩',
    yandexEmail: 'inmetprom77@yandex.ru',
    loginUsername: 'IMP',
    passwordHash: _hash('2205'),
    presetCities: IMP_CITIES,
    endings: IMP_ENDINGS,
  },
  {
    id: 'MPE',
    name: 'МПЭ',
    fullName: 'МетПромЭнерго',
    color: '#f59e0b',          // оранжевый
    icon: '⚡',
    yandexEmail: 'mepen88@yandex.ru',
    loginUsername: 'MPE',
    passwordHash: _hash('1101'),
    presetCities: MPE_CITIES,
    endings: MPE_ENDINGS,
  },
];

// ─── СЕССИИ ─────────────────────────────────────────────────────
const crypto2 = require('crypto');
const sessions = new Map(); // sessionId -> { projectId, createdAt, lastSeen }
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 дней

const createSession = (projectId) => {
  const sid = crypto2.randomBytes(32).toString('hex');
  sessions.set(sid, { projectId, createdAt: Date.now(), lastSeen: Date.now() });
  return sid;
};
const validateSession = (sid) => {
  if (!sid) return null;
  const s = sessions.get(sid);
  if (!s) return null;
  if (Date.now() - s.lastSeen > SESSION_TTL) { sessions.delete(sid); return null; }
  s.lastSeen = Date.now();
  return s.projectId;
};
const destroySession = (sid) => { sessions.delete(sid); };

// ─── API ────────────────────────────────────────────────────────

/** Список проектов для экрана выбора (без хэшей паролей и без приватных данных) */
const listProjectsPublic = () => PROJECTS.map(p => ({
  id: p.id,
  name: p.name,
  fullName: p.fullName,
  color: p.color,
  icon: p.icon,
}));

/** Получить проект по id (полностью, с приватными данными) */
const getProject = (projectId) => PROJECTS.find(p => p.id === projectId) || null;

/** Получить публичные данные проекта (для UI) */
const getProjectPublic = (projectId) => {
  const p = getProject(projectId);
  if (!p) return null;
  return {
    id: p.id, name: p.name, fullName: p.fullName, color: p.color, icon: p.icon,
    yandexEmail: p.yandexEmail,
    presetCities: p.presetCities,
    endings: p.endings,
  };
};

/** Войти в проект. Возвращает sessionId или error */
const loginProject = (projectId, password) => {
  const p = getProject(projectId);
  if (!p) return { error: 'Проект не найден' };
  if (!verifyPassword(password || '', SALT, p.passwordHash)) {
    return { error: 'Неверный пароль' };
  }
  const sid = createSession(p.id);
  return { ok: true, sessionId: sid, project: { id: p.id, name: p.name, fullName: p.fullName } };
};

/** Папка пользователя для данных проекта */
const projectDir = (projectId) => projectId.replace(/[^A-Za-z0-9_-]/g, '_');

module.exports = {
  listProjectsPublic, getProject, getProjectPublic,
  loginProject, validateSession, destroySession, projectDir,
};
