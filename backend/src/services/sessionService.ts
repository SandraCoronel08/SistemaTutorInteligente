import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "../middlewares/errorMiddleware.js";

export type ChatSession = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
};

const NEW_SESSION_TITLE = "Nueva conversacion";

const attachMessageCounts = async (
  supabase: SupabaseClient,
  userId: string,
  sessions: ChatSession[]
) => {
  if (sessions.length === 0) {
    return sessions;
  }

  const sessionIds = sessions.map((session) => session.id);
  const { data, error } = await supabase
    .from("chat_messages")
    .select("session_id")
    .eq("user_id", userId)
    .in("session_id", sessionIds);

  if (error) {
    throw new AppError("No se pudieron contar los mensajes de las sesiones.", 500);
  }

  const counts = new Map<string, number>();

  for (const message of data ?? []) {
    const sessionId = String(message.session_id);
    counts.set(sessionId, (counts.get(sessionId) ?? 0) + 1);
  }

  return sessions.map((session) => ({
    ...session,
    message_count: counts.get(session.id) ?? 0
  }));
};

const isEmptyDraftSession = (session: ChatSession) =>
  session.title === NEW_SESSION_TITLE && (session.message_count ?? 0) === 0;

export const listSessions = async (
  supabase: SupabaseClient,
  userId: string
) => {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new AppError("No se pudieron obtener las sesiones.", 500);
  }

  const sessionsWithCounts = await attachMessageCounts(
    supabase,
    userId,
    data as ChatSession[]
  );
  const emptyDrafts = sessionsWithCounts.filter(isEmptyDraftSession);
  const [, ...draftsToDelete] = emptyDrafts;

  if (draftsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("user_id", userId)
      .in(
        "id",
        draftsToDelete.map((session) => session.id)
      );

    if (deleteError) {
      throw new AppError("No se pudieron limpiar las sesiones vacias.", 500);
    }
  }

  return sessionsWithCounts.filter(
    (session) => !draftsToDelete.some((draft) => draft.id === session.id)
  );
};

export const getEmptyDraftSession = async (
  supabase: SupabaseClient,
  userId: string
) => {
  const sessions = await listSessions(supabase, userId);

  return sessions.find(isEmptyDraftSession);
};

export const getSessionById = async (
  supabase: SupabaseClient,
  userId: string,
  sessionId: string
) => {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new AppError("Sesion no encontrada.", 404);
  }

  return data as ChatSession;
};

export const createSession = async (
  supabase: SupabaseClient,
  userId: string,
  title = "Nueva conversacion"
) => {
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      title
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new AppError("No se pudo crear la sesion.", 500);
  }

  return data as ChatSession;
};

export const updateSessionTitle = async (
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  title: string
) => {
  const { data, error } = await supabase
    .from("chat_sessions")
    .update({ title })
    .eq("id", sessionId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new AppError("No se pudo actualizar la sesion.", 500);
  }

  return data as ChatSession;
};

export const touchSession = async (
  supabase: SupabaseClient,
  userId: string,
  sessionId: string
) => {
  const { error } = await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    throw new AppError("No se pudo actualizar la actividad de la sesion.", 500);
  }
};

export const deleteSession = async (
  supabase: SupabaseClient,
  userId: string,
  sessionId: string
) => {
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    throw new AppError("No se pudo eliminar la sesion.", 500);
  }
};
