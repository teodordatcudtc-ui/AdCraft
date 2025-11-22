import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Dashboard - AdCraft AI',
  description: 'Panoul de control AdCraft AI',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body className="bg-[#0a0a0f] text-white">
        {children}
      </body>
    </html>
  )
}

