import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Function: sendAiMessage
 * -----------------------------------
 * Sends a user query to the backend AI endpoint and retrieves grounded chatbot response.
 * Steps:
 *   1. Validate that message is non-empty.
 *   2. Send POST request to /api/ai/chat.
 *   3. Return normalized response or reject with structured error.
 */
export const sendAiMessage = createAsyncThunk('aiChat/sendAiMessage', async (message, { rejectWithValue }) => {
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (!trimmedMessage) {
    return rejectWithValue({ message: 'Please enter a message' });
  }

  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`, {
      message: trimmedMessage,
    });

    return {
      userMessage: trimmedMessage,
      assistantMessage: response.data?.response || 'No products found',
    };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to get AI response' });
  }
});

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    // Clears the current in-memory chat messages and error state.
    clearAiChat: (state) => {
      state.messages = [];
      state.error = null;
    },

    //Clears AI chat error while preserving message history.
    clearAiChatError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendAiMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendAiMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({ role: 'user', content: action.payload.userMessage, timestamp: Date.now() });
        state.messages.push({ role: 'assistant', content: action.payload.assistantMessage, timestamp: Date.now() + 1 });
      })
      .addCase(sendAiMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Something went wrong';
      });
  },
});

export const { clearAiChat, clearAiChatError } = aiChatSlice.actions;
export default aiChatSlice.reducer;
