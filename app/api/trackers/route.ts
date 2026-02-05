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
      case 'list': {
        const trackers = await prisma.customTracker.findMany({
          where: { userId: user.id },
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
        
        const trackersWithTotals = trackers.map((tracker) => ({
          ...tracker,
          monthlyTotal: tracker.entries.reduce((sum, e) => sum + e.amount, 0),
          entries: tracker.entries.map((e) => ({
            ...e,
            date: formatDateISO(e.date),
          })),
        }))
        
        return NextResponse.json({
          success: true,
          trackers: trackersWithTotals,
        })
      }
      
      case 'get_entries': {
        if (!date) {
          return NextResponse.json(
            { success: false, message: 'Date manquante' },
            { status: 400 }
          )
        }
        
        const trackers = await prisma.customTracker.findMany({
          where: { userId: user.id },
          include: {
            entries: {
              where: { date: new Date(date) },
            },
          },
        })
        
        const entries = trackers.flatMap((tracker) =>
          tracker.entries.map((e) => ({
            ...e,
            date: formatDateISO(e.date),
            trackerTitle: tracker.title,
            trackerIcon: tracker.icon,
            trackerColor: tracker.color,
          }))
        )
        
        return NextResponse.json({
          success: true,
          entries,
        })
      }
      
      case 'dashboard': {
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0)
        
        const trackers = await prisma.customTracker.findMany({
          where: { userId: user.id },
          include: {
            entries: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              orderBy: { date: 'asc' },
            },
          },
        })
        
        const stats = {
          totalAmount: 0,
          daysWithEntries: new Set<string>(),
          totalEntries: 0,
        }
        
        const totals: { trackerId: string; title: string; icon: string; color: string; total: number }[] = []
        const allEntries: { id: string; date: string; amount: number; trackerTitle: string; trackerIcon: string }[] = []
        
        for (const tracker of trackers) {
          const trackerTotal = tracker.entries.reduce((sum, e) => sum + e.amount, 0)
          totals.push({
            trackerId: tracker.id,
            title: tracker.title,
            icon: tracker.icon || '📊',
            color: tracker.color || '#6366f1',
            total: trackerTotal,
          })
          
          stats.totalAmount += trackerTotal
          stats.totalEntries += tracker.entries.length
          
          for (const entry of tracker.entries) {
            stats.daysWithEntries.add(formatDateISO(entry.date))
            allEntries.push({
              id: entry.id,
              date: formatDateISO(entry.date),
              amount: entry.amount,
              trackerTitle: tracker.title,
              trackerIcon: tracker.icon || '📊',
            })
          }
        }
        
        return NextResponse.json({
          success: true,
          stats: {
            totalAmount: stats.totalAmount,
            daysWithEntries: stats.daysWithEntries.size,
            totalEntries: stats.totalEntries,
          },
          totals,
          entries: allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        })
      }
      
      default:
        return NextResponse.json(
          { success: false, message: 'Action non reconnue' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Trackers GET error:', error)
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
    const { action } = body
    
    switch (action) {
      case 'create': {
        const { title, icon, color } = body
        
        if (!title) {
          return NextResponse.json(
            { success: false, message: 'Titre requis' },
            { status: 400 }
          )
        }
        
        const tracker = await prisma.customTracker.create({
          data: {
            userId: user.id,
            title,
            icon: icon || '📊',
            color: color || '#6366f1',
          },
        })
        
        return NextResponse.json({
          success: true,
          tracker,
        })
      }
      
      case 'add_entry': {
        const { trackerId, date, amount } = body
        
        if (!trackerId || !date) {
          return NextResponse.json(
            { success: false, message: 'Tracker ID et date requis' },
            { status: 400 }
          )
        }
        
        // Verify tracker belongs to user
        const tracker = await prisma.customTracker.findFirst({
          where: { id: trackerId, userId: user.id },
        })
        
        if (!tracker) {
          return NextResponse.json(
            { success: false, message: 'Tracker non trouvé' },
            { status: 404 }
          )
        }
        
        const entry = await prisma.customTrackerEntry.upsert({
          where: {
            trackerId_date: {
              trackerId,
              date: new Date(date),
            },
          },
          update: {
            amount: parseFloat(amount) || 0,
          },
          create: {
            trackerId,
            date: new Date(date),
            amount: parseFloat(amount) || 0,
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
      
      case 'delete_entry': {
        const { entryId } = body
        
        if (!entryId) {
          return NextResponse.json(
            { success: false, message: 'Entry ID requis' },
            { status: 400 }
          )
        }
        
        // Verify entry belongs to user's tracker
        const entry = await prisma.customTrackerEntry.findUnique({
          where: { id: entryId },
          include: { tracker: true },
        })
        
        if (!entry || entry.tracker.userId !== user.id) {
          return NextResponse.json(
            { success: false, message: 'Entrée non trouvée' },
            { status: 404 }
          )
        }
        
        await prisma.customTrackerEntry.delete({
          where: { id: entryId },
        })
        
        return NextResponse.json({ success: true })
      }
      
      case 'delete_tracker': {
        const { trackerId } = body
        
        if (!trackerId) {
          return NextResponse.json(
            { success: false, message: 'Tracker ID requis' },
            { status: 400 }
          )
        }
        
        await prisma.customTracker.deleteMany({
          where: { id: trackerId, userId: user.id },
        })
        
        return NextResponse.json({ success: true })
      }
      
      default:
        return NextResponse.json(
          { success: false, message: 'Action non reconnue' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Trackers POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
