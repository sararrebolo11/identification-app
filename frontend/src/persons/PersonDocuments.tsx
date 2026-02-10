import { useEffect, useState } from "react";
import { apiFetch, readErrorMessage } from "../api/api";
import { renderDocumentDetails } from "./PersonsList";
import { ArrowLeftToLine, IdCard, Car, IdCardLanyard } from "lucide-react";
import type { DocumentType } from "../types/domain";
import type { PersonResponse } from "../types/api";
import { useNotifications } from "../ui/notifications";

/* =======================
   TIPOS (alinhados backend)
   ======================= */

function getDocumentIcon(type: DocumentType) {
  switch (type) {
    case "CARTAO_CIDADAO":
      return <IdCard size={18} />;
    case "CARTA_CONDUCAO":
      return <Car size={18} />;
    case "PASSAPORTE":
      return <IdCardLanyard size={18} />;
    case "TITULO_RESIDENCIA":
      return <IdCard size={18} />
    default:
      return null;
  }
}

function formatDocumentType(type: DocumentType) {
  switch (type) {
    case "CARTAO_CIDADAO":
      return "Cartão de Cidadão";
    case "CARTA_CONDUCAO":
      return "Carta de Condução";
    case "PASSAPORTE":
      return "Passaporte";
    case "TITULO_RESIDENCIA":
      return "Título de Residência";
    default:
      return type;
  }
}

/* =======================
   COMPONENTE
   ======================= */

export default function PersonDocuments({
  personId,
  onBack,
}: {
  personId: string;
  onBack: () => void;
}) {
  const [person, setPerson] = useState<PersonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [docType, setDocType] = useState<DocumentType | "">("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [nif, setNif] = useState("");
  const [drivingCategories, setDrivingCategories] = useState("");
  const [residenceType, setResidenceType] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");

  const { toast, showModal } = useNotifications();

  useEffect(() => {
    async function loadPerson() {
      try {
        const res = await apiFetch(`/persons/${personId}`);

        if (!res.ok) {
          const msg = await readErrorMessage(
            res,
            "Erro ao carregar pessoa"
          );
          console.error("Erro ao carregar pessoa:", msg);
          setPerson(null);
          return;
        }

        const data = (await res.json()) as PersonResponse;

        if (!data || !Array.isArray(data.documents)) {
          console.error("Resposta inválida:", data);
          setPerson(null);
          return;
        }

        setPerson(data);
      } catch (err) {
        console.error("Erro de rede:", err);
        setPerson(null);
      } finally {
        setLoading(false);
      }
    }

    loadPerson();
  }, [personId]);

  async function handleAddDocument() {
    if (!docType || !documentNumber.trim()) {
      setFormError("Tipo e número de documento são obrigatórios.");
      return;
    }

    setFormError(null);
    setSaving(true);

    const payload: Record<string, unknown> = {
      personId,
      type: docType,
      documentNumber: documentNumber.trim(),
    };

    if (docType === "CARTAO_CIDADAO") {
      if (nationality.trim()) payload.nationality = nationality.trim();
      if (nif.trim()) payload.nif = nif.trim();
    }

    if (docType === "CARTA_CONDUCAO" && drivingCategories.trim()) {
      payload.drivingCategories = drivingCategories.trim();
    }

    if (docType === "TITULO_RESIDENCIA" && residenceType.trim()) {
      payload.residenceType = residenceType.trim();
    }

    if (docType === "PASSAPORTE" && placeOfBirth.trim()) {
      payload.placeOfBirth = placeOfBirth.trim();
    }

    try {
      const res = await apiFetch("/documents", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await readErrorMessage(
          res,
          "Erro ao adicionar documento"
        );
        showModal("Erro", msg);
        return;
      }

      toast("Documento adicionado");
      setDocumentNumber("");
      setNationality("");
      setNif("");
      setDrivingCategories("");
      setResidenceType("");
      setPlaceOfBirth("");
      setDocType("");

      const refreshed = await apiFetch(`/persons/${personId}`);
      if (refreshed.ok) {
        const data = (await refreshed.json()) as PersonResponse;
        setPerson(data);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="documents-page">
        <div className="page-header">
          <div className="skeleton skeleton-line" style={{ width: 120 }} />
          <div className="skeleton skeleton-line" style={{ width: 240 }} />
          <div className="document-card">
            <div className="skeleton skeleton-line" style={{ width: "60%" }} />
            <div className="skeleton skeleton-line" style={{ width: "80%" }} />
            <div className="skeleton skeleton-line" style={{ width: "50%" }} />
          </div>
        </div>
      </div>
    );
  }
  if (!person) return <p>Pessoa não encontrada.</p>;

  return (
    <div className="documents-page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeftToLine size={18} />
          Voltar
        </button>

        <h2>Documentos de {person.fullName}</h2>

        <div className="document-form">
          <h3>Adicionar documento</h3>

          <div className="form-group">
            <label className="field">
              Tipo de documento
              <select
                className="select"
                value={docType}
                onChange={(e) =>
                  setDocType(e.target.value as DocumentType | "")
                }
              >
                <option value="" disabled>
                  Seleciona o tipo
                </option>
                <option value="CARTAO_CIDADAO">Cartão de Cidadão</option>
                <option value="CARTA_CONDUCAO">Carta de Condução</option>
                <option value="PASSAPORTE">Passaporte</option>
                <option value="TITULO_RESIDENCIA">Título de Residência</option>
              </select>
            </label>

            <label className="field">
              Nº do documento
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </label>

            {docType === "CARTAO_CIDADAO" && (
              <>
                <label className="field">
                  Nacionalidade
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                  />
                </label>

                <label className="field">
                  NIF
                  <input
                    type="text"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                  />
                </label>
              </>
            )}

            {docType === "CARTA_CONDUCAO" && (
              <label className="field">
                Categorias
                <input
                  type="text"
                  value={drivingCategories}
                  onChange={(e) => setDrivingCategories(e.target.value)}
                />
              </label>
            )}

            {docType === "TITULO_RESIDENCIA" && (
              <label className="field">
                Tipo de residência
                <input
                  type="text"
                  value={residenceType}
                  onChange={(e) => setResidenceType(e.target.value)}
                />
              </label>
            )}

            {docType === "PASSAPORTE" && (
              <label className="field">
                Local de nascimento
                <input
                  type="text"
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                />
              </label>
            )}
          </div>

          {formError && <p className="error">{formError}</p>}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleAddDocument}
              disabled={saving}
            >
              {saving ? "A adicionar..." : "Adicionar documento"}
            </button>
          </div>
        </div>

        {person.documents.length === 0 ? (
          <p className="muted">Esta pessoa não tem documentos registados.</p>
        ) : (
          <div className="documents-grid">
            {person.documents.map((doc) => (
              <div key={doc.id} className="document-card">
                <div className="document-header">
                  {getDocumentIcon(doc.type)}
                  <strong>{formatDocumentType(doc.type)}</strong>
                </div>

                <div className="document-body">
                  {renderDocumentDetails(doc, person)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
