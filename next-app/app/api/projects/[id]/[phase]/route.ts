import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  const headersList = headers();
  const origin = headersList.get('origin') || '';

  return NextResponse.json({
    message: 'Project API is ready',
    version: '1.0.0',
    features: [
      'Project Context Provider',
      'Phase-Based Navigation',
      'Permission System',
      'State Management',
    ],
    endpoints: {
      projects: '/api/projects',
      phases: '/api/projects/[id]/[phase]',
      permissions: '/api/projects/[id]/permissions',
      progress: '/api/projects/[id]/progress',
    },
  }, {
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
