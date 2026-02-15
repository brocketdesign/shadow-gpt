"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  clerkUser: ReturnType<typeof useUser>["user"]
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const { signOut } = useClerk()
  const [dbUser, setDbUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    console.log("[AuthProvider] refreshUser called, clerkUser:", clerkUser?.id)
    if (!clerkUser) {
      console.log("[AuthProvider] No clerk user, clearing DB user")
      setDbUser(null)
      setLoading(false)
      return
    }

    try {
      console.log("[AuthProvider] Fetching /api/auth...")
      const res = await fetch("/api/auth")
      const data = await res.json()
      console.log("[AuthProvider] API response:", { authenticated: data.authenticated, hasUser: !!data.user })
      if (data.authenticated && data.user) {
        console.log("[AuthProvider] Setting DB user, onboardingCompleted:", data.user.onboardingCompleted)
        setDbUser(data.user)
      } else {
        console.log("[AuthProvider] No DB user found")
        setDbUser(null)
      }
    } catch (error) {
      console.error("[AuthProvider] Error refreshing user:", error)
      setDbUser(null)
    } finally {
      setLoading(false)
    }
  }, [clerkUser])

  useEffect(() => {
    if (clerkLoaded) {
      refreshUser()
    }
  }, [clerkLoaded, refreshUser])

  const logout = async () => {
    try {
      await signOut()
      setDbUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user: dbUser, clerkUser: clerkUser ?? null, loading: !clerkLoaded || loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
