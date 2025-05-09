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
  } = req.body;

  try {
    // Handle uploaded files
    const filesMeta = req.files?.map(file => ({
      filename: file.filename,
      fileType: file.mimetype,
      fileSize: file.size,
      url: `/api/chat/files/${file.filename}`, // adjust this as per your download route
      filecaption: '', // Optional: Add UI support for caption later
    })) || [];

    const newMessage = {
      senderId,
      receiverId,
      content,
      messageType,
      files: filesMeta,
      timestamp: new Date(),
    };

    // Find existing chat
    let chat = await Chat.findOne({ conversationId });

    if (!chat) {
      // If chat doesn't exist, create it
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

  try {
    const chat = await Chat.findOne({ conversationId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.status(200).json({ messages: chat.messages });
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
