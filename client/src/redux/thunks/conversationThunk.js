import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const addConversation = createAsyncThunk(
  "conversation/addConversation",
  async (conversationData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/api/conversation/add-conversation`,
        conversationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // should be the single conversation object
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Add Conversation failed"
      );
    }
  }
);

export const getConversations = createAsyncThunk(
  "conversation/getConversations",
  async (userId, thunkAPI) => {
    console.log(userId)
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/api/conversation/get/${userId}`
      );
      console.log(response)
      return response.data; // should be an array of conversations
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Get Conversations failed"
      );
    }
  }
);
