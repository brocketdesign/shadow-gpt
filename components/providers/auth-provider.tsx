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
    if (!clerkUser) {
      setDbUser(null)
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth")
      const data = await res.json()
      if (data.authenticated && data.user) {
        setDbUser(data.user)
      } else {
        setDbUser(null)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
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
