import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message =
    error instanceof Error
      ? error.message
      : "Ocurrio un error inesperado en el servidor.";

  res.status(statusCode).json({
    error: {
      message:
        statusCode === 500
          ? "Ocurrio un error inesperado. Intenta nuevamente."
          : message
    }
  });
};
