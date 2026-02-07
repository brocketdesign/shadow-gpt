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
import { ChevronLeft, ChevronRight, Sparkles, Target, Shield, Zap } from "lucide-react"
import { getMonthNameFr } from "@/lib/utils"
import type { DailyTracking } from "@/lib/types"

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [monthData, setMonthData] = useState<Record<string, DailyTracking>>({})
  const [affirmation, setAffirmation] = useState("")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    loadAffirmation()
  }, [loadAffirmation])

  useEffect(() => {
    if (!authLoading) {
      loadMonthData()
    }
  }, [authLoading, loadMonthData])

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
                {getMonthNameFr(currentMonth)} {currentYear}
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
                  🔥 Tes Séries Actuelles
                </h3>
                <StreakDisplay year={currentYear} month={currentMonth} />
              </div>
            )}
            

          </div>
        </div>

        {/* Legend */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">📋 Légende de Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  SAVERS (Miracle Morning)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">🧘</span>
                    <strong>S</strong>ilence - Méditation/Respiration
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">💬</span>
                    <strong>A</strong>ffirmations - Mantras positifs
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">👁️</span>
                    <strong>V</strong>isualisation - Vision de tes objectifs
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">🏃</span>
                    <strong>E</strong>xercise - Sport/Mouvement
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">📚</span>
                    <strong>R</strong>eading - Lecture/Apprentissage
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">✍️</span>
                    <strong>S</strong>cribing - Écriture/Journal
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Vices à Éviter
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">🥤</span>
                    <strong>Coca/Sodas</strong> - Zéro sucre industriel
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">🍺</span>
                    <strong>Bière/Alcool</strong> - Esprit clair
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">🌿</span>
                    <strong>Cannabis</strong> - Clarté mentale
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">📱</span>
                    <strong>SNS (+30min)</strong> - Temps précieux
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">🔞</span>
                    <strong>Contenu Porno</strong> - Énergie pure
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Calendrier de Transformation
            </h3>
            {user && (
              <div className="text-sm text-gray-600">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {Object.keys(monthData).length} jours trackés
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
          />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8">
          <p>Zenith AI - Ton guide personnel pour la transformation 🌟</p>
          <p className="mt-1">Construis ta meilleure version, jour après jour</p>
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

    </div>
  )
}
