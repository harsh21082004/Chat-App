// redux/thunks/userThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchUserFromToken = createAsyncThunk(
    'user/fetchUser',
    async (token, { rejectWithValue }) => {
        console.log(token)
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/get-user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(res.data)
        return res.data;
      } catch (err) {
        return rejectWithValue(err.response.data);
      }
    }
  );
  

export const register = createAsyncThunk(
  'user/register',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/register`, userData.formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message || 'Register failed');
    }
  }
);

export const addAuthUser = createAsyncThunk(
  'user/addAuthUser',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/add-auth-user`, userData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message || 'Add Auth User failed');
    }
  }
);

export const verifyUser = createAsyncThunk(
  'user/verifyUser',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/verify-user`, userData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message || 'Verify User failed');
    }
  }
);

export const login = createAsyncThunk(
    'user/login',
    async (userData, thunkAPI) => {
        console.log(userData)
        try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/login`, { phone: userData.phone } , {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
        } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message || 'Login failed');
        }
    }
)

export const fetchAllUsers = createAsyncThunk(
    'user/fetchAllUsers',
    async (token, thunkAPI) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message || 'Fetch users failed');
        }
    }
)