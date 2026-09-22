import dotenv from "dotenv";

dotenv.config();

type Env = {
  port: number;
  nodeEnv: string;
  corsOrigins: string[];
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  openrouterApiKey: string;
  openrouterModel: string;
};

const requiredVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENROUTER_API_KEY"
] as const;

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

const defaultCorsOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const corsOrigins = (process.env.CORS_ORIGIN ?? defaultCorsOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env: Env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigins,
  supabaseUrl: process.env.SUPABASE_URL as string,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY as string,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  openrouterApiKey: process.env.OPENROUTER_API_KEY as string,
  openrouterModel: process.env.OPENROUTER_MODEL ?? "openai/gpt-5.6-luna"
};
