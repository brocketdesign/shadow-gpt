import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDateISO } from '@/lib/utils'
import { enhanceDescription } from '@/lib/openai'
import { addDays } from 'date-fns'

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
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    
    switch (action) {
      case 'list': {
        const where: { userId: string; status?: string } = { userId: user.id }
        if (status) {
          where.status = status
        }
        
        const challenges = await prisma.challenge.findMany({
          where,
          include: {
            checkIns: true,
          },
          orderBy: { createdAt: 'desc' },
        })
        
        // Calculate progress for each challenge
        const challengesWithProgress = challenges.map((challenge) => {
          const totalDays = challenge.durationDays
          const successDays = challenge.checkIns.filter((c) => c.status === 'success').length
          const failedDays = challenge.checkIns.filter((c) => c.status === 'fail').length
          const skippedDays = challenge.checkIns.filter((c) => c.status === 'skip').length
          
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const startDate = new Date(challenge.startDate)
          const endDate = new Date(challenge.endDate)
          
          const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
          const daysRemaining = Math.max(0, Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1)
          
          // Calculate current streak
          let currentStreak = 0
          const sortedCheckIns = [...challenge.checkIns].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          
          for (const checkIn of sortedCheckIns) {
            if (checkIn.status === 'success') {
              currentStreak++
            } else {
              break
            }
          }
          
          // Calculate best streak
          let bestStreak = 0
          let streak = 0
          for (const checkIn of [...challenge.checkIns].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )) {
            if (checkIn.status === 'success') {
              streak++
              bestStreak = Math.max(bestStreak, streak)
            } else {
              streak = 0
            }
          }
          
          return {
            ...challenge,
            startDate: formatDateISO(challenge.startDate),
            endDate: formatDateISO(challenge.endDate),
            checkIns: challenge.checkIns.map((c) => ({
              ...c,
              date: formatDateISO(c.date),
            })),
            progress: {
              totalDays,
              completedDays: successDays,
              failedDays,
              skippedDays,
              currentStreak,
              bestStreak,
              percentComplete: Math.round((successDays / totalDays) * 100),
              daysRemaining,
            },
          }
        })
        
        return NextResponse.json({
          success: true,
          challenges: challengesWithProgress,
        })
      }
      
      case 'get': {
        if (!id) {
          return NextResponse.json(
            { success: false, message: 'ID required' },
            { status: 400 }
          )
        }
        
        const challenge = await prisma.challenge.findFirst({
          where: { id, userId: user.id },
          include: { checkIns: true },
        })
        
        if (!challenge) {
          return NextResponse.json(
            { success: false, message: 'Challenge not found' },
            { status: 404 }
          )
        }
        
        return NextResponse.json({
          success: true,
          challenge: {
            ...challenge,
            startDate: formatDateISO(challenge.startDate),
            endDate: formatDateISO(challenge.endDate),
            checkIns: challenge.checkIns.map((c) => ({
              ...c,
              date: formatDateISO(c.date),
            })),
          },
        })
      }
      
      default:
        return NextResponse.json(
          { success: false, message: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Challenges GET error:', error)
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
        const { title, description, durationDays, startDate } = body
        
        if (!title || !durationDays) {
          return NextResponse.json(
            { success: false, message: 'Title and duration required' },
            { status: 400 }
          )
        }
        
        const start = startDate ? new Date(startDate) : new Date()
        start.setHours(0, 0, 0, 0)
        const end = addDays(start, durationDays - 1)
        
        const challenge = await prisma.challenge.create({
          data: {
            userId: user.id,
            title,
            description,
            durationDays,
            startDate: start,
            endDate: end,
            status: 'active',
          },
        })
        
        return NextResponse.json({
          success: true,
          challenge: {
            ...challenge,
            startDate: formatDateISO(challenge.startDate),
            endDate: formatDateISO(challenge.endDate),
          },
        })
      }
      
      case 'check_in': {
        const { challengeId, date, status, notes } = body
        
        if (!challengeId || !date) {
          return NextResponse.json(
            { success: false, message: 'Challenge ID and date required' },
            { status: 400 }
          )
        }
        
        // Verify challenge belongs to user
        const challenge = await prisma.challenge.findFirst({
          where: { id: challengeId, userId: user.id },
        })
        
        if (!challenge) {
          return NextResponse.json(
            { success: false, message: 'Challenge not found' },
            { status: 404 }
          )
        }
        
        const checkIn = await prisma.challengeCheckIn.upsert({
          where: {
            challengeId_date: {
              challengeId,
              date: new Date(date),
            },
          },
          update: {
            status: status || 'success',
            notes,
          },
          create: {
            challengeId,
            date: new Date(date),
            status: status || 'success',
            notes,
          },
        })
        
        return NextResponse.json({
          success: true,
          checkIn: {
            ...checkIn,
            date: formatDateISO(checkIn.date),
          },
        })
      }
      
      case 'enhance_description': {
        const { title, description } = body
        const enhanced = await enhanceDescription(title, description)
        return NextResponse.json({
          success: true,
          description: enhanced,
        })
      }
      
      case 'delete': {
        const { challengeId } = body
        
        if (!challengeId) {
          return NextResponse.json(
            { success: false, message: 'Challenge ID required' },
            { status: 400 }
          )
        }
        
        await prisma.challenge.deleteMany({
          where: { id: challengeId, userId: user.id },
        })
        
        return NextResponse.json({ success: true })
      }
      
      case 'update_status': {
        const { challengeId, status } = body
        
        if (!challengeId || !status) {
          return NextResponse.json(
            { success: false, message: 'Challenge ID and status required' },
            { status: 400 }
          )
        }
        
        await prisma.challenge.updateMany({
          where: { id: challengeId, userId: user.id },
          data: { status },
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
    console.error('Challenges POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
