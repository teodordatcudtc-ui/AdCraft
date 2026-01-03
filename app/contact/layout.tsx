import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact - AdLence.ai',
  description: 'Contactează echipa AdLence.ai pentru întrebări despre marketing digital în România cu AI. Suntem aici să te ajutăm cu soluții de marketing digital și generare reclame AI.',
  keywords: [
    'contact marketing digital românia',
    'contact agenție marketing AI',
    'suport marketing digital',
    'contact AdLence.ai',
    'marketing digital bucurești'
  ],
  openGraph: {
    title: 'Contact - AdLence.ai | Marketing Digital cu AI',
    description: 'Contactează echipa AdLence.ai pentru întrebări despre marketing digital în România cu AI.',
    url: '/contact',
  },
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

