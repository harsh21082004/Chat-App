import { createSlice } from '@reduxjs/toolkit';
import { getMessages, markAsSeen, sendMessage } from '../thunks/chatThunks';

const initialState = {
  messages: [],
  newMessage: null,
  status: 'idle',
  fetched: false,
  activeConversationId: null,
};


const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action) => {
      console.log(action.payload)
      state.messages = action.payload.messages;
      state.activeConversationId = action.payload.conversationId;
      state.fetched = true;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setNewMessage: (state, action) => {
      state.newMessage = action.payload;
    },
    resetMessages: (state) => {
      state.messages = [];
      state.activeConversationId = null;
      state.fetched = false;
    }
  },

  extraReducers: (builder) => {
    builder
      //Add Conversation
      .addCase(sendMessage.fulfilled, (state, action) => {
        console.log('Message Sent:', action.payload);
        state.status = 'succeeded';
        state.newMessage = null;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'failed';
      })

      //Get Messages
      .addCase(getMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = action.payload.messages;
        state.fetched = true;
      })
      .addCase(getMessages.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.fetched = false;
      })

      //Seen Messages
      .addCase(markAsSeen.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(markAsSeen.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(markAsSeen.rejected, (state, action) => {
        state.status = 'failed';
      })

  }
});

export const { setMessages, addMessage, setNewMessage, resetMessages } = chatSlice.actions;

export default chatSlice.reducer;
