import { useState } from "react";
import { apiFetch, readErrorMessage } from "../api/api";
import { useNotifications } from "../ui/notifications";
import "../styles/login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast, showModal } = useNotifications();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const msg = await readErrorMessage(
          res,
          "Erro ao enviar email"
        );
        showModal("Erro", msg);
        return;
      }

      toast("Se o email existir, será enviado um link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Recuperar password</h2>
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "A enviar..." : "Enviar"}
          </button>
        </form>
        <div className="login-footer">
          <a href="/login">Voltar</a>
        </div>
      </div>
    </div>
  );
}
