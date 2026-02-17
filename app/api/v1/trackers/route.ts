import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-key-auth'
import { prisma } from '@/lib/prisma'
import { formatDateISO } from '@/lib/utils'

function apiError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

/**
 * GET /api/v1/trackers
 * List all custom trackers for the authenticated user.
 * Optional query params: year, month (for entry data)
 */
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  const apiSecret = request.headers.get('x-api-secret')

  const auth = await authenticateApiKey(apiKey, apiSecret)
  if (!auth) return apiError('Invalid or missing API credentials', 401)

  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    const trackers = await prisma.customTracker.findMany({
      where: { userId: auth.userId },
      include: {
        entries: {
          where: {
            date: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0),
            },
          },
        },
      },
      orderBy: { title: 'asc' },
    })

    const result = trackers.map((tracker) => ({
      id: tracker.id,
      title: tracker.title,
      color: tracker.color,
      icon: tracker.icon,
      createdAt: tracker.createdAt,
      monthlyTotal: tracker.entries.reduce((sum, e) => sum + e.amount, 0),
      entries: tracker.entries.map((e) => ({
        id: e.id,
        date: formatDateISO(e.date),
        amount: e.amount,
      })),
    }))

    return NextResponse.json({ success: true, trackers: result })
  } catch (error) {
    console.error('API v1 trackers GET error:', error)
    return apiError('Internal server error', 500)
  }
}

/**
 * POST /api/v1/trackers
 * Create a new custom tracker.
 * Body: { title: string, color?: string, icon?: string }
 */
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  const apiSecret = request.headers.get('x-api-secret')

  const auth = await authenticateApiKey(apiKey, apiSecret)
  if (!auth) return apiError('Invalid or missing API credentials', 401)

  try {
    const body = await request.json()
    const { title, color, icon } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return apiError('Tracker title is required', 400)
    }

    // Check for duplicate title
    const existing = await prisma.customTracker.findFirst({
      where: { userId: auth.userId, title: title.trim() },
    })
    if (existing) {
      return apiError('A tracker with this title already exists', 409)
    }

    const tracker = await prisma.customTracker.create({
      data: {
        userId: auth.userId,
        title: title.trim(),
        color: color || '#6366f1',
        icon: icon || '📊',
      },
    })

    return NextResponse.json({
      success: true,
      tracker: {
        id: tracker.id,
        title: tracker.title,
        color: tracker.color,
        icon: tracker.icon,
        createdAt: tracker.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('API v1 trackers POST error:', error)
    return apiError('Internal server error', 500)
  }
}
