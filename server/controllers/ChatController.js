const Chat = require('../models/Chat');
const Conversation = require('../models/Conversations');

// Create Chat
exports.createChat = async (req, res) => {
  const { senderId, receiverId, conversationId } = req.body;

  try {
    // Check if a chat exists where either (senderId, receiverId) or (receiverId, senderId)
    const existingChat = await Chat.findOne({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });

    if (existingChat) {
      return res.status(200).json({ message: 'Chat already exists', chat: existingChat });
    }

    const chat = new Chat({ senderId, receiverId, conversationId });
    await chat.save();

    res.status(200).json({ message: 'Chat created', chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send Message
exports.sendMessage = async (req, res) => {
  const { receiverId, senderId, content, messageType } = req.body;

  try {
    // Search for chat where (senderId, receiverId) or (receiverId, senderId)
    const chat = await Chat.findOne({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = {
      senderId,
      receiverId,
      content,
      messageType,
      timestamp: Date.now(),
    };

    chat.messages.push(message);

    // Save the message to the chat
    await chat.save();

    res.status(200).json({ message: 'Message sent', chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Chat Messages by senderId and receiverId
exports.getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    // Find the chat where (senderId, receiverId) or (receiverId, senderId)
    const chat = await Chat.findOne({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.status(200).json({ messages: chat.messages, chat: chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.addLastMessageSender = async (req, res) => {
  const { senderId, receiverId, lastMessage, chatPerson } = req.body;

  try {
    // 1. Update the sender's conversation (messages are marked as seen for the sender)
    let senderConversation = await Conversation.findOne({
      'members.senderId': senderId,
      'members.receiverIds.receiverId': receiverId
    });

    console.log('Sender conversation:', senderConversation);

    if (!senderConversation) {
      return res.status(404).json({ message: 'Sender conversation not found' });
    }

    // Update the last message and timestamp in sender's conversation
    senderConversation.members.forEach(member => {
      if (member.senderId.toString() === senderId) {
        member.receiverIds.forEach(receiver => {
          if (receiver.receiverId.toString() === receiverId) {
            receiver.lastMessage = lastMessage;
            receiver.lastMessageTimestamp = new Date();
            receiver.seen = true;  // Sender has seen the message
            receiver.unreadCount = 0;  // No unread messages for the sender
          }
        });
      }
    });

    // Save the sender conversation
    await senderConversation.save();

    res.status(200).json({ message: 'Last message added successfully', conversation: senderConversation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.addLastMessageReceiver = async (req, res) => {
  const { senderId, receiverId, lastMessage, chatPerson } = req.body;

  console.log(chatPerson?._id, senderId, receiverId, lastMessage)

  try {
    // 1. Update the sender's conversation (messages are marked as seen for the sender)
    let receiverConversation = await Conversation.findOne({
      'members.senderId': receiverId,
      'members.receiverIds.receiverId': senderId
    });

    console.log('Receiver conversation:', receiverConversation);

    if (!receiverConversation) {
      return res.status(404).json({ message: 'Receiver conversation not found' });
    }

    // Update the last message and timestamp in receiver's conversation
    receiverConversation.members.forEach(member => {
      if (member.senderId.toString() === receiverId) {
        member.receiverIds.forEach(receiver => {
          if (receiver.receiverId.toString() === senderId) {
            const bothActive = chatPerson?._id === receiverId; // true if receiver has this chat open
            console.log(bothActive);
            receiver.lastMessage = lastMessage;
            receiver.lastMessageTimestamp = new Date();
            receiver.seen = bothActive; // only mark seen if receiver has this chat open
            receiver.unreadCount = bothActive ? 0 : (receiver.unreadCount + 1); // increment if not active
          }
        });
      }
    });

    // Save the receiver conversation
    await receiverConversation.save();

    res.status(200).json({ message: 'Last message added successfully', conversation: receiverConversation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsSeen = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // Find the conversation where the receiverId is the sender
    let receiverConversation = await Conversation.findOne({
      'members.senderId': receiverId,
      'members.receiverIds.receiverId': senderId
    });

    if (!receiverConversation) {
      return res.status(404).json({ message: 'Receiver conversation not found' });
    }

    // Mark all messages as seen and reset the unread count for receiver's conversation
    receiverConversation.members.forEach(member => {
      if (member.senderId.toString() === receiverId) {
        member.receiverIds.forEach(receiver => {
          if (receiver.receiverId.toString() === senderId) {
            receiver.seen = true;
            receiver.unreadCount = 0;  // Reset unread count to 0 when messages are seen
          }
        });
      }
    });

    // Save the changes
    await receiverConversation.save();

    res.status(200).json({ message: 'Messages marked as seen' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
