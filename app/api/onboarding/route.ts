import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { generateOnboardingContent } from '@/lib/onboarding'

export async function POST(request: NextRequest) {
  try {
    // The user just created a Clerk account in the onboarding wizard,
    // so they should now be authenticated via Clerk session.
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated. Please create your account first.' },
        { status: 401 }
      )
    }

    // Get the Clerk user details (email, name)
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: 'Could not retrieve user details' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, age, disciplineLevel, painPoints, painPointsOther, vision, visionCustom, pactText } = body

    // Validate required fields with specific error messages
    if (!name) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 })
    }
    if (!age) {
      return NextResponse.json({ success: false, message: 'Age is required' }, { status: 400 })
    }
    if (!disciplineLevel) {
      return NextResponse.json({ success: false, message: 'Discipline level is required' }, { status: 400 })
    }
    if (!painPoints?.length) {
      return NextResponse.json({ success: false, message: 'At least one pain point is required' }, { status: 400 })
    }
    if (!vision?.length) {
      return NextResponse.json({ success: false, message: 'At least one vision is required' }, { status: 400 })
    }
    if (!pactText) {
      return NextResponse.json({ success: false, message: 'Pact text is required' }, { status: 400 })
    }

    const parsedAge = typeof age === 'number' ? age : parseInt(age, 10)
    if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 120) {
      return NextResponse.json(
        { success: false, message: 'Invalid age' },
        { status: 400 }
      )
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress || ''

    // Upsert the user — create DB record if it doesn't exist, or update if it does
    const updatedUser = await prisma.user.upsert({
      where: { clerkId },
      create: {
        clerkId,
        email,
        name,
        age: parsedAge,
        disciplineLevel,
        painPoints,
        painPointsOther: painPointsOther || null,
        vision,
        visionCustom: visionCustom || null,
        pactText,
        onboardingCompleted: true,
      },
      update: {
        name,
        age: parsedAge,
        disciplineLevel,
        painPoints,
        painPointsOther: painPointsOther || null,
        vision,
        visionCustom: visionCustom || null,
        pactText,
        onboardingCompleted: true,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        age: true,
        disciplineLevel: true,
        painPoints: true,
        painPointsOther: true,
        vision: true,
        visionCustom: true,
        pactText: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Generate personalized content
    const content = await generateOnboardingContent(painPoints, painPointsOther, vision, visionCustom)

    // Create finance trackers (CustomTracker — money-based, for Finances tab)
    if (content.financeTrackers?.length) {
      for (const tracker of content.financeTrackers) {
        try {
          await prisma.customTracker.create({
            data: {
              userId: updatedUser.id,
              title: tracker.title,
              icon: tracker.icon,
              color: tracker.color,
            },
          })
        } catch {
          // Ignore duplicate tracker errors
        }
      }
    }

    // Create custom protocols (CustomProtocol — boolean daily habits, for Dashboard score)
    if (content.protocols?.length) {
      for (const protocol of content.protocols) {
        try {
          await prisma.customProtocol.create({
            data: {
              userId: updatedUser.id,
              title: protocol.title,
              icon: protocol.icon,
            },
          })
        } catch {
          // Ignore duplicate protocol errors
        }
      }
    }

    // Create first 7-day challenge
    if (content.challenge) {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 7)

      await prisma.challenge.create({
        data: {
          userId: updatedUser.id,
          title: content.challenge.title,
          description: content.challenge.description,
          durationDays: 7,
          startDate,
          endDate,
          status: 'active',
        },
      })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      generatedContent: {
        affirmations: content.affirmations,
        financeTrackers: content.financeTrackers,
        protocols: content.protocols,
        challenge: content.challenge,
      },
    })
  } catch (error) {
    console.error('[Onboarding API] Full error:', error)
    console.error('[Onboarding API] Error message:', (error as Error).message)
    console.error('[Onboarding API] Error stack:', (error as Error).stack)
    
    // Return more detailed error for debugging
    const errorMessage = (error as Error).message || 'Server error'
    return NextResponse.json(
      { success: false, message: errorMessage, details: String(error) },
      { status: 500 }
    )
  }
}
