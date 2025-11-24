// الدوال المساعدة

import { ARABIC_DAYS, ARABIC_MONTHS } from './constants'

export const formatArabicFullDate = (iso: string | null): string => {
  if (!iso) return 'الخميس، 13 نوفمبر 2025'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 'الخميس، 13 نوفمبر 2025'
  const dayName = ARABIC_DAYS[d.getDay()]
  const day = d.getDate()
  const month = ARABIC_MONTHS[d.getMonth()]
  const year = d.getFullYear()
  return `${dayName}، ${day} ${month} ${year}`
}

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const re = /^05\d{8}$/
  return re.test(phone.replace(/\s/g, ''))
}

export const validateIdNumber = (id: string): boolean => {
  return /^\d{10}$/.test(id)
}

export const calculateMealsTotal = (
  selectedMeals: { [key: number]: number },
  meals: Array<{ id: number; price: number }>
): number => {
  return Object.entries(selectedMeals).reduce((total, [mealId, quantity]) => {
    const meal = meals.find(m => m.id === parseInt(mealId))
    return total + (meal ? meal.price * quantity : 0)
  }, 0)
}

export const calculateBaggageTotal = (
  selectedBaggage: { [key: number]: number },
  baggageOptions: Array<{ id: number; price: number }>
): number => {
  return Object.entries(selectedBaggage).reduce((total, [baggageId, quantity]) => {
    const baggage = baggageOptions.find(b => b.id === parseInt(baggageId))
    return total + (baggage ? baggage.price * quantity : 0)
  }, 0)
}

export const calculateLoungeTotal = (selectedLounge: number, loungePrice: number): number => {
  return selectedLounge * loungePrice
}

export const calculateExtrasTotal = (
  mealsTotal: number,
  baggageTotal: number,
  loungeTotal: number,
  extras: { seat: boolean },
  extrasPrices: { seat: number }
): number => {
  return mealsTotal
    + baggageTotal
    + loungeTotal
    + (extras.seat ? extrasPrices.seat : 0)
}

