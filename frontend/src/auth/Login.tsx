import { useState } from "react";
import "../styles/login.css";
import logo from "../images/logologin.png";
import { apiFetch } from "../api/api";
import type { AuthLoginResponse } from "../types/api";
import { readErrorMessage } from "../api/api";
import {
  User,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = await readErrorMessage(
          res,
          "Email ou password inválidos"
        );
        setError(msg);
        return;
      }

      const data = (await res.json()) as AuthLoginResponse;
      console.log("LOGIN RESPONSE:", data);

      if (!data.token) {
        setError("Token não recebido do servidor");
        return;
      }

      // guardar token conforme lembrar-me
      if (rememberMe) {
        localStorage.setItem("token", data.token);
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("token", data.token);
        localStorage.removeItem("token");
      }

      // 🔥 SÓ DEPOIS dizer à app que estás logada
      onLogin();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-avatar">
          <img src={logo} alt="IDFSS Logo" />
        </div>

        <div className="login-field">
          <span className="icon"><User size={18} /></span>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="login-field">
          <span className="icon"><Lock size={18} /></span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle-visibility"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Esconder password" : "Mostrar password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* lembrar-me */}
        <div className="login-remember">
          <label className="remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Lembrar-me</span>
          </label>
        </div>

        {/* botão login */}
        <button
          className="login-button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "A entrar..." : "LOGIN"}
        </button>

        {/* links finais */}
        <div className="login-footer">
          <a href="/register">Criar conta</a>
          <a href="/forgot-password"><i>Esqueceu a password?</i></a>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}
