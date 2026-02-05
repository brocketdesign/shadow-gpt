import { NextRequest, NextResponse } from 'next/server'
import { getDailyAffirmation } from '@/lib/openai'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    const affirmation = await getDailyAffirmation(date)
    
    return NextResponse.json({
      success: true,
      affirmation,
      date,
    })
  } catch (error) {
    console.error('Affirmations GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
