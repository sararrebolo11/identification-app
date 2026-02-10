import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./SideBar";
import logo from "../src/images/logologin.png";
import "../src/styles/App.css";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchEndX.current = null;
  }

  function onTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd() {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const delta = touchEndX.current - touchStartX.current;
    const startedNearEdge = touchStartX.current < 30;

    if (!sidebarOpen && startedNearEdge && delta > 60) {
      setSidebarOpen(true);
      return;
    }

    if (sidebarOpen && delta < -60) {
      setSidebarOpen(false);
    }
  }

  return (
    <div
      className={`app-layout ${sidebarOpen ? "sidebar-open" : ""}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <header className="mobile-topbar">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          ☰
        </button>
        <div className="mobile-title">
          <img src={logo} alt="ID FSS" className="mobile-logo" />
          <span>ID FSS</span>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="sidebar-shell">
        <Sidebar />
      </div>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
