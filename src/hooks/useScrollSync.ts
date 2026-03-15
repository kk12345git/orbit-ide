import { useEffect, useRef } from 'react'

/**
 * Syncs the scroll position of a textarea to a pre overlay.
 * Handles both standard scroll events (desktop/Android)
 * and iOS Safari's visualViewport scroll.
 */
export function useScrollSync(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  preRef: React.RefObject<HTMLPreElement>
) {
  const rafId = useRef<number>(0)

  useEffect(() => {
    const textarea = textareaRef.current
    const pre = preRef.current
    if (!textarea || !pre) return

    const sync = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        pre.scrollTop = textarea.scrollTop
        pre.scrollLeft = textarea.scrollLeft
      })
    }

    textarea.addEventListener('scroll', sync, { passive: true })

    // iOS Safari: the element doesn't fire scroll — visualViewport does
    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('scroll', sync, { passive: true })
    }

    return () => {
      textarea.removeEventListener('scroll', sync)
      if (vv) vv.removeEventListener('scroll', sync)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [textareaRef, preRef])
}
