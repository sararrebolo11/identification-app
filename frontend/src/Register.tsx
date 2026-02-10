import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api/api";
import logo from "../src/images/logologin.png";
import {
  User,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import "../src/styles/login.css";
import type { AuthRegisterResponse } from "./types/api";
import { readErrorMessage } from "./api/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
        setError("As passwords não coincidem");
        return;
    }

    const res = await apiFetch("/users/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const msg = await readErrorMessage(res, "Erro ao criar conta");
        setError(msg);
        return;
    }

    const data = (await res.json()) as AuthRegisterResponse;

    // guardar token como no login
    localStorage.setItem("token", data.token);

    // ir diretamente para a app
    navigate("/");
    } return (
        <form onSubmit={handleRegister}>
          <div className="login-page">
            <div className="login-card">
              <div className="login-avatar">
                <img src={logo} alt="IDFSS Logo" />
              </div>

              {/* Email */}
              <div className="login-field">
                <span className="icon"><User size={18} /></span>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="login-field">
                <span className="icon"><Lock size={18} /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

              {/* Confirmar password */}
              <div className="login-field">
                <span className="icon"><Lock size={18} /></span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Esconder password" : "Mostrar password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {confirmPassword && !passwordsMatch && (
                  <p className="login-error">
                    As passwords não coincidem
                  </p>
                )}
              </div>

              {/* Botão */}
              <button
                className="login-button"
                type="submit"
                disabled={!passwordsMatch}
              >
                CRIAR CONTA
              </button>

              {/* Footer */}
              <div className="login-footer">
                <a href="/login">Já tens conta?</a>
              </div>

              {error && <p className="login-error">{error}</p>}
            </div>
          </div>
      </form>
);
}
