import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";
import { useAuth } from "../context/AuthContext";

export function Login(): JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showRegister = () => {
    setError("");
    setSuccess("");
    setIsActive(true);
    window.setTimeout(() => navigate("/register"), 420);
  };

  const showLogin = () => {
    setError("");
    setSuccess("");
    setIsActive(false);
  };

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <main className="auth-page">
      <section
        className={`container ${isActive ? "active" : ""}`}
        id="container"
        aria-label="Acceso al Tutor Inteligente AED I"
      >
        <div className="form-container sign-up">
          {error && isActive ? (
            <div className="alert alert-error">{error}</div>
          ) : null}
          {success && isActive ? (
            <div className="alert alert-success">{success}</div>
          ) : null}
          <RegisterForm
            onError={setError}
            onSuccess={setSuccess}
            onSwitchMode={showLogin}
          />
        </div>

        <div className="form-container sign-in">
          {error && !isActive ? (
            <div className="alert alert-error">{error}</div>
          ) : null}
          <LoginForm onError={setError} onSwitchMode={showRegister} />
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <img className="brand-logo" src="/sti-aed-logo.png" alt="Logo del Tutor Inteligente AED I" />
              <h1>Bienvenido de nuevo</h1>
              <p>
                Ingresa con tu cuenta para continuar usando el tutor academico.
              </p>
              <button
                className="hidden"
                id="login"
                type="button"
                onClick={showLogin}
              >
                Iniciar sesion
              </button>
            </div>

            <div className="toggle-panel toggle-right">
              <img className="brand-logo" src="/sti-aed-logo.png" alt="Logo del Tutor Inteligente AED I" />
              <h1>Hola, estudiante</h1>
              <p>
                Crea una cuenta para guardar tus conversaciones y avanzar con AED I.
              </p>
              <button
                className="hidden"
                id="register"
                type="button"
                onClick={showRegister}
              >
                Registrarme
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
