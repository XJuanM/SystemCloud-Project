// src/components/Admin-Dashboard.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import logoProyect from "../img/PrimeLogo1.png";
import './admin-Dashboard.css';

export default function Sidebar() {
  // useLocation nos dice en qué ruta (URL) estamos actualmente
  const location = useLocation();

  // Función para determinar si el enlace está activo
  const isActive = (path) => {
    return location.pathname === path ? "admin-link active" : "admin-link";
  };

  return (
    <aside className="sc-sidebar">
      <div style={{ padding: "20px 25px", borderBottom: "1px solid rgba(0, 195, 255, 0.15)", marginBottom: "10px" }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#00c3ff" }}>
          <span className="text">PRIME</span>
        </h2>
      </div>

      <nav className="admin-actions">
        <Link to="/admin/usuarios" className={isActive("/admin/usuarios")}>
          <span className="icon">👥</span>
          <span className="text">Gestionar Usuarios</span>
        </Link>
        <Link to="/admin/membresias" className={isActive("/admin/membresias")}>
          <span className="icon">💎</span>
          <span className="text">Gestionar Membresias</span>
        </Link>
        <Link to="/admin/inventario" className={isActive("/admin/inventario")}>
          <span className="icon">📦</span>
          <span className="text">Gestionar Inventario</span>
        </Link>
        <Link to="/admin/clases" className={isActive("/admin/clases")}>
          <span className="icon">🗓️</span>
          <span className="text">Gestionar Clases</span>
        </Link>
        <Link to="/admin/planes" className={isActive("/admin/planes")}>
          <span className="icon">🥗</span>
          <span className="text">Gestionar Alimentos</span>
        </Link>
        <Link to="/admin/rutinas" className={isActive("/admin/rutinas")}>
          <span className="icon">🏋️‍♂️</span>
          <span className="text">Gestionar Ejercicios</span>
        </Link>
      </nav>
    </aside>
  );
}