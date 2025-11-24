import { useState } from 'react'
import { SIDEBAR_ANIMATION_DURATION } from '../constants'

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const open = () => setIsOpen(true)
  
  const close = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, SIDEBAR_ANIMATION_DURATION)
  }

  return { isOpen, isClosing, open, close }
}

