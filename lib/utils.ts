import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, subDays, differenceInDays } from "date-fns"
import { fr } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, formatStr: string = "PPP") {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, formatStr, { locale: fr })
}

export function formatDateISO(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function getMonthDays(year: number, month: number) {
  const start = startOfMonth(new Date(year, month - 1))
  const end = endOfMonth(new Date(year, month - 1))
  return eachDayOfInterval({ start, end })
}

export function getFirstDayOfWeek(year: number, month: number): number {
  const firstDay = new Date(year, month - 1, 1)
  // Convert Sunday = 0 to Monday-based (Monday = 0)
  const day = getDay(firstDay)
  return day === 0 ? 6 : day - 1
}

export function calculateScore(dayData: {
  saversSilence?: boolean
  saversAffirmations?: boolean
  saversVisualization?: boolean
  saversExercise?: boolean
  saversReading?: boolean
  saversScribing?: boolean
  viceFreeCoke?: boolean
  viceFreeBeer?: boolean
  viceFreeWeed?: boolean
  viceFreeSns?: boolean
  viceFreePorn?: boolean
} | null): { savers: number; vices: number; total: number } {
  if (!dayData) return { savers: 0, vices: 0, total: 0 }
  
  const savers = [
    dayData.saversSilence,
    dayData.saversAffirmations,
    dayData.saversVisualization,
    dayData.saversExercise,
    dayData.saversReading,
    dayData.saversScribing,
  ].filter(Boolean).length
  
  const vices = [
    dayData.viceFreeCoke,
    dayData.viceFreeBeer,
    dayData.viceFreeWeed,
    dayData.viceFreeSns,
    dayData.viceFreePorn,
  ].filter(Boolean).length
  
  return { savers, vices, total: savers + vices }
}

export function getScoreColor(total: number): string {
  if (total >= 9) return "text-green-600"
  if (total >= 7) return "text-yellow-600"
  return "text-red-600"
}

export function getScoreBgColor(total: number): string {
  if (total >= 9) return "bg-green-100"
  if (total >= 7) return "bg-yellow-100"
  if (total >= 4) return "bg-orange-100"
  return "bg-red-100"
}

export function calculateStreak(
  data: { date: string; value: boolean }[],
  endDate: Date = new Date()
): { current: number; best: number } {
  if (!data.length) return { current: 0, best: 0 }
  
  // Sort by date descending
  const sorted = [...data].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  let current = 0
  let best = 0
  let streak = 0
  let lastDate: Date | null = null
  
  for (const item of sorted) {
    const itemDate = parseISO(item.date)
    
    if (item.value) {
      if (!lastDate || differenceInDays(lastDate, itemDate) === 1) {
        streak++
        if (streak > best) best = streak
      } else {
        streak = 1
      }
      lastDate = itemDate
      
      // Check if streak is current (includes today or yesterday)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (differenceInDays(today, itemDate) <= 1 && current === 0) {
        current = streak
      }
    } else {
      if (current === 0) current = streak
      streak = 0
      lastDate = null
    }
  }
  
  return { current, best: Math.max(best, streak) }
}

export const MONTH_NAMES_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

export function getMonthNameFr(month: number): string {
  return MONTH_NAMES_FR[month - 1] || ""
}

export function generateRandomColor(): string {
  const colors = [
    "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
    "#f43f5e", "#ef4444", "#f97316", "#f59e0b", "#eab308",
    "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4",
    "#0ea5e9", "#3b82f6", "#6366f1"
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
