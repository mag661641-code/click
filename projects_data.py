"""
projects_data.py - dannye proektov Click: goroda, shablony okonchaniy, hesh paroley.
Poluchennye 1:1 iz click/projects.js (Node) cherez avtomaticheskoe izvlechenie,
chtoby izbezhat oshibok pri ruchnom perepechatyvanii ~250 gorodov.
"""

SMU_CITIES = [
  {
    "country": "Россия",
    "name": "Москва",
    "url": "https://yandex.ru/sprav/128446144797/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Санкт-Петербург",
    "url": "https://yandex.ru/sprav/229648692343/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новосибирск",
    "url": "https://yandex.ru/sprav/79868830395/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Екатеринбург",
    "url": "https://yandex.ru/sprav/1143534003/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Казань",
    "url": "https://yandex.ru/sprav/104913644514/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Нижний Новгород",
    "url": "https://yandex.ru/sprav/228494005767/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Красноярск",
    "url": "https://yandex.ru/sprav/15441991925/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Челябинск",
    "url": "https://yandex.ru/sprav/24038969/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Уфа",
    "url": "https://yandex.ru/sprav/150969111377/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Самара",
    "url": "https://yandex.ru/sprav/106823264193/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ростов-на-Дону",
    "url": "https://yandex.ru/sprav/151218579478/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Краснодар",
    "url": "https://yandex.ru/sprav/4393581902/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Омск",
    "url": "https://yandex.ru/sprav/37158767109/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Воронеж",
    "url": "https://yandex.ru/sprav/143885893091/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Пермь",
    "url": "https://yandex.ru/sprav/60916044440/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Волгоград",
    "url": "https://yandex.ru/sprav/125165367563/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Саратов",
    "url": "https://yandex.ru/sprav/111407283130/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тюмень",
    "url": "https://yandex.ru/sprav/22517749446/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тольятти",
    "url": "https://yandex.ru/sprav/181035892675/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Барнаул",
    "url": "https://yandex.ru/sprav/99764580978/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ижевск",
    "url": "https://yandex.ru/sprav/243155492091/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Хабаровск",
    "url": "https://yandex.ru/sprav/90492027885/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ульяновск",
    "url": "https://yandex.ru/sprav/157111470951/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Иркутск",
    "url": "https://yandex.ru/sprav/114272803228/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Владивосток",
    "url": "https://yandex.ru/sprav/69226317142/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ярославль",
    "url": "https://yandex.ru/sprav/69707249429/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Севастополь",
    "url": "https://yandex.ru/sprav/199208306761/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ставрополь",
    "url": "https://yandex.ru/sprav/46169435404/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Томск",
    "url": "https://yandex.ru/sprav/206814184572/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Кемерово",
    "url": "https://yandex.ru/sprav/193160798189/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Набережные Челны",
    "url": "https://yandex.ru/sprav/115566834910/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Оренбург",
    "url": "https://yandex.ru/sprav/121367618818/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новокузнецк",
    "url": "https://yandex.ru/sprav/19136488587/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Рязань",
    "url": "https://yandex.ru/sprav/106228311300/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Чебоксары",
    "url": "https://yandex.ru/sprav/158032472122/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Калининград",
    "url": "https://yandex.ru/sprav/242745077439/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Пенза",
    "url": "https://yandex.ru/sprav/3917046611/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Липецк",
    "url": "https://yandex.ru/sprav/215418235431/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Киров",
    "url": "https://yandex.ru/sprav/195480915352/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Астрахань",
    "url": "https://yandex.ru/sprav/159864649139/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тула",
    "url": "https://yandex.ru/sprav/241791752486/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Сочи",
    "url": "https://yandex.ru/sprav/144807514064/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Курск",
    "url": "https://yandex.ru/sprav/200358419533/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Сургут",
    "url": "https://yandex.ru/sprav/96920197977/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тверь",
    "url": "https://yandex.ru/sprav/135893396594/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Магнитогорск",
    "url": "https://yandex.ru/sprav/6832131523/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Брянск",
    "url": "https://yandex.ru/sprav/147599160636/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Якутск",
    "url": "https://yandex.ru/sprav/178629597919/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Иваново",
    "url": "https://yandex.ru/sprav/49538817508/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Владимир",
    "url": "https://yandex.ru/sprav/88020615771/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Чита",
    "url": "https://yandex.ru/sprav/25947570864/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Калуга",
    "url": "https://yandex.ru/sprav/40764560417/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Белгород",
    "url": "https://yandex.ru/sprav/130797066235/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Вологда",
    "url": "https://yandex.ru/sprav/101838610682/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Смоленск",
    "url": "https://yandex.ru/sprav/101206445426/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Курган",
    "url": "https://yandex.ru/sprav/35300536412/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Архангельск",
    "url": "https://yandex.ru/sprav/5741493060/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Орёл",
    "url": "https://yandex.ru/sprav/188702920373/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Нижневартовск",
    "url": "https://yandex.ru/sprav/134117193766/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Мурманск",
    "url": "https://yandex.ru/sprav/172664017642/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Кострома",
    "url": "https://yandex.ru/sprav/133698277407/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новороссийск",
    "url": "https://yandex.ru/sprav/225439264735/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тамбов",
    "url": "https://yandex.ru/sprav/213964461482/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Таганрог",
    "url": "https://yandex.ru/sprav/9688785610/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Благовещенск",
    "url": "https://yandex.ru/sprav/40082372510/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Великий Новгород",
    "url": "https://yandex.ru/sprav/223424281709/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Сыктывкар",
    "url": "https://yandex.ru/sprav/206486140011/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Абакан",
    "url": "https://yandex.ru/sprav/17648599690/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Южно-Сахалинск",
    "url": "https://yandex.ru/sprav/26709782529/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Пятигорск",
    "url": "https://yandex.ru/sprav/24038611/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новый Уренгой",
    "url": "https://yandex.ru/sprav/40363092/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ноябрьск",
    "url": "https://yandex.ru/sprav/29498281/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Донецк",
    "url": "https://yandex.ru/sprav/66340602240/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Мариуполь",
    "url": "https://yandex.ru/sprav/39275955631/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Луганск",
    "url": "https://yandex.ru/sprav/169256502699/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Мелитополь",
    "url": "https://yandex.ru/sprav/107163064076/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Алматы",
    "url": "https://yandex.ru/sprav/210005587496/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Астана",
    "url": "https://yandex.ru/sprav/132927746462/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Шымкент",
    "url": "https://yandex.ru/sprav/239814819262/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Актобе",
    "url": "https://yandex.ru/sprav/40372639/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Караганда",
    "url": "https://yandex.ru/sprav/34015807316/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Тараз",
    "url": "https://yandex.ru/sprav/186427244557/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Усть-Каменогорск",
    "url": "https://yandex.ru/sprav/152338535410/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Павлодар",
    "url": "https://yandex.ru/sprav/80950126806/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Атырау",
    "url": "https://yandex.ru/sprav/17843085929/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Семей",
    "url": "https://yandex.ru/sprav/243183974904/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Кызылорда",
    "url": "https://yandex.ru/sprav/6815881426/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Актау",
    "url": "https://yandex.ru/sprav/129042211206/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Костанай",
    "url": "https://yandex.ru/sprav/188617825069/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Уральск",
    "url": "https://yandex.ru/sprav/143745058451/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Туркестан",
    "url": "https://yandex.ru/sprav/40691746/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Петропавловск",
    "url": "https://yandex.ru/sprav/225962241906/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Кокшетау",
    "url": "https://yandex.ru/sprav/197556572725/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Темиртау",
    "url": "https://yandex.ru/sprav/80020614597/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Талдыкорган",
    "url": "https://yandex.ru/sprav/49120077806/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Экибастуз",
    "url": "https://yandex.ru/sprav/4961174096/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Жезказган",
    "url": "https://yandex.ru/sprav/204664579178/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Жанаозен",
    "url": "https://yandex.ru/sprav/199861757519/p/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Минск",
    "url": "https://yandex.ru/sprav/88250245837/p/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Гомель",
    "url": "https://yandex.ru/sprav/113286734819/p/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Могилев",
    "url": "https://yandex.ru/sprav/88641711411/p/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Витебск",
    "url": "https://yandex.ru/sprav/199823320618/p/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Гродно",
    "url": "https://yandex.ru/sprav/206440723365/p/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Брест",
    "url": "https://yandex.ru/sprav/216176370867/p/edit/posts/"
  },
  {
    "country": "Кыргызстан",
    "name": "Бишкек",
    "url": "https://yandex.ru/sprav/175467360016/p/edit/posts/"
  },
  {
    "country": "Кыргызстан",
    "name": "Ош",
    "url": "https://yandex.ru/sprav/98941568385/p/edit/posts/"
  },
  {
    "country": "Кыргызстан",
    "name": "Джалал-Абад",
    "url": "https://yandex.ru/sprav/69821197088/p/edit/posts/"
  },
  {
    "country": "Кыргызстан",
    "name": "Каракол",
    "url": "https://yandex.ru/sprav/90407173136/p/edit/posts/"
  },
  {
    "country": "Узбекистан",
    "name": "Ташкент",
    "url": "https://yandex.ru/sprav/85356175541/p/edit/posts/"
  },
  {
    "country": "Узбекистан",
    "name": "Наманган",
    "url": "https://yandex.ru/sprav/129575744421/p/edit/posts/"
  },
  {
    "country": "Узбекистан",
    "name": "Самарканд",
    "url": "https://yandex.ru/sprav/34545773619/p/edit/posts/"
  },
  {
    "country": "Азербайджан",
    "name": "Баку",
    "url": "https://yandex.ru/sprav/215378262837/p/edit/posts/"
  },
  {
    "country": "Азербайджан",
    "name": "Гянджа",
    "url": "https://yandex.ru/sprav/114808346802/p/edit/posts/"
  },
  {
    "country": "Азербайджан",
    "name": "Сумгаит",
    "url": "https://yandex.ru/sprav/40544189/edit/posts/"
  },
  {
    "country": "Армения",
    "name": "Ереван",
    "url": "https://yandex.ru/sprav/30074101164/p/edit/posts/"
  },
  {
    "country": "Армения",
    "name": "Гюмри",
    "url": "https://yandex.ru/sprav/93196407888/p/edit/posts/"
  },
  {
    "country": "Армения",
    "name": "Ванадзор",
    "url": "https://yandex.ru/sprav/182799585923/p/edit/posts/"
  }
]

IMP_CITIES = [
  {
    "country": "Россия",
    "name": "Москва",
    "url": "https://yandex.ru/sprav/42632247/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Санкт-Петербург",
    "url": "https://yandex.ru/sprav/42594272/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новосибирск",
    "url": "https://yandex.ru/sprav/42594334/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Екатеринбург",
    "url": "https://yandex.ru/sprav/42729544/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Казань",
    "url": "https://yandex.ru/sprav/42594378/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Красноярск",
    "url": "https://yandex.ru/sprav/42594438/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Нижний Новгород",
    "url": "https://yandex.ru/sprav/42594408/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Челябинск",
    "url": "https://yandex.ru/sprav/42594562/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Уфа",
    "url": "https://yandex.ru/sprav/42594591/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Самара",
    "url": "https://yandex.ru/sprav/42594619/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ростов-на-Дону",
    "url": "https://yandex.ru/sprav/42594643/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Краснодар",
    "url": "https://yandex.ru/sprav/42594681/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Омск",
    "url": "https://yandex.ru/sprav/42594708/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Воронеж",
    "url": "https://yandex.ru/sprav/42594730/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Пермь",
    "url": "https://yandex.ru/sprav/42612444/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Волгоград",
    "url": "https://yandex.ru/sprav/42612731/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Донецк",
    "url": "https://yandex.ru/sprav/42756883/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Саратов",
    "url": "https://yandex.ru/sprav/42612778/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тюмень",
    "url": "https://yandex.ru/sprav/42612881/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тольятти",
    "url": "https://yandex.ru/sprav/42612939/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Махачкала",
    "url": "https://yandex.ru/sprav/42876820/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Барнаул",
    "url": "https://yandex.ru/sprav/42612986/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ижевск",
    "url": "https://yandex.ru/sprav/42613032/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Хабаровск",
    "url": "https://yandex.ru/sprav/42613251/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ульяновск",
    "url": "https://yandex.ru/sprav/42617172/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Иркутск",
    "url": "https://yandex.ru/sprav/42617220/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Владивосток",
    "url": "https://yandex.ru/sprav/42617476/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ярославль",
    "url": "https://yandex.ru/sprav/42617506/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Севастополь",
    "url": "https://yandex.ru/sprav/42617525/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ставрополь",
    "url": "https://yandex.ru/sprav/42617561/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Кемерово",
    "url": "https://yandex.ru/sprav/42617617/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Томск",
    "url": "https://yandex.ru/sprav/42617583/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Набережные Челны",
    "url": "https://yandex.ru/sprav/42729570/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Оренбург",
    "url": "https://yandex.ru/sprav/42617656/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новокузнецк",
    "url": "https://yandex.ru/sprav/42729597/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Рязань",
    "url": "https://yandex.ru/sprav/42617682/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Чебоксары",
    "url": "https://yandex.ru/sprav/42729624/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Калининград",
    "url": "https://yandex.ru/sprav/42618054/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Пенза",
    "url": "https://yandex.ru/sprav/42618189/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Липецк",
    "url": "https://yandex.ru/sprav/42632891/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Киров",
    "url": "https://yandex.ru/sprav/42633008/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Астрахань",
    "url": "https://yandex.ru/sprav/42729653/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тула",
    "url": "https://yandex.ru/sprav/42634635/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Сочи",
    "url": "https://yandex.ru/sprav/42729679/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Курск",
    "url": "https://yandex.ru/sprav/42729763/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Мариуполь",
    "url": "https://yandex.ru/sprav/42756964/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Сургут",
    "url": "https://yandex.ru/sprav/42634836/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тверь",
    "url": "https://yandex.ru/sprav/42634872/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Луганск",
    "url": "https://yandex.ru/sprav/42757038/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Магнитогорск",
    "url": "https://yandex.ru/sprav/42729810/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Брянск",
    "url": "https://yandex.ru/sprav/42634899/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Якутск",
    "url": "https://yandex.ru/sprav/42729835/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Иваново",
    "url": "https://yandex.ru/sprav/42729854/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Владимир",
    "url": "https://yandex.ru/sprav/42634922/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Чита",
    "url": "https://yandex.ru/sprav/42729880/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Калуга",
    "url": "https://yandex.ru/sprav/42729902/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Белгород",
    "url": "https://yandex.ru/sprav/42634986/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Вологда",
    "url": "https://yandex.ru/sprav/42735068/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Смоленск",
    "url": "https://yandex.ru/sprav/42735092/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Курган",
    "url": "https://yandex.ru/sprav/42735119/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Архангельск",
    "url": "https://yandex.ru/sprav/42735187/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Орёл",
    "url": "https://yandex.ru/sprav/42735204/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Нижневартовск",
    "url": "https://yandex.ru/sprav/42735231/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Мурманск",
    "url": "https://yandex.ru/sprav/42735268/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Кострома",
    "url": "https://yandex.ru/sprav/42735295/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новороссийск",
    "url": "https://yandex.ru/sprav/42735335/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тамбов",
    "url": "https://yandex.ru/sprav/42735360/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Таганрог",
    "url": "https://yandex.ru/sprav/42754593/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Благовещенск",
    "url": "https://yandex.ru/sprav/42755473/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Великий Новгород",
    "url": "https://yandex.ru/sprav/42755712/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Сыктывкар",
    "url": "https://yandex.ru/sprav/42755832/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Абакан",
    "url": "https://yandex.ru/sprav/42756065/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Южно-Сахалинск",
    "url": "https://yandex.ru/sprav/42641469/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Мелитополь",
    "url": "https://yandex.ru/sprav/42757602/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Пятигорск",
    "url": "https://yandex.ru/sprav/42756187/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новый Уренгой",
    "url": "https://yandex.ru/sprav/42756290/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ноябрьск",
    "url": "https://yandex.ru/sprav/42756405/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Минск",
    "url": "https://yandex.ru/sprav/41024552/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Гомель",
    "url": "https://yandex.ru/sprav/41026296/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Брест",
    "url": "https://yandex.ru/sprav/41024653/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Витебск",
    "url": "https://yandex.ru/sprav/41026029/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Гродно",
    "url": "https://yandex.ru/sprav/41026430/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Могилев",
    "url": "https://yandex.ru/sprav/41029471/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Актау",
    "url": "https://yandex.ru/sprav/42777143/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Актобе",
    "url": "https://yandex.ru/sprav/42763400/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Алматы",
    "url": "https://yandex.ru/sprav/42763308/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Астана",
    "url": "https://yandex.ru/sprav/42763815/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Атырау",
    "url": "https://yandex.ru/sprav/42763374/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Жанаозен",
    "url": "https://yandex.ru/sprav/42783737/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Жезказган",
    "url": "https://yandex.ru/sprav/42783328/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Караганда",
    "url": "https://yandex.ru/sprav/42777373/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Кокшетау",
    "url": "https://yandex.ru/sprav/42876523/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Костанай",
    "url": "https://yandex.ru/sprav/42774859/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Кызылорда",
    "url": "https://yandex.ru/sprav/42875750/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Павлодар",
    "url": "https://yandex.ru/sprav/42763775/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Петропавловск",
    "url": "https://yandex.ru/sprav/42774966/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Семей",
    "url": "https://yandex.ru/sprav/42777335/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Талдыкорган",
    "url": "https://yandex.ru/sprav/42783182/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Тараз",
    "url": "https://yandex.ru/sprav/42777276/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Темиртау",
    "url": "https://yandex.ru/sprav/42875798/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Туркестан",
    "url": "https://yandex.ru/sprav/42875771/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Уральск",
    "url": "https://yandex.ru/sprav/42777230/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Усть-Каменогорск",
    "url": "https://yandex.ru/sprav/42763346/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Шымкент",
    "url": "https://yandex.ru/sprav/42774823/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Экибастуз",
    "url": "https://yandex.ru/sprav/42783237/edit/posts/"
  },
  {
    "country": "Узбекистан",
    "name": "Наманган",
    "url": "https://yandex.ru/sprav/42783863/edit/posts/"
  },
  {
    "country": "Узбекистан",
    "name": "Самарканд",
    "url": "https://yandex.ru/sprav/42783923/edit/posts/"
  },
  {
    "country": "Узбекистан",
    "name": "Ташкент",
    "url": "https://yandex.ru/sprav/42783818/edit/posts/"
  },
  {
    "country": "Киргизия",
    "name": "Бишкек",
    "url": "https://yandex.ru/sprav/42762396/edit/posts/"
  },
  {
    "country": "Киргизия",
    "name": "Джалал-Абад",
    "url": "https://yandex.ru/sprav/42762858/edit/posts/"
  },
  {
    "country": "Киргизия",
    "name": "Каракол",
    "url": "https://yandex.ru/sprav/42763181/edit/posts/"
  },
  {
    "country": "Киргизия",
    "name": "Ош",
    "url": "https://yandex.ru/sprav/42762825/edit/posts/"
  },
  {
    "country": "Азербайджан",
    "name": "Баку",
    "url": "https://yandex.ru/sprav/42877902/edit/posts/"
  },
  {
    "country": "Азербайджан",
    "name": "Сумгаит",
    "url": "https://yandex.ru/sprav/42876612/edit/posts/"
  },
  {
    "country": "Азербайджан",
    "name": "Гянджа",
    "url": "https://yandex.ru/sprav/42923834/edit/posts/"
  },
  {
    "country": "Армения",
    "name": "Ереван",
    "url": "https://yandex.ru/sprav/42876867/edit/posts/"
  },
  {
    "country": "Армения",
    "name": "Гюмри",
    "url": "https://yandex.ru/sprav/42876926/edit/posts/"
  },
  {
    "country": "Армения",
    "name": "Ванадзор",
    "url": "https://yandex.ru/sprav/42876973/edit/posts/"
  }
]

MPE_CITIES = [
  {
    "country": "Россия",
    "name": "Москва",
    "url": "https://yandex.ru/sprav/140867501802/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Санкт-Петербург",
    "url": "https://yandex.ru/sprav/46921969012/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новосибирск",
    "url": "https://yandex.ru/sprav/116846236337/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Екатеринбург",
    "url": "https://yandex.ru/sprav/120874718919/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Казань",
    "url": "https://yandex.ru/sprav/189687026781/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Нижний Новгород",
    "url": "https://yandex.ru/sprav/133909976495/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Челябинск",
    "url": "https://yandex.ru/sprav/210362345398/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Красноярск",
    "url": "https://yandex.ru/sprav/210788388746/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Омск",
    "url": "https://yandex.ru/sprav/154630720177/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ростов-на-Дону",
    "url": "https://yandex.ru/sprav/112917938811/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Самара",
    "url": "https://yandex.ru/sprav/118811461588/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Уфа",
    "url": "https://yandex.ru/sprav/68482501329/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Воронеж",
    "url": "https://yandex.ru/sprav/19402359619/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Пермь",
    "url": "https://yandex.ru/sprav/50929527354/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Волгоград",
    "url": "https://yandex.ru/sprav/129938274175/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Краснодар",
    "url": "https://yandex.ru/sprav/99691002814/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Саратов",
    "url": "https://yandex.ru/sprav/239286294943/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тюмень",
    "url": "https://yandex.ru/sprav/99219674768/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тольятти",
    "url": "https://yandex.ru/sprav/223447148938/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ижевск",
    "url": "https://yandex.ru/sprav/113694217806/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Барнаул",
    "url": "https://yandex.ru/sprav/201090287617/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ульяновск",
    "url": "https://yandex.ru/sprav/188547513698/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Иркутск",
    "url": "https://yandex.ru/sprav/69649874107/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Хабаровск",
    "url": "https://yandex.ru/sprav/190272500997/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Владивосток",
    "url": "https://yandex.ru/sprav/113664142087/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Махачкала",
    "url": "https://yandex.ru/sprav/62574322612/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ярославль",
    "url": "https://yandex.ru/sprav/83044565058/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Оренбург",
    "url": "https://yandex.ru/sprav/171400752610/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Томск",
    "url": "https://yandex.ru/sprav/205043118154/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Кемерово",
    "url": "https://yandex.ru/sprav/208586121178/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новокузнецк",
    "url": "https://yandex.ru/sprav/23910489078/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Рязань",
    "url": "https://yandex.ru/sprav/148452510342/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Астрахань",
    "url": "https://yandex.ru/sprav/99369138790/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Набережные Челны",
    "url": "https://yandex.ru/sprav/216943043640/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Пенза",
    "url": "https://yandex.ru/sprav/232230464946/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Киров",
    "url": "https://yandex.ru/sprav/190462100131/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Липецк",
    "url": "https://yandex.ru/sprav/215373870756/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Чебоксары",
    "url": "https://yandex.ru/sprav/12862234874/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Калининград",
    "url": "https://yandex.ru/sprav/141581805285/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тула",
    "url": "https://yandex.ru/sprav/58674349714/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Курск",
    "url": "https://yandex.ru/sprav/9745185991/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ставрополь",
    "url": "https://yandex.ru/sprav/113226291416/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Улан-Удэ",
    "url": "https://yandex.ru/sprav/62476590298/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тверь",
    "url": "https://yandex.ru/sprav/11421798768/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Магнитогорск",
    "url": "https://yandex.ru/sprav/20988020191/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Брянск",
    "url": "https://yandex.ru/sprav/118465407221/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Иваново",
    "url": "https://yandex.ru/sprav/158096459962/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Сочи",
    "url": "https://yandex.ru/sprav/64514516210/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Белгород",
    "url": "https://yandex.ru/sprav/17325270531/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Сургут",
    "url": "https://yandex.ru/sprav/29292054714/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Архангельск",
    "url": "https://yandex.ru/sprav/44213645510/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Владимир",
    "url": "https://yandex.ru/sprav/170602475376/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Нижний Тагил",
    "url": "https://yandex.ru/sprav/73884449686/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Чита",
    "url": "https://yandex.ru/sprav/46053586284/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Калуга",
    "url": "https://yandex.ru/sprav/63580775441/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Симферополь",
    "url": "https://yandex.ru/sprav/23786301496/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Якутск",
    "url": "https://yandex.ru/sprav/143605996086/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Волжский",
    "url": "https://yandex.ru/sprav/116791030858/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Саранск",
    "url": "https://yandex.ru/sprav/39063175305/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Смоленск",
    "url": "https://yandex.ru/sprav/239470067471/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Череповец",
    "url": "https://yandex.ru/sprav/181626660468/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Вологда",
    "url": "https://yandex.ru/sprav/177398750554/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Курган",
    "url": "https://yandex.ru/sprav/20152484434/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Владикавказ",
    "url": "https://yandex.ru/sprav/33304235457/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Грозный",
    "url": "https://yandex.ru/sprav/147778012163/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Орёл",
    "url": "https://yandex.ru/sprav/149516632790/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Подольск",
    "url": "https://yandex.ru/sprav/197265960256/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Тамбов",
    "url": "https://yandex.ru/sprav/229002669532/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Йошкар-Ола",
    "url": "https://yandex.ru/sprav/199067371697/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Мурманск",
    "url": "https://yandex.ru/sprav/116870880364/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Нижневартовск",
    "url": "https://yandex.ru/sprav/222202906485/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новороссийск",
    "url": "https://yandex.ru/sprav/101518570775/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Петрозаводск",
    "url": "https://yandex.ru/sprav/113975994100/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Кострома",
    "url": "https://yandex.ru/sprav/181738717953/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Мытищи",
    "url": "https://yandex.ru/sprav/139360732088/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Сыктывкар",
    "url": "https://yandex.ru/sprav/20641386198/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Таганрог",
    "url": "https://yandex.ru/sprav/56723520050/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Нальчик",
    "url": "https://yandex.ru/sprav/162572111983/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Братск",
    "url": "https://yandex.ru/sprav/177489948907/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Люберцы",
    "url": "https://yandex.ru/sprav/242420885081/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Энгельс",
    "url": "https://yandex.ru/sprav/154864359593/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ангарск",
    "url": "https://yandex.ru/sprav/97926765376/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Великий Новгород",
    "url": "https://yandex.ru/sprav/96252399787/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Псков",
    "url": "https://yandex.ru/sprav/55974712627/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Бийск",
    "url": "https://yandex.ru/sprav/66138466148/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Южно-Сахалинск",
    "url": "https://yandex.ru/sprav/159339437284/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Балаково",
    "url": "https://yandex.ru/sprav/73875979150/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Абакан",
    "url": "https://yandex.ru/sprav/183346596238/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Норильск",
    "url": "https://yandex.ru/sprav/108171069972/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Петропавловск-Камчатский",
    "url": "https://yandex.ru/sprav/112176996189/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Каменск-Уральский",
    "url": "https://yandex.ru/sprav/8388558443/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новочеркасск",
    "url": "https://yandex.ru/sprav/67840627449/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Златоуст",
    "url": "https://yandex.ru/sprav/14202497094/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Домодедово",
    "url": "https://yandex.ru/sprav/164678898023/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Керчь",
    "url": "https://yandex.ru/sprav/134720333394/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Колпино",
    "url": "https://yandex.ru/sprav/60265021038/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Миасс",
    "url": "https://yandex.ru/sprav/63117002028/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Электросталь",
    "url": "https://yandex.ru/sprav/5695081782/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Коломна",
    "url": "https://yandex.ru/sprav/99184379670/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Майкоп",
    "url": "https://yandex.ru/sprav/18989744572/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Одинцово",
    "url": "https://yandex.ru/sprav/48752983548/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Батайск",
    "url": "https://yandex.ru/sprav/110254356894/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Щелково",
    "url": "https://yandex.ru/sprav/46455096300/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Долгопрудный",
    "url": "https://yandex.ru/sprav/15791955126/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Кызыл",
    "url": "https://yandex.ru/sprav/113696199079/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новочебоксарск",
    "url": "https://yandex.ru/sprav/236170877371/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Новый Уренгой",
    "url": "https://yandex.ru/sprav/210389096586/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Обнинск",
    "url": "https://yandex.ru/sprav/204967830666/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Орехово-Зуево",
    "url": "https://yandex.ru/sprav/175342479695/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Первоуральск",
    "url": "https://yandex.ru/sprav/177621134341/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Черкесск",
    "url": "https://yandex.ru/sprav/135301534729/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Димитровград",
    "url": "https://yandex.ru/sprav/222943480750/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Жуковский",
    "url": "https://yandex.ru/sprav/86649139821/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Муром",
    "url": "https://yandex.ru/sprav/62874313659/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Артем",
    "url": "https://yandex.ru/sprav/2152632488/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Воткинск",
    "url": "https://yandex.ru/sprav/158319975655/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ленинск-Кузнецкий",
    "url": "https://yandex.ru/sprav/228523456917/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ногинск",
    "url": "https://yandex.ru/sprav/82226356638/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Сергиев Посад",
    "url": "https://yandex.ru/sprav/60085304072/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Ханты-Мансийск",
    "url": "https://yandex.ru/sprav/34711754231/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Элиста",
    "url": "https://yandex.ru/sprav/91702720898/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Воскресенск",
    "url": "https://yandex.ru/sprav/217629697094/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Магадан",
    "url": "https://yandex.ru/sprav/62051039622/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Озерск",
    "url": "https://yandex.ru/sprav/211426713216/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Белорецк",
    "url": "https://yandex.ru/sprav/183038124951/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Курганинск",
    "url": "https://yandex.ru/sprav/11484580554/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Анадырь",
    "url": "https://yandex.ru/sprav/35078679877/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Мышкин",
    "url": "https://yandex.ru/sprav/155072113449/p/edit/posts/"
  },
  {
    "country": "Россия",
    "name": "Железнодорожный",
    "url": "https://yandex.ru/sprav/228169465061/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Шымкент",
    "url": "https://yandex.ru/sprav/120865007406/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Актобе",
    "url": "https://yandex.ru/sprav/141871681522/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Караганда",
    "url": "https://yandex.ru/sprav/180549239338/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Тараз",
    "url": "https://yandex.ru/sprav/144687738493/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Семей",
    "url": "https://yandex.ru/sprav/245124817589/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Усть-Каменогорск",
    "url": "https://yandex.ru/sprav/7219297667/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Атырау",
    "url": "https://yandex.ru/sprav/108114535156/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Уральск",
    "url": "https://yandex.ru/sprav/110063922831/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Костанай",
    "url": "https://yandex.ru/sprav/19586704883/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Кызылорда",
    "url": "https://yandex.ru/sprav/107769173912/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Петропавловск",
    "url": "https://yandex.ru/sprav/173961783407/p/edit/posts/"
  },
  {
    "country": "Казахстан",
    "name": "Абай",
    "url": "https://yandex.ru/sprav/227868942827/p/edit/posts/"
  },
  {
    "country": "Беларусь",
    "name": "Минск",
    "url": "https://yandex.ru/sprav/49159280235/p/edit/posts/"
  }
]

IMP_ENDINGS = {
  "__dynamic": True,
  "contacts": {
    "Россия": {
      "site": "inmetprom.ru",
      "email": "info@inmetprom.ru",
      "phone": "+7 (495) 755-36-28"
    },
    "Беларусь": {
      "site": "inmetprom.by",
      "email": "minsk@inmetprom.by",
      "phone": "+375 (44) 588-81-48"
    },
    "Казахстан": {
      "site": "inmetprom.kz",
      "email": "astana@inmetprom.kz",
      "phone": "+7 (700) 567-89-38"
    },
    "Узбекистан": {
      "site": "inmetprom.uz",
      "email": "tashkent@inmetprom.uz",
      "phone": "+998 (90) 818-86-83"
    },
    "Киргизия": {
      "site": "inmetprom.kg",
      "email": "bishkek@inmetprom.kg",
      "phone": "+996 (77) 631-32-78"
    },
    "Азербайджан": {
      "site": "inmetprom.az",
      "email": "baku@inmetprom.az",
      "phone": None
    },
    "Армения": {
      "site": "inmetprom.am",
      "email": "erevan@inmetprom.am",
      "phone": None
    }
  },
  "templates": {
    "arrival": "Полный каталог металлопроката доступен на нашем сайте {site}.\n\n#Поступление_ИМП #Инметпром #ИМП #Металлопрокат",
    "shipment": "{phoneLine}\n✉️ {email}\n🌏 {site}\n\n#Отгрузка_ИМП #Инметпром #ИМП #Металлопрокат",
    "special": "🌏 {site}\n📫 {email}\n{phoneSpecialLine}\n\n#СПЕЦПРЕДЛОЖЕНИЕ_ИМП #Инметпром #ИМП #Металлопрокат",
    "info": "🔹 Ознакомиться с полным сортаментом металлопроката вы можете на нашем сайте {site}.",
    "greeting": ""
  }
}

MPE_ENDINGS = {
  "__dynamic": True,
  "contacts": {
    "Россия": {
      "site": "mepen.ru",
      "email": "info@mepen.ru",
      "phone": "+7 (495) 799-14-38"
    },
    "Казахстан": {
      "site": "mepen.kz",
      "email": "info@mepen.kz",
      "phone": "+7 (717) 262-58-85"
    },
    "Беларусь": {
      "site": "mepen.by",
      "email": "info@mepen.by",
      "phone": "+375 (29) 643-66-60"
    }
  },
  "templates": {
    "arrival": "Ознакомиться с ассортиментом и оформить заказ можно на нашем сайте {site}.\n\n#Поступление_МПЭ #МетПромЭнерго #МПЭ #Металлопрокат",
    "shipment": "Ознакомиться с ассортиментом, оформить заказ и проконсультироваться с менеджерами можно на нашем сайте:\n\n🌐 {site}\n📩 {email}\n{phoneLine}\n\n#Отгрузка_МПЭ #МетПромЭнерго #МПЭ #Металлопрокат",
    "special": "💻 Сайт: {site}\n✉️ Заявки: {email}\n{phoneSpecialLineMpe}\n\n#СПЕЦПРЕДЛОЖЕНИЕ_МПЭ #МетПромЭнерго #МПЭ #Металлопрокат",
    "info": "Ознакомиться с ассортиментом металлопродукции и оформить заказ можно на нашем сайте {site}.",
    "greeting": ""
  }
}

# ─── СМУ: старая логика окончаний по странам (перенесено из _ui.js) ───
# У СМУ нет "endings" в projects.js (endings=None) — вместо этого окончание поста
# строится из COUNTRY_TEMPLATES (контакты по стране) + POST_TYPES (тип поста).
COUNTRY_TEMPLATES = {
  "Россия":      {"site": "stalmetural.ru", "email": "info@stalmetural.ru", "phone": "+7 (499) 130-36-69",  "currency": "₽",   "currencyCode": "RUB"},
  "Казахстан":   {"site": "stalmetural.kz", "email": "info@stalmetural.kz", "phone": "+7 (717) 226-90-23",  "currency": "тге", "currencyCode": "KZT"},
  "Беларусь":    {"site": "stalmetural.by", "email": "info@stalmetural.by", "phone": "+375 (44) 766-62-58", "currency": "BYN", "currencyCode": "BYN"},
  "Кыргызстан":  {"site": "stalmetural.kg", "email": "info@stalmetural.kg", "phone": "+996 (221) 31-88-82", "currency": "с",   "currencyCode": "KGS"},
  "Узбекистан":  {"site": "stalmetural.uz", "email": "info@stalmetural.uz", "phone": "+998 90-011-36-88",   "currency": "UZS", "currencyCode": "UZS"},
  "Азербайджан": {"site": "smg.az",         "email": "info@smg.az",         "phone": "+994-50-573-28-67",   "currency": "₼",   "currencyCode": "AZN"},
  "Армения":     {"site": "stalmetural.am", "email": "info@stalmetural.am", "phone": "+7 (963) 449-99-68",  "currency": "AMD", "currencyCode": "AMD"},
}

POST_TYPES = [
  {"id": "arrival",  "icon": "📦", "title": "Поступление на склад", "hashtag": "#Поступление_СМУ",      "hasContact": True,  "isInfo": False},
  {"id": "shipment", "icon": "🚚", "title": "Отгрузка",              "hashtag": "#Отгрузка_СМУ",         "hasContact": True,  "isInfo": False},
  {"id": "special",  "icon": "⚡", "title": "Спецпредложение",       "hashtag": "#СПЕЦПРЕДЛОЖЕНИЕ_СМУ", "hasContact": True,  "isInfo": False},
  {"id": "info",     "icon": "ℹ️", "title": "Информационный пост",    "hashtag": "",                       "hasContact": False, "isInfo": True},
  {"id": "greeting", "icon": "🎉", "title": "Поздравление",           "hashtag": "",                       "hasContact": False, "isInfo": False},
]

COMMON_HASHTAGS_SMU = "#Стальметурал #СМУ #Металлопрокат"
