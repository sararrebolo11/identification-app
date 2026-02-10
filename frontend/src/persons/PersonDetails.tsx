import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import type { PersonResponse } from "../types/api";

export default function PersonDetails({
  personId,
  onBack,
}: {
  personId: string;
  onBack: () => void;
}) {
  const [person, setPerson] = useState<PersonResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPerson() {
      const res = await apiFetch(`/persons/${personId}`);
      const data = (await res.json()) as PersonResponse;
      setPerson(data);
      setLoading(false);
    }

    loadPerson();
  }, [personId]);

  if (loading) {
    return (
      <div>
        <div className="skeleton skeleton-line" style={{ width: 100 }} />
        <div className="skeleton skeleton-line" style={{ width: 260 }} />
        <div className="skeleton skeleton-line" style={{ width: 180 }} />
        <div className="skeleton skeleton-line" style={{ width: 220 }} />
      </div>
    );
  }
  if (!person) return <p>Pessoa não encontrada</p>;

  return (
    <div>
      <button onClick={onBack}>⬅️ Voltar</button>

      <h2>👤 {person.fullName}</h2>

      {person.dateOfBirth && (
        <p>🎂 Data nascimento: {person.dateOfBirth}</p>
      )}
      {person.phone && <p>📞 Telefone: {person.phone}</p>}
      {person.address && <p>🏠 Morada: {person.address}</p>}

      <h3>📄 Documentos</h3>

      {person.documents.length === 0 && <p>Sem documentos</p>}

      <ul>
        {person.documents.map((doc) => (
          <li key={doc.id}>
            <strong>{doc.type}</strong> — {doc.documentNumber}
            {doc.placeOfBirth && <> (nascimento: {doc.placeOfBirth})</>}
          </li>
        ))}
      </ul>
    </div>
  );
}
