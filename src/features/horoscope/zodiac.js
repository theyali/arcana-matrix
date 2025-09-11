export const ZODIAC = [
  { slug: 'aries',      name: 'Овен',        emoji: '♈️', dateRange: '21 мар — 19 апр', element:'Огонь' },
  { slug: 'taurus',     name: 'Телец',       emoji: '♉️', dateRange: '20 апр — 20 мая', element:'Земля' },
  { slug: 'gemini',     name: 'Близнецы',    emoji: '♊️', dateRange: '21 мая — 20 июн', element:'Воздух' },
  { slug: 'cancer',     name: 'Рак',         emoji: '♋️', dateRange: '21 июн — 22 июл', element:'Вода' },
  { slug: 'leo',        name: 'Лев',         emoji: '♌️', dateRange: '23 июл — 22 авг', element:'Огонь' },
  { slug: 'virgo',      name: 'Дева',        emoji: '♍️', dateRange: '23 авг — 22 сен', element:'Земля' },
  { slug: 'libra',      name: 'Весы',        emoji: '♎️', dateRange: '23 сен — 22 окт', element:'Воздух' },
  { slug: 'scorpio',    name: 'Скорпион',    emoji: '♏️', dateRange: '23 окт — 21 ноя', element:'Вода' },
  { slug: 'sagittarius',name: 'Стрелец',     emoji: '♐️', dateRange: '22 ноя — 21 дек', element:'Огонь' },
  { slug: 'capricorn',  name: 'Козерог',     emoji: '♑️', dateRange: '22 дек — 19 янв', element:'Земля' },
  { slug: 'aquarius',   name: 'Водолей',     emoji: '♒️', dateRange: '20 янв — 18 фев', element:'Воздух' },
  { slug: 'pisces',     name: 'Рыбы',        emoji: '♓️', dateRange: '19 фев — 20 мар', element:'Вода' },
];

export const getZodiac = (slug) => ZODIAC.find(z => z.slug === slug);
