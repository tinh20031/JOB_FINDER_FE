import FullScreenLoader from '@/components/common/FullScreenLoader'

export default function Loading() {
  // Server Component (no 'use client') so it streams immediately during route change
  return <FullScreenLoader message="Loading..." />
}


