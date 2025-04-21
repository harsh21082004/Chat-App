const express = require('express');
const { createChat, sendMessage, getMessages, markAsSeen, addLastMessageSender, addLastMessageReceiver } = require('../controllers/ChatController');

const router = express.Router();

router.post('/create-chat', createChat);
router.post('/send-message', sendMessage);
router.get('/get-messages/:senderId/:receiverId', getMessages);
router.post('/add-last-message-sender', addLastMessageSender);
router.post('/add-last-message-receiver', addLastMessageReceiver);
router.post('/mark-as-seen', markAsSeen);

module.exports = router;
