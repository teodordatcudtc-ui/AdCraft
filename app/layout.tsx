import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'AdLence.ai - AI-Powered Ad Generation',
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
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <Analytics />
      </body>
    </html>
  )
}

