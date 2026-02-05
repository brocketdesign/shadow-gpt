import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shadow GPT - Guide Personnel",
  description: "Ton guide personnel pour la transformation - Track tes SAVERS, contrôle tes vices, atteins tes objectifs",
  keywords: ["habit tracker", "SAVERS", "miracle morning", "personal development", "addiction recovery"],
  authors: [{ name: "Shadow GPT" }],
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
