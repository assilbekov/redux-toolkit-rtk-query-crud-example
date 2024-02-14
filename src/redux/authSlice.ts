import { createSlice } from '@reduxjs/toolkit'
import { UserWithToken } from '../models';
import { authApi } from './api';

type AuthSliceState = {
  user: null | UserWithToken;
}

const initialState: AuthSliceState = {
  user: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) =>
    builder.
      addMatcher(authApi.endpoints.login.matchPending, (state, action) => {
        console.log('pending', action)
      }).
      addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        console.log('rejected', action)
      }),
  selectors: {
    userSelector: (state: AuthSliceState) => state.user,
  }
})

export const { userSelector } = authSlice.selectors;