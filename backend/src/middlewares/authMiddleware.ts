import type { NextFunction, Request, Response } from "express";
import {
  createSupabaseUserClient,
  supabaseAuth
} from "../config/supabase.js";
import { AppError } from "./errorMiddleware.js";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Token de autenticacion requerido.", 401);
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      throw new AppError("Token de autenticacion vacio.", 401);
    }

    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      throw new AppError("Token de autenticacion invalido o expirado.", 401);
    }

    const supabase = createSupabaseUserClient(token);

    req.user = data.user;
    req.accessToken = token;
    req.supabase = supabase;

    next();
  } catch (error) {
    next(error);
  }
};
