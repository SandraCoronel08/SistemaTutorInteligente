import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import { validateRequiredUser } from "../utils/validators.js";

export const deleteCurrentAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRequiredUser(req.user?.id);

    if (req.body?.confirmation !== "ELIMINAR") {
      throw new AppError("Confirmacion de eliminacion invalida.", 400);
    }

    const avatarPath = (req.user?.user_metadata as Record<string, unknown> | undefined)
      ?.avatar_path;

    if (typeof avatarPath === "string" && avatarPath.length > 0) {
      const { error: avatarError } = await supabaseAdmin.storage
        .from("profile-avatars")
        .remove([avatarPath]);

      if (avatarError) {
        throw new AppError("No se pudo eliminar la cuenta.", 500);
      }
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.user!.id);

    if (error) {
      throw new AppError("No se pudo eliminar la cuenta.", 500);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
