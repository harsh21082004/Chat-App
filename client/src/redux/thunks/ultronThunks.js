import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { addMessage, addPlaceholderMessage, streamMessageUpdate } from "../slices/chatSlice";

const BASE_URL = `${process.env.REACT_APP_FAST_API_BACKEND_BASE_URL}/api/py`;

export const performUltronAction = createAsyncThunk(
  "ultron/performAction",
  async ({ action, text, target_language, tone }, thunkAPI) => {
    try {
      // action can be: 'rephrase', 'summarize', 'translate'
      const response = await axios.post(`${BASE_URL}/ultron-tools/${action}`, {
        text,
        target_language,
        tone
      });
      return response.data.result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Ultron action failed");
    }
  }
);

export const streamUltronMessage = createAsyncThunk(
  "chat/streamUltron",
  async ({ content, senderId, receiverId, conversationId }, { dispatch, rejectWithValue }) => {
    try {
      // 1. Optimistically add USER message to UI immediately
      const userMessage = {
        senderId,
        receiverId,
        content,
        messageType: 'text',
        timestamp: new Date().toISOString(),
        files: []
      };
      dispatch(addMessage(userMessage));

      // 2. Add a PLACEHOLDER message for Ultron (Empty initially)
      const aiPlaceholder = {
        senderId: receiverId, // Ultron is sender
        receiverId: senderId, // User is receiver
        content: '',          // Start empty
        messageType: 'text',
        timestamp: new Date().toISOString(),
        files: [],
        isUltronMessage: true // Flag for styling
      };
      dispatch(addPlaceholderMessage(aiPlaceholder));

      // 3. Hit the Python Stream Endpoint
      const response = await fetch(`${BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          chatId: conversationId, // Assuming backend needs this
          userId: senderId
        }),
      });

      if (!response.body) throw new Error("ReadableStream not supported.");

      // 4. Read the Stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          
          // 5. Dispatch update to Redux (Typing Effect)
          // You might need to filter out "__ANSWER__:" or other tags here if your backend sends them
          const cleanChunk = chunk.replace("__ANSWER__:", ""); 
          dispatch(streamMessageUpdate(cleanChunk));
        }
      }

      return "Stream Complete";

    } catch (error) {
      console.error("Ultron Stream Error:", error);
      return rejectWithValue(error.message);
    }
  }
);