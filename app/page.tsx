"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Navigation } from "@/components/navigation"
import { Calendar } from "@/components/calendar"
import { DayFormModal } from "@/components/day-form-modal"
import { StreakDisplay } from "@/components/streak-display"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight, Sparkles, Target, Shield, Zap, Plus, Trash2, CheckSquare, Loader2 } from "lucide-react"
import { getMonthName } from "@/lib/utils"
import type { DailyTracking } from "@/lib/types"

interface CustomProtocol {
  id: string
  title: string
  icon: string
}

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [monthData, setMonthData] = useState<Record<string, DailyTracking>>({})
  const [affirmation, setAffirmation] = useState("")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Custom Protocols state
  const [protocols, setProtocols] = useState<CustomProtocol[]>([])
  const [showAddProtocolModal, setShowAddProtocolModal] = useState(false)
  const [protocolForm, setProtocolForm] = useState({ title: "", icon: "✅" })
  const [creatingProtocol, setCreatingProtocol] = useState(false)

  const loadMonthData = useCallback(async () => {
    if (!user) {
      setMonthData({})
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`/api/tracking?action=get_month_data&year=${currentYear}&month=${currentMonth}`)
      const data = await res.json()
      if (data.success) {
        setMonthData(data.data || {})
      }
    } catch (error) {
      console.error("Error loading month data:", error)
    } finally {
      setLoading(false)
    }
  }, [user, currentYear, currentMonth])

  const loadAffirmation = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const res = await fetch(`/api/affirmations?date=${today}`)
      const data = await res.json()
      if (data.success) {
        setAffirmation(data.affirmation)
      }
    } catch (error) {
      console.error("Error loading affirmation:", error)
    }
  }, [])

  const loadProtocols = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch("/api/protocols?action=list")
      const data = await res.json()
      if (data.success) {
        setProtocols(data.protocols)
      }
    } catch (error) {
      console.error("Error loading protocols:", error)
    }
  }, [user])

  const handleCreateProtocol = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingProtocol(true)
    try {
      const res = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: protocolForm.title,
          icon: protocolForm.icon,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Protocol created! ✅", variant: "success" })
        setShowAddProtocolModal(false)
        setProtocolForm({ title: "", icon: "✅" })
        loadProtocols()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({ title: "Error", description: "Unable to create protocol", variant: "destructive" })
    } finally {
      setCreatingProtocol(false)
    }
  }

  const handleDeleteProtocol = async (protocolId: string) => {
    if (!confirm("Delete this protocol?")) return
    try {
      const res = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", protocolId }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Protocol deleted", variant: "default" })
        loadProtocols()
      }
    } catch (error) {
      toast({ title: "Error", description: "Unable to delete", variant: "destructive" })
    }
  }

  useEffect(() => {
    loadAffirmation()
  }, [loadAffirmation])

  useEffect(() => {
    if (!authLoading) {
      loadMonthData()
    }
  }, [authLoading, loadMonthData])

  useEffect(() => {
    if (!authLoading && user) {
      loadProtocols()
    }
  }, [authLoading, user, loadProtocols])

  // Redirect to onboarding if user is not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/onboarding")
    }
  }, [authLoading, user, router])

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleDayClick = (date: string) => {
    if (!user) {
      return
    }
    setSelectedDate(date)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="gradient-bg text-white p-8 rounded-3xl mb-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8" />
              <h1 className="text-3xl sm:text-4xl font-bold text-center">Zenith AI</h1>
              <Sparkles className="w-8 h-8" />
            </div>
            
            {/* Month Navigation */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousMonth}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <h2 className="text-2xl font-semibold min-w-[200px] text-center">
                {getMonthName(currentMonth)} {currentYear}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
            
            {/* Daily Affirmation */}
            {affirmation && (
              <p className="text-lg text-center opacity-90 max-w-2xl mx-auto italic">
                "{affirmation}"
              </p>
            )}
            
            {/* Streaks */}
            {user && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-white/90 text-center">
                  🔥 Your Current Streaks
                </h3>
                <StreakDisplay year={currentYear} month={currentMonth} />
              </div>
            )}
            

          </div>
        </div>

        {/* Legend */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">📋 Tracking Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  SAVERS (Miracle Morning)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">🧘</span>
                    <strong>S</strong>ilence - Meditation/Breathing
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">💬</span>
                    <strong>A</strong>ffirmations - Positive mantras
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">👁️</span>
                    <strong>V</strong>isualization - Envision your goals
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">🏃</span>
                    <strong>E</strong>xercise - Workout/Movement
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">📚</span>
                    <strong>R</strong>eading - Learning
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">✍️</span>
                    <strong>S</strong>cribing - Writing/Journaling
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Vices to Avoid
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">🥤</span>
                    <strong>Soda/Cola</strong> - Zero industrial sugar
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">🍺</span>
                    <strong>Beer/Alcohol</strong> - Clear mind
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">🌿</span>
                    <strong>Cannabis</strong> - Mental clarity
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">📱</span>
                    <strong>SNS (+30min)</strong> - Precious time
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">🔞</span>
                    <strong>Porn</strong> - Pure energy
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Protocols Section */}
        {user && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-purple-500" />
                  Custom Protocols
                </h3>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => setShowAddProtocolModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Protocol
                </Button>
              </div>
              
              {protocols.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">
                  No custom protocols yet. Add your first one to track additional habits!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {protocols.map((protocol) => (
                    <div
                      key={protocol.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-purple-200 bg-purple-50/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{protocol.icon}</span>
                        <span className="font-medium text-gray-800 text-sm">{protocol.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteProtocol(protocol.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-400 mt-3">
                These protocols appear as checkboxes in your daily form and count towards your Daily Score ({6 + 5 + protocols.length} max).
              </p>
            </CardContent>
          </Card>
        )}

        {/* Calendar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Transformation Calendar
            </h3>
            {user && (
              <div className="text-sm text-gray-600">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {Object.keys(monthData).length} days tracked
                </span>
              </div>
            )}
          </div>
          
          <Calendar
            year={currentYear}
            month={currentMonth}
            monthData={monthData}
            onDayClick={handleDayClick}
            isAuthenticated={!!user}
            protocolCount={protocols.length}
          />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8">
          <p>Zenith AI - Your personal guide for transformation 🌟</p>
          <p className="mt-1">Build your best self, day after day</p>
        </footer>
      </main>

      {/* Day Form Modal */}
      {selectedDate && (
        <DayFormModal
          open={!!selectedDate}
          onOpenChange={(open) => !open && setSelectedDate(null)}
          date={selectedDate}
          onSave={loadMonthData}
        />
      )}

      {/* Add Protocol Modal */}
      <Dialog open={showAddProtocolModal} onOpenChange={setShowAddProtocolModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-purple-500" />
              Add Custom Protocol
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleCreateProtocol()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="protocol-title">Protocol Name</Label>
              <Input
                id="protocol-title"
                placeholder="e.g. Cold Shower, Reading, Journaling..."
                value={protocolForm.title}
                onChange={(e) =>
                  setProtocolForm({ ...protocolForm, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protocol-icon">Icon (emoji)</Label>
              <Input
                id="protocol-icon"
                placeholder="e.g. 🧊, 📖, ✍️"
                value={protocolForm.icon}
                onChange={(e) =>
                  setProtocolForm({ ...protocolForm, icon: e.target.value })
                }
                className="w-24"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddProtocolModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={creatingProtocol}>
                {creatingProtocol ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Protocol'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
