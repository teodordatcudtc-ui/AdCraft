import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - AdLence.ai',
  description: 'Panoul de control AdLence.ai',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Dashboard layout nu mai include html/body - folosește root layout
  return <>{children}</>
}

