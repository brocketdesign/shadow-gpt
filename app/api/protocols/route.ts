import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDateISO } from '@/lib/utils'
import { checkTrackerLimit } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const date = searchParams.get('date')

    switch (action) {
      case 'list': {
        const protocols = await prisma.customProtocol.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'asc' },
        })

        return NextResponse.json({
          success: true,
          protocols,
        })
      }

      case 'get_day': {
        if (!date) {
          return NextResponse.json(
            { success: false, message: 'Date required' },
            { status: 400 }
          )
        }

        const protocols = await prisma.customProtocol.findMany({
          where: { userId: user.id },
          include: {
            entries: {
              where: { date: new Date(date) },
            },
          },
          orderBy: { createdAt: 'asc' },
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = protocols.map((protocol: any) => ({
          id: protocol.id,
          title: protocol.title,
          icon: protocol.icon,
          completed: protocol.entries.length > 0 ? protocol.entries[0].completed : false,
          entryId: protocol.entries.length > 0 ? protocol.entries[0].id : null,
        }))

        return NextResponse.json({
          success: true,
          protocols: result,
        })
      }

      default:
        return NextResponse.json(
          { success: false, message: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Protocols GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create': {
        const { title, icon } = body

        if (!title) {
          return NextResponse.json(
            { success: false, message: 'Title required' },
            { status: 400 }
          )
        }



        const canCreate = await checkTrackerLimit()
        if (!canCreate) {
          return NextResponse.json(
            { success: false, message: 'Free plan limit reached (max 3 protocols). Upgrade to add more.' },
            { status: 403 }
          )
        }

        const protocol = await prisma.customProtocol.create({
          data: {
            userId: user.id,
            title,
            icon: icon || '✅',
          },
        })

        return NextResponse.json({
          success: true,
          protocol,
        })
      }

      case 'toggle': {
        const { protocolId, date, completed } = body

        if (!protocolId || !date) {
          return NextResponse.json(
            { success: false, message: 'Protocol ID and date required' },
            { status: 400 }
          )
        }

        // Verify protocol belongs to user
        const protocol = await prisma.customProtocol.findFirst({
          where: { id: protocolId, userId: user.id },
        })

        if (!protocol) {
          return NextResponse.json(
            { success: false, message: 'Protocol not found' },
            { status: 404 }
          )
        }

        const entry = await prisma.customProtocolEntry.upsert({
          where: {
            protocolId_date: {
              protocolId,
              date: new Date(date),
            },
          },
          update: {
            completed: completed ?? true,
          },
          create: {
            protocolId,
            date: new Date(date),
            completed: completed ?? true,
          },
        })

        return NextResponse.json({
          success: true,
          entry: {
            ...entry,
            date: formatDateISO(entry.date),
          },
        })
      }

      case 'delete': {
        const { protocolId } = body

        if (!protocolId) {
          return NextResponse.json(
            { success: false, message: 'Protocol ID required' },
            { status: 400 }
          )
        }

        await prisma.customProtocol.deleteMany({
          where: { id: protocolId, userId: user.id },
        })

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json(
          { success: false, message: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Protocols POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
