import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: {
    default: 'AdLence.ai - Marketing Digital în România cu AI | Generare Reclame AI',
    template: '%s | AdLence.ai - Marketing Digital cu AI'
  },
  description: 'Platformă avansată de marketing digital în România cu AI. Generează reclame, copywriting, imagini și strategii de marketing cu inteligență artificială. Soluții complete pentru business-ul tău.',
  keywords: [
    'marketing digital românia',
    'marketing digital cu AI',
    'generare reclame AI',
    'copywriting AI românia',
    'inteligență artificială marketing',
    'platformă marketing digital',
    'reclame generate AI',
    'marketing automatizat',
    'AI pentru business',
    'soluții marketing AI',
    'agenție marketing digital',
    'marketing digital bucurești',
    'tool-uri marketing AI',
    'strategie marketing digital',
    'conținut marketing AI'
  ],
  authors: [{ name: 'AdLence.ai' }],
  creator: 'AdLence.ai',
  publisher: 'AdLence.ai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://adlence.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: '/',
    siteName: 'AdLence.ai',
    title: 'AdLence.ai - Marketing Digital în România cu AI',
    description: 'Platformă avansată de marketing digital în România cu AI. Generează reclame, copywriting, imagini și strategii de marketing cu inteligență artificială.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AdLence.ai - Marketing Digital cu AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AdLence.ai - Marketing Digital în România cu AI',
    description: 'Platformă avansată de marketing digital în România cu AI. Generează reclame, copywriting, imagini și strategii de marketing cu inteligență artificială.',
    images: ['/og-image.jpg'],
    creator: '@adlenceai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://adlence.ai'
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AdLence.ai',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Platformă avansată de marketing digital în România cu AI. Generează reclame, copywriting, imagini și strategii de marketing cu inteligență artificială.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'București',
      addressCountry: 'RO',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'teodordatcu.dtc@gmail.com',
      telephone: '+40-762-444-577',
      contactType: 'Customer Service',
    },
    sameAs: [
      'https://www.instagram.com/adlence.ai/',
      'https://www.tiktok.com/@adlence.ai',
      'https://www.facebook.com/profile.php?id=61580539661853',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AdLence.ai',
    url: siteUrl,
    description: 'Platformă avansată de marketing digital în România cu AI',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AdLence.ai',
    applicationCategory: 'MarketingApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    description: 'Platformă de marketing digital cu AI pentru generare reclame, copywriting, imagini și strategii de marketing în România',
  }

  return (
    <html lang="ro">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
      </head>
      <body>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <Analytics />
      </body>
    </html>
  )
}

