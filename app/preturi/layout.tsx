import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prețuri - AdLence.ai',
  description: 'Pachete de prețuri pentru marketing digital cu AI în România. Alege pachetul perfect de credite pentru generare reclame AI, copywriting, imagini și strategii de marketing.',
  keywords: [
    'prețuri marketing digital AI',
    'pachete marketing digital românia',
    'cost marketing digital cu AI',
    'prețuri generare reclame AI',
    'abonament marketing digital',
    'credite marketing AI'
  ],
  openGraph: {
    title: 'Prețuri - AdLence.ai | Marketing Digital cu AI',
    description: 'Pachete de prețuri pentru marketing digital cu AI în România. Alege pachetul perfect de credite pentru generare reclame AI.',
    url: '/preturi',
  },
  alternates: {
    canonical: '/preturi',
  },
}

export default function PreturiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

