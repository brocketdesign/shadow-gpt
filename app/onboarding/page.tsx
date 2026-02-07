"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const { user: clerkUser, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in, check if onboarding is completed
    // If so, redirect to dashboard
    if (isLoaded && clerkUser) {
      // User is already signed in — check if they already completed onboarding
      fetch("/api/auth")
        .then(res => res.json())
        .then(data => {
          if (data.authenticated && data.user?.onboardingCompleted) {
            router.push("/")
          }
        })
        .catch(() => {})
    }
  }, [isLoaded, clerkUser, router])

  if (!isLoaded) {
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
