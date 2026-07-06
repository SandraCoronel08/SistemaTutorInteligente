import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

type RegisterFormProps = {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onSwitchMode: () => void;
};

export function RegisterForm({
  onError,
  onSuccess,
  onSwitchMode
}: RegisterFormProps): JSX.Element {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onError("");
    onSuccess("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      onError("Ingresa tu nombre para crear la cuenta.");
      return;
    }

    if (password !== confirmPassword) {
      onError("Las contrasenas no coinciden.");
      return;
    }

    if (password.length < 6) {
      onError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    setSubmitting(true);

    try {
      await signUp(trimmedName, email.trim(), password);
      onSuccess(
        "Tu cuenta ya casi esta lista. Te enviamos un correo de confirmacion para activar el acceso."
      );
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el usuario."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleSubmitting(true);
    onError("");
    onSuccess("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/chat`
        }
      });

      if (error) {
        onError(`No se pudo continuar con Google: ${error.message}`);
      }
    } catch (error) {
      onError(
        error instanceof Error
          ? `No se pudo continuar con Google: ${error.message}`
          : "No se pudo continuar con Google."
      );
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>Crear cuenta</h1>
      <button
        className="google-auth-button"
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleSubmitting || submitting}
      >
        <span className="google-mark" aria-hidden="true">
          G
        </span>
        {googleSubmitting ? "Conectando con Google..." : "Continuar con Google"}
      </button>
      <span>o usa tu email para registrarte</span>
      <label>
        <span className="sr-only">Nombre</span>
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
      </label>
      <label>
        <span className="sr-only">Email</span>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </label>
      <label>
        <span className="sr-only">Contrasena</span>
        <input
          type="password"
          placeholder="Contrasena"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />
      </label>
      <label>
        <span className="sr-only">Confirmar contrasena</span>
        <input
          type="password"
          placeholder="Confirmar contrasena"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          required
        />
      </label>
      <button className="primary-button" type="submit" disabled={submitting}>
        <UserPlus aria-hidden="true" size={18} />
        {submitting ? "Registrando..." : "Registrarme"}
      </button>
      <p className="auth-switch">
        Ya tenes cuenta?{" "}
        <button type="button" onClick={onSwitchMode}>
          Iniciar sesion
        </button>
      </p>
    </form>
  );
}
