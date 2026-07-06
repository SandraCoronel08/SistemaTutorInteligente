import { useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

type LoginFormProps = {
  onError: (message: string) => void;
  onSwitchMode: () => void;
};

export function LoginForm({
  onError,
  onSwitchMode
}: LoginFormProps): JSX.Element {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    onError("");

    try {
      await signIn(email.trim(), password);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesion. Verifica tus datos."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleSubmitting(true);
    onError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/chat`
        }
      });

      if (error) {
        onError(`No se pudo iniciar sesion con Google: ${error.message}`);
      }
    } catch (error) {
      onError(
        error instanceof Error
          ? `No se pudo iniciar sesion con Google: ${error.message}`
          : "No se pudo iniciar sesion con Google."
      );
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>Iniciar sesion</h1>
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
      <span>o usa tu email y contrasena</span>
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
          autoComplete="current-password"
          required
        />
      </label>
      <button className="text-link-button" type="button">
        Olvidaste tu contrasena?
      </button>
      <button className="primary-button" type="submit" disabled={submitting}>
        <LogIn aria-hidden="true" size={18} />
        {submitting ? "Ingresando..." : "Ingresar"}
      </button>
      <p className="auth-switch">
        No tenes cuenta?{" "}
        <button type="button" onClick={onSwitchMode}>
          Crear cuenta
        </button>
      </p>
    </form>
  );
}
