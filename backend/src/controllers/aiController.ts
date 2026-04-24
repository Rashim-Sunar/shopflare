import type { NextFunction, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import type { AuthenticatedRequest } from '../types/http';
import { runAiChatGraph } from '../ai/graph';

/**
 * @fileoverview Thin AI chat controller that delegates business logic to LangGraph.
 */

interface AiChatRequestBody {
  message?: string;
}

interface AiChatResponse {
  status: 'success';
  response: string;
}

/**
 * Function: chatWithAi
 * -----------------------------------
 * Purpose:
 *   Validates incoming chat request and delegates query execution to the AI graph layer.
 *
 * Inputs:
 *   - req.body.message (string): User query text.
 *
 * Outputs:
 *   - JSON response containing final chatbot answer.
 *
 * Steps:
 *   1. Validate request payload shape and non-empty message.
 *   2. Invoke LangGraph orchestration function.
 *   3. Return standardized success payload.
 */
export const chatWithAi = asyncHandler(
  async (req: AuthenticatedRequest<never, AiChatResponse, AiChatRequestBody>, res: Response<AiChatResponse>, next: NextFunction) => {
    const message = req.body.message?.trim();

    if (!message) {
      next(new AppError('message is required and must be a non-empty string', 400));
      return;
    }

    const response = await runAiChatGraph(message);

    res.status(200).json({
      status: 'success',
      response,
    });
  }
);
