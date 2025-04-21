module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('User connected');
  
      socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat ${chatId}`);
      });
  
      socket.on('sendMessage', ({ chatId, message }) => {
        io.to(chatId).emit('message', message);
      });
  
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  };
  