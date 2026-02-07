import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ClerkProvider } from "@clerk/nextjs"
import { AuthProvider } from "@/components/providers/auth-provider"
import { ProModal } from "@/components/pro-modal"
import { PromoToast } from "@/components/promo-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Zenith AI - Personal Guide",
  description: "Your personal guide for transformation - Track your SAVERS, control your vices, reach your goals",
  keywords: ["habit tracker", "SAVERS", "miracle morning", "personal development", "addiction recovery"],
  authors: [{ name: "Zenith AI" }],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen bg-gray-50`}>
          <AuthProvider>
            <ProModal />
            <PromoToast />
            {children}
          </AuthProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
