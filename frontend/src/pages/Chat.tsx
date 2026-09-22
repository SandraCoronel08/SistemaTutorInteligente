import { Menu } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatWindow } from "../components/ChatWindow";
import { SidebarSessions } from "../components/SidebarSessions";
import { useAuth } from "../context/AuthContext";
import {
  createSession,
  deleteSession,
  getApiErrorMessage,
  getSessionMessages,
  getSessions,
  sendChatMessage
} from "../services/api";
import type { ChatMessage } from "../types/chat";
import type { ChatSession } from "../types/session";

const NEW_SESSION_TITLE = "Nueva conversacion";

const getUserDisplayName = (user: ReturnType<typeof useAuth>["user"]) => {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const metadataName = [metadata?.name, metadata?.full_name, metadata?.display_name]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0)
    ?.trim();

  if (metadataName) {
    return metadataName;
  }

  return "Usuario";
};

export function Chat(): JSX.Element {
  const {
    user,
    signOut,
    deleteAccount,
    profile,
    updateProfileName,
    uploadAvatar,
    removeAvatar
  } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId),
    [activeSessionId, sessions]
  );
  const userDisplayName = useMemo(() => profile.name || getUserDisplayName(user), [profile.name, user]);

  const isEmptyDraftSession = useCallback(
    (session?: ChatSession) =>
      session?.title === NEW_SESSION_TITLE && (session.message_count ?? 0) === 0,
    []
  );

  const loadSessions = useCallback(async (clearError = true) => {
    setLoadingSessions(true);
    if (clearError) {
      setError("");
    }

    try {
      const data = await getSessions();
      setSessions(data);
      return data;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const loadMessages = useCallback(async (sessionId: string, clearError = true) => {
    setLoadingMessages(true);
    setMessages([]);
    if (clearError) {
      setError("");
    }

    try {
      const data = await getSessionMessages(sessionId);
      setMessages(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleNewSession = async () => {
    if (sending) {
      return;
    }

    setError("");

    if (isEmptyDraftSession(activeSession) && messages.length === 0) {
      setSidebarOpen(false);
      return;
    }

    const existingDraft = sessions.find(isEmptyDraftSession);

    if (existingDraft) {
      setActiveSessionId(existingDraft.id);
      setMessages([]);
      setSidebarOpen(false);
      return;
    }

    try {
      const session = await createSession(NEW_SESSION_TITLE);
      setSessions((current) => {
        if (current.some((item) => item.id === session.id)) {
          return current;
        }

        return [session, ...current];
      });
      setActiveSessionId(session.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    if (sending) {
      return;
    }

    setActiveSessionId(sessionId);
    setSidebarOpen(false);
    await loadMessages(sessionId);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (sending) {
      return;
    }

    setError("");

    try {
      await deleteSession(sessionId);
      setSessions((current) => current.filter((session) => session.id !== sessionId));

      if (activeSessionId === sessionId) {
        setActiveSessionId(undefined);
        setMessages([]);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const handleSendMessage = async (message: string) => {
    const optimisticMessage: ChatMessage = {
      id: `optimistic-${crypto.randomUUID()}`,
      session_id: activeSessionId ?? "optimistic-session",
      user_id: user?.id ?? "optimistic-user",
      role: "user",
      content: message,
      topic: null,
      created_at: new Date().toISOString()
    };
    const sessionIdAtSend = activeSessionId;

    setSending(true);
    setError("");
    setMessages((current) => [...current, optimisticMessage]);

    try {
      const response = await sendChatMessage({
        sessionId: activeSessionId,
        message
      });

      setActiveSessionId(response.sessionId);
      await loadMessages(response.sessionId);
      await loadSessions();
    } catch (requestError) {
      const errorMessage = getApiErrorMessage(requestError);
      setError(errorMessage);

      const refreshedSessions = await loadSessions(false);
      const sessionIdToReload = sessionIdAtSend ?? refreshedSessions?.[0]?.id;

      if (sessionIdToReload) {
        setActiveSessionId(sessionIdToReload);
        await loadMessages(sessionIdToReload, false);
      } else {
        setMessages((current) =>
          current.filter((message) => message.id !== optimisticMessage.id)
        );
      }

      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (signOutError) {
      setError(
        signOutError instanceof Error
          ? signOutError.message
          : "No se pudo cerrar la sesion."
      );
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setError("");

    try {
      await deleteAccount();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar la cuenta.";
      setError(message);
      throw deleteError;
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <main className="app-shell">
      <SidebarSessions
        sessions={sessions}
        activeSessionId={activeSessionId}
        open={sidebarOpen}
        loading={loadingSessions}
        disabled={sending || deletingAccount}
        userName={userDisplayName}
        avatarUrl={profile.avatarUrl}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClose={() => setSidebarOpen(false)}
        onSignOut={handleSignOut}
        onDeleteAccount={handleDeleteAccount}
        onUpdateName={updateProfileName}
        onUploadAvatar={uploadAvatar}
        onRemoveAvatar={removeAvatar}
      />
      <button
        className={`sidebar-backdrop ${sidebarOpen ? "sidebar-backdrop-open" : ""}`}
        type="button"
        aria-label="Cerrar conversaciones"
        onClick={() => setSidebarOpen(false)}
      />

      <section className="chat-layout">
        <header className="app-header">
          <button
            className="icon-button mobile-only"
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-expanded={sidebarOpen}
            aria-label="Abrir conversaciones"
          >
            <Menu aria-hidden="true" size={20} />
            <span className="sr-only">Abrir sesiones</span>
          </button>
          <div className="header-title">
            <h1>Tutor Inteligente AED I</h1>
            <p>Sistema de apoyo academico para Algoritmos y Estructuras de Datos I</p>
          </div>
        </header>

        {error ? <div className="alert alert-error app-alert">{error}</div> : null}

        <ChatWindow
          messages={messages}
          loadingMessages={loadingMessages}
          sending={sending}
          activeSessionId={activeSessionId}
          activeSessionTitle={activeSession?.title}
          userName={userDisplayName}
          onSendMessage={handleSendMessage}
          onRefresh={loadSessions}
        />
      </section>
    </main>
  );
}
