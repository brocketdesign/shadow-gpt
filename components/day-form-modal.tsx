"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Loader2, Sparkles, Check, CheckSquare } from "lucide-react"
import { SAVERS_CONFIG, VICES_CONFIG } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProtocolEntry {
  id: string
  title: string
  icon: string
  completed: boolean
}

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
  const [protocols, setProtocols] = useState<ProtocolEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && date) {
      loadDayData()
      loadProtocols()
    }
  }, [open, date])

  const loadProtocols = async () => {
    try {
      const res = await fetch(`/api/protocols?action=get_day&date=${date}`)
      const data = await res.json()
      if (data.success) {
        setProtocols(data.protocols || [])
      }
    } catch (error) {
      console.error("Error loading protocols:", error)
    }
  }

  const toggleProtocol = async (protocolId: string) => {
    try {
      const res = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", protocolId, date }),
      })
      const data = await res.json()
      if (data.success) {
        setProtocols((prev) =>
          prev.map((p) =>
            p.id === protocolId ? { ...p, completed: data.completed } : p
          )
        )
      }
    } catch (error) {
      console.error("Error toggling protocol:", error)
    }
  }

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
          title: "Saved! ✨",
          description: "Your day has been recorded",
          variant: "success",
        })
        onSave()
        onOpenChange(false)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to save",
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

  const protocolsCount = protocols.filter((p) => p.completed).length
  const maxScore = 11 + protocols.length
  const totalScore = saversCount + vicesCount + protocolsCount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            {format(new Date(date), "EEEE, MMMM d, yyyy")}
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
                  totalScore >= maxScore * 0.8 ? "text-green-600" : totalScore >= maxScore * 0.5 ? "text-yellow-600" : "text-red-600"
                )}>
                  {totalScore}/{maxScore}
                </div>
                <div className="text-sm text-gray-600">Daily Score</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{saversCount}/6</div>
                <div className="text-sm text-gray-600">SAVERS</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{vicesCount}/5</div>
                <div className="text-sm text-gray-600">Vices Avoided</div>
              </div>
              {protocols.length > 0 && (
                <>
                  <div className="h-12 w-px bg-gray-300" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{protocolsCount}/{protocols.length}</div>
                    <div className="text-sm text-gray-600">Protocols</div>
                  </div>
                </>
              )}
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
                Vices Avoided
                <span className="text-xs text-gray-500 font-normal">(Check if you resisted)</span>
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

            {/* Custom Protocols Section */}
            {protocols.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-purple-600" />
                  Custom Protocols
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {protocols.map((protocol) => (
                    <button
                      key={protocol.id}
                      type="button"
                      onClick={() => toggleProtocol(protocol.id)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                        protocol.completed
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <span className="text-xl">{protocol.icon}</span>
                      <span className="text-sm font-medium flex-1 text-left">{protocol.title}</span>
                      {protocol.completed && <Check className="w-5 h-5 text-purple-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mood & Energy */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span>😊</span> Mood
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
                  <span>⚡</span> Energy
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
                <span>📝</span> Daily Notes
              </Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="How was your day?"
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
                Cancel
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save
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
