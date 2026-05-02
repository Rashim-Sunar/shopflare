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
      .addCase(sendAiMessage.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        // Optimistically show the user's message right away
        const userMsg = {
          role: 'user',
          content: typeof action.meta.arg === 'string' ? action.meta.arg : '',
          timestamp: Date.now(),
        };

        // Add a placeholder assistant message while the real response is fetched
        const placeholder = {
          role: 'assistant',
          content: 'Assistant is thinking...',
          timestamp: Date.now() + 1,
          isPlaceholder: true,
        };

        state.messages.push(userMsg);
        state.messages.push(placeholder);
      })
      .addCase(sendAiMessage.fulfilled, (state, action) => {
        state.loading = false;

        // Replace the last assistant placeholder with the real assistant response
        for (let i = state.messages.length - 1; i >= 0; i--) {
          const msg = state.messages[i];
          if (msg.role === 'assistant' && msg.isPlaceholder) {
            state.messages[i] = {
              role: 'assistant',
              content: action.payload.assistantMessage,
              timestamp: Date.now(),
            };
            break;
          }
        }
      })
      .addCase(sendAiMessage.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = action.payload?.message || action.error?.message || 'Something went wrong';
        state.error = errorMessage;

        // Replace placeholder with an error message so user sees failure inline
        for (let i = state.messages.length - 1; i >= 0; i--) {
          const msg = state.messages[i];
          if (msg.role === 'assistant' && msg.isPlaceholder) {
            state.messages[i] = {
              role: 'assistant',
              content: `Error: ${errorMessage}`,
              timestamp: Date.now(),
            };
            break;
          }
        }
      });
  },
});

export const { clearAiChat, clearAiChatError } = aiChatSlice.actions;
export default aiChatSlice.reducer;
