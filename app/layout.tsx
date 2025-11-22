import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'AdCraft AI - AI-Powered Ad Generation',
  description: 'Generează reclame optimizate și imagini pentru produsele tale cu AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}

