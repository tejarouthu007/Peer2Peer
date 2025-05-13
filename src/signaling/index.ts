import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

const server = http.createServer();
const wss = new WebSocketServer({ server });

type Room = WebSocket[];
const rooms = new Map<string, Room>();

// Store metadata like roomId per WebSocket
const wsMetadata = new WeakMap<WebSocket, { roomId: string }>();

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (msg: WebSocket.RawData) => {
    try {
      const message = JSON.parse(msg.toString());

      if (message.type === 'join') {
        const roomId = message.room;

        if (!roomId) return;

        // Save roomId metadata
        wsMetadata.set(ws, { roomId });

        if (!rooms.has(roomId)) rooms.set(roomId, []);
        rooms.get(roomId)!.push(ws);

        console.log(`Client joined room: ${roomId}`);
      }

      if (message.type === 'signal') {
        const metadata = wsMetadata.get(ws);
        if (!metadata) return;

        const roomId = metadata.roomId;
        const peers = rooms.get(roomId) || [];

        peers.forEach((peer) => {
          if (peer !== ws && peer.readyState === WebSocket.OPEN) {
            peer.send(JSON.stringify({ type: 'signal', data: message.data }));
          }
        });
      }

      if (message.type === 'chat') {
        const metadata = wsMetadata.get(ws);
        if (!metadata) return;

        const { roomId } = metadata;
        const peers = rooms.get(roomId) || [];

        peers.forEach((peer) => {
          if (peer.readyState === WebSocket.OPEN) {
            peer.send(JSON.stringify({
              type: 'chat',
              data: {
                sender: message.sender,
                content: message.content,
                timestamp: Date.now()
              }
            }));
          }
        });
      }

    } catch (err) {
      console.error('Invalid message:', err);
    }
  });

  ws.on('close', () => {
    const metadata = wsMetadata.get(ws);
    if (!metadata) return;

    const { roomId } = metadata;
    if (rooms.has(roomId)) {
      const filtered = rooms.get(roomId)!.filter((client) => client !== ws);
      if (filtered.length === 0) {
        rooms.delete(roomId);
      } else {
        rooms.set(roomId, filtered);
      }
    }

    wsMetadata.delete(ws); 
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running at ws://localhost:${PORT}`);
});
