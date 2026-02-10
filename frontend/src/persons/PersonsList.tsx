import { Fragment, useEffect, useState } from "react";
import { apiFetch, readErrorMessage } from "../api/api";
import {
  FileText,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import "../styles/App.css";
import type { Document, Person } from "../types/domain";
import type { PersonsListResponse } from "../types/api";
import { useNotifications } from "../ui/notifications";

/* =======================
   TIPOS (alinhados backend)
   ======================= */

/* =======================
   COMPONENTE
   ======================= */

export default function PersonsList({
  refreshKey,
  onSelect,
  onEdit,
  onDelete
}: {
  refreshKey: number;
  onSelect: (id: string) => void;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
}) {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<"name" | "dob">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [exporting, setExporting] = useState(false);
  const { toast } = useNotifications();

  function normalize(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  const filteredPersons = persons.filter((person) => {
    const term = normalize(search);

    const nameMatch = normalize(person.fullName).includes(term);

    const ccMatch = normalize(getCitizenCardNumber(person)).includes(term);

    const nifMatch = person.nif
      ? normalize(person.nif).includes(term)
      : false;

    return nameMatch || ccMatch || nifMatch;
  });

  useEffect(() => {
    setLoading(true);
    async function loadPersons() {
      try {
        console.log("TOKEN:", localStorage.getItem("token"));
        const res = await apiFetch("/persons");

        if (!res.ok) {
          const msg = await readErrorMessage(
            res,
            "Erro ao carregar pessoas"
          );
          console.error("Erro ao carregar pessoas:", msg);
          setPersons([]);
          return;
        }

        const data = (await res.json()) as PersonsListResponse;

        if (!Array.isArray(data)) {
          console.error("Resposta inesperada:", data);
          setPersons([]);
          return;
        }

        setPersons(data);
      } catch (err) {
        console.error("Erro de rede:", err);
        setPersons([]);
      } finally {
        setLoading(false);
      }
    }

    loadPersons();
  }, [refreshKey]);

  const sortedPersons = [...filteredPersons].sort((a, b) => {
    if (sortKey === "name") {
      const aName = a.fullName.trim().toUpperCase();
      const bName = b.fullName.trim().toUpperCase();
      const cmp = aName.localeCompare(bName, "pt");
      return sortDir === "asc" ? cmp : -cmp;
    }

    const aTime = a.dateOfBirth ? new Date(a.dateOfBirth).getTime() : null;
    const bTime = b.dateOfBirth ? new Date(b.dateOfBirth).getTime() : null;

    if (aTime === null && bTime === null) return 0;
    if (aTime === null) return 1;
    if (bTime === null) return -1;

    const cmp = aTime - bTime;
    return sortDir === "asc" ? cmp : -cmp;
  });

  useEffect(() => {
    const total = Math.max(1, Math.ceil(sortedPersons.length / pageSize));
    if (page > total) setPage(total);
    if (page < 1) setPage(1);
  }, [pageSize, search, persons, sortedPersons.length, sortKey, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);

    try {
      const res = await apiFetch("/export/persons/excel");

      if (!res.ok) {
        const msg = await readErrorMessage(
          res,
          "Erro ao exportar Excel"
        );
        toast(msg, "error");
        return;
      }

      const blob = await res.blob();
      const disposition =
        res.headers.get("content-disposition") ??
        res.headers.get("Content-Disposition");

      const match = disposition?.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1]?.trim() || "pessoas.xlsx";

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast("Exportação concluída");
    } catch (err) {
      console.error("Erro ao exportar Excel:", err);
      toast("Erro ao exportar Excel", "error");
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h1>Pessoas Registadas</h1>
        <div className="form">
          <div className="skeleton skeleton-line" style={{ width: "40%" }} />
          <div className="skeleton skeleton-input" />
          <div className="skeleton skeleton-line" style={{ width: "55%" }} />
          <div className="skeleton skeleton-input" />
          <div className="skeleton skeleton-line" style={{ width: "35%" }} />
          <div className="skeleton skeleton-input" />
          <div className="skeleton skeleton-line" style={{ width: "60%" }} />
          <div className="skeleton skeleton-input" />
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(sortedPersons.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visiblePersons = sortedPersons.slice(start, start + pageSize);

  function toggleSort(key: "name" | "dob") {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div>
      {/* HEADER */}
      <div className="table-header">
        <h1>Pessoas Registadas</h1>
      </div>

      {/* CONTROLOS */}
      <div className="table-controls">
        <div className="page-size">
          <span>Mostrar</span>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>resultados</span>
        </div>

        <div className="controls-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Pesquisar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch("")}
              ><X size={18} /></button>
            )}
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="table-scroll">
        <table
          border={1}
          cellPadding={8}
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th className="col-expand"></th>
              <th className="col-name">
                <button
                  type="button"
                  className="sort-btn"
                  onClick={() => toggleSort("name")}
                >
                  Nome
                  {sortKey === "name" && (
                    <span className="sort-indicator">
                      {sortDir === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </span>
                  )}
                </button>
              </th>
              <th className="col-dob">
                <button
                  type="button"
                  className="sort-btn"
                  onClick={() => toggleSort("dob")}
                >
                  Data Nascimento
                  {sortKey === "dob" && (
                    <span className="sort-indicator">
                      {sortDir === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </span>
                  )}
                </button>
              </th>
              <th className="col-cc">Nº CC</th>
              <th className="col-nif">NIF</th>
              <th className="col-phone">Nº Telemóvel</th>
              <th className="col-address">Morada</th>
              <th className="col-notes">Observações</th>
              <th className="col-actions">Ações</th>
            </tr>
          </thead>

        <tbody>
          {filteredPersons.length === 0 && (
            <tr>
              <td colSpan={8} className="muted">
                Nenhuma pessoa encontrada
              </td>
            </tr>
          )}

          {visiblePersons.map((person) => (
            <Fragment key={person.id}>
              <tr
                key={person.id}
                className="row-clickable"
                onClick={() => {
                  if (window.innerWidth > 600) return;
                  setExpandedId((prev) =>
                    prev === person.id ? null : person.id
                  );
                }}
              >
                <td className="col-expand">
                  <span className="row-expand-icon">
                    {expandedId === person.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </span>
                </td>
                <td className="col-name">{person.fullName}</td>
                <td className="col-dob">
                  {person.dateOfBirth
                    ? new Date(person.dateOfBirth).toLocaleDateString()
                    : "—"}
                </td>
                <td className="col-cc">{getCitizenCardNumber(person)}</td>
                <td className="col-nif">{person.nif ?? "—"}</td>
                <td className="col-phone">{person.phone ?? "—"}</td>
                <td className="col-address">{person.address ?? "—"}</td>
                <td className="col-notes">{person.notes ?? "—"}</td>
                <td className="actions col-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(person.id);
                    }}
                  >
                    <FileText size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(person);
                    }}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(person);
                    }}
                    className="danger"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
              {expandedId === person.id && (
                <tr className="row-details">
                  <td colSpan={10}>
                    <div><strong>Telefone:</strong> {person.phone ?? "—"}</div>
                    <div><strong>Morada:</strong> {person.address ?? "—"}</div>
                    <div><strong>Código Postal:</strong> {person.postalCode ?? "—"}</div>
                    <div><strong>Observações:</strong> {person.notes ?? "—"}</div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
        </table>
      </div>

      <div className="table-pagination">
        <button
          type="button"
          className="primary export-btn"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? "A exportar..." : "Exportar Excel"}
        </button>

        <div className="pagination-controls">
          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            Anterior
          </button>
          <span className="page-info">
            Página {safePage} de {totalPages}
          </span>
          <button
            className="page-btn"
            onClick={() =>
              setPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={safePage === totalPages}
          >
            Seguinte
          </button>
        </div>
      </div>
    </div>
  );
}

/* =======================
   FUNÇÕES AUXILIARES
   ======================= */

function getCitizenCardNumber(person: Person): string {
  if (!person.documents || person.documents.length === 0) {
    return "—";
  }

  const cc = person.documents.find(
    (doc) => doc.type === "CARTAO_CIDADAO"
  );

  return cc?.documentNumber ?? "—";
}

/* =======================
   RENDER DOCUMENTOS
   ======================= */

export function renderDocumentDetails(doc: Document, person: Person) {
  switch (doc.type) {
    case "CARTAO_CIDADAO":
      return (
        <>
          <p><strong>Nome:</strong> {person.fullName}</p>
          <p><strong>Nº CC:</strong> {doc.documentNumber}</p>
          <p><strong>NIF:</strong> {person.nif}</p>
        </>
      );

    case "CARTA_CONDUCAO":
      return (
        <>
          <p><strong>Nº Carta:</strong> {doc.documentNumber}</p>
          <p>
            <strong>Categorias:</strong>{" "}
            {doc.drivingCategories ?? "—"}
          </p>
        </>
      );

    case "TITULO_RESIDENCIA":
      return (
        <>
          <p><strong>Nº Título:</strong> {doc.documentNumber}</p>
          <p><strong>Tipo de residência:</strong> {doc.residenceType}</p>
        </>
      );

    case "PASSAPORTE":
      return (
        <>
          <p><strong>Nº Passaporte:</strong> {doc.documentNumber}</p>
          <p><strong>Local nascimento:</strong> {doc.placeOfBirth}</p>
        </>
      );

    default:
      return <p>Tipo de documento desconhecido.</p>;
  }
}
