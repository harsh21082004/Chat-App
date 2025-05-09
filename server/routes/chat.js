const express = require('express');
const { createChat, sendMessage, getMessages, markAsSeen } = require('../controllers/ChatController');
const upload = require('../config/multerConfig');
const { getFiles } = require('../controllers/fileController');

const router = express.Router();

router.post('/send-message', upload.array('files'), sendMessage);
router.get('/get-messages/:conversationId', getMessages);
router.post('/mark-as-seen/:conversationId', markAsSeen);
router.get('/files/:filename', getFiles);


module.exports = router;
