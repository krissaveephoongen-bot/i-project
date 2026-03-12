import { NextRequest } from "next/server";
import { realTimeService } from "@/lib/services/realtime-service";

export const dynamic = "force-dynamic";

// SSE endpoint for real-time updates
export async function GET(request: NextRequest) {
  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Get user info from request (if authenticated)
  const userId = request.headers.get('x-user-id') || undefined;
  const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create a new Response with SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Register the connection
      realTimeService.registerConnection(connectionId, {
        write: (data: string) => {
          try {
            controller.enqueue(new TextEncoder().encode(data))
          } catch (error) {
            console.error('Failed to enqueue data:', error)
          }
        },
        end: () => {
          controller.close()
        }
      }, userId)

      // Send initial connection message
      const welcomeEvent = {
        id: `welcome_${connectionId}`,
        type: 'system_notification',
        timestamp: new Date(),
        data: {
          message: 'Connected to real-time updates',
          connectionId
        },
        userId
      }

      const welcomeData = `data: ${JSON.stringify(welcomeEvent)}\n\n`
      controller.enqueue(new TextEncoder().encode(welcomeData))

      // Send periodic ping to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          const pingEvent = {
            id: `ping_${Date.now()}`,
            type: 'system_notification',
            timestamp: new Date(),
            data: { ping: true },
            userId
          }
          
          const pingData = `data: ${JSON.stringify(pingEvent)}\n\n`
          controller.enqueue(new TextEncoder().encode(pingData))
        } catch (error) {
          clearInterval(pingInterval)
          realTimeService.unregisterConnection(connectionId)
        }
      }, 30000) // Every 30 seconds

      // Clean up on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval)
        realTimeService.unregisterConnection(connectionId)
      })
    }
  })

  return new Response(stream, { headers })
}
