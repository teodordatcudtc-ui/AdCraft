'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MouseTrail from '@/components/MouseTrail'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const isWaitingList = pathname === '/waiting-list'

  return (
    <>
      {!isDashboard && !isWaitingList && <Header />}
      {!isDashboard && !isWaitingList && <MouseTrail />}
      {children}
      {!isDashboard && !isWaitingList && <Footer />}
    </>
  )
}

