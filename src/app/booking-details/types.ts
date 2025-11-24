// الأنواع والواجهات

export interface Meal {
  id: number
  name: string
  price: number
}

export interface BaggageOption {
  id: number
  name: string
  weight: number
  price: number
}

export interface PassengerForm {
  title: string
  firstName: string
  lastName: string
  docType: string
  docNumber: string
  dob: string
  phone: string
  email: string
}

export interface PaymentForm {
  cardName: string
  cardNumber: string
  expMonth: string
  expYear: string
  cvv: string
}

export interface Extras {
  meal: boolean
  baggage: boolean
  seat: boolean
  lounge: boolean
}

export interface TimeFilters {
  earlyMorning: boolean
  morning: boolean
  afternoon: boolean
  evening: boolean
}

export interface BookingDraft {
  fromStationCode?: string
  toStationCode?: string
  selectedDateISO?: string
  passengers?: {
    summaryAr?: string
    adults?: number
    children?: number
    infants?: number
  }
}

