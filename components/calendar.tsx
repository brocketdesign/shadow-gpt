"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { format, isToday, isWeekend } from "date-fns"
import { fr } from "date-fns/locale"
import { getMonthDays, getFirstDayOfWeek, calculateScore, getScoreColor, cn } from "@/lib/utils"
import { SAVERS_CONFIG, VICES_CONFIG, DailyTracking } from "@/lib/types"
import { Lock } from "lucide-react"

interface CalendarProps {
  year: number
  month: number
  monthData: Record<string, DailyTracking>
  onDayClick: (date: string) => void
  isAuthenticated: boolean
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

export function Calendar({ year, month, monthData, onDayClick, isAuthenticated }: CalendarProps) {
  const days = useMemo(() => getMonthDays(year, month), [year, month])
  const firstDayOffset = useMemo(() => getFirstDayOfWeek(year, month), [year, month])

  return (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-gray-600 border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for offset */}
        {[...Array(firstDayOffset)].map((_, i) => (
          <div key={`empty-${i}`} className="h-28 sm:h-32 border-r border-b bg-gray-50/50" />
        ))}

        {/* Day cells */}
        {days.map((date, index) => {
          const dateStr = format(date, "yyyy-MM-dd")
          const dayData = monthData[dateStr]
          const score = calculateScore(dayData)
          const isWeekendDay = isWeekend(date)
          const isTodayDate = isToday(date)

          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => isAuthenticated ? onDayClick(dateStr) : null}
              className={cn(
                "h-28 sm:h-32 border-r border-b p-2 relative transition-all duration-200 cursor-pointer",
                isWeekendDay ? "bg-blue-50/50" : "bg-white",
                isTodayDate && "ring-2 ring-inset ring-indigo-400",
                isAuthenticated && "hover:bg-gray-50 hover:shadow-inner"
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "font-bold text-lg",
                  isTodayDate ? "text-indigo-600" : "text-gray-800"
                )}>
                  {format(date, "d")}
                </span>
                {isTodayDate && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </div>

              {isAuthenticated ? (
                dayData ? (
                  <>
                    {/* SAVERS icons */}
                    <div className="flex flex-wrap gap-0.5 mb-1">
                      {Object.entries(SAVERS_CONFIG).map(([key, config]) => {
                        const isActive = dayData[config.key as keyof DailyTracking]
                        if (!isActive) return null
                        return (
                          <span key={key} className="text-xs">
                            {config.icon}
                          </span>
                        )
                      })}
                    </div>

                    {/* Vices icons */}
                    <div className="flex flex-wrap gap-0.5">
                      {Object.entries(VICES_CONFIG).map(([key, config]) => {
                        const isActive = dayData[config.key as keyof DailyTracking]
                        if (!isActive) return null
                        return (
                          <span key={key} className="text-xs opacity-60">
                            {config.icon}
                          </span>
                        )
                      })}
                    </div>

                    {/* Score */}
                    <div className={cn(
                      "absolute bottom-1 right-1 text-xs font-bold",
                      getScoreColor(score.total)
                    )}>
                      {score.total}/11
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-16 text-gray-400 text-xs">
                    <span>Cliquez</span>
                    <span>pour tracker</span>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-16 text-gray-400">
                  <Lock className="w-4 h-4 mb-1" />
                  <span className="text-xs">Connectez-vous</span>
                </div>
              )}
            </motion.div>
          )
        })}

        {/* Fill remaining cells */}
        {[...Array((7 - ((firstDayOffset + days.length) % 7)) % 7)].map((_, i) => (
          <div key={`fill-${i}`} className="h-28 sm:h-32 border-r border-b bg-gray-50/50" />
        ))}
      </div>
    </div>
  )
}
