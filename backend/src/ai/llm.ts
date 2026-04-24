import axios from 'axios';
import { appEnv } from '../config/env';

/**
 * @fileoverview OpenRouter-backed LLM client used by AI workflow nodes.
 */

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterChoice {
  message?: {
    content?: string;
  };
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'openai/gpt-4o-mini';

/**
 * Function: callLLM
 * -----------------------------------
 * Purpose:
 *   Calls OpenRouter Chat Completions API and returns the assistant text.
 *
 * Inputs:
 *   - messages (LLMMessage[]): Ordered chat messages for the model.
 *
 * Outputs:
 *   - Promise<string>: The assistant response content.
 *
 * Steps:
 *   1. Build the OpenRouter payload with selected model and message list.
 *   2. Send authenticated HTTPS request with timeout handling.
 *   3. Read the first completion choice and return text content.
 *
 * Notes:
 *   - OpenRouter is a gateway that provides a single API surface to multiple LLM providers.
 *   - We use OpenRouter to keep provider integration standardized and model swapping simple.
 *   - Request structure: { model, messages, temperature }.
 *   - Response structure: { choices: [{ message: { content } }] }.
 */
export async function callLLM(messages: LLMMessage[]): Promise<string> {
  const response = await axios.post<OpenRouterResponse>(
    OPENROUTER_URL,
    {
      model: OPENROUTER_MODEL,
      messages,
      temperature: 0,
    },
    {
      timeout: 12000,
      headers: {
        Authorization: `Bearer ${appEnv.openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const content = response.data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('OpenRouter response did not include message content');
  }

  return content;
}
