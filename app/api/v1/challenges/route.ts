import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-key-auth'
import { prisma } from '@/lib/prisma'
import { formatDateISO } from '@/lib/utils'
import { addDays } from 'date-fns'

function apiError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

/**
 * GET /api/v1/challenges
 * List challenges for the authenticated user.
 * Optional query: status=active|completed|failed|archived
 */
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  const apiSecret = request.headers.get('x-api-secret')

  const auth = await authenticateApiKey(apiKey, apiSecret)
  if (!auth) return apiError('Invalid or missing API credentials', 401)

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: { userId: string; status?: string } = { userId: auth.userId }
    if (status) where.status = status

    const challenges = await prisma.challenge.findMany({
      where,
      include: { checkIns: true },
      orderBy: { createdAt: 'desc' },
    })

    const result = challenges.map((challenge) => {
      const successDays = challenge.checkIns.filter((c) => c.status === 'success').length
      const failedDays = challenge.checkIns.filter((c) => c.status === 'fail').length
      const skippedDays = challenge.checkIns.filter((c) => c.status === 'skip').length

      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        durationDays: challenge.durationDays,
        startDate: formatDateISO(challenge.startDate),
        endDate: formatDateISO(challenge.endDate),
        status: challenge.status,
        createdAt: challenge.createdAt,
        progress: {
          totalDays: challenge.durationDays,
          completedDays: successDays,
          failedDays,
          skippedDays,
          percentComplete: Math.round((successDays / challenge.durationDays) * 100),
        },
        checkIns: challenge.checkIns.map((c) => ({
          id: c.id,
          date: formatDateISO(c.date),
          status: c.status,
          notes: c.notes,
        })),
      }
    })

    return NextResponse.json({ success: true, challenges: result })
  } catch (error) {
    console.error('API v1 challenges GET error:', error)
    return apiError('Internal server error', 500)
  }
}

/**
 * POST /api/v1/challenges
 * Create a new challenge.
 * Body: { title: string, description?: string, durationDays: number, startDate?: string (YYYY-MM-DD) }
 */
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  const apiSecret = request.headers.get('x-api-secret')

  const auth = await authenticateApiKey(apiKey, apiSecret)
  if (!auth) return apiError('Invalid or missing API credentials', 401)

  try {
    const body = await request.json()
    const { title, description, durationDays, startDate } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return apiError('Challenge title is required', 400)
    }
    if (!durationDays || typeof durationDays !== 'number' || durationDays < 1 || durationDays > 365) {
      return apiError('durationDays must be a number between 1 and 365', 400)
    }

    const start = startDate
      ? new Date(startDate + 'T00:00:00.000Z')
      : new Date(new Date().toISOString().split('T')[0] + 'T00:00:00.000Z')
    const end = addDays(start, durationDays - 1)

    const challenge = await prisma.challenge.create({
      data: {
        userId: auth.userId,
        title: title.trim(),
        description: description?.trim() || null,
        durationDays,
        startDate: start,
        endDate: end,
        status: 'active',
      },
    })

    return NextResponse.json({
      success: true,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        durationDays: challenge.durationDays,
        startDate: formatDateISO(challenge.startDate),
        endDate: formatDateISO(challenge.endDate),
        status: challenge.status,
        createdAt: challenge.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('API v1 challenges POST error:', error)
    return apiError('Internal server error', 500)
  }
}
