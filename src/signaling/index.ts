import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

const server = http.createServer();
const wss = new WebSocketServer({ server });

type Room = WebSocket[];
const rooms = new Map<string, Room>();

wss.on('connection', (ws: WebSocket) => {
  let roomId: string | null = null;

  ws.on('message', (msg: WebSocket.RawData) => {
    try {
      const message = JSON.parse(msg.toString());

      if (message.type === 'join') {
        roomId = message.room;

        if (roomId) {
          if (!rooms.has(roomId)) rooms.set(roomId, []);
          rooms.get(roomId)!.push(ws);
          console.log(`Client joined room: ${roomId}`);
        }
      }

      if (message.type === 'signal' && roomId) {
        const peers = rooms.get(roomId) || [];
        peers.forEach((peer) => {
          if (peer !== ws && peer.readyState === WebSocket.OPEN) {
            peer.send(JSON.stringify({ type: 'signal', data: message.data }));
          }
        });
      }
    } catch (err) {
      console.error('Invalid message:', err);
    }
  });

  ws.on('close', () => {
    if (roomId && rooms.has(roomId)) {
      rooms.set(
        roomId,
        rooms.get(roomId)!.filter((client) => client !== ws)
      );
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running at ws://localhost:${PORT}`);
});
