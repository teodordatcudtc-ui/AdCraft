import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - AdCraft AI',
  description: 'Panoul de control AdCraft AI',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Dashboard layout nu mai include html/body - folosește root layout
  return <>{children}</>
}

