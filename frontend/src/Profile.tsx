import { useEffect, useState } from "react";
import { apiFetch, readErrorMessage } from "./api/api";
import { Eye, EyeOff } from "lucide-react";
import "../src/styles/profile.css";
import "../src/styles/App.css";
import type { UserProfileResponse } from "./types/api";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiFetch("/users/profile");

        if (!res.ok) {
          const msg = await readErrorMessage(
            res,
            "Erro ao carregar perfil"
          );
          throw new Error(msg);
        }

        const data = (await res.json()) as UserProfileResponse;
        setProfile(data);
      } catch {
        setMessage("Erro ao carregar o perfil");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage("As passwords não coincidem");
      return;
    }

    const res = await apiFetch("/users/me/password", {
      method: "PUT",
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (res.ok) {
      setMessage("Password alterada com sucesso ✅");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const msg = await readErrorMessage(
        res,
        "Erro ao alterar password"
      );
      setMessage(msg);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <h1>Perfil</h1>
          <div className="card">
            <div className="skeleton skeleton-line" style={{ width: "30%" }} />
            <div className="skeleton skeleton-input" />
          </div>
          <div className="card">
            <div className="skeleton skeleton-line" style={{ width: "45%" }} />
            <div className="skeleton skeleton-input" />
            <div className="skeleton skeleton-input" />
            <div className="skeleton skeleton-input" />
            <div className="form-actions">
              <div className="skeleton skeleton-button" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="page">
    <div className="container">
      <h1>Perfil</h1>

      {profile && (
        <div className="card">
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
        </div>
      )}

      <div className="card">
        <h2>Alterar password</h2>

        <form className="form" onSubmit={handleChangePassword}>
        <div className="form-group">
            <div className="input-with-toggle">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Password atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? "Esconder password" : "Mostrar password"}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="input-with-toggle">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Nova password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? "Esconder password" : "Mostrar password"}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="input-with-toggle">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmar nova password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Esconder password" : "Mostrar password"}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
        </div>

        <button className="btn-primary" type="submit">
            Alterar password
        </button>
        </form>
      </div>

      {message && <p className="feedback">{message}</p>}
    </div>
  </div>
);
}
