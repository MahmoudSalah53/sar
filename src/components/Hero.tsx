'use client'

import { useState } from 'react'

const slides = [
  {
    title: 'جرب القطار',
    subtitle: 'جرب متعة السفر',
  },
  {
    title: 'رحلات مريحة',
    subtitle: 'استمتع بتجربة فريدة',
  },
  {
    title: 'وجهات متعددة',
    subtitle: 'اكتشف المملكة',
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <button className="carousel-control prev" onClick={handlePrev}>
        <i className="fas fa-chevron-right"></i>
      </button>
      <button className="carousel-control next" onClick={handleNext}>
        <i className="fas fa-chevron-left"></i>
      </button>

      <div className="hero-content">
        <h1 className="hero-title">{slides[currentSlide].title}</h1>
        <p className="hero-subtitle">{slides[currentSlide].subtitle}</p>
        <button className="hero-btn">للمزيد</button>
      </div>
    </section>
  )
}

