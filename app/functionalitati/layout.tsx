import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Funcționalități - AdLence.ai',
  description: 'Descoperă toate funcționalitățile platformei AdLence.ai pentru marketing digital în România cu AI: generare reclame, copywriting, imagini, analiză de piață și planificare conținut.',
  keywords: [
    'funcționalități marketing digital AI',
    'tool-uri marketing digital',
    'caracteristici platformă marketing',
    'features marketing digital românia',
    'capabilități AI marketing',
    'instrumente marketing digital'
  ],
  openGraph: {
    title: 'Funcționalități - AdLence.ai | Marketing Digital cu AI',
    description: 'Descoperă toate funcționalitățile platformei AdLence.ai pentru marketing digital în România cu AI.',
    url: '/functionalitati',
  },
  alternates: {
    canonical: '/functionalitati',
  },
}

export default function FunctionalitatiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

