"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Target, 
  Trophy, 
  Flame, 
  Calendar,
  Check,
  X,
  SkipForward,
  Trash2,
  Sparkles,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { format, differenceInDays, addDays, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Challenge, ChallengeProgress } from "@/lib/types"

interface ChallengeWithProgress extends Challenge {
  progress: ChallengeProgress
  checkIns: { date: string; status: string; notes: string | null }[]
}

export default function ChallengesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithProgress | null>(null)
  
  // Form state
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    durationDays: 30,
    startDate: format(new Date(), "yyyy-MM-dd"),
  })
  const [creating, setCreating] = useState(false)
  const [enhancing, setEnhancing] = useState(false)

  const loadChallenges = useCallback(async (status?: string) => {
    if (!user) return
    
    setLoading(true)
    try {
      const url = status && status !== "all" 
        ? `/api/challenges?action=list&status=${status}`
        : `/api/challenges?action=list`
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.success) {
        setChallenges(data.challenges)
      }
    } catch (error) {
      console.error("Error loading challenges:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadChallenges(activeTab === "all" ? undefined : activeTab)
    }
  }, [user, activeTab, loadChallenges])

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...createForm,
          duration_days: createForm.durationDays,
          start_date: createForm.startDate,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Challenge créé ! 🎯",
          description: "Bonne chance dans ton défi !",
          variant: "success",
        })
        setShowCreateModal(false)
        setCreateForm({
          title: "",
          description: "",
          durationDays: 30,
          startDate: format(new Date(), "yyyy-MM-dd"),
        })
        loadChallenges(activeTab === "all" ? undefined : activeTab)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le challenge",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleEnhanceDescription = async () => {
    if (!createForm.title && !createForm.description) return
    
    setEnhancing(true)
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enhance_description",
          title: createForm.title,
          description: createForm.description,
        }),
      })

      const data = await res.json()

      if (data.success && data.description) {
        setCreateForm((prev) => ({ ...prev, description: data.description }))
        toast({
          title: "Description améliorée ! ✨",
          variant: "success",
        })
      }
    } catch (error) {
      console.error("Error enhancing description:", error)
    } finally {
      setEnhancing(false)
    }
  }

  const handleCheckIn = async (challengeId: string, status: "success" | "fail" | "skip") => {
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_in",
          challengeId,
          date: format(new Date(), "yyyy-MM-dd"),
          status,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: status === "success" ? "Bravo ! 🎉" : status === "fail" ? "Dommage..." : "Passé",
          description: status === "success" 
            ? "Continue comme ça !" 
            : status === "fail" 
              ? "Demain est un nouveau jour" 
              : "Tu peux reprendre demain",
          variant: status === "success" ? "success" : "default",
        })
        loadChallenges(activeTab === "all" ? undefined : activeTab)
        setSelectedChallenge(null)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le check-in",
        variant: "destructive",
      })
    }
  }

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm("Supprimer ce challenge ?")) return

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          challengeId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Challenge supprimé",
          variant: "default",
        })
        loadChallenges(activeTab === "all" ? undefined : activeTab)
        setSelectedChallenge(null)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer",
        variant: "destructive",
      })
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Target className="w-8 h-8 text-indigo-500" />
              Mes Challenges
            </h1>
            <p className="text-gray-600 mt-1">
              Transforme tes objectifs en réalité, un jour à la fois
            </p>
          </div>
          <Button 
            variant="gradient" 
            size="lg"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Challenge
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="active">🔥 Actifs</TabsTrigger>
            <TabsTrigger value="completed">✅ Complétés</TabsTrigger>
            <TabsTrigger value="failed">❌ Échoués</TabsTrigger>
            <TabsTrigger value="all">📋 Tous</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Challenges Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun challenge {activeTab !== "all" && activeTab}
            </h3>
            <p className="text-gray-500 mb-6">
              Crée ton premier challenge pour commencer ta transformation !
            </p>
            <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Créer un Challenge
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <Card 
                key={challenge.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => setSelectedChallenge(challenge)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {challenge.title}
                    </CardTitle>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      challenge.status === "active" && "bg-blue-100 text-blue-700",
                      challenge.status === "completed" && "bg-green-100 text-green-700",
                      challenge.status === "failed" && "bg-red-100 text-red-700",
                    )}>
                      {challenge.status === "active" ? "En cours" 
                        : challenge.status === "completed" ? "Réussi" 
                        : "Échoué"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {challenge.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {challenge.description}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progression</span>
                      <span className="font-semibold">
                        {challenge.progress.completedDays}/{challenge.progress.totalDays} jours
                      </span>
                    </div>
                    <Progress value={challenge.progress.percentComplete} />
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-orange-600">
                        <Flame className="w-4 h-4" />
                        <span>{challenge.progress.currentStreak} jours</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Trophy className="w-4 h-4" />
                        <span>Record: {challenge.progress.bestStreak}</span>
                      </div>
                    </div>
                    
                    {challenge.status === "active" && challenge.progress.daysRemaining > 0 && (
                      <div className="text-xs text-gray-500 text-center">
                        {challenge.progress.daysRemaining} jours restants
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Challenge Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              Nouveau Challenge
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateChallenge} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du Challenge *</Label>
              <Input
                id="title"
                value={createForm.title}
                onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ex: 30 jours sans alcool"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={createForm.description}
                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Décris ton challenge et pourquoi tu veux le réaliser..."
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-24"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleEnhanceDescription}
                disabled={enhancing || (!createForm.title && !createForm.description)}
              >
                {enhancing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Améliorer avec AI
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (jours) *</Label>
                <select
                  id="duration"
                  value={createForm.durationDays}
                  onChange={(e) => setCreateForm((p) => ({ ...p, durationDays: parseInt(e.target.value) }))}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={7}>7 jours</option>
                  <option value={14}>14 jours</option>
                  <option value={21}>21 jours</option>
                  <option value={30}>30 jours</option>
                  <option value={60}>60 jours</option>
                  <option value={90}>90 jours</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Conseil pour réussir</p>
                  <p>Choisis un challenge réaliste mais ambitieux. La constance est plus importante que l'intensité !</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="gradient"
                className="flex-1"
                disabled={creating}
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Target className="w-4 h-4 mr-2" />
                )}
                Créer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Challenge Details Modal */}
      {selectedChallenge && (
        <Dialog open={!!selectedChallenge} onOpenChange={() => setSelectedChallenge(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedChallenge.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {selectedChallenge.description && (
                <p className="text-gray-600">{selectedChallenge.description}</p>
              )}

              {/* Progress */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-indigo-600">
                      {selectedChallenge.progress.percentComplete}%
                    </div>
                    <div className="text-sm text-gray-600">Progression</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600 flex items-center gap-1">
                      <Flame className="w-6 h-6" />
                      {selectedChallenge.progress.currentStreak}
                    </div>
                    <div className="text-sm text-gray-600">Série actuelle</div>
                  </div>
                </div>
                <Progress value={selectedChallenge.progress.percentComplete} className="h-4" />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>{selectedChallenge.progress.completedDays} jours réussis</span>
                  <span>Record: {selectedChallenge.progress.bestStreak} jours</span>
                </div>
              </div>

              {/* Check-in buttons for active challenges */}
              {selectedChallenge.status === "active" && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Check-in d'aujourd'hui</h4>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                      onClick={() => handleCheckIn(selectedChallenge.id, "success")}
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Réussi
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => handleCheckIn(selectedChallenge.id, "fail")}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Échoué
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleCheckIn(selectedChallenge.id, "skip")}
                    >
                      <SkipForward className="w-5 h-5 mr-2" />
                      Passer
                    </Button>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Début: {format(parseISO(selectedChallenge.startDate), "d MMMM yyyy", { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Fin: {format(parseISO(selectedChallenge.endDate), "d MMMM yyyy", { locale: fr })}</span>
                </div>
              </div>

              {/* Delete button */}
              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteChallenge(selectedChallenge.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer ce challenge
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
