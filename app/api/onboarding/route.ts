import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOnboardingContent } from '@/lib/onboarding'

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
    const { name, age, disciplineLevel, painPoints, painPointsOther, vision, visionCustom, pactText } = body

    if (!name || !age || !disciplineLevel || !painPoints?.length || !vision?.length || !pactText) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Update user profile with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        age: parseInt(age, 10),
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

    // Generate personalized content in the background
    const content = await generateOnboardingContent(painPoints, painPointsOther, vision, visionCustom)

    // Create suggested trackers
    if (content.trackers?.length) {
      for (const tracker of content.trackers) {
        try {
          await prisma.customTracker.create({
            data: {
              userId: user.id,
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

    // Create first 7-day challenge
    if (content.challenge) {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 7)

      await prisma.challenge.create({
        data: {
          userId: user.id,
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
        trackers: content.trackers,
        challenge: content.challenge,
      },
    })
  } catch (error) {
    console.error('Onboarding API error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
