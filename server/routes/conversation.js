const express = require('express');
const { newConversation, getConversation } = require('../controllers/conversationController');

const router = express.Router();

router.post('/add-conversation', newConversation);
router.get('/get/:senderId', getConversation);

module.exports = router;
