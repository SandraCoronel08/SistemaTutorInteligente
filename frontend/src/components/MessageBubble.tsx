import { forwardRef } from "react";
import type { ChatMessage } from "../types/chat";
import { MarkdownMessage } from "./MarkdownMessage";

type MessageBubbleProps = {
  message: Pick<ChatMessage, "role" | "content" | "created_at">;
};

export const MessageBubble = forwardRef<HTMLElement, MessageBubbleProps>(
  ({ message }, ref): JSX.Element => {
    const isUser = message.role === "user";
    const time = new Intl.DateTimeFormat("es-PY", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date(message.created_at));

    return (
      <article ref={ref} className={`message-row ${isUser ? "message-row-user" : ""}`}>
        {!isUser ? <div className="message-avatar">AI</div> : null}
        <div
          className={`message-bubble ${
            isUser ? "message-user" : "message-assistant"
          }`}
        >
          <div className="message-meta">
            <span>{isUser ? "Estudiante" : "Tutor AED I"}</span>
            <time dateTime={message.created_at}>{time}</time>
          </div>
          {isUser ? (
            <p className="message-text">{message.content}</p>
          ) : (
            <div className="markdown-body">
              <MarkdownMessage content={message.content} />
            </div>
          )}
        </div>
      </article>
    );
  }
);
