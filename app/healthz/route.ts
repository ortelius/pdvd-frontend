import { NextResponse } from 'next/server'

export async function GET() {
  let restEndpoint;

  // 1. Priority: Internal Kubernetes Service Discovery
  // We check this FIRST. If these exist, we are inside the cluster and should
  // use the internal network to avoid the 502 loop on the external Ingress.
  // Service Name: 'pdvd-backend' -> Env Var: 'PDVD_BACKEND_SERVICE_HOST'
  if (process.env.PDVD_BACKEND_SERVICE_HOST) {
    const host = process.env.PDVD_BACKEND_SERVICE_HOST;
    const port = process.env.PDVD_BACKEND_SERVICE_PORT || '8080';
    restEndpoint = `http://${host}:${port}/api/v1`;
    console.log(`Health Check: Using internal K8s service: ${restEndpoint}`);
  } 
  
  // 2. Fallback: Configured Env Var (External URL)
  // We use this only if we are NOT in the cluster (or the backend service is missing).
  else if (process.env.RUNTIME_REST_ENDPOINT) {
    restEndpoint = process.env.RUNTIME_REST_ENDPOINT;
    console.log(`Health Check: Using configured env var: ${restEndpoint}`);
  } 
  
  // 3. Fallback: Localhost (Development)
  else {
    restEndpoint = 'http://localhost:3000/api/v1';
  }

  try {
    const url = new URL(restEndpoint)
    // Extracts protocol and host to avoid path duplication issues
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
    console.error(`Health check failed connecting to ${restEndpoint}:`, error);
    return new NextResponse('Unhealthy', { status: 500 });
  }
}

// Ensure this route is evaluated at request time
export const dynamic = 'force-dynamic';