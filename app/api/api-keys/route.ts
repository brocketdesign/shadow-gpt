import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateApiKeyPair } from '@/lib/api-key-auth'

// GET /api/api-keys - List all API keys for the current user
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        key: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, apiKeys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/api-keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'API key name is required' },
        { status: 400 }
      )
    }

    // Limit API keys per user
    const existingCount = await prisma.apiKey.count({ where: { userId: user.id } })
    if (existingCount >= 10) {
      return NextResponse.json(
        { success: false, message: 'Maximum of 10 API keys allowed per user' },
        { status: 400 }
      )
    }

    const { key, secret, hashedSecret } = generateApiKeyPair()

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: name.trim(),
        key,
        secret: hashedSecret,
      },
      select: {
        id: true,
        name: true,
        key: true,
        createdAt: true,
      },
    })

    // Return the plain secret only once at creation time
    return NextResponse.json({
      success: true,
      apiKey: {
        ...apiKey,
        secret, // Plain text - shown only once
      },
    })
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/api-keys - Delete an API key
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json(
        { success: false, message: 'API key ID is required' },
        { status: 400 }
      )
    }

    // Make sure the key belongs to this user
    const apiKey = await prisma.apiKey.findFirst({
      where: { id: keyId, userId: user.id },
    })

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'API key not found' },
        { status: 404 }
      )
    }

    await prisma.apiKey.delete({ where: { id: keyId } })

    return NextResponse.json({ success: true, message: 'API key deleted' })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
