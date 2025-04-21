import { createSlice } from '@reduxjs/toolkit';
import { addConversation } from '../thunks/conversationThunk';

const initialState = {
  messages: [],
  newMessage: null,
  activePage: 'conversations',
  status: 'idle',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setNewMessage: (state, action) => {
      console.log('New message:', action.payload);
      state.newMessage = action.payload;
    },
    setActivePage: (state, action) => {
      state.activePage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      //Add Conversation
      .addCase(addConversation.fulfilled, (state, action) => {
        console.log('Conversation added:', action.payload);
        state.status = 'succeeded';
      })
      .addCase(addConversation.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(addConversation.rejected, (state, action) => {
        state.status = 'failed';
      })
  }
});

export const { setMessages, addMessage, setNewMessage, setActivePage } = chatSlice.actions;
export default chatSlice.reducer;
