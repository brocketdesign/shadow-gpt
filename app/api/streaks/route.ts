import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDateISO } from '@/lib/utils'
import { subDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non connecté' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
    
    // Get tracking data for the month and previous days
    const startDate = subDays(new Date(year, month - 1, 1), 90) // Get 90 days of history
    const endDate = new Date(year, month, 0)
    
    const trackingData = await prisma.dailyTracking.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    })
    
    // Calculate streaks for each category
    const calculateStreak = (field: keyof typeof trackingData[0]) => {
      let current = 0
      let best = 0
      let streak = 0
      let lastDate: string | null = null
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const sorted = [...trackingData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      
      for (const day of sorted) {
        const value = day[field] as boolean
        const dayDate = new Date(day.date)
        dayDate.setHours(0, 0, 0, 0)
        
        if (value) {
          // Check if consecutive
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
          
          // Check if current streak (includes today or yesterday)
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
    
    const streaks = {
      savers: {
        silence: { ...calculateStreak('saversSilence'), label: 'Méditation', icon: '🧘' },
        affirmations: { ...calculateStreak('saversAffirmations'), label: 'Affirmations', icon: '💬' },
        visualization: { ...calculateStreak('saversVisualization'), label: 'Visualisation', icon: '👁️' },
        exercise: { ...calculateStreak('saversExercise'), label: 'Exercise', icon: '🏃' },
        reading: { ...calculateStreak('saversReading'), label: 'Lecture', icon: '📚' },
        scribing: { ...calculateStreak('saversScribing'), label: 'Écriture', icon: '✍️' },
      },
      vices: {
        coke: { ...calculateStreak('viceFreeCoke'), label: 'Sans Coca', icon: '🥤' },
        beer: { ...calculateStreak('viceFreeBeer'), label: 'Sans Alcool', icon: '🍺' },
        weed: { ...calculateStreak('viceFreeWeed'), label: 'Sans Cannabis', icon: '🌿' },
        sns: { ...calculateStreak('viceFreeSns'), label: 'Sans SNS', icon: '📱' },
        porn: { ...calculateStreak('viceFreePorn'), label: 'Sans Porno', icon: '🔞' },
      },
    }
    
    // Calculate combined streaks
    const calculateCombinedStreak = (fields: (keyof typeof trackingData[0])[]) => {
      let current = 0
      let best = 0
      let streak = 0
      let lastDate: string | null = null
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const sorted = [...trackingData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      
      for (const day of sorted) {
        const allTrue = fields.every((field) => day[field] as boolean)
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
    
    const combinedStreaks = {
      allSavers: {
        ...calculateCombinedStreak([
          'saversSilence',
          'saversAffirmations',
          'saversVisualization',
          'saversExercise',
          'saversReading',
          'saversScribing',
        ]),
        label: 'SAVERS Complet',
        icon: '🌟',
      },
      allVices: {
        ...calculateCombinedStreak([
          'viceFreeCoke',
          'viceFreeBeer',
          'viceFreeWeed',
          'viceFreeSns',
          'viceFreePorn',
        ]),
        label: 'Zéro Vice',
        icon: '🛡️',
      },
      perfectDay: {
        ...calculateCombinedStreak([
          'saversSilence',
          'saversAffirmations',
          'saversVisualization',
          'saversExercise',
          'saversReading',
          'saversScribing',
          'viceFreeCoke',
          'viceFreeBeer',
          'viceFreeWeed',
          'viceFreeSns',
          'viceFreePorn',
        ]),
        label: 'Jour Parfait',
        icon: '👑',
      },
    }
    
    return NextResponse.json({
      success: true,
      streaks,
      combined: combinedStreaks,
    })
  } catch (error) {
    console.error('Streaks GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
