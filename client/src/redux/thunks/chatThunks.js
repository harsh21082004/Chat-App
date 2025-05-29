

import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, thunkAPI) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/send-message`, messageData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Send Message failed")
    }
  }
)

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async ({ conversationId, page = 0, limit = 10 }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/get-messages/${conversationId}?page=${page}&limit=${limit}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Get Messages failed");
    }
  }
);


export const markAsSeen = createAsyncThunk(
  "chat/seenMessages",
  async (conversationId, thunkAPI) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/mark-as-seen/${conversationId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Can't Add Seen Messages")
    }
  }
)