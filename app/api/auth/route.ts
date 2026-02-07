import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    return NextResponse.json({
      success: true,
      authenticated: !!user,
      user,
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({
      success: false,
      authenticated: false,
      user: null,
    })
  }
}
