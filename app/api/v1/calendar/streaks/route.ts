import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-key-auth'
import { prisma } from '@/lib/prisma'
import { formatDateISO } from '@/lib/utils'
import { subDays } from 'date-fns'

function apiError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

/**
 * GET /api/v1/calendar/streaks
 * Get current and best streaks for SAVERS, vices, and combined metrics.
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(
    request.headers.get('x-api-key'),
    request.headers.get('x-api-secret'),
  )
  if (!auth) return apiError('Invalid or missing API credentials', 401)

  try {
    // Fetch 90 days of history
    const endDate = new Date()
    const startDate = subDays(endDate, 90)

    const trackingData = await prisma.dailyTracking.findMany({
      where: {
        userId: auth.userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    })

    const calculateStreak = (field: string) => {
      let current = 0
      let best = 0
      let streak = 0
      let lastDate: string | null = null

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (const day of trackingData) {
        const value = (day as Record<string, unknown>)[field] as boolean
        const dayDate = new Date(day.date)
        dayDate.setHours(0, 0, 0, 0)

        if (value) {
          if (!lastDate) {
            streak = 1
          } else {
            const lastDateObj = new Date(lastDate)
            const diff = (lastDateObj.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
            if (diff === 1) {
              streak++
            } else {
              if (streak > best) best = streak
              streak = 1
            }
          }
          lastDate = formatDateISO(dayDate)

          const diffFromToday = (today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
          if (diffFromToday <= 1 && current === 0) {
            current = streak
          }
        } else {
          if (streak > best) best = streak
          if (current === 0) current = streak
          streak = 0
          lastDate = null
        }
      }

      if (streak > best) best = streak

      return { current, best, lastDate }
    }

    const calculateCombinedStreak = (fields: string[]) => {
      let current = 0
      let best = 0
      let streak = 0
      let lastDate: string | null = null

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (const day of trackingData) {
        const allTrue = fields.every(
          (field) => (day as Record<string, unknown>)[field] as boolean,
        )
        const dayDate = new Date(day.date)
        dayDate.setHours(0, 0, 0, 0)

        if (allTrue) {
          if (!lastDate) {
            streak = 1
          } else {
            const lastDateObj = new Date(lastDate)
            const diff = (lastDateObj.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
            if (diff === 1) {
              streak++
            } else {
              if (streak > best) best = streak
              streak = 1
            }
          }
          lastDate = formatDateISO(dayDate)

          const diffFromToday = (today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
          if (diffFromToday <= 1 && current === 0) {
            current = streak
          }
        } else {
          if (streak > best) best = streak
          if (current === 0) current = streak
          streak = 0
          lastDate = null
        }
      }

      if (streak > best) best = streak

      return { current, best, lastDate }
    }

    const saversFields = [
      'saversSilence',
      'saversAffirmations',
      'saversVisualization',
      'saversExercise',
      'saversReading',
      'saversScribing',
    ]

    const vicesFields = [
      'viceFreeCoke',
      'viceFreeBeer',
      'viceFreeWeed',
      'viceFreeSns',
      'viceFreePorn',
    ]

    const streaks = {
      savers: {
        silence: { ...calculateStreak('saversSilence'), label: 'Meditation', icon: '🧘' },
        affirmations: { ...calculateStreak('saversAffirmations'), label: 'Affirmations', icon: '💬' },
        visualization: { ...calculateStreak('saversVisualization'), label: 'Visualization', icon: '👁️' },
        exercise: { ...calculateStreak('saversExercise'), label: 'Exercise', icon: '🏃' },
        reading: { ...calculateStreak('saversReading'), label: 'Reading', icon: '📚' },
        scribing: { ...calculateStreak('saversScribing'), label: 'Journaling', icon: '✍️' },
      },
      vices: {
        coke: { ...calculateStreak('viceFreeCoke'), label: 'Soda Free', icon: '🥤' },
        beer: { ...calculateStreak('viceFreeBeer'), label: 'Alcohol Free', icon: '🍺' },
        weed: { ...calculateStreak('viceFreeWeed'), label: 'Cannabis Free', icon: '🌿' },
        sns: { ...calculateStreak('viceFreeSns'), label: 'SNS Free', icon: '📱' },
        porn: { ...calculateStreak('viceFreePorn'), label: 'Porn Free', icon: '🔞' },
      },
      combined: {
        allSavers: {
          ...calculateCombinedStreak(saversFields),
          label: 'All SAVERS',
          icon: '🌟',
        },
        allVices: {
          ...calculateCombinedStreak(vicesFields),
          label: 'Zero Vices',
          icon: '🛡️',
        },
        perfectDay: {
          ...calculateCombinedStreak([...saversFields, ...vicesFields]),
          label: 'Perfect Day',
          icon: '👑',
        },
      },
    }

    return NextResponse.json({ success: true, streaks })
  } catch (error) {
    console.error('API v1 calendar/streaks GET error:', error)
    return apiError('Internal server error', 500)
  }
}
