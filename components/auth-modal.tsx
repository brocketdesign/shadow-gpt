"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Sparkles, Mail, Lock } from "lucide-react"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { isLoaded, signIn, setActive } = useSignIn()
  const { toast } = useToast()
  const router = useRouter()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setEmail("")
      setPassword("")
      setError("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return

    setLoading(true)
    setError("")

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId })
        toast({
          title: "Signed in!",
          description: "Welcome to Zenith AI 🎉",
          variant: "success",
        })
        onOpenChange(false)
        router.refresh()
      } else {
        setError("Sign-in could not be completed. Please try again.")
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string; longMessage?: string }[] }
      const message = clerkError.errors?.[0]?.longMessage || clerkError.errors?.[0]?.message || "Sign-in error"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome back!
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to continue your transformation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            variant="gradient"
            size="lg"
            disabled={loading || !isLoaded}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => { onOpenChange(false); router.push("/onboarding") }}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Start here
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
