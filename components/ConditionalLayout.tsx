'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const isWaitingList = pathname === '/waiting-list'

  return (
    <>
      {!isDashboard && !isWaitingList && <Header />}
      {children}
      {!isDashboard && !isWaitingList && <Footer />}
    </>
  )
}

