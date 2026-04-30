import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import chatReducer from './slices/chatSlice';
import conversationReducer from './slices/conversationSlice';
import ultronReducer from './slices/ultronSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    conversation: conversationReducer,
    ultron: ultronReducer,
  },
});

export default store;
