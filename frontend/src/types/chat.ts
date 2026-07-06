export type ChatRole = "user" | "assistant";

export type Difficulty = "basico" | "intermedio" | "avanzado";

export type ChatMessage = {
  id: string;
  session_id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  topic: string | null;
  difficulty: Difficulty | null;
  created_at: string;
};

export type SendChatResponse = {
  sessionId: string;
  answer: string;
  messageId: string;
  userMessageId: string;
};
