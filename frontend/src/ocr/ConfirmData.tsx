import { useState } from "react";
import { apiFetch, readErrorMessage } from "../api/api";
import { useLocation, useNavigate } from "react-router-dom";
import type { ParsedCitizenCard } from "../types/domain";
import type { OcrConfirmResponse } from "../types/api";
import { useNotifications } from "../ui/notifications";
import "../styles/app.css";
import "../styles/forms.css";

export default function ConfirmData() {
  const location = useLocation();
  const navigate = useNavigate();

  const parsed = location.state?.parsed as ParsedCitizenCard | undefined;

  const [fullName, setFullName] = useState(parsed?.fullName || "");
  const [documentNumber, setDocumentNumber] = useState(
    parsed?.documentNumber || ""
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    parsed?.dateOfBirth || ""
  );
  const [nif, setNif] = useState(parsed?.nif || "");

  // 🔹 NOVOS CAMPOS
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast, showModal } = useNotifications();

  // Proteção contra acesso direto
  if (!parsed) {
    return (
      <div style={{ padding: 40 }}>
        <h2>⚠️ Dados OCR não encontrados</h2>
        <p>Por favor volta a submeter o documento.</p>
        <button onClick={() => navigate("/ocr")}>Voltar</button>
      </div>
    );
  }

  async function confirm() {
    setError(null);

    if (!fullName || !documentNumber) {
      setError("Nome e número de documento são obrigatórios");
      return;
    }

    const normalizedPhone = phone.replace(/\s+/g, "");
    const normalizedPostal = postalCode.trim();

    if (normalizedPhone && !/^\d{9}$/.test(normalizedPhone)) {
      setError("Telemóvel inválido (ex: 912345678)");
      return;
    }

    if (normalizedPostal && !/^\d{4}-\d{3}$/.test(normalizedPostal)) {
      setError("Código-Postal inválido (ex: 1234-567)");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/ocr/document/confirm", {
        method: "POST",
        body: JSON.stringify({
          // dados confirmados
          fullName,
          documentNumber,
          dateOfBirth,
          nif,

          // 🔹 novos dados manuais
          phone: normalizedPhone,
          address,
          postalCode: normalizedPostal,
          notes,

          // dados OCR de suporte
          parsed,
        }),
      });

      if (!res.ok) {
        const msg = await readErrorMessage(
          res,
          "Erro ao confirmar dados"
        );
        showModal("Erro", msg);
        return;
      }

      const data = (await res.json()) as OcrConfirmResponse;
      if ("message" in data) {
        showModal("Erro", data.message);
        return;
      }

      toast("Registo criado com sucesso");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
  <div className="card">
    <h1>Confirmar Dados</h1>

    <fieldset>
      <legend>Dados principais</legend>

      <label>Nome completo</label>
      <input value={fullName} onChange={e => setFullName(e.target.value)} />

      <label>Nº documento</label>
      <input value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} />

      <label>Data de nascimento</label>
      <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />

      <label>NIF</label>
      <input value={nif} onChange={e => setNif(e.target.value)} />
    </fieldset>

    <fieldset>
      <legend>Contactos e morada</legend>

      <label>Nº Telemóvel</label>
      <input placeholder="+351912345678" value={phone} onChange={e => setPhone(e.target.value)} />

      <label>Morada</label>
      <input value={address} onChange={e => setAddress(e.target.value)} />

      <label>Código-Postal</label>
      <input placeholder="1234-567" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
    </fieldset>

    <label>Observações</label>
    <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} />

    {error && <p className="error">{error}</p>}

    <br /><br />

    <button onClick={confirm} disabled={loading}>
      {loading ? "A confirmar..." : "Confirmar"}
    </button>
  </div>
</div>
  );
}
