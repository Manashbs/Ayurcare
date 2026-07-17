const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket.io signaling & chat
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a consultation room
    socket.on('join-room', ({ roomId, userId, userName }) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} (${userName}) joined room ${roomId}`);
      // Notify other users in the room
      socket.to(roomId).emit('user-joined', { socketId: socket.id, userId, userName });
    });

    // WebRTC signaling offer/answer/ice-candidate
    socket.on('signal', ({ roomId, signal, to }) => {
      if (to) {
        io.to(to).emit('signal', { signal, from: socket.id });
      } else {
        socket.to(roomId).emit('signal', { signal, from: socket.id });
      }
    });

    // Real-time Chat message
    socket.on('send-message', ({ roomId, message, senderId, senderName, senderRole }) => {
      const msgObj = {
        id: Math.random().toString(36).substring(7),
        message,
        senderId,
        senderName,
        senderRole,
        timestamp: new Date().toISOString(),
      };
      io.to(roomId).emit('receive-message', msgObj);
    });

    // In-call drawing/whiteboard or file upload notify
    socket.on('file-uploaded', ({ roomId, fileUrl, fileName, senderName }) => {
      io.to(roomId).emit('file-shared', { fileUrl, fileName, senderName, timestamp: new Date().toISOString() });
    });

    // Live consultation report sync
    socket.on('update-report', ({ roomId, diagnosis, notes, dietInstructions, lifestyleAdvice }) => {
      socket.to(roomId).emit('report-updated', { diagnosis, notes, dietInstructions, lifestyleAdvice });
    });

    // Live cart sync
    socket.on('add-to-cart', ({ roomId, item }) => {
      socket.to(roomId).emit('cart-item-added', item);
    });

    // Real-time notifications (for appointments, approvals)
    socket.on('join-user-notifications', (userId) => {
      socket.join(`user-notif-${userId}`);
      console.log(`User ${userId} joined notification channel`);
    });

    socket.on('send-notification', ({ userId, message, type }) => {
      io.to(`user-notif-${userId}`).emit('new-notification', {
        message,
        type,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on('disconnecting', () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit('user-left', { socketId: socket.id });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Next.js fallback handler
  expressApp.all(/.*/, (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
