import type { Request, Response, NextFunction } from "express";
import { AppError } from "../middlewares/errorMiddleware.js";
import {
  createSession,
  deleteSession,
  getEmptyDraftSession,
  getSessionById,
  listSessions,
  updateSessionTitle
} from "../services/sessionService.js";
import { listMessagesBySession } from "../services/messageService.js";
import {
  validateOptionalText,
  validateRequiredUser,
  validateTitle,
  validateUuid
} from "../utils/validators.js";

const getRequestContext = (req: Request) => {
  if (!req.supabase) {
    throw new AppError("Cliente de Supabase no disponible.", 500);
  }

  validateRequiredUser(req.user?.id);

  return {
    supabase: req.supabase,
    userId: req.user!.id
  };
};

export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { supabase, userId } = getRequestContext(req);
    const sessions = await listSessions(supabase, userId);

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

export const postSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { supabase, userId } = getRequestContext(req);
    const title =
      validateOptionalText(req.body?.title, "title", 120) ??
      "Nueva conversacion";

    if (title === "Nueva conversacion") {
      const existingDraft = await getEmptyDraftSession(supabase, userId);

      if (existingDraft) {
        res.status(200).json({ session: existingDraft });
        return;
      }
    }

    const session = await createSession(supabase, userId, title);

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
};

export const getSessionMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { supabase, userId } = getRequestContext(req);
    const sessionId = validateUuid(req.params.id, "id");

    await getSessionById(supabase, userId, sessionId);
    const messages = await listMessagesBySession(supabase, userId, sessionId);

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

export const patchSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { supabase, userId } = getRequestContext(req);
    const sessionId = validateUuid(req.params.id, "id");
    const title = validateTitle(req.body?.title);
    const session = await updateSessionTitle(
      supabase,
      userId,
      sessionId,
      title
    );

    res.json({ session });
  } catch (error) {
    next(error);
  }
};

export const removeSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { supabase, userId } = getRequestContext(req);
    const sessionId = validateUuid(req.params.id, "id");

    await getSessionById(supabase, userId, sessionId);
    await deleteSession(supabase, userId, sessionId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
