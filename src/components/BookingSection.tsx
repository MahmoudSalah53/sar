'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// بيانات المحطات
const stations = [
  { name: 'الرياض', code: 'RYD' },
  { name: 'الهفوف', code: 'HAF' },
  { name: 'بقيق', code: 'ABQ' },
  { name: 'الدمام', code: 'DMM' },
  { name: 'المجمعة', code: 'MAJ' },
  { name: 'القصيم', code: 'QSM' },
  { name: 'حائل', code: 'HAI' },
  { name: 'الجوف', code: 'JAU' },
  { name: 'القريات', code: 'QUR' }
]

// خريطة المسارات المتاحة (من أي محطة يمكن الوصول إلى أي محطات)
const availableRoutes: { [key: string]: string[] } = {
  'الرياض': ['الدمام', 'القصيم', 'حائل', 'الجوف', 'القريات', 'المجمعة'],
  'الهفوف': ['الرياض', 'الدمام', 'بقيق'],
  'بقيق': ['الرياض', 'الدمام', 'الهفوف'],
  'الدمام': ['الرياض', 'الهفوف', 'بقيق', 'القصيم'],
  'المجمعة': ['الرياض', 'القصيم'],
  'القصيم': ['الرياض', 'الدمام', 'حائل', 'المجمعة'],
  'حائل': ['الرياض', 'القصيم', 'الجوف'],
  'الجوف': ['الرياض', 'حائل', 'القريات'],
  'القريات': ['الرياض', 'الجوف']
}

export default function BookingSection() {
  const router = useRouter()

  const getStationByName = (name: string | null | undefined) => {
    if (!name) return null
    return stations.find((s) => s.name === name) || null
  }
  const [fromStation, setFromStation] = useState<string>('')
  const [toStation, setToStation] = useState<string>('')
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way')
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2025, 10, 16)) // نوفمبر 16, 2025
  const [selectedReturnDate, setSelectedReturnDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10, 1)) // نوفمبر 2025
  const [currentReturnMonth, setCurrentReturnMonth] = useState(new Date(2025, 11, 1)) // ديسمبر 2025
  const [showPassengersDropdown, setShowPassengersDropdown] = useState(false)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const fromDropdownRef = useRef<HTMLDivElement>(null)
  const dateDropdownRef = useRef<HTMLDivElement>(null)
  const passengersDropdownRef = useRef<HTMLDivElement>(null)
  const fromButtonRef = useRef<HTMLDivElement>(null)
  const dateButtonRef = useRef<HTMLDivElement>(null)
  const passengersButtonRef = useRef<HTMLDivElement>(null)

  // الحصول على المحطات المتاحة للوصول بناءً على محطة المغادرة
  const getAvailableToStations = () => {
    if (!fromStation) return stations
    return stations.filter(station =>
      availableRoutes[fromStation]?.includes(station.name)
    )
  }

  // إغلاق الـ dropdown عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fromDropdownRef.current &&
        !fromDropdownRef.current.contains(event.target as Node) &&
        fromButtonRef.current &&
        !fromButtonRef.current.contains(event.target as Node)
      ) {
        setShowFromDropdown(false)
        setShowToDropdown(false)
      }
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target as Node) &&
        dateButtonRef.current &&
        !dateButtonRef.current.contains(event.target as Node)
      ) {
        setShowDateDropdown(false)
      }
      if (
        passengersDropdownRef.current &&
        !passengersDropdownRef.current.contains(event.target as Node) &&
        passengersButtonRef.current &&
        !passengersButtonRef.current.contains(event.target as Node)
      ) {
        setShowPassengersDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // عند اختيار محطة المغادرة
  const handleFromStationSelect = (stationName: string) => {
    setFromStation(stationName)
    setToStation('') // إعادة تعيين محطة الوصول
  }

  const handleToStationSelect = (stationName: string) => {
    setToStation(stationName)
    // إغلاق الـ dropdown بعد اختيار محطة الوصول
    setShowFromDropdown(false)
    setShowToDropdown(false)
  }

  // حفظ القيم المختارة في localStorage
  useEffect(() => {
    try {
      const from = getStationByName(fromStation)
      const to = getStationByName(toStation)

      const payload = {
        fromStationName: from?.name || '',
        fromStationCode: from?.code || '',
        toStationName: to?.name || '',
        toStationCode: to?.code || '',
        tripType,
        selectedDateISO: selectedDate ? selectedDate.toISOString() : '',
        selectedReturnDateISO: selectedReturnDate ? selectedReturnDate.toISOString() : '',
        passengers: {
          adults,
          children,
          infants,
          summaryAr: (function () {
            const parts: string[] = []
            if (adults > 0) parts.push(`${adults} بالغ`)
            if (children > 0) parts.push(`${children} طفل`)
            if (infants > 0) parts.push(`${infants} رضيع`)
            return parts.length > 0 ? parts.join(', ') : '1 بالغ'
          })()
        }
      }

      window.localStorage.setItem('bookingDraft', JSON.stringify(payload))
    } catch {
      // تجاهل أخطاء التخزين
    }
  }, [fromStation, toStation, tripType, selectedDate, selectedReturnDate, adults, children, infants])

  // دوال التقويم
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ]

  const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const arabicDaysShort = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']

  const formatDate = (date: Date | null): string => {
    if (!date) return '11 نوفمبر 2025'
    const day = date.getDate()
    const month = arabicMonths[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const formatDateRange = (): string => {
    if (tripType === 'one-way') {
      return formatDate(selectedDate)
    } else {
      if (selectedDate && selectedReturnDate) {
        return `${formatDate(selectedDate)} - ${formatDate(selectedReturnDate)}`
      } else if (selectedDate) {
        return `${formatDate(selectedDate)} - حدد تاريخ العودة`
      } else {
        return 'حدد تاريخ السفر'
      }
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    let startingDayOfWeek = firstDay.getDay() // 0 = Sunday, 6 = Saturday
    // تحويل إلى RTL: الأحد = 0 (أول يوم في الأسبوع)
    
    const days = []
    
    // أيام الشهر السابق
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) })
    }
    
    // أيام الشهر الحالي
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) })
    }
    
    // أيام الشهر التالي
    const remainingDays = 42 - days.length // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) })
    }
    
    return days
  }

  const handleDateSelect = (date: Date, isReturnDate: boolean = false) => {
    if (tripType === 'one-way') {
      setSelectedDate(date)
      setShowDateDropdown(false)
    } else {
      if (isReturnDate) {
        // إذا كان تاريخ العودة يجب أن يكون بعد تاريخ الذهاب
        if (selectedDate && date >= selectedDate) {
          setSelectedReturnDate(date)
        } else if (!selectedDate) {
          // إذا لم يتم اختيار تاريخ الذهاب بعد، اجعله تاريخ الذهاب
          setSelectedDate(date)
        }
      } else {
        // اختيار تاريخ الذهاب
        setSelectedDate(date)
        // إذا كان تاريخ العودة قبل تاريخ الذهاب الجديد، امسحه
        if (selectedReturnDate && selectedReturnDate < date) {
          setSelectedReturnDate(null)
        }
      }
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isSameDay = (date1: Date | null, date2: Date): boolean => {
    if (!date1) return false
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  const isInRange = (date: Date): boolean => {
    if (tripType !== 'round-trip' || !selectedDate || !selectedReturnDate) return false
    return date >= selectedDate && date <= selectedReturnDate
  }

  const isDateDisabled = (date: Date, isReturnDate: boolean = false): boolean => {
    if (tripType === 'round-trip' && isReturnDate && selectedDate) {
      // عند اختيار تاريخ العودة، لا يمكن اختيار تاريخ قبل تاريخ الذهاب
      return date < selectedDate
    }
    return false
  }

  const isPastDate = (date: Date): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const availableToStations = getAvailableToStations()
  const showDropdown = showFromDropdown || showToDropdown

  // التقويمات
  const firstMonth = tripType === 'round-trip' ? currentMonth : currentMonth
  const secondMonth = tripType === 'round-trip' 
    ? currentReturnMonth 
    : new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
  const firstMonthDays = getDaysInMonth(firstMonth)
  const secondMonthDays = getDaysInMonth(secondMonth)

  // عند تغيير نوع الرحلة، إعادة تعيين التواريخ
  const handleTripTypeChange = (type: 'one-way' | 'round-trip') => {
    setTripType(type)
    if (type === 'one-way') {
      setSelectedReturnDate(null)
    }
  }

  // دوال المسافرين
  const formatPassengers = (): string => {
    const parts = []
    if (adults > 0) parts.push(`${adults} ${adults === 1 ? 'بالغ' : 'بالغ'}`)
    if (children > 0) parts.push(`${children} ${children === 1 ? 'طفل' : 'طفل'}`)
    if (infants > 0) parts.push(`${infants} ${infants === 1 ? 'رضيع' : 'رضيع'}`)
    return parts.length > 0 ? parts.join(', ') : '1 بالغ'
  }

  const handlePassengerChange = (type: 'adults' | 'children' | 'infants', increment: boolean) => {
    if (type === 'adults') {
      setAdults(prev => Math.max(0, increment ? prev + 1 : prev - 1))
    } else if (type === 'children') {
      setChildren(prev => Math.max(0, increment ? prev + 1 : prev - 1))
    } else if (type === 'infants') {
      setInfants(prev => Math.max(0, increment ? prev + 1 : prev - 1))
    }
  }

  const handleApplyPassengers = () => {
    setShowPassengersDropdown(false)
  }

  return (
    <section className="booking-section">
      <div className="booking-tabs">
        <button className="tab-btn">
          <i className="fas fa-train"></i>
          احجز القطار
        </button>
        <button className="tab-btn">
          <i className="fas fa-train"></i>
          حجز تذاكر السفر + شحن السيارات
        </button>
        <button className="tab-btn">
          <i className="fas fa-box"></i>
          حجز شحن السيارات
        </button>
        <button className="tab-btn active">
          <i className="fas fa-ticket-alt"></i>
          إدارة الحجز
        </button>
        <button className="tab-btn">
          <i className="fas fa-plus"></i>
          خدمات إضافية
        </button>
      </div>

      <div className="booking-card">
        <div className="booking-form">
          <div className="booking-item" style={{ position: 'relative' }}>
            <div className="form-group">
              <i className="fas fa-map-marker-alt form-icon"></i>
            </div>
            <div className="form-content">
              <div className="form-label">
                <span className="from-text">من</span>
                <span className="arrow">←</span>
                <span className="to-text">الى</span>
              </div>
              <div
                className="form-value"
                ref={fromButtonRef}
                onClick={() => {
                  setShowFromDropdown(true)
                  setShowToDropdown(true)
                }}
                style={{ cursor: 'pointer' }}
              >
                {fromStation && toStation
                  ? `${fromStation} ← ${toStation}`
                  : fromStation
                    ? `${fromStation} ← حدد محطة الوصول`
                    : 'حدد محطات المغادرة والوصول'
                }
              </div>
            </div>

            {/* Dropdown مع قائمتين جنباً إلى جنب */}
            {showDropdown && (
              <div className="station-dropdown" ref={fromDropdownRef}>
                <div className="dropdown-header">
                  <span>حدد محطات المغادرة والوصول</span>
                  <i className="fas fa-times" onClick={() => {
                    setShowFromDropdown(false)
                    setShowToDropdown(false)
                  }}></i>
                </div>
                <div className="dropdown-columns">

                  {/* القائمة اليسرى - محطة الوصول */}
                  <div className="dropdown-column">
                    <div className="column-header">الى</div>
                    <div className="station-list">
                      {fromStation ? (
                        availableToStations.length > 0 ? (
                          availableToStations.map((station) => (
                            <div
                              key={station.code}
                              className={`station-item ${toStation === station.name ? 'selected' : ''}`}
                              onClick={() => handleToStationSelect(station.name)}
                            >
                              <span className="station-name">{station.name}</span>
                              <span className="station-code">{station.code}</span>
                            </div>
                          ))
                        ) : (
                          <div className="no-stations">لا توجد محطات متاحة</div>
                        )
                      ) : (
                        <div className="no-stations">اختر محطة المغادرة أولاً</div>
                      )}
                    </div>
                  </div>
                  {/* القائمة اليمنى - محطة المغادرة */}
                  <div className="dropdown-column">
                    <div className="column-header">من</div>
                    <div className="station-list">
                      {stations.map((station) => (
                        <div
                          key={station.code}
                          className={`station-item ${fromStation === station.name ? 'selected' : ''}`}
                          onClick={() => handleFromStationSelect(station.name)}
                        >
                          <span className="station-name">{station.name}</span>
                          <span className="station-code">{station.code}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  
                </div>
              </div>
            )}
          </div>

          <div className="booking-item" style={{ position: 'relative' }}>
            <div className="form-group">
              <i className="fas fa-calendar-alt form-icon"></i>
            </div>
            <div className="form-content">
              <div className="form-label">مواعيد السفر</div>
              <div
                className="form-value"
                ref={dateButtonRef}
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                style={{ cursor: 'pointer' }}
              >
                {formatDateRange()}
              </div>
            </div>

            {/* Date Dropdown */}
            {showDateDropdown && (
              <div className="date-dropdown" ref={dateDropdownRef}>
                <div className="dropdown-header">
                  <span>اختر تاريخ السفر</span>
                  <i className="fas fa-times" onClick={() => setShowDateDropdown(false)}></i>
                </div>
                
                {/* Toggle نوع الرحلة داخل الـ dropdown */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '0',
                    background: '#2b8a9d', 
                    borderRadius: '12px', 
                    padding: '4px',
                    width: 'fit-content'
                  }}>
                    <button
                      onClick={() => handleTripTypeChange('one-way')}
                      style={{
                        padding: '8px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: tripType === 'one-way' ? 'white' : 'transparent',
                        color: tripType === 'one-way' ? '#2b8a9d' : 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        fontSize: '14px'
                      }}
                    >
                      مسار واحد
                    </button>
                    <button
                      onClick={() => handleTripTypeChange('round-trip')}
                      style={{
                        padding: '8px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: tripType === 'round-trip' ? 'white' : 'transparent',
                        color: tripType === 'round-trip' ? '#2b8a9d' : 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        fontSize: '14px'
                      }}
                    >
                      ذهاب وعودة
                    </button>
                  </div>
                </div>

                <div className="calendar-container">
                  {/* التقويم الأول - تاريخ الذهاب */}
                  <div className="calendar-month">
                    <div className="calendar-header">
                      <button onClick={handlePrevMonth}>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                      <span>{tripType === 'round-trip' ? 'من' : ''} {arabicMonths[firstMonth.getMonth()]} {firstMonth.getFullYear()}</span>
                      <button onClick={handleNextMonth}>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </div>
                    <div className="calendar-days-header">
                      {arabicDaysShort.map((day, index) => (
                        <div key={index} className="calendar-day-name">{day}</div>
                      ))}
                    </div>
                    <div className="calendar-days">
                      {firstMonthDays.map((dayObj, index) => {
                        const isSelected = isSameDay(selectedDate, dayObj.date)
                        const isPast = isPastDate(dayObj.date)
                        const inRange = isInRange(dayObj.date)
                        return (
                          <div
                            key={index}
                            className={`calendar-day ${!dayObj.isCurrentMonth ? 'empty' : ''} ${isPast ? 'past' : ''} ${isSelected ? 'selected' : ''} ${inRange ? 'in-range' : ''}`}
                            onClick={() => !isPast && dayObj.isCurrentMonth && handleDateSelect(dayObj.date, false)}
                          >
                            {dayObj.day}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* التقويم الثاني - تاريخ العودة (فقط عند ذهاب وعودة) */}
                  {tripType === 'round-trip' && (
                    <div className="calendar-month">
                      <div className="calendar-header">
                        <button onClick={() => setCurrentReturnMonth(new Date(currentReturnMonth.getFullYear(), currentReturnMonth.getMonth() - 1, 1))}>
                          <i className="fas fa-chevron-right"></i>
                        </button>
                        <span>الى {arabicMonths[secondMonth.getMonth()]} {secondMonth.getFullYear()}</span>
                        <button onClick={() => setCurrentReturnMonth(new Date(currentReturnMonth.getFullYear(), currentReturnMonth.getMonth() + 1, 1))}>
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </div>
                      <div className="calendar-days-header">
                        {arabicDaysShort.map((day, index) => (
                          <div key={index} className="calendar-day-name">{day}</div>
                        ))}
                      </div>
                      <div className="calendar-days">
                        {secondMonthDays.map((dayObj, index) => {
                          const isSelected = isSameDay(selectedReturnDate, dayObj.date)
                          const isPast = isPastDate(dayObj.date)
                          const isDisabled = isDateDisabled(dayObj.date, true)
                          const inRange = isInRange(dayObj.date)
                          return (
                            <div
                              key={index}
                              className={`calendar-day ${!dayObj.isCurrentMonth ? 'empty' : ''} ${isPast || isDisabled ? 'past' : ''} ${isSelected ? 'selected' : ''} ${inRange ? 'in-range' : ''}`}
                              onClick={() => !isPast && !isDisabled && dayObj.isCurrentMonth && handleDateSelect(dayObj.date, true)}
                            >
                              {dayObj.day}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* عند مسار واحد، نعرض تقويمين متتاليين فقط */}
                  {tripType === 'one-way' && (
                    <div className="calendar-month">
                      <div className="calendar-header">
                        <button onClick={() => setCurrentMonth(new Date(secondMonth.getFullYear(), secondMonth.getMonth() - 1, 1))}>
                          <i className="fas fa-chevron-right"></i>
                        </button>
                        <span>{arabicMonths[secondMonth.getMonth()]} {secondMonth.getFullYear()}</span>
                        <button onClick={() => setCurrentMonth(new Date(secondMonth.getFullYear(), secondMonth.getMonth() + 1, 1))}>
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </div>
                      <div className="calendar-days-header">
                        {arabicDaysShort.map((day, index) => (
                          <div key={index} className="calendar-day-name">{day}</div>
                        ))}
                      </div>
                      <div className="calendar-days">
                        {secondMonthDays.map((dayObj, index) => {
                          const isSelected = isSameDay(selectedDate, dayObj.date)
                          const isPast = isPastDate(dayObj.date)
                          return (
                            <div
                              key={index}
                              className={`calendar-day ${!dayObj.isCurrentMonth ? 'empty' : ''} ${isPast ? 'past' : ''} ${isSelected ? 'selected' : ''}`}
                              onClick={() => !isPast && dayObj.isCurrentMonth && handleDateSelect(dayObj.date, false)}
                            >
                              {dayObj.day}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="date-dropdown-actions">
                  <button className="cancel-btn" onClick={() => setShowDateDropdown(false)}>
                    الغاء
                  </button>
                  <button 
                    className="apply-btn" 
                    onClick={() => {
                      if (tripType === 'one-way' && selectedDate) {
                        setShowDateDropdown(false)
                      } else if (tripType === 'round-trip' && selectedDate && selectedReturnDate) {
                        setShowDateDropdown(false)
                      }
                    }}
                    disabled={tripType === 'round-trip' && (!selectedDate || !selectedReturnDate)}
                    style={{ 
                      opacity: (tripType === 'round-trip' && (!selectedDate || !selectedReturnDate)) ? 0.5 : 1,
                      cursor: (tripType === 'round-trip' && (!selectedDate || !selectedReturnDate)) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    تطبيق
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="booking-item" style={{ position: 'relative' }}>
            <div className="form-group">
              <i className="fas fa-user-plus form-icon"></i>
            </div>
            <div className="form-content">
              <div className="form-label">المسافرين</div>
              <div
                className="form-value"
                ref={passengersButtonRef}
                onClick={() => setShowPassengersDropdown(!showPassengersDropdown)}
                style={{ cursor: 'pointer' }}
              >
                {formatPassengers()}
              </div>
            </div>

            {/* Passengers Dropdown */}
            {showPassengersDropdown && (
              <div className="date-dropdown" ref={passengersDropdownRef} style={{ minWidth: '320px', maxWidth: '400px' }}>
                <div className="dropdown-header">
                  <span>المسافرين</span>
                  <i className="fas fa-times" onClick={() => setShowPassengersDropdown(false)}></i>
                </div>
                
                <div style={{ padding: '20px' }}>
                  {/* بالغ */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px', color: '#333' }}>
                        بالغ
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        العمر +12
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => handlePassengerChange('adults', false)}
                        disabled={adults === 0}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          background: adults === 0 ? '#f5f5f5' : 'white',
                          color: adults === 0 ? '#ccc' : '#2b8a9d',
                          cursor: adults === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}
                      >
                        −
                      </button>
                      <div style={{ 
                        minWidth: '40px', 
                        textAlign: 'center', 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {adults}
                      </div>
                      <button
                        onClick={() => handlePassengerChange('adults', true)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #2b8a9d',
                          background: '#2b8a9d',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* طفل */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px', color: '#333' }}>
                        طفل
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        العمر 2-11
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => handlePassengerChange('children', false)}
                        disabled={children === 0}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          background: children === 0 ? '#f5f5f5' : 'white',
                          color: children === 0 ? '#ccc' : '#2b8a9d',
                          cursor: children === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}
                      >
                        −
                      </button>
                      <div style={{ 
                        minWidth: '40px', 
                        textAlign: 'center', 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {children}
                      </div>
                      <button
                        onClick={() => handlePassengerChange('children', true)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #2b8a9d',
                          background: '#2b8a9d',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* رضيع */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px', color: '#333' }}>
                        رضيع
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        العمر 0-1
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => handlePassengerChange('infants', false)}
                        disabled={infants === 0}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          background: infants === 0 ? '#f5f5f5' : 'white',
                          color: infants === 0 ? '#ccc' : '#2b8a9d',
                          cursor: infants === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}
                      >
                        −
                      </button>
                      <div style={{ 
                        minWidth: '40px', 
                        textAlign: 'center', 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {infants}
                      </div>
                      <button
                        onClick={() => handlePassengerChange('infants', true)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #2b8a9d',
                          background: '#2b8a9d',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="date-dropdown-actions">
                  <button className="apply-btn" onClick={handleApplyPassengers} style={{ width: '100%' }}>
                    تطبيق
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <a href="#" className="add-promo">
          <i className="fas fa-plus-circle"></i>
          اضف الرمز الترويجي
        </a>
      </div>

    <button
      className="select-trip-btn"
      onClick={() => router.push('/booking-details')}
    >
        <span>اختيار الرحلة</span>
        <i className="fas fa-arrow-left"></i>
      </button>
    </section>
  )
}
