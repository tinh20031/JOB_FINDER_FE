'use client'

import { useEffect, useState } from 'react'
import FullScreenLoader from '@/components/common/FullScreenLoader'
import { subscribeLoading } from '@/utils/loadingController'

export default function GlobalLoadingOverlay() {
  const [visible, setVisible] = useState(false)
  useEffect(() => subscribeLoading(setVisible), [])
  // No need to suppress during route loading; 'app/loading.jsx' is a server component now
  return <FullScreenLoader visible={visible} message="Loading..." />
}


