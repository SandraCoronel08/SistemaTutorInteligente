import type { NextFunction, Request, Response } from "express";
import { AppError } from "../middlewares/errorMiddleware.js";
import {
  validateErrorReportCategory,
  validateOptionalText,
  validateRequiredText,
  validateRequiredUser
} from "../utils/validators.js";

export const createErrorReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    validateRequiredUser(userId);

    const category = validateErrorReportCategory(req.body?.category);
    const description = validateRequiredText(req.body?.description, "descripcion", 10, 2000);
    const activity = validateOptionalText(req.body?.activity, "actividad", 500);
    const route = validateOptionalText(req.body?.route, "ruta", 200);
    const { error } = await req.supabase!
      .from("error_reports")
      .insert({ user_id: userId, category, description, activity, route });

    if (error) {
      throw new AppError("No se pudo enviar el reporte.", 500);
    }

    res.status(201).json({ message: "Reporte enviado." });
  } catch (error) {
    next(error);
  }
};
