import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env.js";

export const geminiClient = new GoogleGenerativeAI(env.geminiApiKey);

export const geminiModel = geminiClient.getGenerativeModel({
  model: env.geminiModel
});
