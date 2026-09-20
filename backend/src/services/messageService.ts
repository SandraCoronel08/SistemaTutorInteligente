import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "../middlewares/errorMiddleware.js";

export type ChatMessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  session_id: string;
  user_id: string;
  role: ChatMessageRole;
  content: string;
  topic: string | null;
  created_at: string;
};

type CreateMessageInput = {
  sessionId: string;
  userId: string;
  role: ChatMessageRole;
  content: string;
  topic?: string;
};

export const createMessage = async (
  supabase: SupabaseClient,
  input: CreateMessageInput
) => {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: input.sessionId,
      user_id: input.userId,
      role: input.role,
      content: input.content,
      topic: input.topic
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new AppError("No se pudo guardar el mensaje.", 500);
  }

  return data as ChatMessage;
};

export const listMessagesBySession = async (
  supabase: SupabaseClient,
  userId: string,
  sessionId: string
) => {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new AppError("No se pudieron obtener los mensajes.", 500);
  }

  return data as ChatMessage[];
};

export const getRecentMessages = async (
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  limit = 10
) => {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new AppError("No se pudo recuperar el historial reciente.", 500);
  }

  return [...(data ?? [])].reverse() as Pick<
    ChatMessage,
    "role" | "content" | "created_at"
  >[];
};
