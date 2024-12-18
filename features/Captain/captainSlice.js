import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Thunks
export const registerCaptain = createAsyncThunk(
  "captain/register",
  async (formData, { rejectWithValue }) => {
    try {
      console.log(formData);

      const response = await axios.post(
        `${API_BASE_URL}captains/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      console.log(error.response.data.message);

      return rejectWithValue(
        error.response.data.message ||
          "Something went wrong during registration."
      );
    }
  }
);

export const loginCaptain = createAsyncThunk(
  "captain/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}captains/login`,
        credentials,
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || "Login failed");
    }
  }
);

export const getCaptainProfile = createAsyncThunk(
  "captains/getProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { captain } = getState();
      console.log(captain);
      const response = await axios.get(`${API_BASE_URL}captains/profile`, {
        headers: {
          Authorization: `Bearer ${captain.token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.message || "Failed to fetch profile"
      );
    }
  }
);

export const logoutCaptain = createAsyncThunk(
  "captain/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}captains/logout`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || "Logout failed");
    }
  }
);

// Slice
const captainSlice = createSlice({
  name: "captain",
  initialState: {
    captain: null,
    token: null,
    status: "idle",
    error: null,
  },
  reducers: {
    resetState: (state) => {
      state.captain = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerCaptain.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(registerCaptain.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.captain = action.payload.captain;
      state.token = action.payload.token;
    });
    builder.addCase(registerCaptain.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });

    // Login
    builder.addCase(loginCaptain.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(loginCaptain.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.captain = action.payload.captain;
      console.log(action.payload.captain);
      state.token = action.payload.token;
    });
    builder.addCase(loginCaptain.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });

    // Get Profile
    builder.addCase(getCaptainProfile.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(getCaptainProfile.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.captain = action.payload.captain;
    });
    builder.addCase(getCaptainProfile.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });

    // Logout
    builder.addCase(logoutCaptain.fulfilled, (state) => {
      state.captain = null;
      state.token = null;
      state.status = "idle";
    });
    builder.addCase(logoutCaptain.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});

export const { resetState } = captainSlice.actions;
export default captainSlice.reducer;
