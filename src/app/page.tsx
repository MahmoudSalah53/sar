import Header from '@/components/Header'
import Hero from '@/components/Hero'
import BookingSection from '@/components/BookingSection'
import ServicesSection from '@/components/ServicesSection'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <BookingSection />
      <ServicesSection />
      <div style={{ height: '100px' }}></div>
    </main>
  )
}

