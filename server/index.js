const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const conversationRoutes = require('./routes/conversation');
const chatSockets = require('./sockets/chatSocket');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());


// Explicitly handle preflight requests
// app.options('*', (req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', 'https://biz-convo-app.vercel.app'); // Update with your frontend URL
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.sendStatus(204);
// });
app.use(express.json());


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes

app.get("/", (req, res) => {
  res.json("Hello");
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversation', conversationRoutes);

// Socket.IO setup
chatSockets(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
