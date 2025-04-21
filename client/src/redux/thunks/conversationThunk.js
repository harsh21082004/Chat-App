import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const addConversation = createAsyncThunk(
    "conversation/addConversation",
    async (conversationData, thunkAPI) => {
        console.log(conversationData)
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/conversation/add-conversation`, conversationData, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = response.data;
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message || "Add Conversation failed");
        }
    }
)

export const getConversations = createAsyncThunk(
    "conversation/getConversations",
    async (userId, thunkAPI) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/conversation/get/${userId}`);
            const data = response.data;
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message || "Get Conversations failed");
        }
    }
)
