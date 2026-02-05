import { NextRequest, NextResponse } from 'next/server'
import { register, login, logout, getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password, name } = body
    
    switch (action) {
      case 'register': {
        if (!email || !password || !name) {
          return NextResponse.json(
            { success: false, message: 'Tous les champs sont requis' },
            { status: 400 }
          )
        }
        const result = await register(email, password, name)
        return NextResponse.json(result)
      }
      
      case 'login': {
        if (!email || !password) {
          return NextResponse.json(
            { success: false, message: 'Email et mot de passe requis' },
            { status: 400 }
          )
        }
        const result = await login(email, password)
        return NextResponse.json(result)
      }
      
      case 'logout': {
        const result = await logout()
        return NextResponse.json(result)
      }
      
      default:
        return NextResponse.json(
          { success: false, message: 'Action non reconnue' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Auth API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

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
