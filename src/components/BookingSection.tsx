'use client'

import { useState } from 'react'

const stations = {
  'الهفوف': 'HAF',
  'الدمام': 'DMM',
  'الرياض': 'RUH',
  'القصيم': 'QSM',
  'حائل': 'HAI',
}

const trips = [
  { id: 1, departure: '17:41', arrival: '19:20', duration: '1 توقف', durationMinutes: '39 د', price: 55, class: 'اقتصادية', businessPrice: 95 },
  { id: 2, departure: '15:30', arrival: '17:10', duration: '1 توقف', durationMinutes: '40 د', price: 55, class: 'اقتصادية', businessPrice: 95 },
  { id: 3, departure: '12:20', arrival: '14:05', duration: '1 توقف', durationMinutes: '45 د', price: 55, class: 'اقتصادية', businessPrice: 95 },
]

const dates = [
  { day: '13', dayName: 'الخميس', date: 'نوفمبر 2025', isActive: true },
  { day: '14', dayName: 'الجمعة', date: 'نوفمبر 2025', isActive: false },
  { day: '15', dayName: 'السبت', date: 'نوفمبر 2025', isActive: false },
  { day: '16', dayName: 'الأحد', date: 'نوفمبر 2025', isActive: false },
  { day: '17', dayName: 'الاثنين', date: 'نوفمبر 2025', isActive: false },
  { day: '18', dayName: 'الثلاثاء', date: 'نوفمبر 2025', isActive: false },
]

export default function SARBooking() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null)

  const tabs = ['اختيار الرحلة', 'تفاصيل الركاب', 'المقاعد والخدمات الإضافية', 'الدفع']

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif', direction: 'rtl' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', padding: '1rem 2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00758f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>SAR</span>
              <div style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>
                <div>السكك الحديدية</div>
                <div>SAUDI ARABIA RAILWAYS</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Tabs */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex' }}>
          {tabs.map((tab, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                padding: '1.5rem 1rem',
                textAlign: 'center',
                borderBottom: index === activeTab ? '4px solid #00758f' : '4px solid transparent',
                color: index === activeTab ? '#00758f' : '#999',
                fontWeight: index === activeTab ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 2rem' }}>
        {/* Trip Info Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                <span>HAF</span>
                <span style={{ fontSize: '1.2rem', color: '#666' }}>←</span>
                <span>DMM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666' }}>
                <i className="fas fa-calendar" style={{ fontSize: '0.9rem' }}></i>
                <span>الخميس، 13 نوفمبر 2025</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666' }}>
                <i className="fas fa-user" style={{ fontSize: '0.9rem' }}></i>
                <span>1 بالغ</span>
              </div>
            </div>
            <button style={{ 
              backgroundColor: 'transparent', 
              border: '1px solid #00758f', 
              color: '#00758f', 
              padding: '0.5rem 1.5rem', 
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <i className="fas fa-edit"></i>
              تعديل البحث
            </button>
          </div>
          <div style={{ fontSize: '1.5rem', textAlign: 'left' }}>
            <span style={{ fontWeight: 'bold' }}>0</span>
            <span style={{ fontSize: '1rem', color: '#666' }}>.00 ر.س.</span>
          </div>
        </div>

        {/* Date Selector */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              color: '#00758f',
              padding: '0.5rem'
            }}>
              <i className="fas fa-chevron-right"></i>
            </button>
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
              {dates.map((date, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    backgroundColor: date.isActive ? '#00758f' : 'transparent',
                    color: date.isActive ? 'white' : '#333',
                    cursor: 'pointer',
                    textAlign: 'center',
                    minWidth: '120px',
                    border: date.isActive ? 'none' : '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{date.day} {date.date.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{date.dayName}</div>
                </div>
              ))}
            </div>
            <button style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              color: '#00758f',
              padding: '0.5rem'
            }}>
              <i className="fas fa-chevron-left"></i>
            </button>
          </div>
        </div>

        {/* Trips Section */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
          <button style={{
            backgroundColor: '#e8f4f8',
            border: '1px solid #00758f',
            color: '#00758f',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}>
            <i className="fas fa-filter"></i>
            تصنيف
            <i className="fas fa-chevron-down" style={{ fontSize: '0.8rem' }}></i>
          </button>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>اختيار رحلة الذهاب</h2>
        </div>

        {/* Trips List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {trips.map((trip) => (
            <div
              key={trip.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                border: selectedTrip === trip.id ? '2px solid #00758f' : '2px solid transparent',
                transition: 'all 0.3s'
              }}
              onClick={() => setSelectedTrip(trip.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Trip Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flex: 1 }}>
                  {/* Train Number */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>رقم القطار</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>12</div>
                  </div>

                  {/* Time and Stations */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{trip.departure}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>HAF</div>
                    </div>

                    <div style={{ flex: 1, position: 'relative' }}>
                      <div style={{
                        height: '2px',
                        backgroundColor: '#00758f',
                        position: 'relative',
                        margin: '0 1rem'
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: 'white',
                          padding: '0 0.5rem'
                        }}>
                          <i className="fas fa-train" style={{ color: '#00758f', fontSize: '1.2rem' }}></i>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                        <div>{trip.duration}</div>
                        <div>{trip.durationMinutes}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{trip.arrival}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>DMM</div>
                    </div>
                  </div>
                </div>

                {/* Pricing Cards */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{
                    backgroundColor: '#e8f4f8',
                    border: '1px solid #00758f',
                    borderRadius: '8px',
                    padding: '1rem 1.5rem',
                    textAlign: 'center',
                    minWidth: '150px'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>الدرجة الاقتصادية</div>
                    <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.5rem' }}>من</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00758f' }}>
                      {trip.price}<span style={{ fontSize: '0.9rem' }}>.00</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}> ر.س</span>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1rem 1.5rem',
                    textAlign: 'center',
                    minWidth: '150px'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>الدرجة الأعمال</div>
                    <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.5rem' }}>من</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                      {trip.businessPrice}<span style={{ fontSize: '0.9rem' }}>.00</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}> ر.س</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FontAwesome Icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  )
}