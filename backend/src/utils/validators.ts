import { AppError } from "../middlewares/errorMiddleware.js";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateRequiredUser = (userId?: string) => {
  if (!userId) {
    throw new AppError("Usuario autenticado requerido.", 401);
  }
};

export const validateUuid = (value: unknown, fieldName = "id") => {
  if (typeof value !== "string" || !uuidRegex.test(value)) {
    throw new AppError(`El campo ${fieldName} debe ser un UUID valido.`, 400);
  }

  return value;
};

export const validateOptionalUuid = (value: unknown, fieldName = "id") => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return validateUuid(value, fieldName);
};

export const validateMessage = (value: unknown) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError("El mensaje no puede estar vacio.", 400);
  }

  const message = value.trim();

  if (message.length > 4000) {
    throw new AppError("El mensaje no puede superar los 4000 caracteres.", 400);
  }

  return message;
};

export const validateOptionalText = (
  value: unknown,
  fieldName: string,
  maxLength = 120
) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(`El campo ${fieldName} debe ser texto.`, 400);
  }

  const text = value.trim();

  if (text.length === 0 || text.length > maxLength) {
    throw new AppError(
      `El campo ${fieldName} debe tener entre 1 y ${maxLength} caracteres.`,
      400
    );
  }

  if (/[\u0000-\u001F\u007F]/.test(text)) {
    throw new AppError(
      `El campo ${fieldName} contiene caracteres no permitidos.`,
      400
    );
  }

  return text;
};

export const validateTitle = (value: unknown) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError("El titulo no puede estar vacio.", 400);
  }

  const title = value.trim();

  if (title.length > 120) {
    throw new AppError("El titulo no puede superar los 120 caracteres.", 400);
  }

  return title;
};

export const validateErrorReportCategory = (value: unknown) => {
  const allowedCategories = ["tutor_response", "interface", "account", "other"] as const;

  if (!allowedCategories.includes(value as (typeof allowedCategories)[number])) {
    throw new AppError("La categoria del reporte no es valida.", 400);
  }

  return value as (typeof allowedCategories)[number];
};

export const validateRequiredText = (
  value: unknown,
  fieldName: string,
  minLength: number,
  maxLength: number
) => {
  if (typeof value !== "string") {
    throw new AppError(`El campo ${fieldName} debe ser texto.`, 400);
  }

  const text = value.trim();

  if (text.length < minLength || text.length > maxLength) {
    throw new AppError(
      `El campo ${fieldName} debe tener entre ${minLength} y ${maxLength} caracteres.`,
      400
    );
  }

  return text;
};
