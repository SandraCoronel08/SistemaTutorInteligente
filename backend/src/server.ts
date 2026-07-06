import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import {
  errorMiddleware,
  notFoundMiddleware
} from "./middlewares/errorMiddleware.js";
import { securityHeadersMiddleware } from "./middlewares/securityMiddleware.js";
import { chatRoutes } from "./routes/chatRoutes.js";
import { sessionRoutes } from "./routes/sessionRoutes.js";

const app = express();

app.disable("x-powered-by");
app.use(securityHeadersMiddleware);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Tutor Inteligente AED I API"
  });
});

app.use("/api/sessions", sessionRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});
