import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ClerkProvider } from "@clerk/nextjs"
import { AuthProvider } from "@/components/providers/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Zenith AI - Personal Guide",
  description: "Your personal guide for transformation - Track your SAVERS, control your vices, reach your goals",
  keywords: ["habit tracker", "SAVERS", "miracle morning", "personal development", "addiction recovery"],
  authors: [{ name: "Zenith AI" }],
  viewport: "width=device-width, initial-scale=1",
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
            {children}
          </AuthProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
