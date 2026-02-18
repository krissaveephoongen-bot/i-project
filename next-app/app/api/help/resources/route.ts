import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Mock data for help resources - in real app, this would come from database
    const resources = [
      {
        id: '1',
        title: 'User Guide - Getting Started',
        description: 'Complete guide for new users to get started with the system',
        category: 'documentation',
        url: '/docs/user-guide'
      },
      {
        id: '2',
        title: 'Project Management Training',
        description: 'Video tutorials and materials for project management',
        category: 'training',
        url: '/training/project-management'
      },
      {
        id: '3',
        title: 'Technical Support Documentation',
        description: 'Technical documentation for developers and IT staff',
        category: 'technical',
        url: '/docs/technical'
      },
      {
        id: '4',
        title: 'System Troubleshooting Guide',
        description: 'Common issues and solutions for system problems',
        category: 'support',
        url: '/docs/troubleshooting'
      },
      {
        id: '5',
        title: 'API Documentation',
        description: 'Complete API reference for developers',
        category: 'technical',
        url: '/docs/api'
      },
      {
        id: '6',
        title: 'Security Guidelines',
        description: 'Security best practices and guidelines',
        category: 'documentation',
        url: '/docs/security'
      }
    ];

    return NextResponse.json(resources, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}
