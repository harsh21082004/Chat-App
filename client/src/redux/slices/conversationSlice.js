import { createSlice } from '@reduxjs/toolkit';
import { addConversation } from '../thunks/conversationThunk';

const initialState = {
  conversations: [],
};

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  extraReducers: (builder) => {
    builder
      //Add Conversation
      .addCase(addConversation.fulfilled, (state, action) => {
        console.log('Conversation added:', action.payload);
        state.status = 'succeeded';
        state.conversations.push(action.payload);
      })
      .addCase(addConversation.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(addConversation.rejected, (state, action) => {
        state.status = 'failed';
      })
  }
});

// export const { setConversations, addConversation, updateLastMessage } = conversationSlice.actions;
export default conversationSlice.reducer;
