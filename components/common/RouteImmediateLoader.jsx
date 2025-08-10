'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { startLoading, stopLoading } from '@/utils/loadingController'

function getAnchorFromEvent(event) {
  let el = event.target
  while (el && el !== document.body) {
    if (el.tagName === 'A' && el.href) return el
    el = el.parentElement
  }
  return null
}

export default function RouteImmediateLoader() {
  const pathname = usePathname()
  const search = useSearchParams()
  const pendingRef = useRef(false)
  const startedRef = useRef(false)

  // Start loader immediately on in-app link clicks or history changes
  useEffect(() => {
    const onClickCapture = (e) => {
      if (e.defaultPrevented) return
      // ignore modified clicks
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = getAnchorFromEvent(e)
      if (!a) return
      // only same-origin, in-app links
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return
      if (a.target && a.target !== '_self') return
      // if it's the same URL, ignore
      if (url.pathname + url.search + url.hash === location.pathname + location.search + location.hash) return
      if (!startedRef.current) {
        startedRef.current = true
        pendingRef.current = true
        startLoading()
      }
    }

    const origPush = history.pushState
    const origReplace = history.replaceState
    history.pushState = function (...args) {
      if (!startedRef.current) {
        startedRef.current = true
        pendingRef.current = true
        startLoading()
      }
      return origPush.apply(this, args)
    }
    history.replaceState = function (...args) {
      if (!startedRef.current) {
        startedRef.current = true
        pendingRef.current = true
        startLoading()
      }
      return origReplace.apply(this, args)
    }

    window.addEventListener('click', onClickCapture, true)
    window.addEventListener('popstate', () => {
      if (!startedRef.current) {
        startedRef.current = true
        pendingRef.current = true
        startLoading()
      }
    })

    return () => {
      window.removeEventListener('click', onClickCapture, true)
      history.pushState = origPush
      history.replaceState = origReplace
    }
  }, [])

  // When the URL actually changes, release our immediate lock
  useEffect(() => {
    if (!pendingRef.current) return
    pendingRef.current = false
    // Small delay to allow fetch interceptor to take over
    const t = setTimeout(() => {
      startedRef.current = false
      stopLoading()
    }, 50)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search?.toString()])

  return null
}


