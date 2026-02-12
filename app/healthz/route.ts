import { NextResponse } from 'next/server'

export async function GET() {

  const restEndpoint =
    process.env.RUNTIME_REST_ENDPOINT !== undefined
      ? process.env.RUNTIME_REST_ENDPOINT
      : 'http://localhost:3000/api/v1'

  try {
    const url = new URL(restEndpoint)
    const backendRoot = `${url.protocol}//${url.host}`

    const res = await fetch(`${backendRoot}`, { 
      signal: AbortSignal.timeout(3000), // 3s timeout
      cache: 'no-store' 
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('Health check dependency failed:', error);
    // 4. Failure: Return 500 to signal GCLB to stop traffic
    return new NextResponse('Unhealthy', { status: 500 });
  }
}

// Ensure this route is evaluated at request time
export const dynamic = 'force-dynamic';