'use client'

import Image from 'next/image'
import type { PassengerForm, Extras } from '../types'

interface LoungeSidebarProps {
  isOpen: boolean
  isClosing: boolean
  onClose: () => void
  form: PassengerForm
  selectedLounge: number
  setSelectedLounge: React.Dispatch<React.SetStateAction<number>>
  loungeTotal: number
  setExtras: React.Dispatch<React.SetStateAction<Extras>>
}

const LOUNGE_PRICE = 30.00

export default function LoungeSidebar({
  isOpen,
  isClosing,
  onClose,
  form,
  selectedLounge,
  setSelectedLounge,
  loungeTotal,
  setExtras
}: LoungeSidebarProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    setExtras(prev => ({ ...prev, lounge: selectedLounge > 0 }))
    window.localStorage.setItem('selectedLounge', JSON.stringify(selectedLounge))
    onClose()
  }

  const handleAdd = () => {
    setSelectedLounge(1)
  }

  const handleDelete = () => {
    setSelectedLounge(0)
  }

  const passengerName = form.firstName && form.lastName 
    ? `${form.firstName} ${form.lastName}` 
    : 'محمود صلاح منصور'

  const hasLounge = selectedLounge > 0

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
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2b8a9d',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(43, 138, 157, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
            صالة الأعمال
          </h2>
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '14px', color: '#666' }}>
            {passengerName}
          </p>
        </div>

        {/* Lounge Image with Overlay */}
        <div style={{ position: 'relative', width: '100%', height: '450px', overflow: 'hidden' }}>
          <Image
            src="/work.jpeg"
            alt="صالة الأعمال"
            fill
            style={{ objectFit: 'cover' }}
            unoptimized
            priority
          />
          
          {/* Dark Overlay Banner */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(31, 41, 55, 0.95)',
            padding: '1.5rem',
            color: 'white'
          }}>
            <p style={{
              margin: '0 0 0.75rem 0',
              fontSize: '16px',
              fontWeight: '600',
              lineHeight: '1.6'
            }}>
              استمتع بالاسترخاء قبل رحلتك في صالة الأعمال بالمحطة
            </p>
            <p style={{
              margin: '0 0 0.75rem 0',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              جميع الصالات تحتوي ضيافات الطعام والمشروبات.
            </p>
            <p style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              استمتع بخصم ٤٠% عند الشراء مع التذكرة
            </p>
          </div>
        </div>

        {/* Price Section */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#666', marginBottom: '0.5rem' }}>
                سعر الدخول لصالة الأعمال لكل راكب
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'baseline', 
                gap: '4px',
                flexDirection: 'row-reverse'
              }}>
                <span style={{ fontSize: '14px', color: '#666', fontWeight: '400' }}>ر.س</span>
                <span style={{ 
                  fontSize: '24px',
                  color: '#1a1a1a',
                  fontWeight: '700',
                  lineHeight: '1'
                }}>
                  {LOUNGE_PRICE.toFixed(2).split('.')[0]}
                </span>
                <span style={{ 
                  fontSize: '16px',
                  color: '#666',
                  fontWeight: '400',
                  lineHeight: '1'
                }}>
                  {LOUNGE_PRICE.toFixed(2).split('.')[1]}.
                </span>
              </div>
            </div>
          </div>

          {/* Add/Delete Button */}
          {!hasLounge ? (
            <button
              onClick={handleAdd}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#f3f4f6',
                color: '#1a1a1a',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
            >
              إضافة لـ {passengerName}
            </button>
          ) : (
            <button
              onClick={handleDelete}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#dc2626',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626'
              }}
            >
              حذف لـ {passengerName}
            </button>
          )}
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
                {loungeTotal.toFixed(2).split('.')[0]}
              </span>
              <span style={{ 
                fontSize: '20px',
                color: '#999',
                fontWeight: '400',
                lineHeight: '1'
              }}>
                {loungeTotal.toFixed(2).split('.')[1]}.
              </span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                المبلغ الإجمالي = {selectedLounge > 0 ? `X${selectedLounge} صالة درجة الأعمال` : '0 صالة'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

