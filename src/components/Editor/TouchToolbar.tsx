import { useEffect, useState } from 'react'
import styles from './TouchToolbar.module.css'

interface Props {
  onInsert: (text: string) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export default function TouchToolbar({ onInsert, onUndo, onRedo, canUndo, canRedo }: Props) {
  const [isVisible, setIsVisible] = useState(false)
  const [bottomOffset, setBottomOffset] = useState(0)

  useEffect(() => {
    // Check if it's a touch device
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (!isTouch) return

    const handleResize = () => {
      if (!window.visualViewport) return
      const viewportHeight = window.visualViewport.height
      const windowHeight = window.innerHeight
      
      // If the visual viewport is significantly smaller than the window,
      // the virtual keyboard is likely open.
      const keyboardOpen = viewportHeight < windowHeight - 100
      setIsVisible(keyboardOpen)
      
      if (keyboardOpen) {
        setBottomOffset(windowHeight - viewportHeight)
      } else {
        setBottomOffset(0)
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)
      handleResize() // Initial check
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
        window.visualViewport.removeEventListener('scroll', handleResize)
      }
    }
  }, [])

  if (!isVisible) return null

  const keys = ['Tab', '{', '}', '[', ']', '(', ')']

  return (
    <div 
      className={styles.toolbar} 
      style={{ bottom: `${bottomOffset}px` }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing focus on textarea
      onTouchStart={(e) => e.preventDefault()} 
    >
      <button className={styles.btn} onClick={onUndo} disabled={!canUndo}>⤺</button>
      <button className={styles.btn} onClick={onRedo} disabled={!canRedo}>⤼</button>
      {keys.map(key => (
        <button 
          key={key} 
          className={styles.btn} 
          onClick={() => onInsert(key === 'Tab' ? '\t' : key)}
        >
          {key}
        </button>
      ))}
    </div>
  )
}
