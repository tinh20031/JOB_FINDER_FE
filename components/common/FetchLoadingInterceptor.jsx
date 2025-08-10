'use client'

import { useEffect } from 'react'
import { startLoading, stopLoading } from '@/utils/loadingController'

export default function FetchLoadingInterceptor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.fetch) return
    const originalFetch = window.fetch.bind(window)
    window.fetch = (input, init) => {
      const url = typeof input === 'string' ? input : (input && input.url) || ''
      // Skip long-lived connections (EventSource/WebSocket polyfills) or analytics
      const skip = /notificationHub|sockjs|socket|ws|wss|eventsource|analytics|sse/i.test(url)
      const shouldTrack = !skip
      if (shouldTrack) startLoading()
      try {
        const p = originalFetch(input, init)
        return p
          .then((res) => {
            if (shouldTrack) stopLoading()
            return res
          })
          .catch((err) => {
            if (shouldTrack) stopLoading()
            throw err
          })
      } catch (err) {
        if (shouldTrack) stopLoading()
        throw err
      }
    }

    return () => {
      // restore if needed
      window.fetch = originalFetch
    }
  }, [])

  return null
}


