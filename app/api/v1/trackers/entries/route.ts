import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-key-auth'
import { prisma } from '@/lib/prisma'
import { formatDateISO } from '@/lib/utils'

function apiError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

/**
 * GET /api/v1/trackers/entries?trackerId=xxx&year=2026&month=2
 * List entries for a specific tracker.
 */
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  const apiSecret = request.headers.get('x-api-secret')

  const auth = await authenticateApiKey(apiKey, apiSecret)
  if (!auth) return apiError('Invalid or missing API credentials', 401)

  try {
    const { searchParams } = new URL(request.url)
    const trackerId = searchParams.get('trackerId')

    if (!trackerId) return apiError('trackerId is required', 400)

    // Verify the tracker belongs to the user
    const tracker = await prisma.customTracker.findFirst({
      where: { id: trackerId, userId: auth.userId },
    })
    if (!tracker) return apiError('Tracker not found', 404)

    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    const entries = await prisma.customTrackerEntry.findMany({
      where: {
        trackerId,
        date: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({
      success: true,
      tracker: {
        id: tracker.id,
        title: tracker.title,
      },
      entries: entries.map((e) => ({
        id: e.id,
        date: formatDateISO(e.date),
        amount: e.amount,
      })),
    })
  } catch (error) {
    console.error('API v1 tracker entries GET error:', error)
    return apiError('Internal server error', 500)
  }
}

/**
 * POST /api/v1/trackers/entries
 * Add or update an entry for a tracker.
 * Body: { trackerId: string, date: string (YYYY-MM-DD), amount: number }
 */
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  const apiSecret = request.headers.get('x-api-secret')

  const auth = await authenticateApiKey(apiKey, apiSecret)
  if (!auth) return apiError('Invalid or missing API credentials', 401)

  try {
    const body = await request.json()
    const { trackerId, date, amount } = body

    if (!trackerId) return apiError('trackerId is required', 400)
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return apiError('date is required in YYYY-MM-DD format', 400)
    }
    if (amount === undefined || typeof amount !== 'number') {
      return apiError('amount is required and must be a number', 400)
    }

    // Verify tracker belongs to user
    const tracker = await prisma.customTracker.findFirst({
      where: { id: trackerId, userId: auth.userId },
    })
    if (!tracker) return apiError('Tracker not found', 404)

    const entryDate = new Date(date + 'T00:00:00.000Z')

    // Upsert the entry
    const entry = await prisma.customTrackerEntry.upsert({
      where: {
        trackerId_date: { trackerId, date: entryDate },
      },
      update: { amount },
      create: {
        trackerId,
        date: entryDate,
        amount,
      },
    })

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        trackerId: entry.trackerId,
        date: formatDateISO(entry.date),
        amount: entry.amount,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('API v1 tracker entries POST error:', error)
    return apiError('Internal server error', 500)
  }
}
