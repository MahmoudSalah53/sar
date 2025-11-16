export default function PaymentSuccessPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f3f4f6',
      direction: 'rtl'
    }}>
      <div style={{
        background: 'white',
        padding: '2.5rem 3rem',
        borderRadius: 16,
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        textAlign: 'center',
        maxWidth: 480,
        width: '100%'
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '999px',
          background: '#d1fae5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l2.5 2.5L16 9" />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, marginBottom: '0.75rem', color: '#111827' }}>تم الدفع بنجاح</h1>
        <p style={{ fontSize: 14, color: '#4b5563', marginBottom: '1.75rem' }}>
          تم تأكيد عملية الدفع الخاصة بك. ستصلك تفاصيل الحجز على البريد الإلكتروني المسجّل.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.75rem',
            borderRadius: 999,
            background: '#2b8a9d',
            color: 'white',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          العودة إلى الصفحة الرئيسية
        </a>
      </div>
    </div>
  )
}


