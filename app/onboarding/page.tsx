"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useAuth } from "@/components/providers/auth-provider"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const { user: dbUser, loading: authLoading, refreshUser } = useAuth()
  const { isSignedIn, isLoaded: clerkLoaded } = useUser()
  const router = useRouter()
  const prevSignedIn = useRef(isSignedIn)

  // When the user signs in via Clerk modal, refresh auth context
  useEffect(() => {
    if (clerkLoaded && isSignedIn && !prevSignedIn.current) {
      refreshUser()
    }
    prevSignedIn.current = isSignedIn
  }, [clerkLoaded, isSignedIn, refreshUser])

  useEffect(() => {
    // If auth is done loading and user is signed in with completed onboarding,
    // redirect to dashboard
    if (!authLoading && isSignedIn && dbUser?.onboardingCompleted) {
      router.push("/")
    }
  }, [authLoading, isSignedIn, dbUser, router])

  // While checking auth status, show loader
  if (authLoading || (clerkLoaded && isSignedIn && !dbUser)) {
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
