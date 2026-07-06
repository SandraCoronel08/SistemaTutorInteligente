import { geminiModel } from "../config/gemini.js";
import { AppError } from "../middlewares/errorMiddleware.js";

export const generateTutorAnswer = async (prompt: string) => {
  try {
    const result = await geminiModel.generateContent(prompt);
    const answer = result.response.text().trim();

    if (!answer) {
      throw new AppError("Gemini no devolvio una respuesta valida.", 502);
    }

    return answer;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "No se pudo conectar con Gemini. Intenta nuevamente mas tarde.",
      502
    );
  }
};
