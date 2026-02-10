import { NavLink, useNavigate } from "react-router-dom";
import {
  Users,
  Camera,
  User,
  LogOut
} from "lucide-react";
import "../src/styles/sideBar.css";
import logo from "../src/images/logologin.png";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar-logo" onClick={() => navigate("/")}>
        <img src={logo} alt="ID FSS" />

        <div className="sidebar-logo-text">
            <strong>ID FSS</strong>
            <span>Sistema de Identificação</span>
        </div>
    </div>

      {/* MENU */}
      <nav className="sidebar-nav">
        <NavLink to="/" end>
          <Users size={18} />
          <span>Registos</span>
        </NavLink>

        <NavLink to="/ocr">
          <Camera size={18} />
          <span>Novo Registo</span>
        </NavLink>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-bottom">
        <NavLink to="/profile">
          <User size={18} />
          <span>Perfil</span>
        </NavLink>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            navigate("/login");
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
