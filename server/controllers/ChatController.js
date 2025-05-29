const Chat = require('../models/Chat');
const Conversation = require('../models/Conversations');



// Create Chat and Send Message
exports.sendMessage = async (req, res) => {
  const {
    conversationId,
    senderId,
    receiverId,
    content,
    messageType,
    caption
  } = req.body;

  try {
    
    const filesMeta = req.files?.map((file, index) => {
      const fileCaption = Array.isArray(caption) ? caption[index] : caption; // support both string and array
      return {
        filename: file.filename,
        fileType: file.mimetype,
        fileSize: file.size,
        url: `/api/chat/files/${file.filename}`,
        filecaption: fileCaption || '',
      };
    }) || [];

    const newMessage = {
      senderId,
      receiverId,
      content,
      messageType,
      files: filesMeta,
      timestamp: new Date(),
    };

    console.log(newMessage)

    let chat = await Chat.findOne({ conversationId });

    if (!chat) {
      chat = new Chat({
        conversationId,
        messages: [newMessage],
      });
    } else {
      chat.messages.push(newMessage);
    }

    await chat.save();
    res.status(200).json(newMessage);
  } catch (err) {
    console.error('Error sending message:', err.message);
    res.status(500).json({ error: err.message });
  }
};




// Get Chat Messages by conversationId
exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const chat = await Chat.findOne({ conversationId });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const totalMessages = chat.messages.length;
    const start = Math.max(totalMessages - (page + 1) * limit, 0);
    const end = totalMessages - page * limit;

    const paginatedMessages = chat.messages.slice(start, end);

    res.status(200).json({
      messages: paginatedMessages,
      hasMore: start > 0,
    });
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ error: err.message });
  }
};


exports.markAsSeen = async (req, res) => {
  const { conversationId } = req.params;

  try {
    console.log(conversationId)
    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId },
      { $set: { 'seen.receiver.isSeen': true, 'seen.receiver.unreadCount': 0 } },

    )

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    console.log(conversation)

    await conversation.save();

    const chat = await Chat.findOneAndUpdate(
      { conversationId },
      { $set: { 'messages.$[].isSeen': true } },
      { new: true })

    console.log(chat)
    res.status(200).json({ message: 'Messages marked as seen' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
