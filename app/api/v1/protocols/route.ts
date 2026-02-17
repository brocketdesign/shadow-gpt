import { NextResponse } from 'next/server'

const COMING_SOON_RESPONSE = {
  success: false,
  error: 'Coming soon',
  message: 'The Custom Protocols API endpoints are under development and will be available in a future release. Check the /docs page for updates.',
  availableEndpoints: [
    {
      method: 'GET',
      path: '/api/v1/protocols',
      description: 'List all custom protocols',
      status: 'coming_soon',
    },
    {
      method: 'POST',
      path: '/api/v1/protocols',
      description: 'Create a new custom protocol',
      status: 'coming_soon',
    },
    {
      method: 'POST',
      path: '/api/v1/protocols/entries',
      description: 'Log a protocol entry for a specific date',
      status: 'coming_soon',
    },
    {
      method: 'GET',
      path: '/api/v1/protocols/entries',
      description: 'Get protocol entries for a date range',
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
