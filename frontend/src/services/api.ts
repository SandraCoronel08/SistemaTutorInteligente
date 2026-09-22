import axios from "axios";
import { supabase } from "./supabaseClient";
import type { ChatMessage, SendChatResponse } from "../types/chat";
import type { ChatSession } from "../types/session";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export const getSessions = async () => {
  const { data } = await api.get<{ sessions: ChatSession[] }>("/api/sessions");
  return data.sessions;
};

export const createSession = async (title?: string) => {
  const { data } = await api.post<{ session: ChatSession }>("/api/sessions", {
    title
  });
  return data.session;
};

export const getSessionMessages = async (sessionId: string) => {
  const { data } = await api.get<{ messages: ChatMessage[] }>(
    `/api/sessions/${sessionId}/messages`
  );
  return data.messages;
};

export const updateSessionTitle = async (sessionId: string, title: string) => {
  const { data } = await api.patch<{ session: ChatSession }>(
    `/api/sessions/${sessionId}`,
    { title }
  );
  return data.session;
};

export const deleteSession = async (sessionId: string) => {
  await api.delete(`/api/sessions/${sessionId}`);
};

export const deleteCurrentAccount = async () => {
  await api.delete("/api/account", {
    data: { confirmation: "ELIMINAR" }
  });
};

export const sendErrorReport = async (input: {
  category: "tutor_response" | "interface" | "account" | "other";
  description: string;
  activity?: string;
  route: string;
}) => {
  await api.post("/api/error-reports", input);
};

export const sendChatMessage = async (input: {
  sessionId?: string;
  message: string;
}) => {
  const { data } = await api.post<SendChatResponse>("/api/chat/send", input);
  return data;
};

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message;

    if (typeof message === "string") {
      return message;
    }

    if (error.message) {
      return error.message;
    }
  }

  return "Ocurrio un error inesperado. Intenta nuevamente.";
};
