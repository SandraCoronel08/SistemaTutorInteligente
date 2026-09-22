import type { Request, Response, NextFunction } from "express";
import { AppError } from "../middlewares/errorMiddleware.js";
import { generateTutorAnswer } from "../services/openrouterService.js";
import { findKnowledgeContext } from "../services/knowledgeService.js";
import {
  createMessage,
  getRecentMessages
} from "../services/messageService.js";
import { buildTutorPrompt } from "../services/promptService.js";
import {
  createSession,
  getSessionById,
  touchSession
} from "../services/sessionService.js";
import {
  validateMessage,
  validateOptionalText,
  validateOptionalUuid,
  validateRequiredUser
} from "../utils/validators.js";

const buildSessionTitle = (message: string) => {
  const normalized = message.replace(/\s+/g, " ").trim();
  return normalized.length > 60
    ? `${normalized.slice(0, 57).trim()}...`
    : normalized;
};

export const sendChatMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.supabase) {
      throw new AppError("Cliente de Supabase no disponible.", 500);
    }

    validateRequiredUser(req.user?.id);

    const supabase = req.supabase;
    const userId = req.user!.id;
    const message = validateMessage(req.body?.message);
    const sessionIdInput = validateOptionalUuid(req.body?.sessionId, "sessionId");
    const topic = validateOptionalText(req.body?.topic, "topic", 120);

    const session = sessionIdInput
      ? await getSessionById(supabase, userId, sessionIdInput)
      : await createSession(supabase, userId, buildSessionTitle(message));

    const history = await getRecentMessages(supabase, userId, session.id, 6);
    const knowledge = await findKnowledgeContext(supabase, message, topic);
    const prompt = buildTutorPrompt({
      message,
      history,
      knowledge
    });

    const userMessage = await createMessage(supabase, {
      sessionId: session.id,
      userId,
      role: "user",
      content: message,
      topic
    });

    const answer = await generateTutorAnswer(prompt);

    const assistantMessage = await createMessage(supabase, {
      sessionId: session.id,
      userId,
      role: "assistant",
      content: answer,
      topic
    });

    await touchSession(supabase, userId, session.id);

    res.status(201).json({
      sessionId: session.id,
      answer,
      messageId: assistantMessage.id,
      userMessageId: userMessage.id
    });
  } catch (error) {
    next(error);
  }
};
