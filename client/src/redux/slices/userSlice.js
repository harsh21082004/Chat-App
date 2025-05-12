// redux/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { addAuthUser, fetchAllUsers, fetchUserFromToken, login, register, sendOtpHandler, verifyOtpHandler, verifyUser } from '../thunks/userThunks';

const initialState = {
  user: null,
  chatPerson: {},
  chatPersons: [],
  activeUsers: [],
  socket: null,
  error: null,
  status: 'idle',
  isLoggedIn: false,
  authUser: null,
  users: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setChatPerson: (state, action) => {
      state.chatPerson = action.payload;
    },
    setActiveUsers: (state, action) => {
      state.activeUsers = action.payload;
    },
    setChatPersons: (state, action) => {
      state.chatPersons = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    clearUserData: (state) => {
      state.user = null;
      state.chatPerson = {};
      state.chatPersons = [];
      state.activeUsers = [];
      state.socket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserFromToken.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserFromToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(fetchUserFromToken.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(addAuthUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addAuthUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authUser = action.payload;
      })
      .addCase(addAuthUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      //Verify User
      .addCase(verifyUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authUser = action.payload;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      //Get All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      //Send Otp using Firebase
      .addCase(sendOtpHandler.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sendOtpHandler.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(sendOtpHandler.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      //Verify Otp using Firebase
      .addCase(verifyOtpHandler.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyOtpHandler.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(verifyOtpHandler.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
  },
});

export const {
  setUser,
  setChatPerson,
  setActiveUsers,
  setChatPersons,
  setSocket,
  clearUserData,
} = userSlice.actions;

export default userSlice.reducer;
