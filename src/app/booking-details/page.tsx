'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function BookingDetailsPage() {
  const searchParams = useSearchParams()

  const fromStation = searchParams.get('from') || 'الهفوف'
  const toStation = searchParams.get('to') || 'الرياض'
  const departureDate = searchParams.get('departureDate') || '13 نوفمبر 2025'
  const returnDate = searchParams.get('returnDate') || ''
  const tripType = searchParams.get('tripType') || 'one-way'
  const adults = searchParams.get('adults') || '1'
  const children = searchParams.get('children') || '0'
  const infants = searchParams.get('infants') || '0'

  // حالة العرض في الهيدر (من localStorage أو من الquery params كنسخة احتياطية)
  const [headerFromCode, setHeaderFromCode] = useState('ABQ')
  const [headerToCode, setHeaderToCode] = useState('RYD')
  const [headerDateText, setHeaderDateText] = useState('الخميس، 13 نوفمبر 2025')
  const [headerPassengersText, setHeaderPassengersText] = useState('1 بالغ')

  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ]
  const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

  const formatArabicFullDate = (iso: string | null): string => {
    if (!iso) return 'الخميس، 13 نوفمبر 2025'
    const d = new Date(iso)
    if (isNaN(d.getTime())) return 'الخميس، 13 نوفمبر 2025'
    const dayName = arabicDays[d.getDay()]
    const day = d.getDate()
    const month = arabicMonths[d.getMonth()]
    const year = d.getFullYear()
    return `${dayName}، ${day} ${month} ${year}`
  }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('bookingDraft')
      if (raw) {
        const data = JSON.parse(raw) as {
          fromStationCode?: string
          toStationCode?: string
          selectedDateISO?: string
          passengers?: { summaryAr?: string; adults?: number; children?: number; infants?: number }
        }
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
    const stationCodes: { [key: string]: string } = {
      'الهفوف': 'ABQ',
      'الرياض': 'RYD',
      'الدمام': 'DMM',
      'القصيم': 'QSM',
      'حائل': 'HAI'
    }
    setHeaderFromCode(stationCodes[fromStation] || 'ABQ')
    setHeaderToCode(stationCodes[toStation] || 'RYD')
    setHeaderDateText(departureDate || 'الخميس، 13 نوفمبر 2025')
    const totalP = parseInt(adults) + parseInt(children) + parseInt(infants)
    setHeaderPassengersText(totalP > 0 ? `${totalP} بالغ` : '1 بالغ')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [selectedDate, setSelectedDate] = useState(0)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [timeFilters, setTimeFilters] = useState({
    earlyMorning: false,
    morning: false,
    afternoon: false,
    evening: false
  })
  const [sortByPrice, setSortByPrice] = useState(false)
  const [expandedTripId, setExpandedTripId] = useState<number | null>(null)

  const dates = [
    { date: '١٣ نوفمبر ٢٠٢٥', day: 'الخميس', isActive: true },
    { date: '١٤ نوفمبر ٢٠٢٥', day: 'الجمعة', isActive: false },
    { date: '١٥ نوفمبر ٢٠٢٥', day: 'السبت', isActive: false },
    { date: '١٦ نوفمبر ٢٠٢٥', day: 'الأحد', isActive: false },
    { date: '١٧ نوفمبر ٢٠٢٥', day: 'الاثنين', isActive: false },
    { date: '١٨ نوفمبر ٢٠٢٥', day: 'الثلاثاء', isActive: false }
  ]

  const totalPassengers = parseInt(adults) + parseInt(children) + parseInt(infants)

  const trips = [
    {
      id: 1,
      trainNumber: '14',
      departure: '20:11',
      arrival: '20:58',
      departureStation: 'ABQ',
      arrivalStation: 'DMM',
      stops: 'مباشر',
      duration: '',
      economyPrice: 35.00,
      businessPrice: 50.00,
      economySaver: 45.00
    }
  ]

  return (
    <div className="select-trip-page">
      <header className="trip-header">
        <div className="trip-header-content">
          <Image
            src="https://tickets.sar.com.sa/images/vectors/SAR-Logo.svg"
            alt="SAR Logo"
            width={140}
            height={70}
            className="sar-logo"
          />
          <nav className="booking-nav">
            <div className="nav-step active">
              <div className="nav-underline active"></div>
              <span className="nav-label">اختيار الرحلة</span>
            </div>
            <div className="nav-step">
              <div className="nav-underline"></div>
              <span className="nav-label">تفاصيل الركاب</span>
            </div>
            <div className="nav-step">
              <div className="nav-underline"></div>
              <span className="nav-label">المقاعد والخدمات الإضافية</span>
            </div>
            <div className="nav-step">
              <div className="nav-underline"></div>
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
            <span style={{ fontSize: '20px', fontWeight: 'normal', color: '#999' }}>00.</span>
            <span>0</span>
          </div>

          <div style={{ textAlign: 'right'}}>
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

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              style={{
                backgroundColor: '#e8f5f7',
                border: '1px solid #d0e8ec',
                color: '#2b8a9d',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              تصنيف
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showSortMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '1.5rem',
                minWidth: '280px',
                zIndex: 1000,
                direction: 'rtl'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '1rem',
                  marginTop: 0
                }}>
                  التصنيف وفق
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span style={{ fontSize: '14px', color: '#333' }}>
                      <span style={{ color: '#666', marginLeft: '0.5rem' }}>الصباح المبكر</span>
                      <span style={{ color: '#999' }}>00:00 - 06:00</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={timeFilters.earlyMorning}
                      onChange={(e) => setTimeFilters({...timeFilters, earlyMorning: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span style={{ fontSize: '14px', color: '#333' }}>
                      <span style={{ color: '#666', marginLeft: '0.5rem' }}>صباحًا</span>
                      <span style={{ color: '#999' }}>06:00 - 12:00</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={timeFilters.morning}
                      onChange={(e) => setTimeFilters({...timeFilters, morning: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span style={{ fontSize: '14px', color: '#333' }}>
                      <span style={{ color: '#666', marginLeft: '0.5rem' }}>الظهيرة</span>
                      <span style={{ color: '#999' }}>12:00 - 18:00</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={timeFilters.afternoon}
                      onChange={(e) => setTimeFilters({...timeFilters, afternoon: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span style={{ fontSize: '14px', color: '#333' }}>
                      <span style={{ color: '#666', marginLeft: '0.5rem' }}>مساءً</span>
                      <span style={{ color: '#999' }}>18:00 - 00:00</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={timeFilters.evening}
                      onChange={(e) => setTimeFilters({...timeFilters, evening: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </label>
                </div>

                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '1rem',
                  marginTop: 0
                }}>
                  ترتيب حسب
                </h3>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '14px', color: '#333' }}>السعر</span>
                  <input
                    type="checkbox"
                    checked={sortByPrice}
                    onChange={(e) => setSortByPrice(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </label>

                <button 
                  onClick={() => setShowSortMenu(false)}
                  style={{
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
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#247282'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2b8a9d'}
                >
                  تطبيق
                </button>
              </div>
            )}
          </div>
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
              <div
                key={index}
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
              </div>
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
          {trips.map((trip) => (
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
                    <div style={{
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '1rem 1.25rem',
                      textAlign: 'center',
                      minWidth: '145px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '0.35rem', fontWeight: '500' }}>
                        الدرجة الأعمال
                      </div>
                      <div style={{ fontSize: '10px', color: '#999', marginBottom: '0.4rem' }}>من</div>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', lineHeight: '1' }}>
                        {trip.businessPrice.toFixed(2).split('.')[0]}
                        <span style={{ fontSize: '14px', fontWeight: 'normal' }}>.{trip.businessPrice.toFixed(2).split('.')[1]}</span>
                        <span style={{ fontSize: '12px', fontWeight: 'normal', marginRight: '2px' }}>ر.س</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}
                      style={{
                        backgroundColor: expandedTripId === trip.id ? '#e8f5f7' : '#f5f5f5',
                        border: expandedTripId === trip.id ? '2px solid #2b8a9d' : '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '1rem 1.25rem',
                        textAlign: 'center',
                        minWidth: '145px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        transform: expandedTripId === trip.id ? 'scale(1.02)' : 'scale(1)'
                      }}
                    >
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '0.35rem', fontWeight: '500' }}>
                        الاقتصادية التوفيرية
                      </div>
                      <div style={{ fontSize: '10px', color: '#999', marginBottom: '0.4rem' }}>من</div>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: expandedTripId === trip.id ? '#2b8a9d' : '#1a1a1a', lineHeight: '1' }}>
                        {trip.economyPrice.toFixed(2).split('.')[0]}
                        <span style={{ fontSize: '14px', fontWeight: 'normal' }}>.{trip.economyPrice.toFixed(2).split('.')[1]}</span>
                        <span style={{ fontSize: '12px', fontWeight: 'normal', marginRight: '2px' }}>ر.س</span>
                      </div>
                    </div>
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
                maxHeight: expandedTripId === trip.id ? '2000px' : '0',
                opacity: expandedTripId === trip.id ? 1 : 0,
                transition: 'all 0.5s ease-in-out',
                overflow: 'hidden'
              }}>
                {expandedTripId === trip.id && (
                  <div style={{ 
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
                              <path d="M20 6L9 17l-5-5"/>
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
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            <div style={{flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>الأمتعة المشحونة</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>غير متضمنة</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>اختيار المقعد</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>غير متضمن</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
                              <path d="M20 6L9 17l-5-5"/>
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
                              <path d="M20 6L9 17l-5-5"/>
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
                              <path d="M20 6L9 17l-5-5"/>
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

                        <button style={{
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
                              <path d="M20 6L9 17l-5-5"/>
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
                              <path d="M20 6L9 17l-5-5"/>
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
                              <path d="M20 6L9 17l-5-5"/>
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
                              <path d="M20 6L9 17l-5-5"/>
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
                              <path d="M20 6L9 17l-5-5"/>
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
                              <path d="M20 6L9 17l-5-5"/>
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

                        <button style={{
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
          ))}
        </div>
      </div>
    </div>
  )
}