import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Despre Noi - AdLence.ai',
  description: 'Află mai multe despre AdLence.ai - platforma de marketing digital în România cu AI. Echipa noastră transformă modul în care se creează reclame în era digitală.',
  keywords: [
    'despre AdLence.ai',
    'echipa marketing digital',
    'companie marketing AI românia',
    'istoric AdLence.ai',
    'misiune marketing digital',
    'valori marketing digital'
  ],
  openGraph: {
    title: 'Despre Noi - AdLence.ai | Marketing Digital cu AI',
    description: 'Află mai multe despre AdLence.ai - platforma de marketing digital în România cu AI.',
    url: '/despre',
  },
  alternates: {
    canonical: '/despre',
  },
}

export default function DespreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

