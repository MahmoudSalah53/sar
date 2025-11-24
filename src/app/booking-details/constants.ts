// البيانات الثابتة

export const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

export const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export const STATION_CODES: { [key: string]: string } = {
  'الرياض': 'RYD',
  'الهفوف': 'HAF',
  'بقيق': 'ABQ',
  'الدمام': 'DMM',
  'المجمعة': 'MAJ',
  'القصيم': 'QSM',
  'حائل': 'HAI',
  'الجوف': 'JAU',
  'القريات': 'QUR'
}

export const MEALS = [
  { id: 1, name: 'ساندوتش شرائح الديك الرومي مع جبنة شيدر', price: 25.00 },
  { id: 2, name: 'ساندوتش جبن الغاودا مع الطماطم بخبز الشيباتا', price: 25.00 },
  { id: 3, name: 'ساندوتش الدجاج المشوي مع الخضار', price: 25.00 },
  { id: 4, name: 'ساندوتش لحم البقر مع الجبن الأبيض', price: 25.00 },
  { id: 5, name: 'ساندوتش التونة مع الذرة والمايونيز', price: 25.00 },
  { id: 6, name: 'ساندوتش البيض والجبن مع الطماطم', price: 25.00 },
  { id: 7, name: 'ساندوتش الجبن الكريمي مع الزعتر', price: 25.00 },
  { id: 8, name: 'ساندوتش الحمص والطحينة مع الخضار', price: 25.00 },
]

export const BAGGAGE_OPTIONS = [
  { id: 1, name: 'كبيرة', weight: 32, price: 85.00 },
  { id: 2, name: 'كبيرة', weight: 25, price: 75.00 },
  { id: 3, name: 'كبيرة', weight: 15, price: 60.00 },
]

export const UNAVAILABLE_SEATS = [11, 12, 13, 14, 15, 52, 53, 54, 55, 56, 57]

export const EXTRAS_PRICES = { meal: 10, baggage: 10, seat: 5, lounge: 5 }

export const SIDEBAR_ANIMATION_DURATION = 300

