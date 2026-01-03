import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - AdLence.ai',
  description: 'Panoul de control AdLence.ai pentru marketing digital cu AI. Gestionează creditele, generează reclame, copywriting, imagini și strategii de marketing.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Dashboard layout nu mai include html/body - folosește root layout
  return <>{children}</>
}

