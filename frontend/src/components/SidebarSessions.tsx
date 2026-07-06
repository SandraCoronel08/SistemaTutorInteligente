import {
  LogOut,
  MessageSquarePlus,
  PanelLeftClose,
  Trash2
} from "lucide-react";
import type { ChatSession } from "../types/session";

type SidebarSessionsProps = {
  sessions: ChatSession[];
  activeSessionId?: string;
  open: boolean;
  loading: boolean;
  userEmail?: string;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClose: () => void;
  onSignOut: () => void;
};

export function SidebarSessions({
  sessions,
  activeSessionId,
  open,
  loading,
  userEmail,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onClose,
  onSignOut
}: SidebarSessionsProps): JSX.Element {
  return (
    <aside className={`sessions-sidebar ${open ? "sessions-sidebar-open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="sidebar-logo">AED I</span>
          <div>
            <strong>Tutor Inteligente AED I</strong>
            <span>Tutor academico</span>
          </div>
        </div>
        <button className="icon-button mobile-only" type="button" onClick={onClose}>
          <PanelLeftClose aria-hidden="true" size={18} />
          <span className="sr-only">Cerrar sesiones</span>
        </button>
      </div>

      <button className="new-session-button" type="button" onClick={onNewSession}>
        <MessageSquarePlus aria-hidden="true" size={18} />
        Nueva conversacion
      </button>

      <div className="sessions-count">
        {loading ? "Cargando conversaciones..." : `${sessions.length} sesiones`}
      </div>

      <nav className="sessions-list" aria-label="Sesiones anteriores">
        {sessions.length === 0 && !loading ? (
          <p className="empty-state">Aun no hay conversaciones</p>
        ) : null}

        {sessions.map((session) => (
          <div
            className={`session-item ${
              session.id === activeSessionId ? "session-item-active" : ""
            }`}
            key={session.id}
          >
            <button
              type="button"
              onClick={() => onSelectSession(session.id)}
              className="session-select-button"
            >
              <span>{session.title}</span>
              <time dateTime={session.updated_at}>
                {new Intl.DateTimeFormat("es-PY", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit"
                }).format(new Date(session.updated_at))}
              </time>
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => onDeleteSession(session.id)}
              title="Eliminar sesion"
            >
              <Trash2 aria-hidden="true" size={16} />
              <span className="sr-only">Eliminar sesion</span>
            </button>
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar" aria-hidden="true">
          {(userEmail?.[0] ?? "U").toUpperCase()}
        </div>
        <div className="user-details">
          <strong>Usuario</strong>
          <span>{userEmail}</span>
        </div>
        <button className="logout-button" type="button" onClick={onSignOut}>
          <LogOut aria-hidden="true" size={18} />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  );
}
