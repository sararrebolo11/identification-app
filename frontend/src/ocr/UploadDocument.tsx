import { useEffect, useState } from "react";
import { apiFetch, readErrorMessage } from "../api/api";
import { useNavigate } from "react-router-dom";
import type { DocumentType } from "../types/domain";
import type { OcrCreateResponse } from "../types/api";
import { useNotifications } from "../ui/notifications";
import "../styles/App.css";
import "../styles/forms.css";

export default function UploadDocument() {
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const MAX_MB = 20;
  const navigate = useNavigate();
  const requiresBack = (type: DocumentType | "") =>
  type === "CARTAO_CIDADAO" || type === "CARTA_CONDUCAO";
  const [mode, setMode] = useState<"MANUAL" | "DOCUMENT">("MANUAL");

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [cc, setCC] = useState("");
  const [nif, setNif] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast, showModal } = useNotifications();

  useEffect(() => {
    if (frontFile && frontFile.size > MAX_MB * 1024 * 1024) {
      setUploadError("A imagem da frente é demasiado grande (máx 20MB)");
      setFrontFile(null);
      return;
    }

    if (backFile && backFile.size > MAX_MB * 1024 * 1024) {
      setUploadError("A imagem do verso é demasiado grande (máx 20MB)");
      setBackFile(null);
    }
  }, [frontFile, backFile]);

  async function handleCreateManual(e: React.FormEvent) {
    e.preventDefault();
    setManualError(null);

    if (!fullName.trim()) {
      setManualError("O nome é obrigatório");
      return;
    }

    if (!dateOfBirth) {
      setManualError("A data de nascimento é obrigatória");
      return;
    }

    const normalizedCc = cc.replace(/\s+/g, "").toUpperCase();
    const normalizedNif = nif.replace(/\s+/g, "");
    const normalizedPostal = postalCode.trim();
    const normalizedPhone = phone.replace(/\s+/g, "");

    if (!normalizedCc) {
      setManualError("O nº CC é obrigatório");
      return;
    }

    if (!/^\d{8}$/.test(normalizedCc)) {
      setManualError("O nº CC deve ter 8 dígitos (ex: 12345678)");
      return;
    }

    if (!normalizedNif) {
      setManualError("O NIF é obrigatório");
      return;
    }

    if (!/^\d{9}$/.test(normalizedNif)) {
      setManualError("O NIF deve ter 9 dígitos");
      return;
    }

    if (normalizedPostal && !/^\d{4}-\d{3}$/.test(normalizedPostal)) {
      setManualError("Código-Postal inválido (ex: 1234-567)");
      return;
    }

    if (normalizedPhone && !/^\d{9}$/.test(normalizedPhone)) {
      setManualError("Telemóvel inválido (ex: 912345678)");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/persons", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          dateOfBirth: dateOfBirth || null,
          cc: normalizedCc || null,
          nif: normalizedNif || null,
          phone: normalizedPhone || null,
          address: address || null,
          postalCode: normalizedPostal || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const msg = await readErrorMessage(
          res,
          "Erro ao criar pessoa"
        );
        setManualError(msg);
        return;
      }

      toast("Pessoa criada com sucesso");
      navigate("/"); // volta à lista
    } catch (err) {
      console.error(err);
      showModal("Erro", "Erro inesperado ao criar pessoa.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
  setUploadError(null);

  if (!documentType) {
    setUploadError("Seleciona o tipo de documento");
    return;
  }

  if (!frontFile) {
    setUploadError("A frente do documento é obrigatória");
    return;
  }

  if (requiresBack(documentType) && !backFile) {
    setUploadError("Este tipo de documento exige frente e verso");
    return;
  }

  const formData = new FormData();
  formData.append("type", documentType);
  formData.append("front", frontFile);

  if (requiresBack(documentType) && backFile) {
    formData.append("back", backFile);
  }

  setLoading(true);

  try {
  const res = await apiFetch("/ocr/document/create", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const msg = await readErrorMessage(
      res,
      "Erro ao processar documento"
    );
    showModal("Erro", msg);
    return;
  }

  const data = (await res.json()) as OcrCreateResponse;

  console.log("RES STATUS:", res.status);
  console.log("RES DATA:", data);

  if (res.status === 409) {
    if ("message" in data) {
      showModal("Documento já registado", data.message);
    } else {
      showModal("Documento já registado", "Este documento já existe.");
    }
    return;
  }

  if ("status" in data && data.status === "NEEDS_CONFIRMATION") {
    navigate("/ocr/confirm", {
      state: { parsed: data.parsed },
    });
    return;
  }

  showModal("Erro", "Resposta inesperada do servidor.");
} catch (err) {
  console.error("Erro no upload:", err);
  showModal("Erro", "Erro inesperado no upload.");
} finally {
  setLoading(false);
}
}
  return (
    <div className="page">
      <div className="tabs">
        <button
          className={mode === "MANUAL" ? "active" : ""}
          onClick={() => setMode("MANUAL")}
        >
          Manual
        </button>

        <button
          className={mode === "DOCUMENT" ? "active" : ""}
          onClick={() => setMode("DOCUMENT")}
        >
          Com documento
        </button>
      </div>

      {mode === "MANUAL" && (
        <div className="card">
          <h1>Novo Registo</h1>

          <form className="form" onSubmit={handleCreateManual}>
            <fieldset>
              <legend>Dados principais</legend>

              <label className="field">
                Nome completo
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </label>

              <label className="field">
                Data de nascimento
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </label>

              <label className="field">
                Nº CC
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCC(e.target.value)}
                  required
                />
              </label>

              <label className="field">
                NIF
                <input
                  type="text"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  required
                />
              </label>
            </fieldset>

            <fieldset>
              <legend>Contactos e morada</legend>

              <label className="field">
                Nº Telemóvel
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <label className="field">
                Morada
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </label>

              <label className="field">
                Código Postal
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </label>
            </fieldset>

            <label className="field">
              Notas
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            {manualError && <p className="error">{manualError}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "A criar..." : "Adicionar"}
            </button>
          </form>
        </div>
      )}

      {mode === "DOCUMENT" && (
        <div className="card">
          <h1>Novo Registo</h1>

          {/* ===== FORMULÁRIO DOCUMENTO (igual ao teu) ===== */}
          <label className="field">
            Tipo de documento
            <select
              className="select"
              value={documentType}
              onChange={(e) => {
                setDocumentType(e.target.value as DocumentType | "");
                setFrontFile(null);
                setBackFile(null);
                setUploadError(null);
              }}
            >
              <option value="" disabled hidden>
                Seleciona o tipo
              </option>
              <option value="CARTAO_CIDADAO">Cartão de Cidadão</option>
              <option value="CARTA_CONDUCAO">Carta de Condução</option>
              <option value="PASSAPORTE">Passaporte</option>
              <option value="TITULO_RESIDENCIA">Título de Residência</option>
            </select>
          </label>

          <br /><br />

          <label>
            Frente:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setFrontFile(e.target.files?.[0] ?? null);
                setUploadError(null);
              }}
            />
          </label>

          <br /><br />

          {requiresBack(documentType) && (
            <label>
              Verso:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setBackFile(e.target.files?.[0] ?? null);
                  setUploadError(null);
                }}
              />
            </label>
          )}

          {uploadError && <p className="error">{uploadError}</p>}

          <br /><br />

          <button onClick={handleUpload} disabled={loading}>
            {loading ? "A processar..." : "Adicionar"}
          </button>
        </div>
      )}

    </div>
  );
}
