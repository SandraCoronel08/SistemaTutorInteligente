import { ChevronDown, MessageSquarePlus, PanelLeftClose, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProfilePanel } from "./ProfilePanel";
import type { ChatSession } from "../types/session";

type SidebarSessionsProps = {
  sessions: ChatSession[];
  activeSessionId?: string;
  open: boolean;
  loading: boolean;
  disabled: boolean;
  userName: string;
  avatarUrl?: string;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClose: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => Promise<void>;
  onUpdateName: (name: string) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
};

export function SidebarSessions({
  sessions,
  activeSessionId,
  open,
  loading,
  disabled,
  userName,
  avatarUrl,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onClose,
  onSignOut,
  onDeleteAccount,
  onUpdateName,
  onUploadAvatar,
  onRemoveAvatar
}: SidebarSessionsProps): JSX.Element {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const closeAccountMenu = () => {
    setAccountMenuOpen(false);
  };

  return (
    <aside
      className={`sessions-sidebar ${open ? "sessions-sidebar-open" : ""} ${
        disabled ? "sessions-sidebar-disabled" : ""
      }`}
    >
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="sidebar-logo">
            <img src="/sti-aed-logo.png" alt="Logo del Tutor Inteligente AED I" />
          </span>
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

      <button
        className="new-session-button"
        type="button"
        onClick={onNewSession}
        disabled={disabled}
      >
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
              disabled={disabled}
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
              disabled={disabled}
            >
              <Trash2 aria-hidden="true" size={16} />
              <span className="sr-only">Eliminar sesion</span>
            </button>
          </div>
        ))}
      </nav>

      <div className="sidebar-account">
        <button
          className="sidebar-user"
          type="button"
          onClick={() => setAccountMenuOpen((current) => !current)}
          disabled={disabled}
          aria-expanded={accountMenuOpen}
          aria-haspopup="menu"
        >
          <div className="user-avatar" aria-hidden="true">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              (userName.trim()[0] ?? "U").toUpperCase()
            )}
          </div>
          <div className="user-details">
            <strong>{userName}</strong>
          </div>
          <ChevronDown aria-hidden="true" size={18} />
        </button>

      </div>
      {accountMenuOpen ? (
        <ProfilePanel
          name={userName}
          avatarUrl={avatarUrl}
          disabled={disabled}
          onClose={closeAccountMenu}
          onUpdateName={onUpdateName}
          onUploadAvatar={onUploadAvatar}
          onRemoveAvatar={onRemoveAvatar}
          onSignOut={onSignOut}
          onDeleteAccount={onDeleteAccount}
        />
      ) : null}
    </aside>
  );
}
