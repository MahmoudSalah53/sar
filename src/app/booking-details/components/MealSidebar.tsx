'use client'

import Image from 'next/image'
import { MEALS } from '../constants'
import type { PassengerForm, Extras } from '../types'

interface MealSidebarProps {
  isOpen: boolean
  isClosing: boolean
  onClose: () => void
  form: PassengerForm
  selectedMeals: { [key: number]: number }
  setSelectedMeals: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>
  mealsTotal: number
  setExtras: React.Dispatch<React.SetStateAction<Extras>>
}

export default function MealSidebar({
  isOpen,
  isClosing,
  onClose,
  form,
  selectedMeals,
  setSelectedMeals,
  mealsTotal,
  setExtras
}: MealSidebarProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    setExtras(prev => ({ ...prev, meal: mealsTotal > 0 }))
    window.localStorage.setItem('selectedMeals', JSON.stringify(selectedMeals))
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
            الوجبة
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

        {/* Info Banner */}
        <div style={{
          margin: '1.5rem',
          padding: '1rem',
          backgroundColor: '#e8f5f7',
          borderRadius: '8px',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8a9d" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p style={{ margin: 0, fontSize: '13px', color: '#2b8a9d', lineHeight: '1.5' }}>
            الوجبات التي تم طلبها قبل أقل من 24 ساعة من مغادرة القطار قد لا تكون متاحة. إذا كانت الوجبة التي اخترتها غير متوفرة على متن القطار، فسوف نقدم لك خيار بديل بنفس القيمة.
          </p>
        </div>

        {/* Meals List */}
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {MEALS.map((meal) => {
              const quantity = selectedMeals[meal.id] || 0
              return (
                <div
                  key={meal.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: 'white'
                  }}
                >
                  {/* Meal Image */}
                  <div style={{
                    width: '100%',
                    height: '280px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Image
                      src="/food.jpg"
                      alt={meal.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {meal.price.toFixed(2)} ر.س
                    </div>
                  </div>

                  {/* Meal Details */}
                  <div style={{ padding: '1rem' }}>
                    <h4 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1a1a1a'
                    }}>
                      وجبة خفيفة مجمعة
                    </h4>
                    <p style={{
                      margin: '0 0 1rem 0',
                      fontSize: '12px',
                      color: '#666',
                      lineHeight: '1.4'
                    }}>
                      {meal.name}
                    </p>

                    {/* Quantity Selector */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}>
                      <button
                        onClick={() => {
                          setSelectedMeals(prev => ({
                            ...prev,
                            [meal.id]: Math.max(0, (prev[meal.id] || 0) - 1)
                          }))
                        }}
                        disabled={quantity === 0}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          background: quantity === 0 ? '#f5f5f5' : 'white',
                          color: quantity === 0 ? '#ccc' : '#2b8a9d',
                          cursor: quantity === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}
                      >
                        −
                      </button>
                      <span style={{
                        minWidth: '30px',
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedMeals(prev => ({
                            ...prev,
                            [meal.id]: (prev[meal.id] || 0) + 1
                          }))
                        }}
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
                {mealsTotal.toFixed(2).split('.')[0]}
              </span>
              <span style={{ 
                fontSize: '20px',
                color: '#999',
                fontWeight: '400',
                lineHeight: '1'
              }}>
                {mealsTotal.toFixed(2).split('.')[1]}.
              </span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                المبلغ الإجمالي = {Object.values(selectedMeals).reduce((sum, qty) => sum + qty, 0)} × الوجبات
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                السعر مشمول جميع الوجبات
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

