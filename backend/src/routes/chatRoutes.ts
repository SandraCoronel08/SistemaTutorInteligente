import { Router } from "express";
import { sendChatMessage } from "../controllers/chatController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createRateLimitMiddleware } from "../middlewares/securityMiddleware.js";

export const chatRoutes = Router();

const chatRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000,
  maxRequests: 20
});

chatRoutes.use(authMiddleware);

chatRoutes.post("/send", chatRateLimit, sendChatMessage);
