'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import { 
  ARABIC_MONTHS, 
  ARABIC_DAYS, 
  STATION_CODES, 
  MEALS, 
  BAGGAGE_OPTIONS, 
  UNAVAILABLE_SEATS, 
  EXTRAS_PRICES 
} from './constants'
import { formatArabicFullDate, calculateMealsTotal, calculateBaggageTotal, calculateLoungeTotal, calculateExtrasTotal } from './utils'
import type { Extras, BookingDraft, PassengerForm, PaymentForm } from './types'
import { getTrainsForRoute, type TrainTrip } from './trainData'
import MealSidebar from './components/MealSidebar'
import BaggageSidebar from './components/BaggageSidebar'
import LoungeSidebar from './components/LoungeSidebar'

type StoredBookingSelection = {
  fromStation?: string
  toStation?: string
  tripType?: 'one-way' | 'round-trip'
  departureDate?: string
  returnDate?: string
  departureDateISO?: string | null
  returnDateISO?: string | null
  adults?: string | number
  children?: string | number
  infants?: string | number
}

const normalizeCount = (value: unknown, fallback: string): string => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.floor(value).toString()
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    if (!Number.isNaN(parsed) && parsed >= 0) {
      return parsed.toString()
    }
  }
  return fallback
}

function BookingDetailsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialSelection = {
    fromStation: searchParams.get('from') || 'الهفوف',
    toStation: searchParams.get('to') || 'الرياض',
    departureDate: searchParams.get('departureDate') || '13 نوفمبر 2025',
    returnDate: searchParams.get('returnDate') || '',
    tripType: (searchParams.get('tripType') as 'one-way' | 'round-trip') || 'one-way',
    adults: searchParams.get('adults') || '1',
    children: searchParams.get('children') || '0',
    infants: searchParams.get('infants') || '0',
  }

  const [selection, setSelection] = useState(initialSelection)
  const {
    fromStation,
    toStation,
    departureDate,
    returnDate,
    tripType,
    adults,
    children,
    infants,
  } = selection

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.sessionStorage.getItem('bookingSelection')
      if (!raw) return
      const data = JSON.parse(raw) as StoredBookingSelection
      setSelection(prev => ({
        fromStation: typeof data.fromStation === 'string' && data.fromStation ? data.fromStation : prev.fromStation,
        toStation: typeof data.toStation === 'string' && data.toStation ? data.toStation : prev.toStation,
        departureDate: typeof data.departureDate === 'string' && data.departureDate ? data.departureDate : prev.departureDate,
        returnDate: typeof data.returnDate === 'string' ? data.returnDate : prev.returnDate,
        tripType: data.tripType === 'round-trip' ? 'round-trip' : data.tripType === 'one-way' ? 'one-way' : prev.tripType,
        adults: normalizeCount(data.adults, prev.adults),
        children: normalizeCount(data.children, prev.children),
        infants: normalizeCount(data.infants, prev.infants),
      }))
    } catch (error) {
      console.error('Failed to load booking selection', error)
    }
  }, [])

  // حالة العرض في الهيدر (من localStorage أو من الquery params كنسخة احتياطية)
  const [headerFromCode, setHeaderFromCode] = useState('ABQ')
  const [headerToCode, setHeaderToCode] = useState('RYD')
  const [headerDateText, setHeaderDateText] = useState('الخميس، 13 نوفمبر 2025')
  const [headerPassengersText, setHeaderPassengersText] = useState('1 بالغ')

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('bookingDraft')
      if (raw) {
        const data = JSON.parse(raw) as BookingDraft
        if (data.fromStationCode) setHeaderFromCode(data.fromStationCode)
        if (data.toStationCode) setHeaderToCode(data.toStationCode)
        if (data.selectedDateISO) setHeaderDateText(formatArabicFullDate(data.selectedDateISO))
        if (data.passengers?.summaryAr) {
          setHeaderPassengersText(data.passengers.summaryAr)
        } else {
          const a = parseInt(adults); const c = parseInt(children); const i = parseInt(infants)
          const parts: string[] = []
          if (a > 0) parts.push(`${a} بالغ`)
          if (c > 0) parts.push(`${c} طفل`)
          if (i > 0) parts.push(`${i} رضيع`)
          setHeaderPassengersText(parts.length ? parts.join(', ') : '1 بالغ')
        }
        return
      }
    } catch {
      // تجاهل الأخطاء
    }
    // fallback لا توجد بيانات في التخزين: استخدم query params الافتراضية
    setHeaderFromCode(STATION_CODES[fromStation] || 'ABQ')
    setHeaderToCode(STATION_CODES[toStation] || 'RYD')
    setHeaderDateText(departureDate || 'الخميس، 13 نوفمبر 2025')
    const totalP = parseInt(adults) + parseInt(children) + parseInt(infants)
    setHeaderPassengersText(totalP > 0 ? `${totalP} بالغ` : '1 بالغ')
  }, [adults, children, departureDate, fromStation, infants, toStation])

  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null)
  const [selectedClass, setSelectedClass] = useState<'economy' | 'business' | null>(null)
  const [selectedPlanName, setSelectedPlanName] = useState<string | null>(null)
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number>(0)
  const [showPassengerDetails, setShowPassengerDetails] = useState(false)
  const [showExtras, setShowExtras] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [showMealSidebar, setShowMealSidebar] = useState(false)
  const [isClosingSidebar, setIsClosingSidebar] = useState(false)
  const [showBaggageSidebar, setShowBaggageSidebar] = useState(false)
  const [isClosingBaggageSidebar, setIsClosingBaggageSidebar] = useState(false)
  const [showLoungeSidebar, setShowLoungeSidebar] = useState(false)
  const [isClosingLoungeSidebar, setIsClosingLoungeSidebar] = useState(false)
  const [showSeatSidebar, setShowSeatSidebar] = useState(false)
  const [isClosingSeatSidebar, setIsClosingSeatSidebar] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)

  const handleCloseSidebar = () => {
    setIsClosingSidebar(true)
    setTimeout(() => {
      setShowMealSidebar(false)
      setIsClosingSidebar(false)
    }, 300) // نفس مدة الـ animation
  }

  const handleCloseBaggageSidebar = () => {
    setIsClosingBaggageSidebar(true)
    setTimeout(() => {
      setShowBaggageSidebar(false)
      setIsClosingBaggageSidebar(false)
    }, 300)
  }

  const handleCloseLoungeSidebar = () => {
    setIsClosingLoungeSidebar(true)
    setTimeout(() => {
      setShowLoungeSidebar(false)
      setIsClosingLoungeSidebar(false)
    }, 300)
  }

  const handleCloseSeatSidebar = () => {
    setIsClosingSeatSidebar(true)
    setTimeout(() => {
      setShowSeatSidebar(false)
      setIsClosingSeatSidebar(false)
    }, 300)
  }
  const [extras, setExtras] = useState<Extras>({
    meal: false,
    baggage: false,
    seat: false,
    lounge: false,
  })
  
  const [selectedMeals, setSelectedMeals] = useState<{ [key: number]: number }>({})
  const [selectedBaggage, setSelectedBaggage] = useState<{ [key: number]: number }>({})
  const [selectedLounge, setSelectedLounge] = useState<number>(0)
  
  // حساب الإجماليات
  const mealsTotal = calculateMealsTotal(selectedMeals, MEALS)
  const baggageTotal = calculateBaggageTotal(selectedBaggage, BAGGAGE_OPTIONS)
  const loungeTotal = calculateLoungeTotal(selectedLounge, 30.00)
  const extrasTotal = calculateExtrasTotal(mealsTotal, baggageTotal, loungeTotal, extras, EXTRAS_PRICES)

  // Passenger/contact form state and validation
  const [form, setForm] = useState<PassengerForm>({
    title: 'السيد',
    firstName: '',
    lastName: '',
    docType: 'الهوية الوطنية',
    docNumber: '',
    dob: '',
    phone: '',
    email: ''
  })
  const [errors, setErrors] = useState<{ [K in keyof typeof form]?: string }>({})

  const updateField = <K extends keyof typeof form>(key: K, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined })) // clear error on change
  }

  // دالة لمسح جميع بيانات الحجز عند بدء session جديد
  const clearBookingSession = () => {
    try {
      // مسح localStorage
      window.localStorage.removeItem('selectedMeals')
      window.localStorage.removeItem('selectedBaggage')
      window.localStorage.removeItem('selectedLounge')
      window.localStorage.removeItem('selectedSeat')
      window.localStorage.removeItem('selectedExtras')
      window.localStorage.removeItem('passengerInfo')
      
      // إعادة تعيين state
      setSelectedMeals({})
      setSelectedBaggage({})
      setSelectedLounge(0)
      setSelectedSeat(null)
      setExtras({
        meal: false,
        baggage: false,
        seat: false,
        lounge: false,
      })
      
      // إعادة تعيين بيانات المسافر
      setForm({
        title: 'السيد',
        firstName: '',
        lastName: '',
        docType: 'الهوية الوطنية',
        docNumber: '',
        dob: '',
        phone: '',
        email: ''
      })
      setErrors({})
      
      // إعادة تعيين مراحل الحجز
      setShowPassengerDetails(false)
      setShowExtras(false)
      setShowPayment(false)
    } catch (error) {
      console.error('Error clearing booking session:', error)
    }
  }


  // تحميل بيانات المسافر من localStorage (فقط إذا كان هناك trip محدد)
  useEffect(() => {
    // لا نحمل البيانات إلا إذا كان هناك trip محدد حالياً
    if (selectedTripId === null || selectedClass === null) {
      return
    }

    try {
      const passengerData = window.localStorage.getItem('passengerInfo')
      if (passengerData) {
        const data = JSON.parse(passengerData)
        if (data.firstName || data.lastName) {
          setForm(prev => ({
            ...prev,
            firstName: data.firstName || prev.firstName,
            lastName: data.lastName || prev.lastName,
            title: data.title || prev.title
          }))
        }
      }
      
      // تحميل الوجبات المختارة من localStorage
      const savedMeals = window.localStorage.getItem('selectedMeals')
      if (savedMeals) {
        const mealsData = JSON.parse(savedMeals) as { [key: number]: number }
        setSelectedMeals(mealsData)
        // تحديث حالة meal بناءً على وجود وجبات
        const hasMeals = Object.values(mealsData).some((qty: number) => qty > 0)
        setExtras(prev => ({ ...prev, meal: hasMeals }))
      }
      
      // تحميل الأمتعة المختارة من localStorage
      const savedBaggage = window.localStorage.getItem('selectedBaggage')
      if (savedBaggage) {
        const baggageData = JSON.parse(savedBaggage) as { [key: number]: number }
        setSelectedBaggage(baggageData)
        // تحديث حالة baggage بناءً على وجود أمتعة
        const hasBaggage = Object.values(baggageData).some((qty: number) => qty > 0)
        setExtras(prev => ({ ...prev, baggage: hasBaggage }))
      }

      // تحميل صالة الأعمال المختارة من localStorage
      const savedLounge = window.localStorage.getItem('selectedLounge')
      if (savedLounge) {
        const loungeData = parseInt(savedLounge)
        setSelectedLounge(loungeData)
        // تحديث حالة lounge بناءً على وجود صالة
        setExtras(prev => ({ ...prev, lounge: loungeData > 0 }))
      }

      // تحميل المقعد المختار
      const savedSeat = window.localStorage.getItem('selectedSeat')
      if (savedSeat) {
        setSelectedSeat(parseInt(savedSeat))
        setExtras(prev => ({ ...prev, seat: true }))
      }
    } catch {
      // تجاهل الأخطاء
    }
  }, [selectedTripId, selectedClass])

  // Display value for DOB as dd/mm/yyyy while storing ISO yyyy-mm-dd
  const [dobDisplay, setDobDisplay] = useState('')
  useEffect(() => {
    if (form.dob) {
      // convert ISO -> dd/mm/yyyy
      const [y, m, d] = form.dob.split('-')
      if (y && m && d) setDobDisplay(`${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`)
    }
  }, [form.dob])

  const handleDobInput = (val: string) => {
    // keep digits only, max 8 digits (ddmmyyyy)
    const digits = val.replace(/\D/g, '').slice(0, 8)
    let dd = digits.slice(0, 2)
    let mm = digits.slice(2, 4)
    let yyyy = digits.slice(4, 8)
    const display =
      [dd, mm, yyyy].filter(Boolean).join('/')
    setDobDisplay(display)

    // when full length, update ISO in form
    if (digits.length === 8) {
      const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
      updateField('dob', iso)
    } else {
      // clear dob until complete
      updateField('dob', '')
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [K in keyof typeof form]?: string } = {}

    if (!form.firstName.trim()) newErrors.firstName = 'الاسم الأول مطلوب'
    if (!form.lastName.trim()) newErrors.lastName = 'اسم العائلة مطلوب'
    if (!form.docNumber.trim()) newErrors.docNumber = 'رقم الوثيقة مطلوب'

    // Date YYYY-MM-DD basic check
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob)) {
      newErrors.dob = 'صيغة التاريخ يجب أن تكون YYYY-MM-DD'
    } else {
      const d = new Date(form.dob)
      if (isNaN(d.getTime())) newErrors.dob = 'تاريخ غير صالح'
    }

    // Phone basic: digits 8-15
    if (!/^\+?\d{8,15}$/.test(form.phone.trim())) {
      newErrors.phone = 'رقم الجوال غير صالح'
    }

    // Email simple regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      newErrors.email = 'البريد الإلكتروني غير صالح'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Payment form state & validation
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardName: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: ''
  })
  const [paymentErrors, setPaymentErrors] = useState<{ [K in keyof typeof paymentForm]?: string }>({})

  const updatePaymentField = <K extends keyof typeof paymentForm>(key: K, value: string) => {
    setPaymentForm((prev) => ({ ...prev, [key]: value }))
    setPaymentErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validatePaymentForm = (): boolean => {
    const newErrors: { [K in keyof typeof paymentForm]?: string } = {}

    if (!paymentForm.cardName.trim()) {
      newErrors.cardName = 'اسم حامل البطاقة مطلوب'
    }

    const digitsCard = paymentForm.cardNumber.replace(/\D/g, '')
    if (digitsCard.length < 12) {
      newErrors.cardNumber = 'رقم البطاقة غير صالح'
    }

    const month = parseInt(paymentForm.expMonth, 10)
    if (!(month >= 1 && month <= 12)) {
      newErrors.expMonth = 'شهر غير صالح'
    }

    const yearDigits = paymentForm.expYear.replace(/\D/g, '')
    if (yearDigits.length < 2) {
      newErrors.expYear = 'سنة غير صالحة'
    }

    const cvvDigits = paymentForm.cvv.replace(/\D/g, '')
    if (!(cvvDigits.length === 3 || cvvDigits.length === 4)) {
      newErrors.cvv = 'رمز التحقق غير صالح'
    }

    setPaymentErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const dates = [
    { id: 'date-2025-11-13', date: '١٣ نوفمبر ٢٠٢٥', day: 'الخميس', isActive: true },
    { id: 'date-2025-11-14', date: '١٤ نوفمبر ٢٠٢٥', day: 'الجمعة', isActive: false },
    { id: 'date-2025-11-15', date: '١٥ نوفمبر ٢٠٢٥', day: 'السبت', isActive: false },
    { id: 'date-2025-11-16', date: '١٦ نوفمبر ٢٠٢٥', day: 'الأحد', isActive: false },
    { id: 'date-2025-11-17', date: '١٧ نوفمبر ٢٠٢٥', day: 'الاثنين', isActive: false },
    { id: 'date-2025-11-18', date: '١٨ نوفمبر ٢٠٢٥', day: 'الثلاثاء', isActive: false }
  ]

  const totalPassengers = parseInt(adults) + parseInt(children) + parseInt(infants)

  // الحصول على القطارات حسب المسار والتاريخ المختار
  const selectedDateObj = dates[selectedDate]
  const selectedDateString = selectedDateObj ? selectedDateObj.date : dates[0].date
  const trips: TrainTrip[] = getTrainsForRoute(fromStation, toStation, selectedDateString)

  const handleSelectPlan = (trip: TrainTrip, plan: {
    classKey: 'economy' | 'business',
    variantKey: 'saver' | 'standard' | 'premium',
    displayName: string,
    pricePerPassenger: number,
    features: string[]
  }) => {
    const total = plan.pricePerPassenger * totalPassengers
    setSelectedPlanName(plan.displayName)
    setSelectedPlanPrice(total)
    setShowPassengerDetails(true)

    const selectedTrip = {
      id: trip.id,
      trainNumber: trip.trainNumber,
      departure: trip.departure,
      arrival: trip.arrival,
      from: trip.departureStation,
      to: trip.arrivalStation,
      stops: trip.stops
    }

    const selectedPlan = {
      classKey: plan.classKey,
      variantKey: plan.variantKey,
      displayName: plan.displayName,
      pricePerPassenger: plan.pricePerPassenger,
      totalPrice: total,
      passengers: totalPassengers,
      features: plan.features
    }

    try {
      window.localStorage.setItem('selectedTrip', JSON.stringify(selectedTrip))
      window.localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan))
    } catch {
      // ignore storage issues
    }
  }

  return (
    <div className="select-trip-page">
      <header className="trip-header">
        <div className="trip-header-content">
          <Link href="/" style={{ display: 'inline-block' }}>
            <Image
              src="https://tickets.sar.com.sa/images/vectors/SAR-Logo.svg"
              alt="SAR Logo"
              width={140}
              height={70}
              className="sar-logo"
            />
          </Link>
          <nav className="booking-nav">
            <div className="nav-step active">
              <div className="nav-underline active"></div>
              <span className="nav-label">اختيار الرحلة</span>
            </div>
            <div className="nav-step">
              <div className="nav-underline" style={{ backgroundColor: (showPassengerDetails || showExtras || showPayment) ? '#2b8a9d' : '#e5e7eb' }}></div>
              <span className="nav-label">تفاصيل الركاب</span>
            </div>
            <div className="nav-step">
              <div className="nav-underline" style={{ backgroundColor: (showExtras || showPayment) ? '#2b8a9d' : '#e5e7eb' }}></div>
              <span className="nav-label">المقاعد والخدمات الإضافية</span>
            </div>
            <div className="nav-step">
              <div className="nav-underline" style={{ backgroundColor: showPayment ? '#2b8a9d' : '#e5e7eb' }}></div>
              <span className="nav-label">الدفع</span>
            </div>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 3rem 2.5rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '100px',
          flexDirection: 'row-reverse'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.25rem',
            color: '#1a1a1a',
            fontWeight: 'bold',
            fontSize: '36px',
            direction: 'rtl',
          }}>
            <span style={{ fontSize: '18px', fontWeight: 'normal', color: '#666' }}>ر.س</span>
            <span style={{ fontSize: '20px', fontWeight: 'normal', color: '#999' }}>{(selectedPlanPrice + extrasTotal).toFixed(2).split('.')[1]}</span>
            <span>{(selectedPlanPrice + extrasTotal).toFixed(2).split('.')[0]}</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginBottom: '0.5rem',
            }}>
              <div style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span>{headerFromCode}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>{headerToCode}</span>
              </div>

              <Link
                href="/"
                style={{
                  color: '#2b8a9d',
                  textDecoration: 'none',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: '500',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                تعديل البحث
              </Link>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1.25rem',
              color: '#666',
              fontSize: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{headerDateText}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>{headerPassengersText}</span>
              </div>
            </div>
          </div>
        </div>

        {!showPassengerDetails && !showExtras && !showPayment && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              position: 'relative'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2b8a9d',
                margin: 0
              }}>
                اختيار رحلة الذهاب
              </h2>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '1.25rem 2rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#2b8a9d',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'center', padding: '0 1rem' }}>
                {dates.map((date, index) => (
                  <button
                    key={date.id}
                    id={date.id}
                    type="button"
                    onClick={() => setSelectedDate(index)}
                    style={{
                      padding: '0.875rem 1.5rem',
                      borderRadius: '8px',
                      backgroundColor: selectedDate === index ? '#2b8a9d' : 'transparent',
                      color: selectedDate === index ? 'white' : '#333',
                      cursor: 'pointer',
                      textAlign: 'center',
                      minWidth: '130px',
                      border: selectedDate === index ? 'none' : '1px solid #e5e5e5',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {date.date}
                    </div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>
                      {date.day}
                    </div>
                  </button>
                ))}
              </div>

              <button style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#2b8a9d',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {trips.length === 0 ? (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ fontSize: '18px', color: '#666', marginBottom: '0.5rem' }}>
                    لا توجد قطارات متاحة لهذا المسار والتاريخ
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    يرجى اختيار تاريخ آخر أو مسار مختلف
                  </div>
                </div>
              ) : (
                trips.map((trip, index) => (
                <div
                  key={trip.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ padding: '1.75rem 2rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2.5rem',
                      direction: 'rtl'
                    }}>
                      <div style={{ display: 'flex', gap: '0.625rem' }}>
                        <button
                          type="button"
                          id={`trip-${index + 1}-business`}
                          onClick={() => {
                            const isActive = selectedTripId === trip.id && selectedClass === 'business'
                            if (isActive) {
                              setSelectedTripId(null)
                              setSelectedClass(null)
                            } else {
                              // عند اختيار trip جديد، مسح جميع بيانات الحجز السابقة
                              if (selectedTripId !== trip.id || selectedClass !== 'business') {
                                clearBookingSession()
                              }
                              setSelectedTripId(trip.id)
                              setSelectedClass('business')
                            }
                          }}
                          style={{
                            backgroundColor: selectedTripId === trip.id && selectedClass === 'business' ? '#e8f5f7' : '#f5f5f5',
                            border: selectedTripId === trip.id && selectedClass === 'business' ? '2px solid #2b8a9d' : '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '1rem 1.25rem',
                            textAlign: 'center',
                            minWidth: '145px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            transform: selectedTripId === trip.id && selectedClass === 'business' ? 'scale(1.02)' : 'scale(1)'
                          }}>
                          <div style={{ fontSize: '13px', color: '#666', marginBottom: '0.35rem', fontWeight: '500' }}>
                            الدرجة الأعمال
                          </div>
                          <div style={{ fontSize: '10px', color: '#999', marginBottom: '0.4rem' }}>من</div>
                          <div style={{ fontSize: '22px', fontWeight: 'bold', color: selectedTripId === trip.id && selectedClass === 'business' ? '#2b8a9d' : '#1a1a1a', lineHeight: '1' }}>
                            {trip.businessPrice.toFixed(2).split('.')[0]}
                            <span style={{ fontSize: '14px', fontWeight: 'normal' }}>.{trip.businessPrice.toFixed(2).split('.')[1]}</span>
                            <span style={{ fontSize: '12px', fontWeight: 'normal', marginRight: '2px' }}>ر.س</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          id={`trip-${index + 1}-economy`}
                          onClick={() => {
                            const isActive = selectedTripId === trip.id && selectedClass === 'economy'
                            if (isActive) {
                              setSelectedTripId(null)
                              setSelectedClass(null)
                            } else {
                              // عند اختيار trip جديد، مسح جميع بيانات الحجز السابقة
                              if (selectedTripId !== trip.id || selectedClass !== 'economy') {
                                clearBookingSession()
                              }
                              setSelectedTripId(trip.id)
                              setSelectedClass('economy')
                            }
                          }}
                          style={{
                            backgroundColor: selectedTripId === trip.id && selectedClass === 'economy' ? '#e8f5f7' : '#f5f5f5',
                            border: selectedTripId === trip.id && selectedClass === 'economy' ? '2px solid #2b8a9d' : '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '1rem 1.25rem',
                            textAlign: 'center',
                            minWidth: '145px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            transform: selectedTripId === trip.id && selectedClass === 'economy' ? 'scale(1.02)' : 'scale(1)'
                          }}
                        >
                          <div style={{ fontSize: '13px', color: '#666', marginBottom: '0.35rem', fontWeight: '500' }}>
                            الدرجة الاقتصادية
                          </div>
                          <div style={{ fontSize: '10px', color: '#999', marginBottom: '0.4rem' }}>من</div>
                          <div style={{ fontSize: '22px', fontWeight: 'bold', color: selectedTripId === trip.id && selectedClass === 'economy' ? '#2b8a9d' : '#1a1a1a', lineHeight: '1' }}>
                            {trip.economyPrice.toFixed(2).split('.')[0]}
                            <span style={{ fontSize: '14px', fontWeight: 'normal' }}>.{trip.economyPrice.toFixed(2).split('.')[1]}</span>
                            <span style={{ fontSize: '12px', fontWeight: 'normal', marginRight: '2px' }}>ر.س</span>
                          </div>
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flex: 1 }}>
                        <div style={{ textAlign: 'center', minWidth: '75px' }}>
                          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.35rem' }}>
                            {trip.departure}
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>{trip.departureStation}</div>
                        </div>

                        <div style={{ flex: 1, position: 'relative', paddingTop: '0.5rem', minWidth: '180px' }}>
                          <div style={{
                            height: '2px',
                            backgroundColor: 'transparent',
                            position: 'relative',
                            backgroundImage: 'repeating-linear-gradient(to left, #2b8a9d 0, #2b8a9d 6px, transparent 6px, transparent 12px)'
                          }}>
                          </div>
                          <div style={{
                            position: 'absolute',
                            top: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            textAlign: 'center',
                            fontSize: '11px',
                            color: '#2b8a9d',
                            whiteSpace: 'nowrap',
                            fontWeight: '500'
                          }}>
                            {trip.stops}
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', minWidth: '75px' }}>
                          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.35rem' }}>
                            {trip.arrival}
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>{trip.arrivalStation}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'center', minWidth: '70px' }}>
                        <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.35rem' }}>
                          {trip.trainNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>رقم القطار</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    maxHeight: selectedTripId === trip.id ? '2000px' : '0',
                    opacity: selectedTripId === trip.id ? 1 : 0,
                    transform: selectedTripId === trip.id ? 'translateY(0)' : 'translateY(-8px)',
                    transition: 'opacity 0.35s ease, max-height 0.5s ease, transform 0.35s ease',
                    overflow: 'hidden'
                  }}>
                    {selectedTripId === trip.id && selectedClass === 'economy' && (
                      <div className="fade-slide-in" style={{
                        borderTop: '1px solid #e5e5e5',
                        padding: '2rem',
                        direction: 'rtl'
                      }}>
                        <div style={{
                          marginBottom: '2rem',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          height: '250px'
                        }}>
                          <Image
                            src="https://tickets.sar.com.sa/images/sub-classes/Economy-EAST%20TRAIN.png"
                            alt="Train Interior"
                            width={1200}
                            height={250}
                            unoptimized
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'space-between' }}>
                          <div style={{
                            flex: 1,
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            border: '1px solid #e5e5e5'
                          }}>
                            <h3 style={{
                              fontSize: '20px',
                              fontWeight: 'bold',
                              color: '#2b8a9d',
                              marginTop: 0,
                              marginBottom: '0.5rem'
                            }}>
                              الاقتصادية التوفيرية
                            </h3>
                            <div style={{
                              fontSize: '32px',
                              fontWeight: 'bold',
                              color: '#1a1a1a',
                              marginBottom: '0.25rem'
                            }}>
                              {trip.economyPrice.toFixed(2).split('.')[0]}
                              <span style={{ fontSize: '20px', fontWeight: 'normal' }}>.{trip.economyPrice.toFixed(2).split('.')[1]}</span>
                              <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>ر.س</span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#999', marginBottom: '1.5rem' }}>
                              مجموع كل الركاب
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    الأمتعة المحمولة
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>1 كجم 10 + 1 حقيبة متوسطة 25 كجم</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>الأمتعة المشحونة</div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>غير متضمنة</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>اختيار المقعد</div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>غير متضمن</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    تغيير الحجز
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      رسوم 20%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    إلغاء الحجز
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      رسوم 40%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    عدم الحضور
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      رسوم 100%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              className="choose"
                              onClick={() => handleSelectPlan(trip, {
                              classKey: 'economy',
                              variantKey: 'saver',
                              displayName: 'الاقتصادية التوفيرية',
                              pricePerPassenger: trip.economyPrice,
                              features: ['حقيبة يد 10كجم + متوسطة 25كجم', 'لا تشمل شحن', 'رسوم تغيير 20%', 'رسوم إلغاء 40%']
                            })} style={{
                              width: '100%',
                              backgroundColor: '#2b8a9d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.875rem',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}>
                              اختيار
                            </button>
                          </div>

                          <div style={{
                            flex: 1,
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            border: '2px solid #2b8a9d'
                          }}>
                            <h3 style={{
                              fontSize: '20px',
                              fontWeight: 'bold',
                              color: '#2b8a9d',
                              marginTop: 0,
                              marginBottom: '0.5rem'
                            }}>
                              الاقتصادية
                            </h3>
                            <div style={{
                              fontSize: '32px',
                              fontWeight: 'bold',
                              color: '#1a1a1a',
                              marginBottom: '0.25rem'
                            }}>
                              {trip.economySaver.toFixed(2).split('.')[0]}
                              <span style={{ fontSize: '20px', fontWeight: 'normal' }}>.{trip.economySaver.toFixed(2).split('.')[1]}</span>
                              <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>ر.س</span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#999', marginBottom: '1.5rem' }}>
                              مجموع كل الركاب
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    الأمتعة المحمولة
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>1 حقيبة يد 10 كجم + 1 حقيبة متوسطة 25 كجم</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    الأمتعة المشحونة
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>2 حقيبة كبيرة 25 كجم لكل حقيبة</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    اختيار المقعد
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    تغيير الحجز
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    إلغاء الحجز
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    عدم الحضور
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      رسوم 50%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              className="choose"
                              onClick={() => handleSelectPlan(trip, {
                              classKey: 'economy',
                              variantKey: 'standard',
                              displayName: 'الاقتصادية',
                              pricePerPassenger: trip.economySaver,
                              features: ['حقيبة يد 10كجم + متوسطة 25كجم', 'شحن مجاني حقيبتين 25كجم', 'اختيار مقعد مجاني', 'تغيير/إلغاء مجاني']
                            })} style={{
                              width: '100%',
                              backgroundColor: '#2b8a9d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.875rem',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}>
                              اختيار
                            </button>
                          </div>
                        </div>
                      </div>
                    )}


                    {selectedTripId === trip.id && selectedClass === 'business' && (
                      <div className="fade-slide-in" style={{
                        borderTop: '1px solid #e5e5e5',
                        padding: '2rem',
                        direction: 'rtl'
                      }}>
                        <div style={{
                          marginBottom: '2rem',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          height: '250px'
                        }}>
                          <Image
                            src="https://tickets.sar.com.sa/images/sub-classes/Business-EAST%20TRAIN.png"
                            alt="Business Class"
                            width={1200}
                            height={250}
                            unoptimized
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'space-between' }}>
                          <div style={{
                            flex: 1,
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            border: '1px solid #e5e5e5'
                          }}>
                            <h3 style={{
                              fontSize: '20px',
                              fontWeight: 'bold',
                              color: '#2b8a9d',
                              marginTop: 0,
                              marginBottom: '0.5rem'
                            }}>
                              الأعمال
                            </h3>
                            <div style={{
                              fontSize: '32px',
                              fontWeight: 'bold',
                              color: '#1a1a1a',
                              marginBottom: '0.25rem'
                            }}>
                              {trip.businessPrice.toFixed(2).split('.')[0]}
                              <span style={{ fontSize: '20px', fontWeight: 'normal' }}>.{trip.businessPrice.toFixed(2).split('.')[1]}</span>
                              <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>ر.س</span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#999', marginBottom: '1.5rem' }}>
                              مجموع كل الركاب
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    الأمتعة المحمولة
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>1 حقيبة يد 10 كجم + 1 حقيبة متوسطة 25 كجم</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    الأمتعة المشحونة
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>1 حقيبة كبيرة 32 كجم</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    اختيار المقعد
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    تغيير الحجز
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    إلغاء الحجز
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    عدم الحضور
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      رسوم 30%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              className="choose"
                              onClick={() => handleSelectPlan(trip, {
                              classKey: 'business',
                              variantKey: 'standard',
                              displayName: 'الأعمال',
                              pricePerPassenger: trip.businessPrice,
                              features: ['حقيبة يد 10كجم + متوسطة 25كجم', 'شحن مجاني 32كجم', 'اختيار مقعد مجاني', 'تغيير/إلغاء مجاني']
                            })} style={{
                              width: '100%',
                              backgroundColor: '#2b8a9d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.875rem',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}>
                              اختيار
                            </button>
                          </div>

                          <div style={{
                            flex: 1,
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            border: '2px solid #2b8a9d'
                          }}>
                            <h3 style={{
                              fontSize: '20px',
                              fontWeight: 'bold',
                              color: '#2b8a9d',
                              marginTop: 0,
                              marginBottom: '0.5rem'
                            }}>
                              الأعمال المميزة
                            </h3>
                            <div style={{
                              fontSize: '32px',
                              fontWeight: 'bold',
                              color: '#1a1a1a',
                              marginBottom: '0.25rem'
                            }}>
                              {(trip.businessPrice + 60).toFixed(2).split('.')[0]}
                              <span style={{ fontSize: '20px', fontWeight: 'normal' }}>.{(trip.businessPrice + 60).toFixed(2).split('.')[1]}</span>
                              <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>ر.س</span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#999', marginBottom: '1.5rem' }}>
                              مجموع كل الركاب
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    الأمتعة المحمولة
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>1 حقيبة يد 10 كجم + 1 حقيبة متوسطة 25 كجم</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    الأمتعة المشحونة
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>2 حقيبة كبيرة 32 كجم لكل حقيبة</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    اختيار المقعد
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    تغيير الحجز
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    إلغاء الحجز
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      مجاني
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    عدم الحضور
                                    <span style={{ fontSize: '12px', color: '#2b8a9d', fontWeight: 'normal' }}>
                                      رسوم 15%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              className="choose"
                              onClick={() => handleSelectPlan(trip, {
                              classKey: 'business',
                              variantKey: 'premium',
                              displayName: 'الأعمال المميزة',
                              pricePerPassenger: trip.businessPrice + 60,
                              features: ['حقيبة يد 10كجم + متوسطة 25كجم', 'شحن مجاني حقيبتين 32كجم', 'اختيار مقعد مجاني', 'تغيير/إلغاء مجاني']
                            })} style={{
                              width: '100%',
                              backgroundColor: '#2b8a9d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.875rem',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}>
                              اختيار
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                ))
              )
              }
            </div>
          </>
        )}
      </div>

      {showPassengerDetails && (
  <div
    style={{
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "0 3rem 3rem",
    }}
  >
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        marginTop: "1.5rem",
        direction: "rtl",
        border: "1px solid #e5e7eb",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#111827", fontWeight: 700, fontSize: "20px" }}>
        تفاصيل الركاب
      </h3>

      {/* بلوك تفاصيل الراكب */}
      <div
        style={{
          background: "#F7F9FC",
          border: "1px solid #E1E5EB",
          borderRadius: "14px",
          padding: "1.5rem",
          marginTop: "1.2rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          {/* اللقب */}
          <div>
            <label
              style={{ fontSize: "13px", marginBottom: "6px", color: "#4B5563", display: "block" }}
            >
              اللقب
            </label>
            <select
              style={{
                padding: "12px",
                border: errors.title ? "1px solid #DC2626" : "1px solid #D1D5DB",
                borderRadius: "10px",
                width: "100%",
                background: "white",
              }}
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            >
              <option>السيد</option>
              <option>السيدة</option>
              <option>الآنسة</option>
            </select>
          </div>

          {/* الاسم الأول */}
          <div>
            <label
              style={{ fontSize: "13px", marginBottom: "6px", color: "#4B5563", display: "block" }}
            >
              الاسم الأول
            </label>
            <input
              placeholder="الاسم الأول"
              style={{
                padding: "12px",
                border: errors.firstName ? "1px solid #DC2626" : "1px solid #D1D5DB",
                borderRadius: "10px",
                width: "100%",
              }}
              value={form.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
            />
            {errors.firstName && <div style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>{errors.firstName}</div>}
          </div>

          {/* اسم العائلة */}
          <div>
            <label
              style={{ fontSize: "13px", marginBottom: "6px", color: "#4B5563", display: "block" }}
            >
              اسم العائلة
            </label>
            <input
              placeholder="اسم العائلة"
              style={{
                padding: "12px",
                border: errors.lastName ? "1px solid #DC2626" : "1px solid #D1D5DB",
                borderRadius: "10px",
                width: "100%",
              }}
              value={form.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
            />
            {errors.lastName && <div style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>{errors.lastName}</div>}
          </div>

          {/* نوع الوثيقة */}
          <div>
            <label
              style={{ fontSize: "13px", marginBottom: "6px", color: "#4B5563", display: "block" }}
            >
              نوع الوثيقة
            </label>
            <select
              style={{
                padding: "12px",
                border: errors.docType ? "1px solid #DC2626" : "1px solid #D1D5DB",
                borderRadius: "10px",
                width: "100%",
                background: "white",
              }}
              value={form.docType}
              onChange={(e) => updateField('docType', e.target.value)}
            >
              <option>الهوية الوطنية</option>
              <option>جواز سفر</option>
            </select>
          </div>

          {/* رقم الوثيقة */}
          <div>
            <label
              style={{ fontSize: "13px", marginBottom: "6px", color: "#4B5563", display: "block" }}
            >
              رقم الوثيقة
            </label>
            <input
              placeholder="رقم الوثيقة"
              style={{
                padding: "12px",
                border: errors.docNumber ? "1px solid #DC2626" : "1px solid #D1D5DB",
                borderRadius: "10px",
                width: "100%",
              }}
              value={form.docNumber}
              onChange={(e) => updateField('docNumber', e.target.value)}
            />
            {errors.docNumber && <div style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>{errors.docNumber}</div>}
          </div>

          {/* تاريخ الميلاد */}
          <div>
            <label
              style={{ fontSize: "13px", marginBottom: "6px", color: "#4B5563", display: "block" }}
            >
              تاريخ الميلاد
            </label>
            <input
              type="date"
              lang="en-GB"
              dir="ltr"
              placeholder="DD-MM-YYYY"
              style={{
                padding: "12px",
                border: errors.dob ? "1px solid #DC2626" : "1px solid #D1D5DB",
                borderRadius: "10px",
                width: "100%",
              }}
              value={form.dob}
              onChange={(e) => updateField('dob', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.dob && <div style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>{errors.dob}</div>}
          </div>
        </div>
      </div>

      {/* بيانات الاتصال */}
      <h4
        style={{
          marginTop: "2.2rem",
          color: "#111827",
          fontWeight: 700,
          fontSize: "18px",
        }}
      >
        بيانات الإتصال
      </h4>

      <div
        style={{
          background: "#F7F9FC",
          border: "1px solid #E1E5EB",
          borderRadius: "14px",
          padding: "1.5rem",
          marginTop: "1rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* رقم الجوال */}
          <div>
            <label
              style={{ fontSize: "13px", marginBottom: "6px", color: "#4B5563", display: "block" }}
            >
              رقم الجوال
            </label>
            <input
              placeholder="رقم الجوال"
              style={{
                padding: "12px",
                border: errors.phone ? "1px solid #DC2626" : "1px solid #D1D5DB",
                borderRadius: "10px",
                width: "100%",
              }}
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            {errors.phone && <div style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>{errors.phone}</div>}
          </div>

          {/* البريد */}
          <div>
            <label
              style={{ fontSize: "13px", marginBottom: "6px", color: "#4B5563", display: "block" }}
            >
              البريد الإلكتروني
            </label>
            <input
              placeholder="example@mail.com"
              style={{
                padding: "12px",
                border: errors.email ? "1px solid #DC2626" : "1px solid #D1D5DB",
                borderRadius: "10px",
                width: "100%",
              }}
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
            {errors.email && <div style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>{errors.email}</div>}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "2rem",
        }}
      >
        <button
          style={{
            background: "#E8F5F7",
            color: "#2B8A9D",
            border: "1px solid #CDE7EB",
            padding: "12px 24px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={() => setShowPassengerDetails(false)}
        >
          رجوع
        </button>

        <button
          style={{
            background: "#2B8A9D",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={() => {
            if (!validateForm()) return
            try {
              const passenger = {
                title: form.title,
                firstName: form.firstName,
                lastName: form.lastName,
                docType: form.docType,
                docNumber: form.docNumber,
                dob: form.dob,
                phone: form.phone,
                email: form.email,
              }
              window.localStorage.setItem('passengerInfo', JSON.stringify(passenger))
              // move to extras stage
              setShowPassengerDetails(false)
              setShowExtras(true)
              window.localStorage.setItem('selectedExtras', JSON.stringify({ ...extras }))
            } catch {
              // ignore
            }
          }}
        >
          متابعة
        </button>
      </div>
    </div>
    </div>
)}

      {showExtras && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 3rem 3rem' }}>
          <div style={{ background: 'white', borderRadius: 8, padding: '1.5rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', direction: 'rtl' }}>
            <h3 style={{ marginTop: 0, color: '#1a1a1a' }}>الخدمات الإضافية</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={() => {
                  setShowMealSidebar(true)
                }}
                style={{
                  textAlign: 'right',
                  padding: '1.25rem',
                  borderRadius: 12,
                  border: mealsTotal > 0 ? '2px solid #2b8a9d' : '1px solid #e5e5e5',
                  background: mealsTotal > 0 ? '#e8f5f7' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 600, color: '#1a1a1a' }}>الوجبة</span>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="1.5">
                    <path d="M4 11h16a6 6 0 0 1-12 0z" fill="#1f2937" stroke="none" />
                    <line x1="15" y1="3" x2="21" y2="9" stroke="#1f2937" strokeWidth="1.5" />
                    <line x1="13.5" y1="4" x2="19.5" y2="10" stroke="#1f2937" strokeWidth="1.5" />
                  </svg>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowBaggageSidebar(true)
                }}
                style={{
                  textAlign: 'right',
                  padding: '1.25rem',
                  borderRadius: 12,
                  border: baggageTotal > 0 ? '2px solid #2b8a9d' : '1px solid #e5e5e5',
                  background: baggageTotal > 0 ? '#e8f5f7' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 600, color: '#1a1a1a' }}>أمتعة السفر</span>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="1.5">
                    <rect x="6" y="7" width="12" height="12" rx="2" fill="#1f2937" stroke="none" />
                    <rect x="9" y="5" width="6" height="2" rx="1" fill="#1f2937" stroke="none" />
                  </svg>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowSeatSidebar(true)
                }}
                style={{
                  textAlign: 'right',
                  padding: '1.25rem',
                  borderRadius: 12,
                  border: extras.seat ? '2px solid #2b8a9d' : '1px solid #e5e5e5',
                  background: extras.seat ? '#e8f5f7' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 600, color: '#1a1a1a' }}>اختيار المقعد</span>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="1.5">
                    <path d="M8 5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0" fill="#1f2937" stroke="none" />
                    <path d="M6 12h6a2 2 0 0 1 2 2v4H7a2 2 0 0 1-2-2v-4z" fill="#1f2937" stroke="none" />
                    <rect x="14" y="13" width="4" height="7" rx="1" fill="#1f2937" stroke="none" />
                  </svg>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowLoungeSidebar(true)
                }}
                style={{
                  textAlign: 'right',
                  padding: '1.25rem',
                  borderRadius: 12,
                  border: selectedLounge > 0 ? '2px solid #2b8a9d' : '1px solid #e5e5e5',
                  background: selectedLounge > 0 ? '#e8f5f7' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 600, color: '#1a1a1a' }}>صالة الأعمال</span>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="1.5">
                    <rect x="4" y="15" width="16" height="2" fill="#1f2937" stroke="none" />
                    <rect x="7" y="11" width="4" height="3" rx="1" fill="#1f2937" stroke="none" />
                    <path d="M15 11h4l-1 3h-3z" fill="#1f2937" stroke="none" />
                    <rect x="6" y="17" width="2" height="2" rx="1" fill="#1f2937" stroke="none" />
                    <rect x="16" y="17" width="2" height="2" rx="1" fill="#1f2937" stroke="none" />
                  </svg>
                </div>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button
                style={{ background: '#e8f5f7', color: '#2b8a9d', border: '1px solid #d0e8ec', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}
                onClick={() => {
                  setShowExtras(false)
                  setShowPassengerDetails(true)
                }}
              >
                رجوع
              </button>
              <button
                style={{ background: '#2b8a9d', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}
                onClick={() => {
                  // persist and proceed
                  window.localStorage.setItem('selectedExtras', JSON.stringify(extras))
                  setShowExtras(false)
                  setShowPayment(true)
                }}
              >
                متابعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Sidebar */}
      <MealSidebar
        isOpen={showMealSidebar}
        isClosing={isClosingSidebar}
        onClose={handleCloseSidebar}
        form={form}
        selectedMeals={selectedMeals}
        setSelectedMeals={setSelectedMeals}
        mealsTotal={mealsTotal}
        setExtras={setExtras}
      />

      {/* Baggage Sidebar */}
      <BaggageSidebar
        isOpen={showBaggageSidebar}
        isClosing={isClosingBaggageSidebar}
        onClose={handleCloseBaggageSidebar}
        form={form}
        selectedBaggage={selectedBaggage}
        setSelectedBaggage={setSelectedBaggage}
        baggageTotal={baggageTotal}
        setExtras={setExtras}
      />

      {/* Lounge Sidebar */}
      <LoungeSidebar
        isOpen={showLoungeSidebar}
        isClosing={isClosingLoungeSidebar}
        onClose={handleCloseLoungeSidebar}
        form={form}
        selectedLounge={selectedLounge}
        setSelectedLounge={setSelectedLounge}
        loungeTotal={loungeTotal}
        setExtras={setExtras}
      />

      {/* Seat Sidebar - Will be moved to separate component */}
      {showSeatSidebar && (
        <>
          {/* Overlay */}
          <div
            onClick={handleCloseSeatSidebar}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              animation: isClosingSeatSidebar ? 'fadeOut 0.3s ease-out' : 'fadeIn 0.3s ease-out',
            }}
          />
          
          {/* Sidebar */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '700px',
              maxWidth: '90vw',
              backgroundColor: 'white',
              boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              overflowY: 'auto',
              direction: 'rtl',
              transform: isClosingSeatSidebar ? 'translateX(100%)' : 'translateX(0)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: isClosingSeatSidebar ? 'none' : 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                  اختيار المقعد
                </h2>
                <button
                  onClick={handleCloseSeatSidebar}
                  style={{
                    backgroundColor: '#e0f2f5',
                    color: '#2b8a9d',
                    border: 'none',
                    borderRadius: '8px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </div>
              <button
                style={{
                  backgroundColor: '#2b8a9d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                اختيار {form.firstName && form.lastName ? `${form.firstName} ${form.lastName}` : 'محمود صلاح منصور'}
              </button>
            </div>

            {/* Seat Map Container */}
            <div style={{
              flex: 1,
              backgroundColor: '#e8f4f8',
              padding: '2rem 1.5rem',
              overflowY: 'auto',
              minHeight: 0
            }}>
              {/* Section B */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{
                  textAlign: 'center',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#2b8a9d',
                  marginBottom: '1.5rem'
                }}>
                  B
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: '0.75rem',
                  maxWidth: '500px',
                  margin: '0 auto'
                }}>
                  {/* Left Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[1, 3, 6, 9, 12, 15, 18, 21, 24, 27].map((seatNum) => (
                      <div key={seatNum}>
                        {seatNum === 6 || seatNum === 18 ? (
                          <div style={{
                            backgroundColor: '#2b8a9d',
                            color: 'white',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '0.75rem'
                          }}>
                            طاولة
                          </div>
                        ) : null}
                        <button
                          onClick={() => {
                            if (!UNAVAILABLE_SEATS.includes(seatNum)) {
                              setSelectedSeat(seatNum === selectedSeat ? null : seatNum)
                            }
                          }}
                          disabled={UNAVAILABLE_SEATS.includes(seatNum)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            backgroundColor: UNAVAILABLE_SEATS.includes(seatNum) 
                              ? 'white' 
                              : seatNum === selectedSeat 
                                ? '#1a5f6f' 
                                : '#2b8a9d',
                            color: UNAVAILABLE_SEATS.includes(seatNum) ? '#9ca3af' : 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: UNAVAILABLE_SEATS.includes(seatNum) ? 'not-allowed' : 'pointer',
                            opacity: UNAVAILABLE_SEATS.includes(seatNum) ? 0.6 : 1,
                            border: UNAVAILABLE_SEATS.includes(seatNum) ? '1px solid #d1d5db' : 'none'
                          }}
                        >
                          {seatNum}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Right Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 37].map((seatNum, idx) => (
                      <div key={seatNum}>
                        {seatNum === 5 || seatNum === 8 || seatNum === 20 || seatNum === 23 ? (
                          <div style={{
                            backgroundColor: '#2b8a9d',
                            color: 'white',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '0.75rem'
                          }}>
                            طاولة
                          </div>
                        ) : null}
                        {seatNum === 2 || seatNum === 5 || seatNum === 8 || seatNum === 11 || seatNum === 14 || seatNum === 17 || seatNum === 20 || seatNum === 23 || seatNum === 26 || seatNum === 29 || seatNum === 32 || seatNum === 35 || seatNum === 37 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button
                              onClick={() => {
                                if (!UNAVAILABLE_SEATS.includes(seatNum)) {
                                  setSelectedSeat(seatNum === selectedSeat ? null : seatNum)
                                }
                              }}
                              disabled={UNAVAILABLE_SEATS.includes(seatNum)}
                              style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                backgroundColor: UNAVAILABLE_SEATS.includes(seatNum) 
                                  ? 'white' 
                                  : seatNum === selectedSeat 
                                    ? '#1a5f6f' 
                                    : '#2b8a9d',
                                color: UNAVAILABLE_SEATS.includes(seatNum) ? '#9ca3af' : 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: UNAVAILABLE_SEATS.includes(seatNum) ? 'not-allowed' : 'pointer',
                                opacity: UNAVAILABLE_SEATS.includes(seatNum) ? 0.6 : 1,
                                border: UNAVAILABLE_SEATS.includes(seatNum) ? '1px solid #d1d5db' : 'none'
                              }}
                            >
                              {seatNum}
                            </button>
                            {seatNum === 2 ? (
                              <button
                                onClick={() => {
                                  if (!UNAVAILABLE_SEATS.includes(4)) {
                                    setSelectedSeat(4 === selectedSeat ? null : 4)
                                  }
                                }}
                                disabled={UNAVAILABLE_SEATS.includes(4)}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  backgroundColor: UNAVAILABLE_SEATS.includes(4) 
                                    ? 'white' 
                                    : 4 === selectedSeat 
                                      ? '#1a5f6f' 
                                      : '#2b8a9d',
                                  color: UNAVAILABLE_SEATS.includes(4) ? '#9ca3af' : 'white',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  cursor: UNAVAILABLE_SEATS.includes(4) ? 'not-allowed' : 'pointer',
                                  opacity: UNAVAILABLE_SEATS.includes(4) ? 0.6 : 1,
                                  border: UNAVAILABLE_SEATS.includes(4) ? '1px solid #d1d5db' : 'none'
                                }}
                              >
                                4
                              </button>
                            ) : seatNum === 5 ? (
                              <button
                                onClick={() => {
                                  if (!UNAVAILABLE_SEATS.includes(7)) {
                                    setSelectedSeat(7 === selectedSeat ? null : 7)
                                  }
                                }}
                                disabled={UNAVAILABLE_SEATS.includes(7)}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  backgroundColor: UNAVAILABLE_SEATS.includes(7) 
                                    ? 'white' 
                                    : 7 === selectedSeat 
                                      ? '#1a5f6f' 
                                      : '#2b8a9d',
                                  color: UNAVAILABLE_SEATS.includes(7) ? '#9ca3af' : 'white',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  cursor: UNAVAILABLE_SEATS.includes(7) ? 'not-allowed' : 'pointer',
                                  opacity: UNAVAILABLE_SEATS.includes(7) ? 0.6 : 1,
                                  border: UNAVAILABLE_SEATS.includes(7) ? '1px solid #d1d5db' : 'none'
                                }}
                              >
                                7
                              </button>
                            ) : seatNum === 8 ? (
                              <button
                                onClick={() => {
                                  if (!UNAVAILABLE_SEATS.includes(10)) {
                                    setSelectedSeat(10 === selectedSeat ? null : 10)
                                  }
                                }}
                                disabled={UNAVAILABLE_SEATS.includes(10)}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  backgroundColor: UNAVAILABLE_SEATS.includes(10) 
                                    ? 'white' 
                                    : 10 === selectedSeat 
                                      ? '#1a5f6f' 
                                      : '#2b8a9d',
                                  color: UNAVAILABLE_SEATS.includes(10) ? '#9ca3af' : 'white',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  cursor: UNAVAILABLE_SEATS.includes(10) ? 'not-allowed' : 'pointer',
                                  opacity: UNAVAILABLE_SEATS.includes(10) ? 0.6 : 1,
                                  border: UNAVAILABLE_SEATS.includes(10) ? '1px solid #d1d5db' : 'none'
                                }}
                              >
                                10
                              </button>
                            ) : seatNum === 11 ? (
                              <button
                                onClick={() => {
                                  if (!UNAVAILABLE_SEATS.includes(13)) {
                                    setSelectedSeat(13 === selectedSeat ? null : 13)
                                  }
                                }}
                                disabled={UNAVAILABLE_SEATS.includes(13)}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  backgroundColor: UNAVAILABLE_SEATS.includes(13) 
                                    ? 'white' 
                                    : 13 === selectedSeat 
                                      ? '#1a5f6f' 
                                      : '#2b8a9d',
                                  color: UNAVAILABLE_SEATS.includes(13) ? '#9ca3af' : 'white',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  cursor: UNAVAILABLE_SEATS.includes(13) ? 'not-allowed' : 'pointer',
                                  opacity: UNAVAILABLE_SEATS.includes(13) ? 0.6 : 1,
                                  border: UNAVAILABLE_SEATS.includes(13) ? '1px solid #d1d5db' : 'none'
                                }}
                              >
                                13
                              </button>
                            ) : seatNum === 14 ? (
                              <button
                                onClick={() => {
                                  if (!UNAVAILABLE_SEATS.includes(16)) {
                                    setSelectedSeat(16 === selectedSeat ? null : 16)
                                  }
                                }}
                                disabled={UNAVAILABLE_SEATS.includes(16)}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  backgroundColor: UNAVAILABLE_SEATS.includes(16) 
                                    ? 'white' 
                                    : 16 === selectedSeat 
                                      ? '#1a5f6f' 
                                      : '#2b8a9d',
                                  color: UNAVAILABLE_SEATS.includes(16) ? '#9ca3af' : 'white',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  cursor: UNAVAILABLE_SEATS.includes(16) ? 'not-allowed' : 'pointer',
                                  opacity: UNAVAILABLE_SEATS.includes(16) ? 0.6 : 1,
                                  border: UNAVAILABLE_SEATS.includes(16) ? '1px solid #d1d5db' : 'none'
                                }}
                              >
                                16
                              </button>
                            ) : seatNum === 17 ? (
                              <button
                                onClick={() => {
                                  if (!UNAVAILABLE_SEATS.includes(19)) {
                                    setSelectedSeat(19 === selectedSeat ? null : 19)
                                  }
                                }}
                                disabled={UNAVAILABLE_SEATS.includes(19)}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  backgroundColor: UNAVAILABLE_SEATS.includes(19) 
                                    ? 'white' 
                                    : 19 === selectedSeat 
                                      ? '#1a5f6f' 
                                      : '#2b8a9d',
                                  color: UNAVAILABLE_SEATS.includes(19) ? '#9ca3af' : 'white',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  cursor: UNAVAILABLE_SEATS.includes(19) ? 'not-allowed' : 'pointer',
                                  opacity: UNAVAILABLE_SEATS.includes(19) ? 0.6 : 1,
                                  border: UNAVAILABLE_SEATS.includes(19) ? '1px solid #d1d5db' : 'none'
                                }}
                              >
                                19
                              </button>
                            ) : seatNum === 20 ? (
                              <button
                                onClick={() => {
                                  if (!UNAVAILABLE_SEATS.includes(22)) {
                                    setSelectedSeat(22 === selectedSeat ? null : 22)
                                  }
                                }}
                                disabled={UNAVAILABLE_SEATS.includes(22)}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  backgroundColor: UNAVAILABLE_SEATS.includes(22) 
                                    ? 'white' 
                                    : 22 === selectedSeat 
                                      ? '#1a5f6f' 
                                      : '#2b8a9d',
                                  color: UNAVAILABLE_SEATS.includes(22) ? '#9ca3af' : 'white',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  cursor: UNAVAILABLE_SEATS.includes(22) ? 'not-allowed' : 'pointer',
                                  opacity: UNAVAILABLE_SEATS.includes(22) ? 0.6 : 1,
                                  border: UNAVAILABLE_SEATS.includes(22) ? '1px solid #d1d5db' : 'none'
                                }}
                              >
                                22
                              </button>
                            ) : seatNum === 23 ? (
                              <button
                                onClick={() => {
                                  if (!UNAVAILABLE_SEATS.includes(25)) {
                                    setSelectedSeat(25 === selectedSeat ? null : 25)
                                  }
                                }}
                                disabled={UNAVAILABLE_SEATS.includes(25)}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  backgroundColor: UNAVAILABLE_SEATS.includes(25) 
                                    ? 'white' 
                                    : 25 === selectedSeat 
                                      ? '#1a5f6f' 
                                      : '#2b8a9d',
                                  color: UNAVAILABLE_SEATS.includes(25) ? '#9ca3af' : 'white',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  cursor: UNAVAILABLE_SEATS.includes(25) ? 'not-allowed' : 'pointer',
                                  opacity: UNAVAILABLE_SEATS.includes(25) ? 0.6 : 1,
                                  border: UNAVAILABLE_SEATS.includes(25) ? '1px solid #d1d5db' : 'none'
                                }}
                              >
                                25
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (!UNAVAILABLE_SEATS.includes(seatNum)) {
                                setSelectedSeat(seatNum === selectedSeat ? null : seatNum)
                              }
                            }}
                            disabled={UNAVAILABLE_SEATS.includes(seatNum)}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              borderRadius: '8px',
                              backgroundColor: UNAVAILABLE_SEATS.includes(seatNum) 
                                ? 'white' 
                                : seatNum === selectedSeat 
                                  ? '#1a5f6f' 
                                  : '#2b8a9d',
                              color: UNAVAILABLE_SEATS.includes(seatNum) ? '#9ca3af' : 'white',
                              fontSize: '16px',
                              fontWeight: '600',
                              cursor: UNAVAILABLE_SEATS.includes(seatNum) ? 'not-allowed' : 'pointer',
                              opacity: UNAVAILABLE_SEATS.includes(seatNum) ? 0.6 : 1,
                              border: UNAVAILABLE_SEATS.includes(seatNum) ? '1px solid #d1d5db' : 'none'
                            }}
                          >
                            {seatNum}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                maxWidth: '500px',
                margin: '0 auto 2rem',
                paddingTop: '1rem',
                borderTop: '2px solid #2b8a9d'
              }}>
                <div style={{
                  backgroundColor: '#2b8a9d',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 0.5rem' }}>
                    <circle cx="12" cy="8" r="3" stroke="white" strokeWidth="2" fill="none"/>
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="white" strokeWidth="2" fill="none"/>
                  </svg>
                  WC
                </div>
                <div style={{
                  backgroundColor: '#2b8a9d',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 0.5rem' }}>
                    <rect x="6" y="7" width="12" height="12" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                    <rect x="9" y="5" width="6" height="2" rx="1" stroke="white" strokeWidth="2" fill="none"/>
                  </svg>
                  أمتعة
                </div>
              </div>

              {/* Section A - Bottom Section */}
              <div>
                <div style={{
                  textAlign: 'center',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#2b8a9d',
                  marginBottom: '1.5rem'
                }}>
                  A
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '0.75rem',
                  maxWidth: '500px',
                  margin: '0 auto'
                }}>
                  {/* Left Column - Pairs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[29, 32, 35, 38, 41, 44, 47, 50, 53].map((seatNum) => (
                      <div key={seatNum}>
                        {seatNum === 35 || seatNum === 41 || seatNum === 47 ? (
                          <div style={{
                            backgroundColor: '#2b8a9d',
                            color: 'white',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '0.75rem'
                          }}>
                            طاولة
                          </div>
                        ) : null}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              if (!UNAVAILABLE_SEATS.includes(seatNum)) {
                                setSelectedSeat(seatNum === selectedSeat ? null : seatNum)
                              }
                            }}
                            disabled={UNAVAILABLE_SEATS.includes(seatNum)}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            backgroundColor: UNAVAILABLE_SEATS.includes(seatNum)
                                ? 'white' 
                                : seatNum === selectedSeat 
                                  ? '#1a5f6f' 
                                  : '#2b8a9d',
                              color: UNAVAILABLE_SEATS.includes(seatNum) ? '#9ca3af' : 'white',
                              fontSize: '16px',
                              fontWeight: '600',
                              cursor: UNAVAILABLE_SEATS.includes(seatNum) ? 'not-allowed' : 'pointer',
                              opacity: UNAVAILABLE_SEATS.includes(seatNum) ? 0.6 : 1,
                              border: UNAVAILABLE_SEATS.includes(seatNum) ? '1px solid #d1d5db' : 'none'
                            }}
                          >
                            {seatNum}
                          </button>
                          <button
                            onClick={() => {
                              const nextSeat = seatNum + 1
                              if (!UNAVAILABLE_SEATS.includes(nextSeat)) {
                                setSelectedSeat(nextSeat === selectedSeat ? null : nextSeat)
                              }
                            }}
                            disabled={UNAVAILABLE_SEATS.includes(seatNum + 1)}
                            style={{
                              padding: '0.75rem',
                              borderRadius: '8px',
                              backgroundColor: UNAVAILABLE_SEATS.includes(seatNum + 1) 
                                ? 'white' 
                                : (seatNum + 1) === selectedSeat 
                                  ? '#1a5f6f' 
                                  : '#2b8a9d',
                              color: UNAVAILABLE_SEATS.includes(seatNum + 1) ? '#9ca3af' : 'white',
                              fontSize: '16px',
                              fontWeight: '600',
                              cursor: UNAVAILABLE_SEATS.includes(seatNum + 1) ? 'not-allowed' : 'pointer',
                              opacity: UNAVAILABLE_SEATS.includes(seatNum + 1) ? 0.6 : 1,
                              border: UNAVAILABLE_SEATS.includes(seatNum + 1) ? '1px solid #d1d5db' : 'none'
                            }}
                          >
                            {seatNum + 1}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Column - Singles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 57].map((seatNum) => (
                      <div key={seatNum}>
                        {seatNum === 37 || seatNum === 43 || seatNum === 49 ? (
                          <div style={{
                            backgroundColor: '#2b8a9d',
                            color: 'white',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '0.75rem'
                          }}>
                            طاولة
                          </div>
                        ) : null}
                        <button
                          onClick={() => {
                            if (!UNAVAILABLE_SEATS.includes(seatNum)) {
                              setSelectedSeat(seatNum === selectedSeat ? null : seatNum)
                            }
                          }}
                          disabled={UNAVAILABLE_SEATS.includes(seatNum)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            backgroundColor: UNAVAILABLE_SEATS.includes(seatNum) 
                              ? 'white' 
                              : seatNum === selectedSeat 
                                ? '#1a5f6f' 
                                : '#2b8a9d',
                            color: UNAVAILABLE_SEATS.includes(seatNum) ? '#9ca3af' : 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: UNAVAILABLE_SEATS.includes(seatNum) ? 'not-allowed' : 'pointer',
                            opacity: UNAVAILABLE_SEATS.includes(seatNum) ? 0.6 : 1,
                            border: UNAVAILABLE_SEATS.includes(seatNum) ? '1px solid #d1d5db' : 'none'
                          }}
                        >
                          {seatNum}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Confirm Button */}
            <div style={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: 'white',
              borderTop: '1px solid #e5e7eb',
              padding: '1.5rem',
              boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'row-reverse',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}>
              {/* Confirm Button */}
              <button
                onClick={() => {
                  if (selectedSeat) {
                    setExtras(prev => ({ ...prev, seat: true }))
                    window.localStorage.setItem('selectedSeat', selectedSeat.toString())
                    handleCloseSeatSidebar()
                  }
                }}
                type="button"
                disabled={!selectedSeat}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: selectedSeat ? '#2b8a9d' : '#d1d5db',
                  padding: '10px 14px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  border: 'none',
                  cursor: selectedSeat ? 'pointer' : 'not-allowed',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                تأكيد
              </button>

              {/* Total Display */}
              <div style={{ textAlign: 'right', flex: 1 }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'row-reverse',
                  alignItems: 'baseline',
                  justifyContent: 'flex-end',
                  gap: '4px',
                  marginBottom: '4px'
                }}>
                  <span style={{ fontSize: '14px', color: '#666', fontWeight: '400' }}>ر.س</span>
                  <span style={{ 
                    fontSize: '36px',
                    color: '#1a1a1a',
                    fontWeight: '700',
                    lineHeight: '1'
                  }}>
                    0.00
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                  المبلغ الإجمالي = {selectedSeat ? '1' : '0'} × المقاعد
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {showPayment && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 3rem 3rem' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', direction: 'rtl', border: '1px solid #e5e7eb', marginTop: '1.5rem' }}>
            <h3 style={{ marginTop: 0, color: '#111827', fontWeight: 700, fontSize: 20 }}>بيانات الدفع</h3>

            <div style={{ marginTop: '1rem', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937', fontWeight: 600 }}>
                  <span>المبلغ المستحق</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', color: '#1a1a1a', fontWeight: 'bold', fontSize: 24 }}>
                  <span style={{ fontSize: 14, fontWeight: 400, color: '#666' }}>ر.س</span>
                  <span style={{ fontSize: 16, fontWeight: 400, color: '#999' }}>{(selectedPlanPrice + extrasTotal).toFixed(2).split('.')[1]}</span>
                  <span>{(selectedPlanPrice + extrasTotal).toFixed(2).split('.')[0]}</span>
                </div>
              </div>

              <div style={{ padding: '1.25rem', background: 'white' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>مالك البطاقة</label>
                    <input
                      placeholder="الاسم كما يظهر على البطاقة"
                      style={{ width: '100%', padding: '12px', borderRadius: 10, border: paymentErrors.cardName ? '1px solid #dc2626' : '1px solid #d1d5db' }}
                      value={paymentForm.cardName}
                      onChange={(e) => updatePaymentField('cardName', e.target.value)}
                    />
                    {paymentErrors.cardName && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{paymentErrors.cardName}</div>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>رقم البطاقة</label>
                    <input
                      placeholder="0000 0000 0000 0000"
                      style={{ width: '100%', padding: '12px', borderRadius: 10, border: paymentErrors.cardNumber ? '1px solid #dc2626' : '1px solid #d1d5db', direction: 'ltr' }}
                      value={paymentForm.cardNumber}
                      onChange={(e) => updatePaymentField('cardNumber', e.target.value)}
                    />
                    {paymentErrors.cardNumber && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{paymentErrors.cardNumber}</div>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>الشهر</label>
                      <input
                        placeholder="MM"
                        style={{ width: '100%', padding: '12px', borderRadius: 10, border: paymentErrors.expMonth ? '1px solid #dc2626' : '1px solid #d1d5db', direction: 'ltr' }}
                        value={paymentForm.expMonth}
                        onChange={(e) => updatePaymentField('expMonth', e.target.value)}
                      />
                      {paymentErrors.expMonth && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{paymentErrors.expMonth}</div>}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>السنة</label>
                      <input
                        placeholder="YY"
                        style={{ width: '100%', padding: '12px', borderRadius: 10, border: paymentErrors.expYear ? '1px solid #dc2626' : '1px solid #d1d5db', direction: 'ltr' }}
                        value={paymentForm.expYear}
                        onChange={(e) => updatePaymentField('expYear', e.target.value)}
                      />
                      {paymentErrors.expYear && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{paymentErrors.expYear}</div>}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>رمز التحقق</label>
                      <input
                        placeholder="CVV"
                        style={{ width: '100%', padding: '12px', borderRadius: 10, border: paymentErrors.cvv ? '1px solid #dc2626' : '1px solid #d1d5db', direction: 'ltr' }}
                        value={paymentForm.cvv}
                        onChange={(e) => updatePaymentField('cvv', e.target.value)}
                      />
                      {paymentErrors.cvv && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{paymentErrors.cvv}</div>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                  <button
                    style={{ background: '#e8f5f7', color: '#2b8a9d', border: '1px solid #d0e8ec', padding: '10px 16px', borderRadius: 8, cursor: isPaying ? 'default' : 'pointer', opacity: isPaying ? 0.7 : 1 }}
                    onClick={() => {
                      if (isPaying) return
                      setShowPayment(false)
                      setShowExtras(true)
                    }}
                  >
                    رجوع
                  </button>
                  <button
                    style={{ background: '#2b8a9d', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: isPaying ? 'default' : 'pointer', minWidth: 160, opacity: isPaying ? 0.7 : 1 }}
                    onClick={() => {
                      if (isPaying) return
                      if (!validatePaymentForm()) return
                      setIsPaying(true)
                      setTimeout(() => {
                        router.push('/payment-success')
                      }, 3000)
                    }}
                  >
                    {isPaying ? 'جاري معالجة الدفع...' : `الدفع [${(selectedPlanPrice + extrasTotal).toFixed(2)}]`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function BookingDetailsPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        جاري التحميل...
      </div>
    }>
      <BookingDetailsContent />
    </Suspense>
  )
}