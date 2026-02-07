"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useAuth } from "@/components/providers/auth-provider"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
  /* 
     We use the centralized AuthProvider (useAuth) to check for the DB user status.
     The AuthProvider handles the fetching and state management. 
  */
  const { user: dbUser, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If auth is done loading, user is logged in, and onboarding is complete:
    // Redirect to dashboard (home)
    if (!authLoading && dbUser?.onboardingCompleted) {
      router.push("/")
    }
  }, [authLoading, dbUser, router])

  // While checking auth status, show loader
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  // Show the wizard for logged-out users (main use case) AND
  // for logged-in users who haven't completed onboarding
  return <OnboardingWizard />
}
