import { createSlice } from '@reduxjs/toolkit';
import { addConversation, getConversations } from '../thunks/conversationThunk';

const initialState = {
  conversations: [],
  fetched: false,
  activePage: 'conversations',
  status: 'idle',
};

export const toggleActivePage = (page) => (dispatch) => {
  dispatch(setActivePage(page));
};

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    clearConversations: (state) => {
      state.conversations = [];
      state.fetched = false;
      state.status = 'idle';
    },
    setActivePage: (state, action) => {
      state.activePage = action.payload;
    },
    
  },
  extraReducers: (builder) => {
    builder
      // Add Conversation
      .addCase(addConversation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addConversation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const newConv = action.payload;

        // Avoid duplicates
        const index = state.conversations.findIndex(
          (conv) => conv._id === newConv._id
        );
        if (index !== -1) {
          state.conversations[index] = newConv;
        } else {
          state.conversations.unshift(newConv);
        }
      })
      .addCase(addConversation.rejected, (state) => {
        state.status = 'failed';
      })

      // Get Conversations
      .addCase(getConversations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.conversations = action.payload;
        state.fetched = true;
      })
      .addCase(getConversations.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { clearConversations, setActivePage } = conversationSlice.actions;
export default conversationSlice.reducer;
