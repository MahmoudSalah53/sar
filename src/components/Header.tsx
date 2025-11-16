'use client'

export default function Header() {
  return (
    <header>
      <div className="logo">
        <div className="logo-icon">SAR</div>
        <div className="logo-text">
          <div className="logo-text-ar">الخطوط الحديدية السعودية</div>
          <div className="logo-text-en">SAUDI ARABIA RAILWAYS</div>
        </div>
      </div>
      <nav>
        <a href="#">عن سار</a>
        <a href="#">ساهر مع سار</a>
        <a href="#">شحن</a>
        <a href="#">التطوير العقاري</a>
        <a href="#">اساسيات</a>
        <a href="#">تسجيل الدخول</a>
        <span className="nav-separator"></span>
        <a href="#">إنشاء حساب جديد</a>
        <a href="#" className="lang-switch">
          <i className="fas fa-globe"></i>
          <span>En</span>
        </a>
      </nav>
    </header>
  )
}

