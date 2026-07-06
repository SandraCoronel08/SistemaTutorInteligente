import { Router } from "express";
import {
  getSessionMessages,
  getSessions,
  patchSession,
  postSession,
  removeSession
} from "../controllers/sessionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const sessionRoutes = Router();

sessionRoutes.use(authMiddleware);

sessionRoutes.get("/", getSessions);
sessionRoutes.post("/", postSession);
sessionRoutes.get("/:id/messages", getSessionMessages);
sessionRoutes.patch("/:id", patchSession);
sessionRoutes.delete("/:id", removeSession);
