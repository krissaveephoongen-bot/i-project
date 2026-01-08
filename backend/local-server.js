// This file is for local development only.
// It sets up a standard Node.js server with WebSocket support.

import http from 'http';
import { WebSocketServer } from 'ws';
import app from './app.js';

const PORT = process.env.PORT || 3001;

// 1. Create HTTP server
const server = http.createServer(app);

// 2. Create WebSocket server
const wss = new WebSocketServer({ server });

console.log('WebSocket server created');

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  clients.add(ws);

  ws.on('message', (message) => {
    console.log('received: %s', message);
    // Echo message back to client
    ws.send(`Hello, you sent -> ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.send(JSON.stringify({ type: 'connection_ack', message: 'WebSocket connection established.' }));
});

// 3. Broadcaster function
// This will be called by the API route to send progress to all clients.
export function broadcastProgress(data) {
  if (clients.size === 0) {
    console.log('No WebSocket clients connected, skipping broadcast.');
    return;
  }
  
  console.log(`Broadcasting to ${clients.size} clients:`, data);
  const message = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  }
}

// 4. Start the server
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop.');
});

export default server;
