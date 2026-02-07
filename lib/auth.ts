import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { User } from './types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key'
)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
  
  return token
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) return null
  
  const payload = await verifyToken(token)
  if (!payload) return null
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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
    
    return user
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}

export async function register(email: string, password: string, name: string) {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })
  
  if (existingUser) {
    return { success: false, message: 'Email déjà utilisé' }
  }
  
  // Hash password and create user
  const hashedPassword = await hashPassword(password)
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
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
  
  // Create token
  const token = await createToken(user.id)
  await setAuthCookie(token)
  
  return { success: true, user, token }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })
  
  if (!user) {
    return { success: false, message: 'Email ou mot de passe incorrect' }
  }
  
  const isValid = await verifyPassword(password, user.password)
  
  if (!isValid) {
    return { success: false, message: 'Email ou mot de passe incorrect' }
  }
  
  // Create token
  const token = await createToken(user.id)
  await setAuthCookie(token)
  
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      disciplineLevel: user.disciplineLevel,
      painPoints: user.painPoints,
      painPointsOther: user.painPointsOther,
      vision: user.vision,
      visionCustom: user.visionCustom,
      pactText: user.pactText,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  }
}

export async function logout() {
  await clearAuthCookie()
  return { success: true }
}
