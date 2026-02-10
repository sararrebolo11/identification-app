import { useState } from "react";
import { apiFetch } from "../api/api";
import "../styles/App.css";
import "../styles/forms.css";
import type { Person } from "../types/domain";

export default function EditPerson({
  person,
  onCancel,
  onSaved,
}: {
  person: Person;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const initialCc =
    person.documents?.find(
      (doc) => doc.type === "CARTAO_CIDADAO"
    )?.documentNumber ?? "";

  const [fullName, setFullName] = useState(person.fullName ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(
    person.dateOfBirth?.slice(0, 10) ?? ""
  );
  const [cc, setCC] = useState(initialCc);
  const [nif, setNif] = useState(person.nif ?? "");
  const [phone, setPhone] = useState(person.phone ?? "");
  const [address, setAddress] = useState(person.address ?? "");
  const [postalCode, setPostalCode] = useState(person.postalCode ?? "");
  const [notes, setNotes] = useState(person.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("O nome é obrigatório");
      return;
    }

    setSaving(true);

    const res = await apiFetch(`/persons/${person.id}`, {
      method: "PUT",
      body: JSON.stringify({
        fullName,
        dateOfBirth: dateOfBirth || null,
        cc: cc || null,
        nif: nif || null,
        phone: phone || null,
        address: address || null,
        postalCode: postalCode || null,
        notes: notes || null,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      setError(err?.message || "Erro ao guardar alterações");
      return;
    }

    onSaved();
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Editar</h1>

        <form className="form" onSubmit={handleSave}>
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
              />
            </label>

            <label className="field">
              Nº CC
              <input
                type="text"
                value={cc}
                onChange={(e) => setCC(e.target.value)}
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

          {error && <p className="error">{error}</p>}

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "A guardar..." : "Guardar"}
            </button>

            <button type="button" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
