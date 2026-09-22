import { Router } from "express";
import { createErrorReport } from "../controllers/errorReportController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const errorReportRoutes = Router();

errorReportRoutes.use(authMiddleware);
errorReportRoutes.post("/", createErrorReport);
