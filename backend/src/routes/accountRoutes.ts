import { Router } from "express";
import { deleteCurrentAccount } from "../controllers/accountController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const accountRoutes = Router();

accountRoutes.use(authMiddleware);
accountRoutes.delete("/", deleteCurrentAccount);
