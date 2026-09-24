import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase.js";
import Sidebar from "../../components/Admin-Dashboard.jsx";
import bcrypt from "bcryptjs";
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import "./admin-Usuarios.css";

const ROLES = ["Administrador", "Entrenador", "Cliente"];
const POR_PAGINA = 10;
const FORM_VACIO = { nombre_apellido: "", correo: "", telefono: "", direccion: "", tipo_rol: "Cliente", password: "" };

/* ---------- Utilidades ---------- */
const iniciales = (nombre = "") =>
  nombre.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";

const estiloAvatar = (id) => {
  const hue = (Number(id) * 47) % 360;
  return { background: `hsl(${hue} 55% 32% / 0.45)`, color: `hsl(${hue} 90% 78%)` };
};

const paginasVisibles = (actual, total) => {
  const orden = [...new Set([1, total, actual - 1, actual, actual + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const res = [];
  orden.forEach((n, i) => {
    if (i && n - orden[i - 1] > 1) res.push(`gap-${n}`);
    res.push(n);
  });
  return res;
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [paginaActual, setPaginaActual] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const [usuarioEliminar, setUsuarioEliminar] = useState(null);
  const [toast, setToast] = useState(null);

  const mostrarToast = (texto, tipo = "ok") => {
    setToast({ texto, tipo });
    setTimeout(() => setToast(null), 3200);
  };

  /* ---------- Datos ---------- */
  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id_usuario, tipo_rol, nombre_apellido, correo, telefono, direccion")
        .order("id_usuario", { ascending: true });
      if (error) throw error;
      setUsuarios(data);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error.message);
      mostrarToast("No se pudieron cargar los usuarios.", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowModal(false);
        setUsuarioEliminar(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- Filtros y paginación ---------- */
  const conteo = useMemo(
    () => usuarios.reduce((acc, u) => ({ ...acc, [u.tipo_rol]: (acc[u.tipo_rol] || 0) + 1 }), {}),
    [usuarios]
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return usuarios.filter(
      (u) =>
        (filtroRol === "Todos" || u.tipo_rol === filtroRol) &&
        (!q || [u.nombre_apellido, u.correo, u.telefono, u.direccion].some((v) => 
          String(v || "").toLowerCase().includes(q) // <--- ESTA ES LA MAGIA
        ))
    );
  }, [usuarios, busqueda, filtroRol]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina = Math.min(paginaActual, totalPaginas);
  const inicio = (pagina - 1) * POR_PAGINA;
  const usuariosActuales = filtrados.slice(inicio, inicio + POR_PAGINA);

  const cambiarBusqueda = (v) => { setBusqueda(v); setPaginaActual(1); };
  const cambiarFiltro = (v) => { setFiltroRol(v); setPaginaActual(1); };

  /* ---------- Modal crear / editar ---------- */
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setUsuarioEditando(null);
    setFormData(FORM_VACIO);
    setShowModal(true);
  };

  const abrirModalEditar = (u) => {
    setModoEdicion(true);
    setUsuarioEditando(u.id_usuario);
    setFormData({
      nombre_apellido: u.nombre_apellido,
      correo: u.correo,
      telefono: u.telefono || "",
      direccion: u.direccion || "",
      tipo_rol: u.tipo_rol,
      password: "",
    });
    setShowModal(true);
  };

  const setCampo = (campo) => (e) => setFormData({ ...formData, [campo]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (modoEdicion) {
        const { password, ...perfil } = formData;
        const cambios = { ...perfil };
        if (password) cambios.password = await bcrypt.hash(password, 10); // solo si escribió una nueva
        const { error } = await supabase.from("usuarios").update(cambios).eq("id_usuario", usuarioEditando);
        if (error) throw error;
        mostrarToast("Usuario actualizado.");
      } else {
        // Solo guarda el perfil; el inicio de sesión requiere supabase.auth
        const { password, ...perfil } = formData;
        const hash = await bcrypt.hash(password, 10);
        const { error } = await supabase.from("usuarios").insert([{ ...perfil, password: hash }]);
        if (error) throw error;
        mostrarToast("Usuario creado.");
      }
      setShowModal(false);
      fetchUsuarios();
    } catch (error) {
      console.error("Error al guardar:", error.message);
      mostrarToast("No se pudo guardar. Revisa los datos e inténtalo de nuevo.", "error");
    } finally {
      setGuardando(false);
    }
  };

  /* ---------- Eliminar ---------- */
  const confirmarEliminar = async () => {
    try {
      const { error } = await supabase.from("usuarios").delete().eq("id_usuario", usuarioEliminar.id_usuario);
      if (error) throw error;
      mostrarToast("Usuario eliminado.");
      fetchUsuarios();
    } catch (error) {
      console.error("Error al eliminar:", error.message);
      mostrarToast("No se pudo eliminar el usuario.", "error");
    } finally {
      setUsuarioEliminar(null);
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <div className="usr-page">
          <header className="usr-header">
            <div>
              <h1>Gestión de usuarios</h1>
              <p>{usuarios.length} usuarios registrados en la plataforma</p>
            </div>
            <button className="usr-btn usr-btn-primary" onClick={abrirModalCrear}>
              <Plus size={16} /> Nuevo usuario
            </button>
          </header>

          <div className="usr-toolbar">
            <label className="usr-search">
              <Search size={16} />
              <input
                type="search"
                placeholder="Buscar por nombre, correo o teléfono"
                value={busqueda}
                onChange={(e) => cambiarBusqueda(e.target.value)}
              />
            </label>
            <div className="usr-chips" role="tablist" aria-label="Filtrar por rol">
              {["Todos", ...ROLES].map((rol) => (
                <button
                  key={rol}
                  role="tab"
                  aria-selected={filtroRol === rol}
                  className={`usr-chip ${filtroRol === rol ? "activo" : ""}`}
                  onClick={() => cambiarFiltro(rol)}
                >
                  {rol}
                  <span>{rol === "Todos" ? usuarios.length : conteo[rol] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          <section className="usr-card">
            <div className="usr-scroll">
              <table className="usr-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th className="oculta-sm">Teléfono</th>
                    <th className="oculta-md">Dirección</th>
                    <th className="col-acciones">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr><td colSpan="5" className="usr-vacio"><span className="usr-spinner" /> Cargando usuarios…</td></tr>
                  ) : usuariosActuales.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="usr-vacio">
                        {usuarios.length === 0
                          ? "Aún no hay usuarios. Crea el primero con «Nuevo usuario»."
                          : "Ningún usuario coincide con la búsqueda. Prueba con otro nombre o cambia el filtro."}
                      </td>
                    </tr>
                  ) : (
                    usuariosActuales.map((u) => (
                      <tr key={u.id_usuario}>
                        <td>
                          <div className="usr-persona">
                            <span className="usr-avatar" style={estiloAvatar(u.id_usuario)}>{iniciales(u.nombre_apellido)}</span>
                            <div>
                              <strong>{u.nombre_apellido}</strong>
                              <small>{u.correo}</small>
                            </div>
                          </div>
                        </td>
                        <td><span className={`usr-badge ${u.tipo_rol?.toLowerCase()}`}>{u.tipo_rol}</span></td>
                        <td className="oculta-sm">{u.telefono || <em className="usr-nd">Sin registrar</em>}</td>
                        <td className="oculta-md"><span className="usr-trunc">{u.direccion || <em className="usr-nd">Sin registrar</em>}</span></td>
                        <td className="col-acciones">
                          <button className="usr-icon-btn" title="Editar" aria-label={`Editar a ${u.nombre_apellido}`} onClick={() => abrirModalEditar(u)}>
                            <Pencil size={18} />
                          </button>
                          <button className="usr-icon-btn peligro" title="Eliminar" aria-label={`Eliminar a ${u.nombre_apellido}`} onClick={() => setUsuarioEliminar(u)}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!cargando && filtrados.length > 0 && (
              <footer className="usr-footer">
                <span>
                  Mostrando {inicio + 1}–{Math.min(inicio + POR_PAGINA, filtrados.length)} de {filtrados.length}
                </span>
                <nav className="usr-pag" aria-label="Paginación">
                  <button className="usr-page-btn" disabled={pagina === 1} onClick={() => setPaginaActual(pagina - 1)} aria-label="Página anterior">
                    <ChevronLeft size={16} />
                  </button>
                  {paginasVisibles(pagina, totalPaginas).map((n) =>
                    typeof n === "string" ? (
                      <span key={n} className="usr-gap">…</span>
                    ) : (
                      <button key={n} className={`usr-page-btn ${n === pagina ? "activo" : ""}`} onClick={() => setPaginaActual(n)} aria-current={n === pagina ? "page" : undefined}>
                        {n}
                      </button>
                    )
                  )}
                  <button className="usr-page-btn" disabled={pagina === totalPaginas} onClick={() => setPaginaActual(pagina + 1)} aria-label="Página siguiente">
                    <ChevronRight size={16} />
                  </button>
                </nav>
              </footer>
            )}
          </section>
        </div>
      </main>

      {/* ---------- Modal crear / editar ---------- */}
      {showModal && (
        <div className="usr-overlay" onClick={() => setShowModal(false)}>
          <div className="usr-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="usr-icon-btn usr-cerrar" onClick={() => setShowModal(false)} aria-label="Cerrar">
              <X size={18} />
            </button>
            <h2>{modoEdicion ? "Editar usuario" : "Nuevo usuario"}</h2>
            <p className="usr-modal-sub">
              {modoEdicion ? "Modifica los datos del perfil." : "Completa los datos del nuevo perfil."}
            </p>

            <form onSubmit={handleGuardar} className="usr-form">
              <label className="usr-campo completo">
                Nombre completo
                <input type="text" required autoFocus value={formData.nombre_apellido} onChange={setCampo("nombre_apellido")} />
              </label>
              <label className="usr-campo">
                Correo electrónico
                <input type="email" required value={formData.correo} onChange={setCampo("correo")} />
              </label>
              <label className="usr-campo">
                Teléfono
                <input type="text" value={formData.telefono} onChange={setCampo("telefono")} />
              </label>
              <label className="usr-campo completo">
                Dirección
                <input type="text" value={formData.direccion} onChange={setCampo("direccion")} />
              </label>
              <label className="usr-campo completo">
                Contraseña
                <input
                  type="password"
                  required={!modoEdicion}
                  minLength={6}
                  autoComplete="new-password"
                  placeholder={modoEdicion ? "Déjala en blanco para mantener la actual" : "Mínimo 6 caracteres"}
                  value={formData.password}
                  onChange={setCampo("password")}
                />
              </label>
              <label className="usr-campo completo">
                Rol
                <select value={formData.tipo_rol} onChange={setCampo("tipo_rol")}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>

              <div className="usr-modal-acciones completo">
                <button type="button" className="usr-btn usr-btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="usr-btn usr-btn-primary" disabled={guardando}>
                  {guardando ? "Guardando…" : modoEdicion ? "Guardar cambios" : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Confirmar eliminación ---------- */}
      {usuarioEliminar && (
        <div className="usr-overlay" onClick={() => setUsuarioEliminar(null)}>
          <div className="usr-modal usr-modal-sm" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Eliminar usuario</h2>
            <p className="usr-modal-sub">
              Vas a eliminar a <strong>{usuarioEliminar.nombre_apellido}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="usr-modal-acciones">
              <button className="usr-btn usr-btn-ghost" onClick={() => setUsuarioEliminar(null)}>Cancelar</button>
              <button className="usr-btn usr-btn-danger" onClick={confirmarEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Aviso ---------- */}
      {toast && <div className={`usr-toast ${toast.tipo}`} role="status">{toast.texto}</div>}
    </div>
  );
}