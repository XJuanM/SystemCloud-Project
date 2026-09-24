import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase.js";
import Sidebar from "../../components/Admin-Dashboard.jsx";
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import "./admin-Usuarios.css"; // estilos compartidos con la vista de usuarios
import "./admin-Membresias.css"; // extras propios de membresías

/* ---------- Configuración (ajusta a tu negocio) ---------- */
const ESTADOS = ["Activa", "Inactiva", "Vencida"];
const POR_PAGINA = 10;
const UNIDAD = { singular: "mes", plural: "meses" }; // unidad de la columna "duracion"
const MONEDA = { locale: "es-CO", currency: "COP" };
const FORM_VACIO = { id_usuario: "", nombre_plan: "", duracion: "", precio: "", estado: "Activa", beneficios: "" };

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

const formatoPrecio = (n) =>
  new Intl.NumberFormat(MONEDA.locale, {
    style: "currency",
    currency: MONEDA.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

const textoDuracion = (n) => `${n} ${Number(n) === 1 ? UNIDAD.singular : UNIDAD.plural}`;

const claseEstado = (estado = "") => {
  const e = estado.toLowerCase();
  if (e.startsWith("activ")) return "activa";
  if (e.startsWith("venc") || e.startsWith("expir")) return "vencida";
  return "inactiva";
};

export default function Membresias() {
  const [membresias, setMembresias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [paginaActual, setPaginaActual] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [codEditando, setCodEditando] = useState(null);
  const [formData, setFormData] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const [membresiaEliminar, setMembresiaEliminar] = useState(null);
  const [toast, setToast] = useState(null);

  const mostrarToast = (texto, tipo = "ok") => {
    setToast({ texto, tipo });
    setTimeout(() => setToast(null), 3200);
  };

  /* ---------- Datos ---------- */
  const fetchDatos = async () => {
    try {
      const [resM, resU] = await Promise.all([
        supabase
          .from("membresias")
          .select("cod_membresia, id_usuario, nombre_plan, duracion, precio, estado, beneficios")
          .order("cod_membresia", { ascending: true }),
        supabase
          .from("usuarios")
          .select("id_usuario, nombre_apellido, correo")
          .order("nombre_apellido", { ascending: true }),
      ]);
      if (resM.error) throw resM.error;
      if (resU.error) throw resU.error;
      setMembresias(resM.data);
      setUsuarios(resU.data);
    } catch (error) {
      console.error("Error obteniendo datos:", error.message);
      mostrarToast("No se pudieron cargar las membresías.", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowModal(false);
        setMembresiaEliminar(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const mapaUsuarios = useMemo(
    () => Object.fromEntries(usuarios.map((u) => [u.id_usuario, u])),
    [usuarios]
  );

  /* ---------- Filtros y paginación ---------- */
  const conteo = useMemo(
    () => membresias.reduce((acc, m) => ({ ...acc, [m.estado]: (acc[m.estado] || 0) + 1 }), {}),
    [membresias]
  );
  const activas = useMemo(
    () => membresias.filter((m) => claseEstado(m.estado) === "activa").length,
    [membresias]
  );

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return membresias.filter((m) => {
      if (filtroEstado !== "Todos" && m.estado !== filtroEstado) return false;
      if (!q) return true;
      const titular = mapaUsuarios[m.id_usuario];
      return [m.nombre_plan, m.estado, m.beneficios, titular?.nombre_apellido, titular?.correo].some((v) =>
        v?.toLowerCase().includes(q)
      );
    });
  }, [membresias, busqueda, filtroEstado, mapaUsuarios]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const pagina = Math.min(paginaActual, totalPaginas);
  const inicio = (pagina - 1) * POR_PAGINA;
  const filasActuales = filtradas.slice(inicio, inicio + POR_PAGINA);

  const cambiarBusqueda = (v) => { setBusqueda(v); setPaginaActual(1); };
  const cambiarFiltro = (v) => { setFiltroEstado(v); setPaginaActual(1); };

  /* ---------- Modal crear / editar ---------- */
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setCodEditando(null);
    setFormData(FORM_VACIO);
    setShowModal(true);
  };

  const abrirModalEditar = (m) => {
    setModoEdicion(true);
    setCodEditando(m.cod_membresia);
    setFormData({
      id_usuario: String(m.id_usuario ?? ""),
      nombre_plan: m.nombre_plan || "",
      duracion: String(m.duracion ?? ""),
      precio: String(m.precio ?? ""),
      estado: m.estado || ESTADOS[0],
      beneficios: m.beneficios || "",
    });
    setShowModal(true);
  };

  const setCampo = (campo) => (e) => setFormData({ ...formData, [campo]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const payload = {
      id_usuario: Number(formData.id_usuario),
      nombre_plan: formData.nombre_plan.trim(),
      duracion: parseInt(formData.duracion, 10),
      precio: Number(formData.precio),
      estado: formData.estado,
      beneficios: formData.beneficios.trim(),
    };
    try {
      if (modoEdicion) {
        const { error } = await supabase.from("membresias").update(payload).eq("cod_membresia", codEditando);
        if (error) throw error;
        mostrarToast("Membresía actualizada.");
      } else {
        const { error } = await supabase.from("membresias").insert([payload]);
        if (error) throw error;
        mostrarToast("Membresía creada.");
      }
      setShowModal(false);
      fetchDatos();
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
      const { error } = await supabase
        .from("membresias")
        .delete()
        .eq("cod_membresia", membresiaEliminar.cod_membresia);
      if (error) throw error;
      mostrarToast("Membresía eliminada.");
      fetchDatos();
    } catch (error) {
      console.error("Error al eliminar:", error.message);
      mostrarToast("No se pudo eliminar la membresía.", "error");
    } finally {
      setMembresiaEliminar(null);
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
              <h1>Gestión de membresías</h1>
              <p>{membresias.length} membresías registradas, {activas} activas</p>
            </div>
            <button className="usr-btn usr-btn-primary" onClick={abrirModalCrear}>
              <Plus size={16} /> Nueva membresía
            </button>
          </header>

          <div className="usr-toolbar">
            <label className="usr-search">
              <Search size={16} />
              <input
                type="search"
                placeholder="Buscar por plan, titular o beneficios"
                value={busqueda}
                onChange={(e) => cambiarBusqueda(e.target.value)}
              />
            </label>
            <div className="usr-chips" role="tablist" aria-label="Filtrar por estado">
              {["Todos", ...ESTADOS].map((estado) => (
                <button
                  key={estado}
                  role="tab"
                  aria-selected={filtroEstado === estado}
                  className={`usr-chip ${filtroEstado === estado ? "activo" : ""}`}
                  onClick={() => cambiarFiltro(estado)}
                >
                  {estado}
                  <span>{estado === "Todos" ? membresias.length : conteo[estado] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          <section className="usr-card">
            <div className="usr-scroll">
              <table className="usr-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Titular</th>
                    <th className="oculta-sm">Duración</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th className="oculta-md">Beneficios</th>
                    <th className="col-acciones">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr><td colSpan="7" className="usr-vacio"><span className="usr-spinner" /> Cargando membresías…</td></tr>
                  ) : filasActuales.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="usr-vacio">
                        {membresias.length === 0
                          ? "Aún no hay membresías. Crea la primera con «Nueva membresía»."
                          : "Ninguna membresía coincide con la búsqueda. Prueba con otro término o cambia el filtro."}
                      </td>
                    </tr>
                  ) : (
                    filasActuales.map((m) => {
                      const titular = mapaUsuarios[m.id_usuario];
                      return (
                        <tr key={m.cod_membresia}>
                          <td>
                            <div className="usr-plan">
                              <strong>{m.nombre_plan}</strong>
                              <small>Código {m.cod_membresia}</small>
                            </div>
                          </td>
                          <td>
                            <div className="usr-persona">
                              <span className="usr-avatar" style={estiloAvatar(m.id_usuario)}>
                                {iniciales(titular?.nombre_apellido)}
                              </span>
                              <div>
                                <strong>{titular?.nombre_apellido || `Usuario ${m.id_usuario}`}</strong>
                                <small>{titular?.correo || "Sin correo"}</small>
                              </div>
                            </div>
                          </td>
                          <td className="oculta-sm">{textoDuracion(m.duracion)}</td>
                          <td className="usr-precio">{formatoPrecio(m.precio)}</td>
                          <td><span className={`usr-badge ${claseEstado(m.estado)}`}>{m.estado}</span></td>
                          <td className="oculta-md">
                            <span className="usr-trunc">{m.beneficios || <em className="usr-nd">Sin registrar</em>}</span>
                          </td>
                          <td className="col-acciones">
                            <button className="usr-icon-btn" title="Editar" aria-label={`Editar ${m.nombre_plan}`} onClick={() => abrirModalEditar(m)}>
                              <Pencil size={18} />
                            </button>
                            <button className="usr-icon-btn peligro" title="Eliminar" aria-label={`Eliminar ${m.nombre_plan}`} onClick={() => setMembresiaEliminar(m)}>
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!cargando && filtradas.length > 0 && (
              <footer className="usr-footer">
                <span>
                  Mostrando {inicio + 1}–{Math.min(inicio + POR_PAGINA, filtradas.length)} de {filtradas.length}
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
            <h2>{modoEdicion ? "Editar membresía" : "Nueva membresía"}</h2>
            <p className="usr-modal-sub">
              {modoEdicion ? "Modifica los datos del plan." : "Completa los datos de la nueva membresía."}
            </p>

            <form onSubmit={handleGuardar} className="usr-form">
              <label className="usr-campo completo">
                Nombre del plan
                <input type="text" required autoFocus value={formData.nombre_plan} onChange={setCampo("nombre_plan")} />
              </label>
              <label className="usr-campo completo">
                Titular
                <select required value={formData.id_usuario} onChange={setCampo("id_usuario")}>
                  <option value="" disabled>Selecciona un usuario</option>
                  {usuarios.map((u) => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombre_apellido} ({u.correo})
                    </option>
                  ))}
                </select>
              </label>
              <label className="usr-campo">
                Duración ({UNIDAD.plural})
                <input type="number" required min="1" step="1" value={formData.duracion} onChange={setCampo("duracion")} />
              </label>
              <label className="usr-campo">
                Precio
                <input type="number" required min="0" step="any" inputMode="decimal" value={formData.precio} onChange={setCampo("precio")} />
              </label>
              <label className="usr-campo completo">
                Estado
                <select value={formData.estado} onChange={setCampo("estado")}>
                  {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="usr-campo completo">
                Beneficios
                <textarea
                  rows="3"
                  placeholder="Ej. Acceso a todas las clases, casillero, 2 sesiones con entrenador"
                  value={formData.beneficios}
                  onChange={setCampo("beneficios")}
                />
              </label>

              <div className="usr-modal-acciones completo">
                <button type="button" className="usr-btn usr-btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="usr-btn usr-btn-primary" disabled={guardando}>
                  {guardando ? "Guardando…" : modoEdicion ? "Guardar cambios" : "Crear membresía"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Confirmar eliminación ---------- */}
      {membresiaEliminar && (
        <div className="usr-overlay" onClick={() => setMembresiaEliminar(null)}>
          <div className="usr-modal usr-modal-sm" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Eliminar membresía</h2>
            <p className="usr-modal-sub">
              Vas a eliminar el plan <strong>{membresiaEliminar.nombre_plan}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="usr-modal-acciones">
              <button className="usr-btn usr-btn-ghost" onClick={() => setMembresiaEliminar(null)}>Cancelar</button>
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