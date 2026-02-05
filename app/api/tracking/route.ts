import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDateISO } from '@/lib/utils'

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
    const action = searchParams.get('action')
    const date = searchParams.get('date')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
    
    switch (action) {
      case 'get_day_data': {
        if (!date) {
          return NextResponse.json(
            { success: false, message: 'Date manquante' },
            { status: 400 }
          )
        }
        
        const dayData = await prisma.dailyTracking.findUnique({
          where: {
            userId_date: {
              userId: user.id,
              date: new Date(date),
            },
          },
        })
        
        return NextResponse.json({
          success: true,
          data: dayData ? {
            ...dayData,
            date: formatDateISO(dayData.date),
          } : null,
        })
      }
      
      case 'get_month_data': {
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0)
        
        const monthData = await prisma.dailyTracking.findMany({
          where: {
            userId: user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { date: 'asc' },
        })
        
        const dataMap: Record<string, typeof monthData[0]> = {}
        for (const day of monthData) {
          dataMap[formatDateISO(day.date)] = day
        }
        
        return NextResponse.json({
          success: true,
          data: dataMap,
        })
      }
      
      default:
        return NextResponse.json(
          { success: false, message: 'Action non reconnue' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Tracking GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non connecté' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { action, date, ...data } = body
    
    switch (action) {
      case 'update_day': {
        if (!date) {
          return NextResponse.json(
            { success: false, message: 'Date manquante' },
            { status: 400 }
          )
        }
        
        const dayData = await prisma.dailyTracking.upsert({
          where: {
            userId_date: {
              userId: user.id,
              date: new Date(date),
            },
          },
          update: {
            saversSilence: data.saversSilence ?? false,
            saversAffirmations: data.saversAffirmations ?? false,
            saversVisualization: data.saversVisualization ?? false,
            saversExercise: data.saversExercise ?? false,
            saversReading: data.saversReading ?? false,
            saversScribing: data.saversScribing ?? false,
            viceFreeCoke: data.viceFreeCoke ?? false,
            viceFreeBeer: data.viceFreeBeer ?? false,
            viceFreeWeed: data.viceFreeWeed ?? false,
            viceFreeSns: data.viceFreeSns ?? false,
            viceFreePorn: data.viceFreePorn ?? false,
            dailyAffirmation: data.dailyAffirmation,
            notes: data.notes,
            moodRating: data.moodRating,
            energyLevel: data.energyLevel,
          },
          create: {
            userId: user.id,
            date: new Date(date),
            saversSilence: data.saversSilence ?? false,
            saversAffirmations: data.saversAffirmations ?? false,
            saversVisualization: data.saversVisualization ?? false,
            saversExercise: data.saversExercise ?? false,
            saversReading: data.saversReading ?? false,
            saversScribing: data.saversScribing ?? false,
            viceFreeCoke: data.viceFreeCoke ?? false,
            viceFreeBeer: data.viceFreeBeer ?? false,
            viceFreeWeed: data.viceFreeWeed ?? false,
            viceFreeSns: data.viceFreeSns ?? false,
            viceFreePorn: data.viceFreePorn ?? false,
            dailyAffirmation: data.dailyAffirmation,
            notes: data.notes,
            moodRating: data.moodRating,
            energyLevel: data.energyLevel,
          },
        })
        
        return NextResponse.json({
          success: true,
          data: {
            ...dayData,
            date: formatDateISO(dayData.date),
          },
        })
      }
      
      default:
        return NextResponse.json(
          { success: false, message: 'Action non reconnue' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Tracking POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
