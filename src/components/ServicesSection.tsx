import Image from 'next/image'

const services = [
  {
    image:
      'https://www.sar.com.sa/static/4d9ffb6b8f84e7edeb9e6bbef6d96dcf/80e2b/SAR_Hero_Passengers.webp',
    title: 'الركاب',
    description:
      'استمتع بتجربة سفر فريدة ومريحة على متن قطاراتنا الحديثة المجهزة بأحدث وسائل الراحة والأمان.',
  },
  {
    image:
      'https://www.sar.com.sa/static/0fccb8e8e9e2e0ac7f4e10c48eeffd1b/80e2b/SAR_Hero_Real_Estate.webp',
    title: 'التطوير العقاري',
    description:
      'نساهم في تطوير البنية التحتية والمشاريع العقارية الحديثة في جميع أنحاء المملكة.',
  },
  {
    image:
      'https://www.sar.com.sa/static/0c0219b43445424899f150a93d85db4b/80e2b/ac_banner_ar.webp',
    title: 'شحن البضائع',
    description:
      'خدمات شحن متطورة وآمنة لنقل البضائع والسيارات عبر شبكتنا الواسعة من السكك الحديدية.',
  },
  {
    image:
      'https://www.sar.com.sa/static/af3a25f9f71c1dc57fbe0e01cff58595/80e2b/SAR_Hero_Freight.webp',
    title: 'الخدمات اللوجستية',
    description:
      'حلول لوجستية متكاملة لدعم الشركات والأفراد في نقل احتياجاتهم بكفاءة عالية.',
  },
]

export default function ServicesSection() {
  return (
    <section className="services-section">
      <h2 className="services-title">ماذا نقدم</h2>
      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <Image
              src={service.image}
              alt={service.title}
              width={600}
              height={300}
              style={{ width: '100%', height: '300px', objectFit: 'cover' }}
            />
            <div className="service-card-content">
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-description">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

