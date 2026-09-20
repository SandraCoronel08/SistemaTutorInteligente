import { RefreshCw, SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { ChatMessage } from "../types/chat";
import { LoadingIndicator } from "./LoadingIndicator";
import { MessageBubble } from "./MessageBubble";

const topicOptions = [
  "",
  "Fundamentos de algoritmos",
  "Estructuras de control",
  "Complejidad algoritmica",
  "Arreglos",
  "Listas",
  "Pilas",
  "Colas",
  "Busqueda secuencial",
  "Busqueda binaria",
  "Ordenamiento",
  "Recursividad",
  "Arboles binarios",
  "Arboles binarios de busqueda"
];

const welcomeGreetingTemplates = [
  (name: string) => ({
    title: `Hola, ${name}. Listo para practicar AED I?`,
    body: "Podes empezar con una duda puntual, pedir un ejemplo paso a paso o elegir una sugerencia."
  }),
  (name: string) => ({
    title: `Que bueno verte, ${name}.`,
    body: "Trae tu consulta de algoritmos, estructuras de datos o ejercicios y lo resolvemos juntos."
  }),
  (name: string) => ({
    title: `Bienvenido, ${name}. Empecemos con calma.`,
    body: "Preguntame sobre pilas, colas, busquedas, recursividad o cualquier tema de AED I."
  }),
  (name: string) => ({
    title: `Hola, ${name}. Tu tutor AED I esta listo.`,
    body: "Escribi una pregunta o selecciona una idea rapida para abrir esta conversacion."
  })
];

const getGreetingIndex = (key: string) => {
  let hash = 0;

  for (const character of key) {
    hash = (hash * 31 + character.charCodeAt(0)) % welcomeGreetingTemplates.length;
  }

  return hash;
};

type ChatWindowProps = {
  messages: ChatMessage[];
  loadingMessages: boolean;
  sending: boolean;
  activeSessionId?: string;
  activeSessionTitle?: string;
  userName: string;
  onRefresh: () => void;
  onSendMessage: (input: {
    message: string;
    topic?: string;
  }) => Promise<void>;
};

export function ChatWindow({
  messages,
  loadingMessages,
  sending,
  activeSessionId,
  activeSessionTitle,
  userName,
  onRefresh,
  onSendMessage
}: ChatWindowProps): JSX.Element {
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const welcomeGreeting = useMemo(() => {
    const greetingKey = `${activeSessionId ?? "inicio"}-${userName}`;
    return welcomeGreetingTemplates[getGreetingIndex(greetingKey)](userName);
  }, [activeSessionId, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [message]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message.trim() || sending) {
      return;
    }

    const content = message.trim();
    setMessage("");

    await onSendMessage({
      message: content,
      topic: topic || undefined
    });
  };

  const handleSuggestion = (suggestion: string) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <section className="chat-window" aria-label="Chat del tutor">
      <div className="chat-context">
        <div className="chat-context-badge" aria-hidden="true">
          AED
        </div>
        <strong className="chat-context-title">
          {activeSessionTitle ?? "Nueva conversacion"}
        </strong>
        <div className="chat-context-actions">
          <div className="chat-selectors">
            <label>
              Tema
              <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                {topicOptions.map((option) => (
                  <option key={option || "todos"} value={option}>
                    {option || "Sin tema fijo"}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="icon-button refresh-button" type="button" onClick={onRefresh}>
            <RefreshCw aria-hidden="true" size={18} />
            <span className="sr-only">Actualizar sesiones</span>
          </button>
        </div>
      </div>

      <div className="messages-area">
        <div className="messages-container">
          {loadingMessages ? (
            <LoadingIndicator label="Cargando mensajes..." />
          ) : null}

          {!loadingMessages && messages.length === 0 ? (
            <div className="welcome-panel">
              <h2>{welcomeGreeting.title}</h2>
              <p>{welcomeGreeting.body}</p>
              <div className="quick-suggestions" aria-label="Sugerencias rapidas">
                {[
                  "Que es una pila?",
                  "Explicame busqueda binaria",
                  "Generame un ejercicio basico de colas",
                  "Que es recursividad?"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((item) => (
            <MessageBubble key={item.id} message={item} />
          ))}

          {sending ? <LoadingIndicator asMessage /> : null}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form className="chat-input-bar input-dock" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-message">
          Mensaje
        </label>
        <div className="chat-input-shell input-inner">
          <textarea
            ref={textareaRef}
            id="chat-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Escribi tu consulta sobre Algoritmos y Estructuras de Datos I..."
            rows={2}
            maxLength={4000}
            disabled={sending}
          />
          <button
            className="send-button"
            type="submit"
            disabled={sending || message.trim().length === 0}
            title="Enviar mensaje"
          >
            <SendHorizonal aria-hidden="true" size={20} />
            <span className="sr-only">Enviar mensaje</span>
          </button>
        </div>
        <p className="input-disclaimer">
          Tutor AED I puede cometer errores.
        </p>
      </form>
    </section>
  );
}
