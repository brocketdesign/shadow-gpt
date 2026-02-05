"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Loader2, Sparkles, Check } from "lucide-react"
import { SAVERS_CONFIG, VICES_CONFIG } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DayFormData {
  saversSilence: boolean
  saversAffirmations: boolean
  saversVisualization: boolean
  saversExercise: boolean
  saversReading: boolean
  saversScribing: boolean
  viceFreeCoke: boolean
  viceFreeBeer: boolean
  viceFreeWeed: boolean
  viceFreeSns: boolean
  viceFreePorn: boolean
  dailyAffirmation: string
  notes: string
  moodRating: number
  energyLevel: number
}

interface DayFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: string
  onSave: () => void
}

const defaultFormData: DayFormData = {
  saversSilence: false,
  saversAffirmations: false,
  saversVisualization: false,
  saversExercise: false,
  saversReading: false,
  saversScribing: false,
  viceFreeCoke: false,
  viceFreeBeer: false,
  viceFreeWeed: false,
  viceFreeSns: false,
  viceFreePorn: false,
  dailyAffirmation: "",
  notes: "",
  moodRating: 5,
  energyLevel: 5,
}

export function DayFormModal({ open, onOpenChange, date, onSave }: DayFormModalProps) {
  const [formData, setFormData] = useState<DayFormData>(defaultFormData)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && date) {
      loadDayData()
    }
  }, [open, date])

  const loadDayData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tracking?action=get_day_data&date=${date}`)
      const data = await res.json()
      if (data.success && data.data) {
        setFormData({
          saversSilence: data.data.saversSilence || false,
          saversAffirmations: data.data.saversAffirmations || false,
          saversVisualization: data.data.saversVisualization || false,
          saversExercise: data.data.saversExercise || false,
          saversReading: data.data.saversReading || false,
          saversScribing: data.data.saversScribing || false,
          viceFreeCoke: data.data.viceFreeCoke || false,
          viceFreeBeer: data.data.viceFreeBeer || false,
          viceFreeWeed: data.data.viceFreeWeed || false,
          viceFreeSns: data.data.viceFreeSns || false,
          viceFreePorn: data.data.viceFreePorn || false,
          dailyAffirmation: data.data.dailyAffirmation || "",
          notes: data.data.notes || "",
          moodRating: data.data.moodRating || 5,
          energyLevel: data.data.energyLevel || 5,
        })
      } else {
        setFormData(defaultFormData)
      }
    } catch (error) {
      console.error("Error loading day data:", error)
      setFormData(defaultFormData)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_day",
          date,
          ...formData,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Sauvegardé ! ✨",
          description: "Ta journée a été enregistrée",
          variant: "success",
        })
        onSave()
        onOpenChange(false)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleField = (field: keyof DayFormData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const saversCount = Object.entries(SAVERS_CONFIG).filter(
    ([_, config]) => formData[config.key as keyof DayFormData]
  ).length

  const vicesCount = Object.entries(VICES_CONFIG).filter(
    ([_, config]) => formData[config.key as keyof DayFormData]
  ).length

  const totalScore = saversCount + vicesCount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            {format(new Date(date), "EEEE d MMMM yyyy", { locale: fr })}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Score Preview */}
            <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <div className="text-center">
                <div className={cn(
                  "text-4xl font-bold",
                  totalScore >= 9 ? "text-green-600" : totalScore >= 6 ? "text-yellow-600" : "text-red-600"
                )}>
                  {totalScore}/11
                </div>
                <div className="text-sm text-gray-600">Score du jour</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{saversCount}/6</div>
                <div className="text-sm text-gray-600">SAVERS</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{vicesCount}/5</div>
                <div className="text-sm text-gray-600">Vices évités</div>
              </div>
            </div>

            {/* SAVERS Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="text-indigo-600">🌅</span>
                SAVERS (Miracle Morning)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(SAVERS_CONFIG).map(([key, config]) => {
                  const isChecked = formData[config.key as keyof DayFormData] as boolean
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleField(config.key as keyof DayFormData)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                        isChecked
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <span className="text-xl">{config.icon}</span>
                      <span className="text-sm font-medium flex-1 text-left">{config.label.split(" ")[0]}</span>
                      {isChecked && <Check className="w-5 h-5 text-indigo-500" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Vices Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="text-green-600">🛡️</span>
                Vices Évités
                <span className="text-xs text-gray-500 font-normal">(Coche si tu as résisté)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(VICES_CONFIG).map(([key, config]) => {
                  const isChecked = formData[config.key as keyof DayFormData] as boolean
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleField(config.key as keyof DayFormData)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                        isChecked
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <span className="text-xl">{config.icon}</span>
                      <span className="text-sm font-medium flex-1 text-left">{config.label.split(" ")[0]}</span>
                      {isChecked && <Check className="w-5 h-5 text-green-500" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mood & Energy */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span>😊</span> Humeur
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.moodRating}
                    onChange={(e) => setFormData((prev) => ({ ...prev, moodRating: parseInt(e.target.value) }))}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="w-8 text-center font-bold text-indigo-600">{formData.moodRating}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span>⚡</span> Énergie
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.energyLevel}
                    onChange={(e) => setFormData((prev) => ({ ...prev, energyLevel: parseInt(e.target.value) }))}
                    className="flex-1 accent-yellow-500"
                  />
                  <span className="w-8 text-center font-bold text-yellow-600">{formData.energyLevel}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <span>📝</span> Notes du jour
              </Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Comment s'est passée ta journée ?"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-24"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="gradient"
                className="flex-1"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
