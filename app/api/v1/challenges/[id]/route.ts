import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-key-auth'
import { prisma } from '@/lib/prisma'
import { formatDateISO } from '@/lib/utils'

function apiError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

/**
 * GET /api/v1/challenges/[id]
 * Get a single challenge by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKey = request.headers.get('x-api-key')
  const apiSecret = request.headers.get('x-api-secret')

  const auth = await authenticateApiKey(apiKey, apiSecret)
  if (!auth) return apiError('Invalid or missing API credentials', 401)

  try {
    const challenge = await prisma.challenge.findFirst({
      where: { id: params.id, userId: auth.userId },
      include: { checkIns: true },
    })

    if (!challenge) return apiError('Challenge not found', 404)

    const successDays = challenge.checkIns.filter((c) => c.status === 'success').length
    const failedDays = challenge.checkIns.filter((c) => c.status === 'fail').length
    const skippedDays = challenge.checkIns.filter((c) => c.status === 'skip').length

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
      },
    })
  } catch (error) {
    console.error('API v1 challenge GET error:', error)
    return apiError('Internal server error', 500)
  }
}

/**
 * PATCH /api/v1/challenges/[id]
 * Update a challenge (title, description, status).
 * Body: { title?: string, description?: string, status?: "active"|"completed"|"failed"|"archived" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKey = request.headers.get('x-api-key')
  const apiSecret = request.headers.get('x-api-secret')

  const auth = await authenticateApiKey(apiKey, apiSecret)
  if (!auth) return apiError('Invalid or missing API credentials', 401)

  try {
    // Verify challenge belongs to user
    const existing = await prisma.challenge.findFirst({
      where: { id: params.id, userId: auth.userId },
    })
    if (!existing) return apiError('Challenge not found', 404)

    const body = await request.json()
    const { title, description, status } = body

    const validStatuses = ['active', 'completed', 'failed', 'archived']
    if (status && !validStatuses.includes(status)) {
      return apiError(`status must be one of: ${validStatuses.join(', ')}`, 400)
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (status !== undefined) updateData.status = status

    if (Object.keys(updateData).length === 0) {
      return apiError('No fields to update', 400)
    }

    const challenge = await prisma.challenge.update({
      where: { id: params.id },
      data: updateData,
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
        updatedAt: challenge.updatedAt,
      },
    })
  } catch (error) {
    console.error('API v1 challenge PATCH error:', error)
    return apiError('Internal server error', 500)
  }
}
