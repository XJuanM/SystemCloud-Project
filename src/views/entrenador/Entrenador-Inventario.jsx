import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase.js';
import Paginacion from '../../components/Paginacion.jsx';
import './entrenador-Inventario.css';

const ITEMS_POR_PAGINA = 6;

const tonoEstado = (estado) =>
    estado === 'Disponible' ? 'ok' : estado === 'En mantenimiento' ? 'low' : 'out';

const nombreEquipo = (item) => item?.nombre || item?.maquinas?.nombre || '';

const formatearFecha = (f) => {
    if (!f) return 'Sin programar';
    const [y, m, d] = String(f).slice(0, 10).split('-');
    return y && m && d ? `${d}/${m}/${y}` : f;
};

const MUSCULOS_SUGERIDOS = ['Pectoral', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Piernas', 'Glúteos', 'Abdomen', 'Cardio'];

const FORM_VACIO = {
    nombre: '',
    musculo_enfoque: '',
    descripcion: '',
    estado: 'Disponible',
    cantidad: '',
    fecha_mantenimiento: ''
};

export default function Inventario() {
    const [inventario, setInventario] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [form, setForm] = useState(FORM_VACIO);
    const [guardando, setGuardando] = useState(false);

    const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
    const [itemAEliminar, setItemAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    useEffect(() => {
        obtenerInventario();
    }, []);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda]);

    const obtenerInventario = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from('inventario_maquinas')
                .select(`
                    cod_inventario,
                    id_maquina,
                    nombre,
                    estado,
                    cantidad,
                    fecha_mantenimiento,
                    maquinas (
                        nombre,
                        descripcion,
                        musculo_enfoque
                    )
                `)
                .order('cod_inventario', { ascending: true });

            if (error) throw error;
            setInventario(data || []);
        } catch (error) {
            console.error("Error al obtener inventario:", error.message);
        } finally {
            setCargando(false);
        }
    };

    const inventarioFiltrado = inventario.filter(item => {
        const nombreMaquina = nombreEquipo(item);
        return nombreMaquina.toLowerCase().includes(busqueda.toLowerCase());
    });

    const totalPaginas = Math.max(1, Math.ceil(inventarioFiltrado.length / ITEMS_POR_PAGINA));
    const inventarioPaginado = inventarioFiltrado.slice(
        (paginaActual - 1) * ITEMS_POR_PAGINA,
        paginaActual * ITEMS_POR_PAGINA
    );

    useEffect(() => {
        if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
    }, [paginaActual, totalPaginas]);

    const totalEquipos = inventario.length;
    const totalUnidades = inventario.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);
    const equiposEnMantenimiento = inventario.filter(i => i.estado === 'En mantenimiento').length;
    const equiposFueraServicio = inventario.filter(i => i.estado === 'Fuera de servicio').length;

    const abrirModalNuevo = () => {
        setItemSeleccionado(null);
        setForm(FORM_VACIO);
        setMostrarModal(true);
    };

    const abrirModalEditar = (item) => {
        setItemSeleccionado(item);
        setForm({
            nombre: nombreEquipo(item),
            musculo_enfoque: item.maquinas?.musculo_enfoque || '',
            descripcion: item.maquinas?.descripcion || '',
            estado: item.estado || 'Disponible',
            cantidad: item.cantidad ?? '',
            fecha_mantenimiento: item.fecha_mantenimiento ? String(item.fecha_mantenimiento).slice(0, 10) : ''
        });
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
    };

    const confirmarEliminar = (item) => {
        setItemAEliminar(item);
        setModalEliminarOpen(true);
    };

    const cerrarModalEliminar = () => {
        if (eliminando) return;
        setModalEliminarOpen(false);
        setItemAEliminar(null);
    };

    const eliminarEquipo = async () => {
        if (!itemAEliminar) return;
        setEliminando(true);

        try {
            const { data: invBorrado, error: errInv } = await supabase
                .from('inventario_maquinas')
                .delete()
                .eq('cod_inventario', itemAEliminar.cod_inventario)
                .select();
            if (errInv) throw errInv;
            if (!invBorrado || invBorrado.length === 0) {
                throw new Error('No se eliminó nada. Falta la política DELETE (RLS) en la tabla inventario_maquinas.');
            }

            const { count } = await supabase
                .from('inventario_maquinas')
                .select('cod_inventario', { count: 'exact', head: true })
                .eq('id_maquina', itemAEliminar.id_maquina);

            let aviso = 'Equipo eliminado correctamente.';

            if (!count) {
                const { error: errMaq } = await supabase
                    .from('maquinas')
                    .delete()
                    .eq('id_maquina', itemAEliminar.id_maquina);

                if (errMaq) {
                    aviso = errMaq.code === '23503'
                        ? 'El equipo se quitó del inventario, pero la máquina se conserva en el catálogo porque está usada en otras tablas (por ejemplo rutinas).'
                        : 'El equipo se quitó del inventario, pero no se pudo borrar de maquinas: ' + errMaq.message;
                }
            }

            alert(aviso);
            setModalEliminarOpen(false);
            setItemAEliminar(null);
            obtenerInventario();
        } catch (error) {
            console.error('Error al eliminar el equipo:', error.message);
            alert('ERROR DE SUPABASE: ' + error.message);
        } finally {
            setEliminando(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const guardarEquipo = async (e) => {
        e.preventDefault();

        const nombre = form.nombre.trim();
        const cantidad = Number(form.cantidad);

        if (!nombre) {
            alert('Escribe el nombre del equipo.');
            return;
        }
        if (form.cantidad === '' || !Number.isInteger(cantidad) || cantidad < 0) {
            alert('La cantidad debe ser un número entero mayor o igual a 0.');
            return;
        }

        const datosMaquina = {
            nombre,
            musculo_enfoque: form.musculo_enfoque.trim() || null,
            descripcion: form.descripcion.trim() || null
        };
        const datosInventario = {
            nombre,
            estado: form.estado,
            cantidad,
            fecha_mantenimiento: form.fecha_mantenimiento || null
        };

        setGuardando(true);
        let idMaquinaNueva = null;

        try {
            if (itemSeleccionado) {
                const { data: maqAct, error: errMaq } = await supabase
                    .from('maquinas')
                    .update(datosMaquina)
                    .eq('id_maquina', itemSeleccionado.id_maquina)
                    .select();
                if (errMaq) throw errMaq;
                if (!maqAct || maqAct.length === 0) {
                    throw new Error('No se actualizó la máquina. Falta la política UPDATE (RLS) en la tabla maquinas.');
                }

                const { data: invAct, error: errInv } = await supabase
                    .from('inventario_maquinas')
                    .update(datosInventario)
                    .eq('cod_inventario', itemSeleccionado.cod_inventario)
                    .select();
                if (errInv) throw errInv;
                if (!invAct || invAct.length === 0) {
                    throw new Error('No se actualizó el inventario. Falta la política UPDATE (RLS) en la tabla inventario_maquinas.');
                }

                alert('¡Equipo actualizado con éxito!');
            } else {
                const { data: maquina, error: errMaq } = await supabase
                    .from('maquinas')
                    .insert([datosMaquina])
                    .select('id_maquina')
                    .single();
                if (errMaq) throw errMaq;
                idMaquinaNueva = maquina.id_maquina;

                const { error: errInv } = await supabase
                    .from('inventario_maquinas')
                    .insert([{ id_maquina: idMaquinaNueva, ...datosInventario }]);
                if (errInv) throw errInv;

                alert('¡Equipo registrado con éxito!');
            }

            setMostrarModal(false);
            obtenerInventario();
        } catch (error) {
            console.error('Error al guardar el equipo:', error.message);

            if (idMaquinaNueva) {
                await supabase.from('maquinas').delete().eq('id_maquina', idMaquinaNueva);
            }
            alert('ERROR DE SUPABASE: ' + error.message);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <>
            <div className="dashboard-layout inventario-page">
                <aside className="sidebar">
                    <div className="sidebar-logo">
                        <img src="../IMG/logoSinFondo2.png" alt="Logo" />
                        <h2>Prime</h2>
                        <p>Panel entrenador</p>
                    </div>

                    <nav className="sidebar-menu">
                        <Link to="/usuarios"><i className="fa-solid fa-users"></i>Usuarios</Link>
                        <Link to="/rutinas"><i className="fa-solid fa-dumbbell"></i>Rutinas</Link>
                        <Link to="/planes"><i className="fa-solid fa-jar-wheat"></i>Planes Alimenticios</Link>
                        <Link to="/clases"><i className="fa-solid fa-people-group"></i>Clases</Link>
                        <Link to="/inventario" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
                            <i className="fa-solid fa-box"></i>Inventario
                        </Link>
                        <Link to="/reportes"><i className="fa-solid fa-bug"></i>Reportes</Link>
                        <Link to="/"><i className="fa-solid fa-right-from-bracket"></i>Salir</Link>
                    </nav>
                </aside>

                <main className="dashboard-main">
                    <section className="dashboard-header">
                        <div className="header-text">
                            <div className="text">
                                <h2 className="titulo">Inventario <i className="fa-solid fa-box"></i></h2>
                                <p id="headerSummary">
                                    Gestiona el estado y mantenimiento de todas las máquinas y equipos del gimnasio.
                                </p>
                            </div>
                        </div>

                        <div className="header-cards">
                            <div className="mini-card">
                                <i className="fa-solid fa-boxes-stacked"></i>
                                <div>
                                    <h3 id="statTotalProducts">{totalEquipos}</h3>
                                    <span>Modelos de Máquinas</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-dumbbell"></i>
                                <div>
                                    <h3 id="statTotalValue">{totalUnidades}</h3>
                                    <span>Unidades Totales</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-screwdriver-wrench"></i>
                                <div>
                                    <h3 id="statLowStock">{equiposEnMantenimiento}</h3>
                                    <span>En Mantenimiento</span>
                                </div>
                            </div>

                            <div className="mini-card" style={{ borderColor: equiposFueraServicio > 0 ? 'rgba(230,60,60,.5)' : ''}}>
                                <i className="fa-solid fa-triangle-exclamation" style={{ color: equiposFueraServicio > 0 ? 'rgb(240,90,90)' : '' }}></i>
                                <div>
                                    <h3 id="statMovements">{equiposFueraServicio}</h3>
                                    <span>Fuera de Servicio</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="dashboard-content inventory-content">
                        <div className="inventory-table-wrap">
                            <div className="inventory-table-head">
                                <h3>Equipos en stock</h3>

                                <div className="inventory-search">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nombre..." 
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                    />
                                </div>

                                <button className="btn-add-product" onClick={abrirModalNuevo}>
                                    <i className="fa-solid fa-plus"></i>
                                    Nuevo equipo
                                </button>
                            </div>

                            {cargando ? (
                                <p className="empty-state">Cargando inventario...</p>
                            ) : inventarioFiltrado.length === 0 ? (
                                <p className="empty-state">No se encontraron equipos que coincidan con tu búsqueda.</p>
                            ) : (
                                <>
                                    <div className="inv-grid">
                                        {inventarioPaginado.map((item) => {
                                            const tono = tonoEstado(item.estado);
                                            return (
                                                <article className={`inv-card inv-card--${tono}`} key={item.cod_inventario}>
                                                    <div className="inv-card-top">
                                                        <div className="inv-icon">
                                                            <i className="fa-solid fa-dumbbell"></i>
                                                        </div>
                                                        <div className="inv-title">
                                                            <h4>{nombreEquipo(item) || 'Sin nombre'}</h4>
                                                            <span>ID Máquina: {item.id_maquina}</span>
                                                        </div>
                                                        <div className="inv-actions">
                                                            <button
                                                                type="button"
                                                                className="inv-edit"
                                                                title="Editar"
                                                                onClick={() => abrirModalEditar(item)}
                                                            >
                                                                <i className="fa-solid fa-pen"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="inv-delete"
                                                                title="Eliminar"
                                                                onClick={() => confirmarEliminar(item)}
                                                            >
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="inv-meta">
                                                        <span className={`inv-badge inv-badge--${tono}`}>{item.estado}</span>
                                                        {item.maquinas?.musculo_enfoque && (
                                                            <span className="inv-tag">
                                                                <i className="fa-solid fa-bullseye"></i>
                                                                {item.maquinas.musculo_enfoque}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="inv-stats">
                                                        <div>
                                                            <small>Cantidad</small>
                                                            <strong>{item.cantidad} <em>uds</em></strong>
                                                        </div>
                                                        <div>
                                                            <small>Mantenimiento</small>
                                                            <strong>{formatearFecha(item.fecha_mantenimiento)}</strong>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>

                                    <Paginacion
                                        paginaActual={paginaActual}
                                        totalPaginas={totalPaginas}
                                        onCambiarPagina={setPaginaActual}
                                    />
                                </>
                            )}
                        </div>

                        <div className="upcoming-expirations stock-alerts inv-alerts">
                            <h3 style={{ textAlign: 'left', marginBottom: '14px' }}>Alertas de Mantenimiento</h3>
                            <div id="alertsList" className="inv-alerts-list">
                                {equiposEnMantenimiento === 0 && equiposFueraServicio === 0 ? (
                                    <p className="empty-state" style={{ textAlign: 'left' }}>Todos los equipos operan con normalidad.</p>
                                ) : (
                                    inventario
                                        .filter(i => i.estado !== 'Disponible')
                                        .slice(0, 5)
                                        .map(alerta => (
                                            <div className="alert-card" key={`alert-${alerta.cod_inventario}`} style={{ display: 'flex', alignItems: 'center', textAlign: 'left', width: '100%' }}>
                                                <div className={`alert-icon ${alerta.estado === 'En mantenimiento' ? 'warn' : 'danger'}`} style={{ marginRight: '14px', flexShrink: 0 }}>
                                                    <i className="fa-solid fa-wrench"></i>
                                                </div>
                                                <div style={{ overflow: 'hidden', width: '100%' }}>
                                                    <h4 style={{ margin: 0, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {nombreEquipo(alerta) || 'Máquina'}
                                                    </h4>
                                                    <span style={{ fontSize: '0.8rem', color: 'rgb(170,170,170)', display: 'block' }}>
                                                        {alerta.estado} - Programado: {alerta.fecha_mantenimiento}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            <div className={`modal-overlay ${mostrarModal ? 'active' : ''}`}>
                <div className="modal-box" style={{ textAlign: 'left' }}>
                    <div className="modal-header">
                        <h3 style={{ margin: 0 }}>{itemSeleccionado ? 'Editar Equipo' : 'Nuevo Equipo'}</h3>
                        <button type="button" className="modal-close" onClick={cerrarModal}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <form onSubmit={guardarEquipo}>
                        <div className="modal-body">
                            <div className="form-group" style={{ alignItems: 'stretch' }}>
                                <label style={{ textAlign: 'left', display: 'block' }}>Nombre del equipo</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej. Press de pecho"
                                    style={{ width: '100%' }}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group" style={{ alignItems: 'stretch' }}>
                                    <label style={{ textAlign: 'left', display: 'block' }}>Músculo de enfoque</label>
                                    <input
                                        type="text"
                                        name="musculo_enfoque"
                                        list="lista-musculos"
                                        value={form.musculo_enfoque}
                                        onChange={handleChange}
                                        placeholder="Ej. Pectoral"
                                        style={{ width: '100%' }}
                                    />
                                    <datalist id="lista-musculos">
                                        {MUSCULOS_SUGERIDOS.map((m) => (
                                            <option key={m} value={m} />
                                        ))}
                                    </datalist>
                                </div>

                                <div className="form-group" style={{ alignItems: 'stretch' }}>
                                    <label style={{ textAlign: 'left', display: 'block' }}>Estado</label>
                                    <select
                                        name="estado"
                                        value={form.estado}
                                        onChange={handleChange}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="Disponible">Disponible</option>
                                        <option value="En mantenimiento">En mantenimiento</option>
                                        <option value="Fuera de servicio">Fuera de servicio</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group" style={{ alignItems: 'stretch' }}>
                                    <label style={{ textAlign: 'left', display: 'block' }}>Cantidad</label>
                                    <input
                                        type="number"
                                        name="cantidad"
                                        min="0"
                                        step="1"
                                        value={form.cantidad}
                                        onChange={handleChange}
                                        placeholder="0"
                                        style={{ width: '100%' }}
                                        required
                                    />
                                </div>

                                <div className="form-group" style={{ alignItems: 'stretch' }}>
                                    <label style={{ textAlign: 'left', display: 'block' }}>Fecha Mantenimiento</label>
                                    <input
                                        type="date"
                                        name="fecha_mantenimiento"
                                        value={form.fecha_mantenimiento}
                                        onChange={handleChange}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ alignItems: 'stretch' }}>
                                <label style={{ textAlign: 'left', display: 'block' }}>Descripción (opcional)</label>
                                <input
                                    type="text"
                                    name="descripcion"
                                    value={form.descripcion}
                                    onChange={handleChange}
                                    placeholder="Ej. Máquina de empuje horizontal con placas"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button type="button" className="btn-cancel" onClick={cerrarModal}>Cancelar</button>
                            <button type="submit" className="btn-save" disabled={guardando}>
                                {guardando ? 'Guardando...' : 'Guardar equipo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className={`modal-overlay ${modalEliminarOpen ? 'active' : ''}`}>
                <div className="modal-box" style={{ textAlign: 'left', maxWidth: '420px' }}>
                    <div className="modal-header">
                        <h3 style={{ margin: 0 }}>Eliminar equipo</h3>
                        <button type="button" className="modal-close" onClick={cerrarModalEliminar}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="modal-body">
                        <p style={{ margin: 0, lineHeight: 1.5 }}>
                            ¿Seguro que quieres eliminar{' '}
                            <strong>{nombreEquipo(itemAEliminar) || 'este equipo'}</strong> del inventario?
                            Esta acción no se puede deshacer.
                        </p>
                    </div>

                    <div className="modal-actions" style={{ marginTop: '20px' }}>
                        <button type="button" className="btn-cancel" onClick={cerrarModalEliminar} disabled={eliminando}>
                            Cancelar
                        </button>
                        <button type="button" className="inv-btn-danger" onClick={eliminarEquipo} disabled={eliminando}>
                            {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}