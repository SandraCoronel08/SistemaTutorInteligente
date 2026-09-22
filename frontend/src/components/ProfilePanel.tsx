import { Camera, Flag, Info, LogOut, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { sendErrorReport } from "../services/api";

type ProfilePanelProps = {
  name: string;
  avatarUrl?: string;
  disabled: boolean;
  onClose: () => void;
  onUpdateName: (name: string) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
  onSignOut: () => void;
  onDeleteAccount: () => Promise<void>;
};

const REPORT_CATEGORIES = [
  { value: "tutor_response", label: "Error de respuesta del tutor" },
  { value: "interface", label: "Problema de interfaz" },
  { value: "account", label: "Problema de inicio de sesion/cuenta" },
  { value: "other", label: "Otro" }
] as const;

const isAcceptedImage = (file: File) =>
  ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 2 * 1024 * 1024;

export function ProfilePanel({
  name,
  avatarUrl,
  disabled,
  onClose,
  onUpdateName,
  onUploadAvatar,
  onRemoveAvatar,
  onSignOut,
  onDeleteAccount
}: ProfilePanelProps): JSX.Element {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [reportOpen, setReportOpen] = useState(false);
  const [category, setCategory] = useState<(typeof REPORT_CATEGORIES)[number]["value"]>(
    "tutor_response"
  );
  const [description, setDescription] = useState("");
  const [activity, setActivity] = useState("");
  const [deleteStep, setDeleteStep] = useState<"idle" | "warning" | "confirm">("idle");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [busy, onClose]);

  useEffect(() => {
    setNameValue(name);
  }, [name]);

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!isAcceptedImage(file)) {
      setStatus("La imagen debe ser JPG, PNG o WebP y no superar 2 MB.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return nextPreviewUrl;
    });
    setBusy(true);
    setStatus("");
    try {
      await onUploadAvatar(file);
      setPreviewUrl(undefined);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar la foto.");
    } finally {
      setBusy(false);
    }
  };

  const handleNameSave = async () => {
    setBusy(true);
    setStatus("");
    try {
      await onUpdateName(nameValue);
      setEditingName(false);
      setStatus("Perfil actualizado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo actualizar el perfil.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setBusy(true);
    setStatus("");
    try {
      await onRemoveAvatar();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo eliminar la foto.");
    } finally {
      setBusy(false);
    }
  };

  const handleReportSubmit = async () => {
    setBusy(true);
    setStatus("");
    try {
      await sendErrorReport({
        category,
        description,
        activity: activity || undefined,
        route: window.location.pathname
      });
      setDescription("");
      setActivity("");
      setReportOpen(false);
      setStatus("Reporte enviado. Gracias por ayudarnos a mejorar el sistema.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo enviar el reporte.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    setBusy(true);
    setStatus("");
    try {
      await onDeleteAccount();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo eliminar la cuenta.");
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="profile-panel-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        className="profile-panel"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-panel-title"
        tabIndex={-1}
      >
        <div className="profile-panel-header">
          <h2 id="profile-panel-title">Mi perfil</h2>
          <button className="icon-button" type="button" onClick={onClose} disabled={busy}>
            <X aria-hidden="true" size={18} />
            <span className="sr-only">Cerrar perfil</span>
          </button>
        </div>

        <section className="profile-summary">
          <button
            className="profile-avatar"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || busy}
            aria-label="Cambiar foto de perfil"
          >
            {previewUrl || avatarUrl ? <img src={previewUrl ?? avatarUrl} alt="Foto de perfil" /> : <span>{name[0]?.toUpperCase() ?? "U"}</span>}
            <span className="profile-avatar-edit"><Camera aria-hidden="true" size={15} /></span>
          </button>
          <div>
            <strong>{name}</strong>
            <span>Estudiante</span>
          </div>
        </section>

        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => void handleAvatarChange(event)}
        />
        <div className="profile-photo-actions">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled || busy}>
            {avatarUrl ? "Reemplazar imagen" : "Subir imagen"}
          </button>
          {avatarUrl ? (
            <button type="button" onClick={() => void handleRemoveAvatar()} disabled={disabled || busy}>
              Eliminar imagen
            </button>
          ) : null}
        </div>

        <section className="profile-section">
          <div className="profile-section-title">
            <h3>Perfil</h3>
            {!editingName ? (
              <button type="button" onClick={() => setEditingName(true)} disabled={disabled || busy}>
                <Pencil aria-hidden="true" size={16} /> Editar perfil
              </button>
            ) : null}
          </div>
          {editingName ? (
            <div className="profile-edit-name">
              <label htmlFor="profile-name">Nombre</label>
              <input
                id="profile-name"
                value={nameValue}
                onChange={(event) => setNameValue(event.target.value)}
                maxLength={80}
              />
              <div>
                <button type="button" onClick={() => setEditingName(false)} disabled={busy}>Cancelar</button>
                <button type="button" onClick={() => void handleNameSave()} disabled={!nameValue.trim() || busy}>Guardar</button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="profile-section">
          <div className="profile-section-title">
            <h3>Ayuda</h3>
            <button type="button" onClick={() => setReportOpen((current) => !current)} disabled={disabled || busy}>
              <Flag aria-hidden="true" size={16} /> Reportar un error
            </button>
          </div>
          {reportOpen ? (
            <div className="report-form">
              <label>
                Tipo
                <select value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
                  {REPORT_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label>
                Descripcion
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} minLength={10} maxLength={2000} />
              </label>
              <label>
                Que estabas haciendo cuando ocurrio? <span>(opcional)</span>
                <textarea value={activity} onChange={(event) => setActivity(event.target.value)} maxLength={500} />
              </label>
              <button type="button" onClick={() => void handleReportSubmit()} disabled={description.trim().length < 10 || busy}>Enviar reporte</button>
            </div>
          ) : null}
        </section>

        <section className="profile-section profile-about">
          <h3><Info aria-hidden="true" size={16} /> Acerca del tutor</h3>
          <strong>Tutor Inteligente AED I</strong>
          <p>Sistema de apoyo academico para Algoritmos y Estructuras de Datos I</p>
          <span>Version 1.0</span>
        </section>

        <section className="profile-section profile-account-actions">
          {deleteStep === "idle" ? (
            <>
              <button type="button" onClick={onSignOut} disabled={disabled || busy}><LogOut aria-hidden="true" size={17} /> Cerrar sesion</button>
              <button className="profile-danger" type="button" onClick={() => setDeleteStep("warning")} disabled={disabled || busy}><Trash2 aria-hidden="true" size={17} /> Eliminar cuenta</button>
            </>
          ) : null}
          {deleteStep === "warning" ? (
            <div className="profile-confirmation">
              <p>Esta accion elimina permanentemente tu cuenta y sus conversaciones.</p>
              <div><button type="button" onClick={() => setDeleteStep("idle")}>Cancelar</button><button type="button" onClick={() => setDeleteStep("confirm")}>Continuar</button></div>
            </div>
          ) : null}
          {deleteStep === "confirm" ? (
            <div className="profile-confirmation">
              <label>Escribi ELIMINAR para confirmar<input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /></label>
              <div><button type="button" onClick={() => setDeleteStep("idle")} disabled={busy}>Cancelar</button><button className="profile-danger" type="button" onClick={() => void handleDeleteAccount()} disabled={confirmation !== "ELIMINAR" || busy}>Eliminar cuenta</button></div>
            </div>
          ) : null}
        </section>

        {status ? <p className="profile-status" role="status">{status}</p> : null}
      </div>
    </div>,
    document.body
  );
}
