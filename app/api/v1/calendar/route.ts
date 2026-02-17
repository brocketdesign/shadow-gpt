import { NextResponse } from 'next/server'

const COMING_SOON_RESPONSE = {
  success: false,
  error: 'Coming soon',
  message: 'The Calendar API endpoints are under development and will be available in a future release. Check the /docs page for updates.',
  availableEndpoints: [
    {
      method: 'GET',
      path: '/api/v1/calendar',
      description: 'Get daily tracking data for a month',
      status: 'coming_soon',
    },
    {
      method: 'POST',
      path: '/api/v1/calendar',
      description: 'Create or update a daily tracking entry',
      status: 'coming_soon',
    },
    {
      method: 'GET',
      path: '/api/v1/calendar/streaks',
      description: 'Get current streak data',
      status: 'coming_soon',
    },
  ],
}

export async function GET() {
  return NextResponse.json(COMING_SOON_RESPONSE, { status: 501 })
}

export async function POST() {
  return NextResponse.json(COMING_SOON_RESPONSE, { status: 501 })
}

export async function PATCH() {
  return NextResponse.json(COMING_SOON_RESPONSE, { status: 501 })
}
