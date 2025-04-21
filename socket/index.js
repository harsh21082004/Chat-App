import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

const origins = [`${process.env.FRONTEND_URL1}`, `${process.env.FRONTEND_URL2}`];

const io = new Server(9000, {
  cors: { origin: origins }
});

let users = [];
let openChats = {}; // 🆕 Stores which chat each user has open

const addUser = (userData, socketId) => {
  if (!users.some(user => user?._id === userData?._id)) {
    users.push({ ...userData, socketId });
  }
};

io.on('connection', socket => {
  console.log('Connected:', socket.id);

  // When user logs in
  socket.on('addUsers', userData => {
    addUser(userData, socket.id);
    io.emit('getUsers', users);
  });

  // When user opens a specific chat
  socket.on('openChat', ({ userId, chatWithId }) => {
    openChats[userId] = chatWithId;
    console.log(`User ${userId} opened chat with ${chatWithId}`);
  });

  // When message is sent
  socket.on('sendMessage', data => {
    const user = users.find(user => user._id === data.receiverId);
    const sender = users.find(user => user._id === data.senderId);

    const receiverHasChatOpen = openChats[data.receiverId] === data.senderId;

    const fullMessage = {
      ...data,
      seen: receiverHasChatOpen // ✅ Pass this to client/backend
    };

    // Send message to both parties
    if (user) io.to(user.socketId).emit('getMessage', fullMessage);
    if (sender) io.to(sender.socketId).emit('getMessage', fullMessage);

    // Update conversation for both
    if (user) io.to(user.socketId).emit('refreshConversation', fullMessage);
    if (sender) io.to(sender.socketId).emit('refreshConversation', fullMessage);
  });

  // On disconnect
  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);

    const disconnectedUser = users.find(user => user.socketId === socket.id);
    if (disconnectedUser) {
      delete openChats[disconnectedUser._id]; // ❌ Remove chat tracking
    }

    users = users.filter(user => user.socketId !== socket.id);
    io.emit('getUsers', users);
  });
});
