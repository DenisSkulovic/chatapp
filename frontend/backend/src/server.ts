import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Redis client setup
const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.connect().catch(console.error);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', async (msg) => {
    console.log('message: ' + msg);
    // Emit message to all clients
    io.emit('chat message', msg);

    // save messages to Redis
    await redisClient.lPush('chatMessages', msg);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
