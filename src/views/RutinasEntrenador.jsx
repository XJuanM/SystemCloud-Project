import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import Paginacion from '../components/Paginacion.jsx';
import '../views/rutinasEntrenador.css';


const ITEMS_POR_PAGINA = 8;

export default function RutinasEntrenador() {
    const [rutinas, setRutinas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);

    const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
    const [rutinaAEliminar, setRutinaAEliminar] = useState(null);

    const [rutinaSeleccionada, setRutinaSeleccionada] = useState({
        cod_rutina: '',
        id_usuario: '',
        nombre: '',
        objetivo: '',
        usuarios: { nombre: '', apellido: '' }
    });

    const [nuevaRutina, setNuevaRutina] = useState({
        id_usuario: '',
        nombre: '',
        objetivo: ''
    });

    const [ejercicios, setEjercicios] = useState([]);

    const [detalleRutina, setDetalleRutina] = useState([]);

    const [nuevoDetalleEjercicio, setNuevoDetalleEjercicio] = useState({
        id_ejercicio: '',
        series: '',
        repeticiones: '',
        descanso: '',
        peso: ''
    });

    useEffect(() => {
        obtenerDatos();
    }, []);

    const obtenerDatos = async () => {
        try {
            const { data: usuariosData, error: errorUsuarios } = await supabase
                .from('usuarios')
                .select('*');

            if (errorUsuarios) throw errorUsuarios;
            setUsuarios(usuariosData || []);
            console.log("👥 Usuarios cargados:", usuariosData);

            const { data: ejerciciosData, error: errorEjercicios } = await supabase
                .from('ejercicios')
                .select('*');

            if (errorEjercicios) throw errorEjercicios;
            setEjercicios(ejerciciosData || []);
            console.log("🏋️ Ejercicios cargados:", ejerciciosData);

            const { data: rutinasData, error: errorRutinas } = await supabase
                .from('rutinas')
                .select('*');

            if (errorRutinas) throw errorRutinas;
            console.log("📋 Rutinas cargadas:", rutinasData);

            const rutinasConUsuarios = (rutinasData || []).map(rutina => {
                const clienteEncontrado = (usuariosData || []).find(u => 
                    String(u.id_usuario || u.id || '').trim() === String(rutina.id_usuario || '').trim()
                );

                const nombreCompleto = clienteEncontrado?.nombre_apellido || 'Sin asignar';

                return {
                    ...rutina,
                    usuarios: {
                        nombre_completo: nombreCompleto,
                        nombre: nombreCompleto, 
                        apellido: ''
                    }
                };
            });

            setRutinas(rutinasConUsuarios);
        } catch (error) {
            console.error("Error al obtener los datos:", error.message);
        }
    };

    const guardarNuevaRutina = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('rutinas')
                .insert([
                    {
                        id_usuario: nuevaRutina.id_usuario,
                        nombre: nuevaRutina.nombre,
                        objetivo: nuevaRutina.objetivo
                    }
                ]);

            if (error) throw error;
            
            alert("Rutina asignada con éxito");
            setNuevaRutina({ id_usuario: '', nombre: '', objetivo: '' });
            obtenerDatos();
        } catch (error) {
            alert("Error al guardar la rutina: " + error.message);
        }
    };


    const cargarDetalleRutina = async (cod_rutina) => {
        try {
            const { data: detalleData, error: errorDetalle } = await supabase
                .from('detalle_rutina')
                .select('*, ejercicios(nombre, musculo_enfoque)')
                .eq('cod_rutina', cod_rutina);

            if (errorDetalle) throw errorDetalle;

            const detalleConEjercicio = (detalleData || []).map(item => ({
                ...item,
                ejercicio_nombre: item.ejercicios?.nombre || 'Ejercicio no encontrado',
                musculo_enfoque: item.ejercicios?.musculo_enfoque || ''
            }));

            setDetalleRutina(detalleConEjercicio);
        } catch (error) {
            console.error("Error al cargar el detalle de la rutina:", error.message);
            alert("No se pudieron cargar los ejercicios de la rutina: " + error.message);
            setDetalleRutina([]);
        }
    };


    const abrirRutina = (rutina) => {
        setRutinaSeleccionada(rutina);
        setNuevoDetalleEjercicio({ id_ejercicio: '', series: '', repeticiones: '', descanso: '', peso: '' });
        cargarDetalleRutina(rutina.cod_rutina);
    };

    const agregarEjercicioARutina = async (e) => {
        e.preventDefault();

        if (!nuevoDetalleEjercicio.id_ejercicio) {
            alert("Selecciona un ejercicio del catálogo");
            return;
        }

        try {
            const { error } = await supabase
                .from('detaller')
                .insert([
                    {
                        cod_rutina: rutinaSeleccionada.cod_rutina,
                        id_ejercicio: Number(nuevoDetalleEjercicio.id_ejercicio),
                        series: nuevoDetalleEjercicio.series ? Number(nuevoDetalleEjercicio.series) : null,
                        repeticiones: nuevoDetalleEjercicio.repeticiones ? Number(nuevoDetalleEjercicio.repeticiones) : null,
                        descanso: nuevoDetalleEjercicio.descanso ? Number(nuevoDetalleEjercicio.descanso) : null,
                        peso: nuevoDetalleEjercicio.peso ? Number(nuevoDetalleEjercicio.peso) : null
                    }
                ]);

            if (error) throw error;

            setNuevoDetalleEjercicio({ id_ejercicio: '', series: '', repeticiones: '', descanso: '', peso: '' });
            await cargarDetalleRutina(rutinaSeleccionada.cod_rutina);
        } catch (error) {
            alert("Error al agregar el ejercicio: " + error.message);
        }
    };

    const eliminarEjercicioDeRutina = async (cod_detaller) => {
        try {
            const { error } = await supabase
                .from('detaller')
                .delete()
                .eq('cod_detaller', cod_detaller);

            if (error) throw error;
            await cargarDetalleRutina(rutinaSeleccionada.cod_rutina);
        } catch (error) {
            alert("Error al eliminar el ejercicio: " + error.message);
        }
    };

    const confirmarEliminarRutina = (rutina) => {
        setRutinaAEliminar(rutina);
        setModalEliminarOpen(true);
    };

    const eliminarRutinaFirme = async () => {
        try {
            const { error } = await supabase
                .from('rutinas')
                .delete()
                .eq('cod_rutina', rutinaAEliminar.cod_rutina);

            if (error) throw error;

            alert("Rutina eliminada correctamente");
            setModalEliminarOpen(false);
            obtenerDatos();
        } catch (error) {
            console.error("Error al eliminar la rutina:", error.message);
            alert("Error al eliminar: " + error.message);
        }
    };

    const rutinasFiltradas = rutinas.filter(r => 
        (r.nombre && r.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
        (r.objetivo && r.objetivo.toLowerCase().includes(busqueda.toLowerCase())) ||
        (r.usuarios?.nombre_completo && r.usuarios.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()))
    );

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda]);

    const totalPaginas = Math.max(1, Math.ceil(rutinasFiltradas.length / ITEMS_POR_PAGINA));
    const rutinasPaginadas = rutinasFiltradas.slice(
        (paginaActual - 1) * ITEMS_POR_PAGINA,
        paginaActual * ITEMS_POR_PAGINA
    );

    return (
        <>
            <div className="dashboard-layout rutinas-page">
                <aside className="sidebar">
                    <div className="sidebar-logo">
                        <img src="../IMG/logoSinFondo2.png" alt="Logo" />
                        <h2>Prime</h2>
                        <p>Panel entrenador</p>
                    </div>

                    <nav className="sidebar-menu">
                        <Link to="/usuarios">
                            <i className="fa-solid fa-users"></i>
                            Usuarios
                        </Link>
                        <Link to="/rutinas" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
                            <i className="fa-solid fa-dumbbell"></i>
                            Rutinas
                        </Link>
                        <Link to="/planes">
                            <i className="fa-solid fa-jar-wheat"></i>
                            Planes Alimenticios
                        </Link>
                        <Link to="/clases">
                            <i className="fa-solid fa-people-group"></i>
                            Clases
                        </Link>
                        <Link to="/inventario">
                            <i className="fa-solid fa-box"></i>
                            Inventario
                        </Link>
                        <Link to="/reportes">
                            <i className="fa-solid fa-bug"></i>
                            Reportes
                        </Link>
                        <Link to="/">
                            <i className="fa-solid fa-right-from-bracket"></i>
                            Salir
                        </Link>
                    </nav>
                </aside>

                <main className="dashboard-main">
                    <section className="dashboard-header">
                        <div className="header-text">
                            <div className="text">
                                <h2 className="titulo">Hola, Miguel <i className="fa-solid fa-user-tie"></i></h2>
                                <p>
                                    Esta semana se registró un aumento en la asignación de rutinas personalizadas.
                                    Se recomienda revisar los clientes con planes pendientes y actualizar los programas
                                    de entrenamiento según el progreso alcanzado para mantener un seguimiento constante.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="routine-manager user-manager">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h3 className="m-0">Gestión de Rutinas</h3>
                                    <button 
                                        className="btn btn-success" 
                                        data-bs-toggle="modal" 
                                        data-bs-target="#modalCrearRutina"
                                    >
                                        <i className="fa-solid fa-plus me-2"></i> Nueva Rutina
                                    </button>
                                </div>

                                <div className="card-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="Buscar por cliente, rutina u objetivo..."
                                                value={busqueda}
                                                onChange={(e) => setBusqueda(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Cliente</th>
                                                    <th>Objetivo</th>
                                                    <th>Rutina</th>
                                                    <th>Estado</th>
                                                    <th className="text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rutinasPaginadas.length > 0 ? (
                                                    rutinasPaginadas.map((rutina) => (
                                                        <tr key={rutina.cod_rutina}>
                                                            <td>{rutina.cod_rutina}</td>
                                                            <td>
                                                                {rutina.usuarios 
                                                                    ? rutina.usuarios.nombre_completo 
                                                                    : <span className="text-danger">Sin asignar</span>
                                                                }
                                                            </td>
                                                            <td>{rutina.objetivo}</td>
                                                            <td>{rutina.nombre || 'Sin nombre'}</td>
                                                            <td>
                                                                <span className="badge bg-success">
                                                                    Activo
                                                                </span>
                                                            </td>
                                                            <td className="text-center">
                                                                <button 
                                                                    className="btn btn-info btn-sm me-2"
                                                                    data-bs-toggle="modal" 
                                                                    data-bs-target="#modalVerRutina"
                                                                    onClick={() => abrirRutina(rutina)}
                                                                >
                                                                    <i className="fa-solid fa-eye"></i>
                                                                </button>
                                                                <button 
                                                                    className="btn btn-primary btn-sm me-2"
                                                                    data-bs-toggle="modal" 
                                                                    data-bs-target="#modalGestionarEjercicios"
                                                                    onClick={() => abrirRutina(rutina)}
                                                                    title="Gestionar ejercicios"
                                                                >
                                                                    <i className="fa-solid fa-dumbbell"></i>
                                                                </button>
                                                                <button 
                                                                    className="btn btn-warning btn-sm me-2"
                                                                    data-bs-toggle="modal" 
                                                                    data-bs-target="#modalEditarRutina"
                                                                    onClick={() => setRutinaSeleccionada(rutina)}
                                                                >
                                                                    <i className="fa-solid fa-pen"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => confirmarEliminarRutina(rutina)}
                                                                >
                                                                    <i className="fa-solid fa-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="text-center">No se encontraron rutinas registradas.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <Paginacion
                                        paginaActual={paginaActual}
                                        totalPaginas={totalPaginas}
                                        onCambiarPagina={setPaginaActual}
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="dashboard-info">
                            <div className="recent-activity">
                                <h3>
                                    <i className="fa-solid fa-clock-rotate-left"></i>
                                    Actividades recientes
                                </h3>
                                <div className="activity-item">
                                    <i className="fa-solid fa-circle-check"></i>
                                    <div>
                                        <strong>Rutina actualizada</strong>
                                        <p>Se modificó el plan de entrenamiento para hipertrofia.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="attention-card">
                                <h3>
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    Clientes que requieren atención
                                </h3>
                                <div className="attention-item">
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    <div>
                                        <strong>Seguimiento pendiente</strong>
                                        <p>Revisar progreso de los clientes con rutinas próximas a vencer.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                </main>
            </div>

            <div className="modal fade" id="modalCrearRutina" tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Asignar Nueva Rutina</h5>
                            <button className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form onSubmit={guardarNuevaRutina}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Seleccionar Cliente</label>
                                    <select 
                                        className="form-select"
                                        required
                                        value={nuevaRutina.id_usuario}
                                        onChange={(e) => setNuevaRutina({...nuevaRutina, id_usuario: e.target.value})}
                                    >
                                        <option value="">-- Seleccione un usuario --</option>
                                        {usuarios.map((u) => {
                                            const idVal = u.id_usuario || u.id || u.codigo;
                                            const nombreVal = u.nombre_apellido || 'Sin nombre';
                                            return (
                                                <option key={idVal} value={idVal}>
                                                    {nombreVal} (ID: {idVal})
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Nombre de la Rutina</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Ej. Hipertrofia Pierna"
                                        required
                                        value={nuevaRutina.nombre}
                                        onChange={(e) => setNuevaRutina({...nuevaRutina, nombre: e.target.value})}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Objetivo</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Ej. Ganar masa muscular"
                                        required
                                        value={nuevaRutina.objetivo}
                                        onChange={(e) => setNuevaRutina({...nuevaRutina, objetivo: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-success" data-bs-dismiss="modal">Guardar Rutina</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="modalVerRutina" tabIndex="-1">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Rutina del cliente</h5>
                            <button className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <h4>{rutinaSeleccionada.usuarios ? rutinaSeleccionada.usuarios.nombre_completo : 'Cliente'}</h4>
                            <p className="text-info fw-semibold">Objetivo: {rutinaSeleccionada.objetivo}</p>
                            <hr />
                            <p><strong>Nombre de la Rutina:</strong> {rutinaSeleccionada.nombre}</p>
                            <h5 className="mt-3">Ejercicios asignados</h5>
                            {detalleRutina.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Ejercicio</th>
                                                <th>Músculo</th>
                                                <th>Series</th>
                                                <th>Repeticiones</th>
                                                <th>Descanso (seg)</th>
                                                <th>Peso (kg)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detalleRutina.map((item) => (
                                                <tr key={item.cod_detaller}>
                                                    <td>{item.ejercicio_nombre}</td>
                                                    <td>{item.musculo_enfoque || '-'}</td>
                                                    <td>{item.series ?? '-'}</td>
                                                    <td>{item.repeticiones ?? '-'}</td>
                                                    <td>{item.descanso ?? '-'}</td>
                                                    <td>{item.peso ?? '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted">Esta rutina todavía no tiene ejercicios asignados.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL GESTIONAR EJERCICIOS DE LA RUTINA */}
            <div className="modal fade" id="modalGestionarEjercicios" tabIndex="-1">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                Ejercicios de: {rutinaSeleccionada.nombre || 'Rutina'}
                                {rutinaSeleccionada.usuarios?.nombre_completo ? ` — ${rutinaSeleccionada.usuarios.nombre_completo}` : ''}
                            </h5>
                            <button className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="table-responsive mb-4">
                                <table className="table table-sm table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Ejercicio</th>
                                            <th>Músculo</th>
                                            <th>Series</th>
                                            <th>Repeticiones</th>
                                            <th>Descanso (seg)</th>
                                            <th>Peso (kg)</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detalleRutina.length > 0 ? (
                                            detalleRutina.map((item) => (
                                                <tr key={item.cod_detaller}>
                                                    <td>{item.ejercicio_nombre}</td>
                                                    <td>{item.musculo_enfoque || '-'}</td>
                                                    <td>{item.series ?? '-'}</td>
                                                    <td>{item.repeticiones ?? '-'}</td>
                                                    <td>{item.descanso ?? '-'}</td>
                                                    <td>{item.peso ?? '-'}</td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => eliminarEjercicioDeRutina(item.cod_detaller)}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center text-muted py-3">
                                                    Todavía no hay ejercicios asignados a esta rutina.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <hr />
                            <h6>Agregar ejercicio</h6>
                            <form onSubmit={agregarEjercicioARutina} className="row g-2 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label">Ejercicio</label>
                                    <select
                                        className="form-select"
                                        required
                                        value={nuevoDetalleEjercicio.id_ejercicio}
                                        onChange={(e) => setNuevoDetalleEjercicio({ ...nuevoDetalleEjercicio, id_ejercicio: e.target.value })}
                                    >
                                        <option value="">-- Seleccione --</option>
                                        {ejercicios.map((ej) => (
                                            <option key={ej.id_ejercicio} value={ej.id_ejercicio}>
                                                {ej.nombre} ({ej.musculo_enfoque})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Series</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-control"
                                        value={nuevoDetalleEjercicio.series}
                                        onChange={(e) => setNuevoDetalleEjercicio({ ...nuevoDetalleEjercicio, series: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Repeticiones</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-control"
                                        value={nuevoDetalleEjercicio.repeticiones}
                                        onChange={(e) => setNuevoDetalleEjercicio({ ...nuevoDetalleEjercicio, repeticiones: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Descanso (seg)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-control"
                                        value={nuevoDetalleEjercicio.descanso}
                                        onChange={(e) => setNuevoDetalleEjercicio({ ...nuevoDetalleEjercicio, descanso: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Peso (kg)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        className="form-control"
                                        value={nuevoDetalleEjercicio.peso}
                                        onChange={(e) => setNuevoDetalleEjercicio({ ...nuevoDetalleEjercicio, peso: e.target.value })}
                                    />
                                </div>
                                <div className="col-12 mt-2">
                                    <button type="submit" className="btn btn-success">
                                        <i className="fa-solid fa-plus me-2"></i> Agregar ejercicio a la rutina
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="modalEditarRutina" tabIndex="-1">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Editar rutina</h5>
                            <button className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <h4>{rutinaSeleccionada.usuarios ? rutinaSeleccionada.usuarios.nombre_completo : 'Cliente'}</h4>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Nombre de la rutina</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={rutinaSeleccionada.nombre || ''}
                                        onChange={(e) => setRutinaSeleccionada({...rutinaSeleccionada, nombre: e.target.value})}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Objetivo</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={rutinaSeleccionada.objetivo || ''}
                                        onChange={(e) => setRutinaSeleccionada({...rutinaSeleccionada, objetivo: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-success" data-bs-dismiss="modal" onClick={async () => {
                                try {
                                    const { error } = await supabase
                                        .from('rutinas')
                                        .update({
                                            nombre: rutinaSeleccionada.nombre,
                                            objetivo: rutinaSeleccionada.objetivo
                                        })
                                        .eq('cod_rutina', rutinaSeleccionada.cod_rutina);

                                    if (error) throw error;
                                    alert("Rutina actualizada con éxito");
                                    obtenerDatos();
                                } catch (err) {
                                    alert("Error al actualizar: " + err.message);
                                }
                            }}>
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CONFIRMAR ELIMINACIÓN */}
            {modalEliminarOpen && (
                <div className="modal fade show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
                        <div className="modal-content" style={{ backgroundColor: '#1a1d20', color: '#fff', border: '1px solid #2c3237', borderRadius: '12px', padding: '15px' }}>
                            <div className="modal-header border-0 d-flex justify-content-between align-items-center">
                                <h5 className="modal-title fw-bold">Confirmar Eliminación</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setModalEliminarOpen(false)}></button>
                            </div>
                            <div className="modal-body text-start">
                                <p className="mb-0">
                                    ¿Estás seguro de que deseas eliminar la rutina
                                    {rutinaAEliminar ? ` "${rutinaAEliminar.nombre}"` : ''}? Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <div className="modal-footer border-0 d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalEliminarOpen(false)}>Cancelar</button>
                                <button type="button" className="btn btn-danger" onClick={eliminarRutinaFirme}>Sí, eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}