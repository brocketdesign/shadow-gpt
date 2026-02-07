import { NextResponse } from 'next/server'
import { checkSubscription } from '@/lib/subscription'

export async function GET() {
    try {
        const isPro = await checkSubscription()

        return NextResponse.json({ isPro })
    } catch (error) {
        console.error('Subscription status check error:', error)
        return NextResponse.json({ isPro: false })
    }
}
