import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import UploadDocument from "./ocr/UploadDocument";
import ConfirmData from "./ocr/ConfirmData";
import PersonsList from "./persons/PersonsList";
import PersonDocuments from "./persons/PersonDocuments";
import EditPerson from "./persons/EditPerson";
import { apiFetch } from "./api/api";
import { useEffect, useState } from "react";
import React from "react";
import AppLayout from "./AppLayout";
import Profile from "./Profile";
import Register from "./Register";
import "../src/styles/App.css";
import type { Person } from "./types/domain";
import { useNotifications } from "./ui/notifications";

/* =======================
   AUTH GUARD
   ======================= */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

/* =======================
   LOGIN PAGE
   ======================= */
function LoginPage() {
  const navigate = useNavigate();

  return (
    <Login
      onLogin={() => {
        navigate("/");
      }}
    />
  );
}

/* =======================
   PERSON DOCUMENTS PAGE
   ======================= */
function PersonDocumentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) return null;

  return (
    <PersonDocuments
      personId={id}
      onBack={() => navigate("/")}
    />
  );
}

function EditPersonPage({
  onSaved,
  onCancel,
}: {
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPerson() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiFetch(`/persons/${id}`);
        if (!res.ok) {
          setPerson(null);
          return;
        }

        const data = (await res.json()) as Person;
        setPerson(data);
      } catch {
        setPerson(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPerson();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div className="card form-card">
          <h1>Editar</h1>
          <div className="form">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-input" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-input" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-input" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-input" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-input" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-input" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-input" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-input" />
            <div className="form-actions">
              <div className="skeleton skeleton-button" />
              <div className="skeleton skeleton-button" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!person) return <p>Pessoa não encontrada.</p>;

  return (
    <EditPerson
      person={person}
      onCancel={() => {
        onCancel();
        navigate("/");
      }}
      onSaved={() => {
        onSaved();
        navigate("/");
      }}
    />
  );
}
/* =======================
   MAIN APP
   ======================= */

function MainHome({
  refreshKey,
  onEdit,
  onDelete,
}: {
  refreshKey: number;
  onEdit: (p: Person) => void;
  onDelete: (p: Person) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="card">

        <div className="section">
          <PersonsList
            refreshKey={refreshKey}
            onSelect={(id) => navigate(`/persons/${id}`)}
            onEdit={(person) => {
              onEdit(person);
              navigate(`/persons/${person.id}/edit`);
            }}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast, showModal } = useNotifications();

  async function handleDeletePerson(person: Person) {
    const confirmed = window.confirm(
      `Tens a certeza que queres apagar ${person.fullName}?\nTodos os documentos serão removidos.`
    );

    if (!confirmed) return;

    const res = await apiFetch(`/persons/${person.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      showModal("Erro", "Não foi possível apagar a pessoa.");
      return;
    }

    toast("Pessoa apagada com sucesso");
    setRefreshKey((k) => k + 1);
  }

  /* =======================
     EDIT PERSON FLOW
     ======================= */
  /* =======================
     ROUTES
     ======================= */
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route
          path="/"
          element={
            <MainHome
              refreshKey={refreshKey}
            onEdit={() => {}}
              onDelete={handleDeletePerson}
            />
          }
        />

        <Route path="/ocr" element={<UploadDocument />} />
        <Route path="/ocr/confirm" element={<ConfirmData />} />
        <Route path="/persons/:id" element={<PersonDocumentsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/persons/:id/edit"
          element={
          <EditPersonPage
            onCancel={() => {}}
            onSaved={() => {
              setRefreshKey((k) => k + 1);
            }}
          />
        }
      />
      </Route>

      <Route path="/register" element={<Register />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
