"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Flame, Trophy, Shield, Crown, Star } from "lucide-react"

interface Streak {
  label: string
  icon: string
  current: number
  best: number
}

interface CombinedStreak {
  label: string
  icon: string
  current: number
  best: number
}

interface StreaksData {
  savers: Record<string, Streak>
  vices: Record<string, Streak>
}

interface StreakDisplayProps {
  year: number
  month: number
}

export function StreakDisplay({ year, month }: StreakDisplayProps) {
  const [streaks, setStreaks] = useState<StreaksData | null>(null)
  const [combined, setCombined] = useState<Record<string, CombinedStreak> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStreaks() {
      try {
        const res = await fetch(`/api/streaks?year=${year}&month=${month}`)
        const data = await res.json()
        if (data.success) {
          setStreaks(data.streaks)
          setCombined(data.combined)
        }
      } catch (error) {
        console.error("Error fetching streaks:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStreaks()
  }, [year, month])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/20 rounded-xl p-4 animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-2" />
            <div className="h-4 bg-white/20 rounded mb-1" />
            <div className="h-3 bg-white/20 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!combined) return null

  const streakCards = [
    { 
      key: "perfectDay", 
      data: combined.perfectDay, 
      Icon: Crown, 
      gradient: "from-yellow-400 to-orange-500" 
    },
    { 
      key: "allSavers", 
      data: combined.allSavers, 
      Icon: Star, 
      gradient: "from-indigo-400 to-purple-500" 
    },
    { 
      key: "allVices", 
      data: combined.allVices, 
      Icon: Shield, 
      gradient: "from-green-400 to-emerald-500" 
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {streakCards.map(({ key, data, Icon, gradient }, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${gradient} text-white shadow-lg`}
        >
          <div className="flex items-center justify-between mb-2">
            <Icon className="w-8 h-8 opacity-80" />
            {data.current > 0 && (
              <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
            )}
          </div>
          <div className="text-3xl font-bold mb-1">
            {data.current}
            <span className="text-lg opacity-80"> jours</span>
          </div>
          <div className="text-sm opacity-90">{data.label}</div>
          <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Record: {data.best} jours
          </div>
          
          {/* Background decoration */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </motion.div>
      ))}
    </div>
  )
}
