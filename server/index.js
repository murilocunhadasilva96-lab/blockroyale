const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

let waitingPlayer = null;

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Matchmaking 1v1
  socket.on('find_match', () => {
    if (waitingPlayer && waitingPlayer.id !== socket.id) {
      const roomId = `room_${Date.now()}`;
      socket.join(roomId);
      waitingPlayer.join(roomId);
      io.to(roomId).emit('match_found', { roomId, player1: waitingPlayer.id, player2: socket.id });
      waitingPlayer = null;
    } else {
      waitingPlayer = socket;
      socket.emit('waiting_for_opponent');
    }
  });

  socket.on('disconnect', () => {
    if (waitingPlayer?.id === socket.id) waitingPlayer = null;
    console.log(`Player disconnected: ${socket.id}`);
  });
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`BlockRoyale server running on port ${PORT}`));
