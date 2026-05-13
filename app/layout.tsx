import type { Metadata } from 'next'
import { BRAND_DESCRIPTION, BRAND_TITLE } from './brand-media'
import './globals.css'

function resolveMetadataBase() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!configuredSiteUrl) {
    return new URL('http://localhost:3000')
  }

  return new URL(
    configuredSiteUrl.startsWith('http')
      ? configuredSiteUrl
      : `https://${configuredSiteUrl}`,
  )
}

const metadataBase = resolveMetadataBase()

export const metadata: Metadata = {
  title: BRAND_TITLE,
  description: BRAND_DESCRIPTION,
  applicationName: 'Contoso Command Center',
  metadataBase,
  openGraph: {
    title: BRAND_TITLE,
    description: BRAND_DESCRIPTION,
    type: 'website',
    siteName: 'Contoso Command Center',
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND_TITLE,
    description: BRAND_DESCRIPTION,
  },
}

export const viewport = {
  themeColor: '#0a0f1e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className="font-sans antialiased ambient-bg min-h-screen">
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
