import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-key-auth'
import { prisma } from '@/lib/prisma'
import { formatDateISO } from '@/lib/utils'

function apiError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

/**
 * GET /api/v1/calendar
 * Retrieve daily tracking data.
 *
 * Query params:
 *   date       – single date YYYY-MM-DD  (returns one day)
 *   year/month – (returns full month map, defaults to current month)
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(
    request.headers.get('x-api-key'),
    request.headers.get('x-api-secret'),
  )
  if (!auth) return apiError('Invalid or missing API credentials', 401)

  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    // --- Single day ---
    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return apiError('date must be in YYYY-MM-DD format', 400)
      }

      const dayData = await prisma.dailyTracking.findUnique({
        where: {
          userId_date: {
            userId: auth.userId,
            date: new Date(date + 'T00:00:00.000Z'),
          },
        },
      })

      if (!dayData) {
        return NextResponse.json({ success: true, data: null })
      }

      return NextResponse.json({
        success: true,
        data: formatDayData(dayData),
      })
    }

    // --- Full month ---
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    if (month < 1 || month > 12) return apiError('month must be 1-12', 400)

    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 0))

    const monthData = await prisma.dailyTracking.findMany({
      where: {
        userId: auth.userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    })

    const dataMap: Record<string, ReturnType<typeof formatDayData>> = {}
    for (const day of monthData) {
      dataMap[formatDateISO(day.date)] = formatDayData(day)
    }

    return NextResponse.json({
      success: true,
      year,
      month,
      daysTracked: monthData.length,
      data: dataMap,
    })
  } catch (error) {
    console.error('API v1 calendar GET error:', error)
    return apiError('Internal server error', 500)
  }
}

/**
 * POST /api/v1/calendar
 * Create or update a daily tracking entry.
 *
 * Body: { date: "YYYY-MM-DD", ...fields }
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(
    request.headers.get('x-api-key'),
    request.headers.get('x-api-secret'),
  )
  if (!auth) return apiError('Invalid or missing API credentials', 401)

  try {
    const body = await request.json()
    const { date, ...fields } = body

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return apiError('date is required in YYYY-MM-DD format', 400)
    }

    const trackingFields = {
      saversSilence: fields.saversSilence ?? false,
      saversAffirmations: fields.saversAffirmations ?? false,
      saversVisualization: fields.saversVisualization ?? false,
      saversExercise: fields.saversExercise ?? false,
      saversReading: fields.saversReading ?? false,
      saversScribing: fields.saversScribing ?? false,
      viceFreeCoke: fields.viceFreeCoke ?? false,
      viceFreeBeer: fields.viceFreeBeer ?? false,
      viceFreeWeed: fields.viceFreeWeed ?? false,
      viceFreeSns: fields.viceFreeSns ?? false,
      viceFreePorn: fields.viceFreePorn ?? false,
      dailyAffirmation: fields.dailyAffirmation ?? null,
      notes: fields.notes ?? null,
      moodRating: typeof fields.moodRating === 'number' ? fields.moodRating : null,
      energyLevel: typeof fields.energyLevel === 'number' ? fields.energyLevel : null,
    }

    const entryDate = new Date(date + 'T00:00:00.000Z')

    const dayData = await prisma.dailyTracking.upsert({
      where: {
        userId_date: {
          userId: auth.userId,
          date: entryDate,
        },
      },
      update: trackingFields,
      create: {
        userId: auth.userId,
        date: entryDate,
        ...trackingFields,
      },
    })

    return NextResponse.json({
      success: true,
      data: formatDayData(dayData),
    }, { status: 201 })
  } catch (error) {
    console.error('API v1 calendar POST error:', error)
    return apiError('Internal server error', 500)
  }
}

// ---- helpers ----

function formatDayData(day: {
  id: string
  date: Date
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
  dailyAffirmation: string | null
  notes: string | null
  moodRating: number | null
  energyLevel: number | null
}) {
  const saversCount = [
    day.saversSilence,
    day.saversAffirmations,
    day.saversVisualization,
    day.saversExercise,
    day.saversReading,
    day.saversScribing,
  ].filter(Boolean).length

  const vicesCount = [
    day.viceFreeCoke,
    day.viceFreeBeer,
    day.viceFreeWeed,
    day.viceFreeSns,
    day.viceFreePorn,
  ].filter(Boolean).length

  return {
    id: day.id,
    date: formatDateISO(day.date),
    savers: {
      silence: day.saversSilence,
      affirmations: day.saversAffirmations,
      visualization: day.saversVisualization,
      exercise: day.saversExercise,
      reading: day.saversReading,
      scribing: day.saversScribing,
      score: `${saversCount}/6`,
    },
    vices: {
      cokeFree: day.viceFreeCoke,
      beerFree: day.viceFreeBeer,
      weedFree: day.viceFreeWeed,
      snsFree: day.viceFreeSns,
      pornFree: day.viceFreePorn,
      score: `${vicesCount}/5`,
    },
    dailyAffirmation: day.dailyAffirmation,
    notes: day.notes,
    moodRating: day.moodRating,
    energyLevel: day.energyLevel,
  }
}
