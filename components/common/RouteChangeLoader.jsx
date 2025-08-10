'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import FullScreenLoader from '@/components/common/FullScreenLoader'


export default function RouteChangeLoader({ minDurationMs = 220, message = 'Loading...' }) {
  const pathname = usePathname()
  const search = useSearchParams()
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    // Show for a brief moment on any URL change (path or query)
    setVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), minDurationMs)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search?.toString()])

  return <FullScreenLoader visible={visible} message={message} />
}


