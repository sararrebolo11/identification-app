import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch, readErrorMessage } from "../api/api";
import { useNotifications } from "../ui/notifications";
import "../styles/login.css";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast, showModal } = useNotifications();

  const params = new URLSearchParams(location.search);
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      showModal("Erro", "Token inválido.");
      return;
    }
    if (password.length < 6) {
      showModal("Erro", "Password demasiado curta.");
      return;
    }
    if (password !== confirm) {
      showModal("Erro", "As passwords não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (!res.ok) {
        const msg = await readErrorMessage(
          res,
          "Erro ao alterar password"
        );
        showModal("Erro", msg);
        return;
      }

      toast("Password alterada com sucesso");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Definir nova password</h2>
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <input
              type="password"
              placeholder="Nova password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <input
              type="password"
              placeholder="Confirmar password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "A guardar..." : "Guardar"}
          </button>
        </form>
        <div className="login-footer">
          <a href="/login">Voltar</a>
        </div>
      </div>
    </div>
  );
}
