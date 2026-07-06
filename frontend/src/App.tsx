import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { useAuth } from "./context/AuthContext";
import { Chat } from "./pages/Chat";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

function ProtectedRoute({ children }: { children: JSX.Element }): JSX.Element {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="center-screen">
        <LoadingIndicator label="Cargando sesion..." />
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}
