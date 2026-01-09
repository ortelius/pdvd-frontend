import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const graphqlEndpoint =
    process.env.RUNTIME_GRAPHQL_ENDPOINT !== undefined
      ? process.env.RUNTIME_GRAPHQL_ENDPOINT
      : 'http://localhost:3000/api/v1/graphql'

  const restEndpoint =
    process.env.RUNTIME_REST_ENDPOINT !== undefined
      ? process.env.RUNTIME_REST_ENDPOINT
      : 'http://localhost:3000/api/v1'

  return NextResponse.json({
    graphqlEndpoint,
    restEndpoint
  })
}

export const dynamic = 'force-dynamic'