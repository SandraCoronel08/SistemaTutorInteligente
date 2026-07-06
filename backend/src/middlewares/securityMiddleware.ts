import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorMiddleware.js";

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const chatRateLimitStore = new Map<string, RateLimitEntry>();

export const securityHeadersMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  next();
};

export const createRateLimitMiddleware = ({
  windowMs,
  maxRequests
}: RateLimitOptions) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const now = Date.now();
    const identifier =
      req.user?.id ??
      req.ip ??
      req.headers["x-forwarded-for"]?.toString() ??
      "anonymous";
    const entry = chatRateLimitStore.get(identifier);

    if (!entry || entry.resetAt <= now) {
      chatRateLimitStore.set(identifier, {
        count: 1,
        resetAt: now + windowMs
      });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      next(
        new AppError(
          "Demasiadas solicitudes al tutor. Espera un momento e intenta nuevamente.",
          429
        )
      );
      return;
    }

    entry.count += 1;
    next();
  };
};
