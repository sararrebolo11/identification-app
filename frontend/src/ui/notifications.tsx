import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ModalState = {
  title: string;
  message: string;
};

type NotificationsContextValue = {
  toast: (message: string, type?: ToastType) => void;
  showModal: (title: string, message: string) => void;
  hideModal: () => void;
};

const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const showModal = useCallback((title: string, message: string) => {
    setModal({ title, message });
  }, []);

  const hideModal = useCallback(() => {
    setModal(null);
  }, []);

  const value = useMemo(
    () => ({ toast, showModal, hideModal }),
    [toast, showModal, hideModal]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}

      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>{modal.title}</h3>
            <p>{modal.message}</p>
            <button className="modal-button" onClick={hideModal}>
              Ok
            </button>
          </div>
        </div>
      )}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider"
    );
  }
  return ctx;
}
