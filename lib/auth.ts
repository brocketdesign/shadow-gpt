import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'
import type { User } from './types'

/**
 * Get the current authenticated user from Clerk + DB.
 * Returns null if not signed in or no DB record found.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return null

    const user = await prisma.user.findUnique({
      where: { clerkId },
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

    return user
  } catch {
    return null
  }
}

/**
 * Ensure a DB user record exists for the given Clerk user.
 * Creates one if it doesn't exist. Returns the DB user.
 */
export async function ensureDbUser(clerkId: string, email: string, name?: string | null): Promise<User> {
  let user = await prisma.user.findUnique({
    where: { clerkId },
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

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email,
        name: name || null,
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
  }

  return user
}
