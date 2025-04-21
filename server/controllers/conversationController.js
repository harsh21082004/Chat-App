const mongoose = require('mongoose');
const Conversation = require('../models/Conversations');

// Create or update a conversation
exports.newConversation = async (req, res) => {
    const { senderId, receiverId, lastMessage, lastMessageTimestamp } = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json('Invalid ObjectId format');
    }
  
    try {
      const existingConversation = await Conversation.findOne({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      });
  
      if (existingConversation) {
        const isSameDirection = existingConversation.senderId.toString() === senderId;
  
        if (isSameDirection) {
          // Message is from same sender as before
          existingConversation.lastMessage = lastMessage || '';
          existingConversation.lastMessageTimestamp = lastMessageTimestamp || Date.now();
  
          // Update seen and unreadCount accordingly
          existingConversation.seen.sender = {
            userId: senderId,
            isSeen: true,
            unreadCount: 0
          };
          existingConversation.seen.receiver = {
            userId: receiverId,
            isSeen: false,
            unreadCount: (existingConversation.seen.receiver.unreadCount || 0) + 1
          };
        } else {
          // Sender and receiver are flipped – update the structure
          existingConversation.senderId = senderId;
          existingConversation.receiverId = receiverId;
          existingConversation.lastMessage = lastMessage || '';
          existingConversation.lastMessageTimestamp = lastMessageTimestamp || Date.now();
  
          // Reassign seen structure
          existingConversation.seen = {
            sender: {
              userId: senderId,
              isSeen: true,
              unreadCount: 0
            },
            receiver: {
              userId: receiverId,
              isSeen: false,
              unreadCount: 1
            }
          };
        }
  
        const updatedConversation = await existingConversation.save();
        return res.status(200).json({
          message: 'Conversation updated successfully',
          conversation: updatedConversation
        });
      }
  
      // No existing conversation, create new
      const newConversation = new Conversation({
        senderId,
        receiverId,
        lastMessage: lastMessage || '',
        lastMessageTimestamp: lastMessageTimestamp || Date.now(),
        seen: {
          sender: {
            userId: senderId,
            isSeen: true,
            unreadCount: 0
          },
          receiver: {
            userId: receiverId,
            isSeen: false,
            unreadCount: 1
          }
        }
      });
  
      const savedConversation = await newConversation.save();
      return res.status(201).json({
        message: 'Conversation created successfully',
        conversation: savedConversation
      });
  
    } catch (error) {
      console.error('Error handling conversation:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  };

// Get all conversations for a user
exports.getConversation = async (req, res) => {
    const { senderId } = req.params;

    // Ensure senderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
        return res.status(400).json('Invalid ObjectId format');
    }

    try {
        // Find conversations where the user is the sender
        const conversations = await Conversation.find({
            'members.senderId': senderId
        });

        // if (!conversations || conversations[0].length === 0) {
        //     return res.status(404).json('No conversations found');
        // }

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json(error);
    }
};
