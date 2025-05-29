import { createSlice } from '@reduxjs/toolkit';
import { getMessages, markAsSeen, sendMessage } from '../thunks/chatThunks';

const initialState = {
  messages: [],
  newMessage: null,
  status: 'idle',
  messageFetchedStatus: 'idle',
  fetched: false,
  fetchingMoreStatus: 'idle',
  activeConversationId: null,
  messagePage: 0,
  hasMoreMessages: true,
  limit: 10,
};


const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action) => {
      if (action.payload.append) {
        state.messages = [...action.payload.messages, ...state.messages]; // ✅ Prepend new messages
      } else {
        state.messages = action.payload.messages;
      }
      state.activeConversationId = action.payload.conversationId;
      state.fetched = true;
    },

    setMessagePage: (state, action) => {
      state.messagePage = action.payload;
    },
    setHasMoreMessages: (state, action) => {
      state.hasMoreMessages = action.payload;
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
        state.messageFetchedStatus = 'succeeded';
        state.fetched = true;
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
        state.messageFetchedStatus = 'succeeded';
        state.fetchingMoreStatus = 'succeeded';
        state.fetched = true;
        state.hasMoreMessages = action.payload.hasMore;
      })
      .addCase(getMessages.pending, (state, action) => {
        state.fetchingMoreStatus = 'loading';
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.messageFetchedStatus = 'failed';
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

export const { setMessages, addMessage, setNewMessage, resetMessages, setMessagePage, setHasMoreMessages } = chatSlice.actions;

export default chatSlice.reducer;
