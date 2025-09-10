import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  authToken: null,
  isAuth: false,
  openAIKey: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const { user, authToken } = action.payload;
      state.user = user;
      state.authToken = authToken;
      state.isAuth = true;
    },

    logout: (state) => {
      state.user = null;
      state.authToken = null;
      state.isAuth = false;
    },

    setUser: (state, action) => {
      const user = action.payload;
      state.user = user;
    },

    setOpenAIKey: (state, action) => {
      const openAIKey = action.payload;
      state.openAIKey = openAIKey;
    },
  },
});

export const { setAuth, logout, setUser, setOpenAIKey } = authSlice.actions;
export default authSlice.reducer;
