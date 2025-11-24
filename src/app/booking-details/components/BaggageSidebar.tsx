'use client'

import { BAGGAGE_OPTIONS } from '../constants'
import type { PassengerForm, Extras } from '../types'

interface BaggageSidebarProps {
  isOpen: boolean
  isClosing: boolean
  onClose: () => void
  form: PassengerForm
  selectedBaggage: { [key: number]: number }
  setSelectedBaggage: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>
  baggageTotal: number
  setExtras: React.Dispatch<React.SetStateAction<Extras>>
}

export default function BaggageSidebar({
  isOpen,
  isClosing,
  onClose,
  form,
  selectedBaggage,
  setSelectedBaggage,
  baggageTotal,
  setExtras
}: BaggageSidebarProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    setExtras(prev => ({ ...prev, baggage: baggageTotal > 0 }))
    window.localStorage.setItem('selectedBaggage', JSON.stringify(selectedBaggage))
    onClose()
  }

  const passengerName = form.firstName && form.lastName 
    ? `${form.firstName} ${form.lastName}` 
    : 'محمود صلاح منصور'

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          animation: isClosing ? 'fadeOut 0.3s ease-out' : 'fadeIn 0.3s ease-out',
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
          transform: isClosing ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: isClosing ? 'none' : 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
            أمتعة السفر
          </h2>
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '14px', color: '#666' }}>
            {passengerName}
          </p>
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
            اختيار {passengerName}
          </button>
        </div>

        {/* Allowed Baggage Info */}
        <div style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>
            الوزن المسموح به للأمتعة لكل راكب
          </h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
              الأمتعة المحمولة
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="1.5">
                  <rect x="6" y="7" width="12" height="12" rx="2" fill="#1f2937" stroke="none" />
                  <rect x="9" y="5" width="6" height="2" rx="1" fill="#1f2937" stroke="none" />
                </svg>
                <span style={{ fontSize: '14px', color: '#666' }}>1 X حقيبة يد (10 كجم)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="1.5">
                  <rect x="6" y="7" width="12" height="12" rx="2" fill="#1f2937" stroke="none" />
                  <rect x="9" y="5" width="6" height="2" rx="1" fill="#1f2937" stroke="none" />
                </svg>
                <span style={{ fontSize: '14px', color: '#666' }}>1 X حقيبة متوسطة (25 كجم)</span>
              </div>
            </div>
          </div>

          <p style={{ margin: '1rem 0', fontSize: '14px', color: '#666' }}>
            الأمتعة المشحونة المسموح بها تعتمد نوع تذكرتك للمزيد
          </p>
        </div>

        {/* Additional Baggage Prompt */}
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#2b8a9d', lineHeight: '1.6' }}>
            هل تحتاج إلى شحن المزيد من الأمتعة ؟ يمكنك إضافة أمتعة ابتداءً من 60.00 ريال.
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: '#2b8a9d', lineHeight: '1.6' }}>
            يمكنك توفير حتي ٢٩% من أشعار المحطات خلال الشراء أونلاين .
          </p>
        </div>

        {/* Baggage Options */}
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {BAGGAGE_OPTIONS.map((baggage) => {
              const quantity = selectedBaggage[baggage.id] || 0
              return (
                <div
                  key={baggage.id}
                  style={{
                    border: 'none',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#f3f4f6',
                    padding: '1.5rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  {/* الوزن والأيقونة */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: 'row-reverse' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="6" width="14" height="14" rx="2" fill="#1f2937" />
                      <rect x="8" y="4" width="8" height="2" rx="1" fill="#1f2937" />
                      <path d="M9 19L15 19" stroke="#666" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                        كبيرة
                      </div>
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>
                        kg {baggage.weight}
                      </div>
                    </div>
                  </div>

                  {/* السعر */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'baseline', 
                    gap: '2px',
                    flexDirection: 'row-reverse'
                  }}>
                    <span style={{ fontSize: '14px', color: '#666', fontWeight: '400' }}>ر.س</span>
                    <span style={{ 
                      fontSize: '28px',
                      color: '#1a1a1a',
                      fontWeight: '700',
                      lineHeight: '1'
                    }}>
                      {baggage.price.toFixed(2).split('.')[0]}
                    </span>
                    <span style={{ 
                      fontSize: '16px',
                      color: '#666',
                      fontWeight: '400',
                      lineHeight: '1'
                    }}>
                      {baggage.price.toFixed(2).split('.')[1]}.
                    </span>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    width: '100%'
                  }}>
                    <button
                      onClick={() => {
                        setSelectedBaggage(prev => ({
                          ...prev,
                          [baggage.id]: Math.max(0, (prev[baggage.id] || 0) - 1)
                        }))
                      }}
                      disabled={quantity === 0}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: 'none',
                        background: quantity === 0 ? '#d1d5db' : '#e0f2f5',
                        color: quantity === 0 ? '#9ca3af' : '#2b8a9d',
                        cursor: quantity === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                    >
                      −
                    </button>
                    <span style={{
                      minWidth: '40px',
                      textAlign: 'center',
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#1a1a1a'
                    }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedBaggage(prev => ({
                          ...prev,
                          [baggage.id]: (prev[baggage.id] || 0) + 1
                        }))
                      }}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#2b8a9d',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#247282'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2b8a9d'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
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
          <button
            onClick={handleConfirm}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '6px',
              backgroundColor: '#2b8a9d',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'background-color 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#247282'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2b8a9d'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            تأكيد
          </button>

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
                {baggageTotal.toFixed(2).split('.')[0]}
              </span>
              <span style={{ 
                fontSize: '20px',
                color: '#999',
                fontWeight: '400',
                lineHeight: '1'
              }}>
                {baggageTotal.toFixed(2).split('.')[1]}.
              </span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                المبلغ الإجمالي = {Object.values(selectedBaggage).reduce((sum, qty) => sum + qty, 0)} × الأمتعة المشحونة
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                السعر مشمول جميع الأمتعة
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

