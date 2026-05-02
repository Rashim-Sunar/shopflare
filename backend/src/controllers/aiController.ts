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


interface Product {
  id: string;
  name: string;
  price: number;
  brand: string | null;
  category: string;
  countInStock: number;
  image?: string;
}

interface AiChatStructuredResponse {
  status: 'success';
  response: string;
  products?: Product[];
  hasProducts: boolean;
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
  async (req: AuthenticatedRequest<never, AiChatStructuredResponse, AiChatRequestBody>, res: Response<AiChatStructuredResponse>, next: NextFunction) => {
    const message = req.body.message?.trim();

    if (!message) {
      next(new AppError('message is required and must be a non-empty string', 400));
      return;
    }

    const response = await runAiChatGraph(message);

    res.status(200).json({
      status: 'success',
        response: response.response,
      products: response.products || [],
      hasProducts: (response.products?.length ?? 0) > 0,
    });
  }
);
