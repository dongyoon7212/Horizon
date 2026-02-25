import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Horizon — AI Trend Dashboard',
  description: 'AI trends rise and set on the Horizon. Track rising and falling AI models, keywords, and GitHub repos.',
  openGraph: {
    title: 'Horizon — AI Trend Dashboard',
    description: 'AI trends rise and set on the Horizon.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen" style={{ background: 'var(--bg-deep)' }}>
        {/* 네비바 */}
        <Navbar />

        {/* 메인 콘텐츠 */}
        <main className="relative z-10 pt-20">
          {children}
        </main>

        {/* 푸터 */}
        <Footer />
      </body>
    </html>
  )
}
