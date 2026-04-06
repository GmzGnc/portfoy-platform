import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portföy Seçim Platformu',
  description: 'Ürün portföy değerlendirme ve aday analiz platformu',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
