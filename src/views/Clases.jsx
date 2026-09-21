import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import '../views/clases.css';

export default function Clases() {
    const [clases, setClases] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [mostrarModalVer, setMostrarModalVer] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarModalSesion, setMostrarModalSesion] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);

    const [claseSeleccionada, setClaseSeleccionada] = useState(null);

    useEffect(() => {
        obtenerClases();
    }, []);

    const obtenerClases = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from('clases')
                .select(`
                    cod_clase,
                    nombre,
                    salon,
                    estado,
                    entrenador_encargado,
                    detalle_clase (
                        descripcion,
                        hora_inicio,
                        hora_fin,
                        cupo_maximo
                    )
                `);

            if (error) throw error;
            setClases(data);
        } catch (error) {
            console.error("Error al obtener las clases:", error.message);
        } finally {
            setCargando(false);
        }
    };

    const abrirModalNuevaClase = () => {
        setClaseSeleccionada(null); 
        setMostrarModalEditar(true);
    };

    const abrirModalEditar = (clase) => {
        setClaseSeleccionada(clase); 
        setMostrarModalEditar(true);
    };

    const abrirModalVer = (clase) => {
        setClaseSeleccionada(clase); 
        setMostrarModalVer(true);
    };

    const abrirModalEliminar = (clase) => {
        setClaseSeleccionada(clase);
        setMostrarModalEliminar(true);
    };

    const confirmarEliminacion = async () => {
        if (!claseSeleccionada) return;
        try {
            const { error } = await supabase
                .from('clases')
                .delete()
                .eq('cod_clase', claseSeleccionada.cod_clase);

            if (error) throw error;
            obtenerClases();
            cerrarModales();
        } catch (error) {
            console.error("Error al eliminar la clase:", error.message);
            alert("No se pudo eliminar la clase. Verifica la consola.");
        }
    };

    const cerrarModales = () => {
        setMostrarModalVer(false);
        setMostrarModalEditar(false);
        setMostrarModalSesion(false);
        setMostrarModalEliminar(false);
    };

    return (
        <>
            <div className="dashboard-layout">
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
                        <Link to="/clases" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
                            <i className="fa-solid fa-people-group"></i>Clases
                        </Link>
                        <Link to="/inventario"><i className="fa-solid fa-box"></i>Inventario</Link>
                        <Link to="/reportes"><i className="fa-solid fa-bug"></i>Reportes</Link>
                        <Link to="/"><i className="fa-solid fa-right-from-bracket"></i>Salir</Link>
                    </nav>
                </aside>

                <main className="rutinas-main">
                    <section className="users-rutinas">
                        <div className="header-text">
                            <div className="text">
                                <h2 className="titulo">Hola, Miguel <i className="fa-solid fa-user-tie"></i></h2>
                                <p>Aquí puedes gestionar las clases grupales del gimnasio...</p>
                            </div>
                        </div>

                        <section className="routine-manager">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h3 className="m-0">Gestión de Clases</h3>
                                    <button className="btn btn-success btn-sm" onClick={abrirModalNuevaClase}>
                                        <i className="fa-solid fa-plus"></i> Nueva clase
                                    </button>
                                </div>

                                <div className="card-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <input type="text" className="form-control" placeholder="Buscar clase..." id="buscarClase" />
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Clase</th>
                                                    <th>Categoría</th>
                                                    <th>Instructor</th>
                                                    <th>Horario</th>
                                                    <th>Cupo</th>
                                                    <th>Estado</th>
                                                    <th className="text-center">Acciones</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {cargando ? (
                                                    <tr><td colSpan="8" className="text-center">Cargando clases...</td></tr>
                                                ) : clases.length === 0 ? (
                                                    <tr><td colSpan="8" className="text-center">No hay clases registradas</td></tr>
                                                ) : (
                                                    clases.map((clase) => {
                                                        const detalle = clase.detalle_clase && clase.detalle_clase.length > 0 
                                                            ? clase.detalle_clase[0] : null;

                                                        return (
                                                            <tr key={clase.cod_clase}>
                                                                <td>{clase.cod_clase}</td>
                                                                <td>{clase.nombre}</td>
                                                                <td>{detalle ? detalle.descripcion : clase.salon}</td>
                                                                <td>{clase.entrenador_encargado}</td>
                                                                <td>{detalle ? `${detalle.hora_inicio} - ${detalle.hora_fin}` : 'Sin horario'}</td>
                                                                <td>{detalle ? detalle.cupo_maximo : '-'}</td>
                                                                <td>
                                                                    <span className={`badge ${clase.estado === 'Activa' ? 'bg-success' : 'bg-secondary'}`}>
                                                                        {clase.estado}
                                                                    </span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <button className="btn btn-sm btn-info me-1" title="Ver detalle" onClick={() => abrirModalVer(clase)}>
                                                                        <i className="fa-solid fa-eye"></i>
                                                                    </button>
                                                                    <button className="btn btn-sm btn-warning me-1" title="Editar" onClick={() => abrirModalEditar(clase)}>
                                                                        <i className="fa-solid fa-pen"></i>
                                                                    </button>
                                                                    <button className="btn btn-sm btn-danger" title="Eliminar" onClick={() => abrirModalEliminar(clase)}>
                                                                        <i className="fa-solid fa-trash"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </section>
                </main>
            </div>

            {/* MODAL VER CLASE */}
            <div className={`modal fade ${mostrarModalVer ? 'show d-block' : 'd-none'}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Detalle de la clase</h5>
                            <button type="button" className="btn-close" onClick={cerrarModales}></button>
                        </div>
                        <div className="modal-body text-start">
                            <h4 id="verClaseNombre">{claseSeleccionada ? claseSeleccionada.nombre : ''}</h4>
                            <p id="verClaseCategoria" className="text-info fw-semibold">
                                {claseSeleccionada?.detalle_clase?.[0]?.descripcion || claseSeleccionada?.salon}
                            </p>
                            <p id="verClaseInfo" className="fw-semibold">
                                Instructor: {claseSeleccionada?.entrenador_encargado}
                            </p>
                            <hr />
                            <h5>Lunes a Domingo</h5>
                            <p>Aquí se listarán los horarios...</p>
                            <hr />
                            <h5>Inscritos</h5>
                            <p>Aquí se listarán los inscritos...</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={cerrarModales}>Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL EDITAR / NUEVA CLASE */}
            <div className={`modal fade ${mostrarModalEditar ? 'show d-block' : 'd-none'}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="tituloModalClase">
                                {claseSeleccionada ? 'Editar clase' : 'Nueva clase'}
                            </h5>
                            <button type="button" className="btn-close" onClick={cerrarModales}></button>
                        </div>
                        <div className="modal-body text-start">
                            <div className="row">
                                <div className="col-md-5 mb-3">
                                    <label className="form-label">Nombre de la clase</label>
                                    <input type="text" className="form-control" defaultValue={claseSeleccionada?.nombre || ''} placeholder="Ej: Yoga Flow" />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Categoría / Salón</label>
                                    <select className="form-select" defaultValue={claseSeleccionada?.salon || ''}>
                                        <option>Salon 1</option>
                                        <option>Salon 2</option>
                                        <option>Salon 3</option>
                                    </select>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Instructor</label>
                                    <input type="text" className="form-control" defaultValue={claseSeleccionada?.entrenador_encargado || ''} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Cupo máximo</label>
                                    <input type="number" className="form-control" defaultValue={claseSeleccionada?.detalle_clase?.[0]?.cupo_maximo || ''} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Estado</label>
                                    <select className="form-select" defaultValue={claseSeleccionada?.estado || 'Activa'}>
                                        <option value="Activa">Activa</option>
                                        <option value="Inactiva">Inactiva</option>
                                        <option value="Cancelada">Cancelada</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={cerrarModales}>Cancelar</button>
                            <button type="button" className="btn btn-success">Guardar cambios</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL ELIMINAR CLASE */}
            <div className={`modal fade ${mostrarModalEliminar ? 'show d-block' : 'd-none'}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-danger">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">
                                <i className="fa-solid fa-triangle-exclamation me-2"></i> 
                                Confirmar Eliminación
                            </h5>
                            <button type="button" className="btn-close btn-close-white" onClick={cerrarModales}></button>
                        </div>
                        <div className="modal-body text-center py-4">
                            <h4>¿Estás seguro de que deseas eliminar esta clase?</h4>
                            <p className="mb-0 text-muted">
                                Estás a punto de eliminar la clase <strong>{claseSeleccionada ? claseSeleccionada.nombre : ''}</strong>. 
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="modal-footer justify-content-center">
                            <button type="button" className="btn btn-secondary px-4" onClick={cerrarModales}>Cancelar</button>
                            <button type="button" className="btn btn-danger px-4" onClick={confirmarEliminacion}>Sí, Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}