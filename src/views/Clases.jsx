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
    const [guardando, setGuardando] = useState(false);
    const [inscritos, setInscritos] = useState([]);

    const formClaseInicial = {
        nombre: '',
        salon: 'Salon 1',
        categoria: '',
        entrenador_encargado: '',
        estado: 'Activa',
        descripcion: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        cupo_maximo: ''
    };
    const [formClase, setFormClase] = useState(formClaseInicial);

    const handleChangeClase = (e) => {
        setFormClase({ ...formClase, [e.target.name]: e.target.value });
    };

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
                    categoria,
                    detalle_clase (
                        cod_detallec,
                        descripcion,
                        fecha,
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
        setFormClase(formClaseInicial);
        setMostrarModalEditar(true);
    };

    const abrirModalEditar = (clase) => {
        const detalle = clase.detalle_clase && clase.detalle_clase.length > 0 ? clase.detalle_clase[0] : null;
        setClaseSeleccionada(clase);
        setFormClase({
            nombre: clase.nombre || '',
            salon: clase.salon || 'Salon 1',
            categoria: clase.categoria || '',
            entrenador_encargado: clase.entrenador_encargado || '',
            estado: clase.estado || 'Activa',
            descripcion: detalle?.descripcion || '',
            fecha: detalle?.fecha || '',
            hora_inicio: detalle?.hora_inicio || '',
            hora_fin: detalle?.hora_fin || '',
            cupo_maximo: detalle?.cupo_maximo ?? ''
        });
        setMostrarModalEditar(true);
    };

    const abrirModalVer = (clase) => {
        setClaseSeleccionada(clase);
        setInscritos([]);
        setMostrarModalVer(true);
        const detalle = clase.detalle_clase && clase.detalle_clase.length > 0 ? clase.detalle_clase[0] : null;
        if (detalle?.cod_detallec) {
            cargarInscritos(detalle.cod_detallec);
        }
    };


    const cargarInscritos = async (cod_detallec) => {
        try {
            const { data, error } = await supabase
                .from('inscripciones')
                .select('cod_inscripcion, fecha_inscripcion, usuarios(nombre_apellido, correo)')
                .eq('cod_detallec', cod_detallec);

            if (error) throw error;
            setInscritos(data || []);
        } catch (error) {
            console.error("Error al cargar los inscritos:", error.message);
            setInscritos([]);
        }
    };

    const abrirModalEliminar = (clase) => {
        setClaseSeleccionada(clase);
        setMostrarModalEliminar(true);
    };

    const guardarClase = async () => {
        if (!formClase.nombre.trim()) {
            alert("El nombre de la clase es obligatorio");
            return;
        }

        setGuardando(true);
        try {
            const datosClase = {
                nombre: formClase.nombre,
                salon: formClase.salon,
                categoria: formClase.categoria,
                entrenador_encargado: formClase.entrenador_encargado,
                estado: formClase.estado
            };
            const datosDetalle = {
                descripcion: formClase.descripcion,
                fecha: formClase.fecha || null,
                hora_inicio: formClase.hora_inicio,
                hora_fin: formClase.hora_fin,
                cupo_maximo: formClase.cupo_maximo !== '' ? Number(formClase.cupo_maximo) : null
            };

            if (claseSeleccionada) {
                const { error: errorClase } = await supabase
                    .from('clases')
                    .update(datosClase)
                    .eq('cod_clase', claseSeleccionada.cod_clase);
                if (errorClase) throw errorClase;

                const detalleExistente = claseSeleccionada.detalle_clase?.[0];
                if (detalleExistente?.cod_detallec) {
                    const { error: errorDetalle } = await supabase
                        .from('detalle_clase')
                        .update(datosDetalle)
                        .eq('cod_detallec', detalleExistente.cod_detallec);
                    if (errorDetalle) throw errorDetalle;
                } else {
                    const { error: errorDetalle } = await supabase
                        .from('detalle_clase')
                        .insert([{ ...datosDetalle, cod_clase: claseSeleccionada.cod_clase }]);
                    if (errorDetalle) throw errorDetalle;
                }

                alert("Clase actualizada con éxito");
            } else {
                const { data: claseCreada, error: errorClase } = await supabase
                    .from('clases')
                    .insert([datosClase])
                    .select()
                    .single();
                if (errorClase) throw errorClase;

                const { error: errorDetalle } = await supabase
                    .from('detalle_clase')
                    .insert([{ ...datosDetalle, cod_clase: claseCreada.cod_clase }]);
                if (errorDetalle) throw errorDetalle;

                alert("Clase creada con éxito");
            }

            cerrarModales();
            obtenerClases();
        } catch (error) {
            console.error("Error al guardar la clase:", error.message);
            alert("No se pudo guardar la clase: " + error.message);
        } finally {
            setGuardando(false);
        }
    };

    const confirmarEliminacion = async () => {
        if (!claseSeleccionada) return;
        try {
            const codsDetallec = (claseSeleccionada.detalle_clase || [])
                .map((d) => d.cod_detallec)
                .filter(Boolean);

            if (codsDetallec.length > 0) {
                const { error: errorInscripciones } = await supabase
                    .from('inscripciones')
                    .delete()
                    .in('cod_detallec', codsDetallec);
                if (errorInscripciones) throw errorInscripciones;

                const { error: errorDetalle } = await supabase
                    .from('detalle_clase')
                    .delete()
                    .in('cod_detallec', codsDetallec);
                if (errorDetalle) throw errorDetalle;
            }

            const { error } = await supabase
                .from('clases')
                .delete()
                .eq('cod_clase', claseSeleccionada.cod_clase);

            if (error) throw error;
            obtenerClases();
            cerrarModales();
        } catch (error) {
            console.error("Error al eliminar la clase:", error.message);
            alert("No se pudo eliminar la clase: " + error.message);
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
            <div className="dashboard-layout clases-page">
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
                    <section className="dashboard-header">
                        <div className="header-text">
                            <div className="text">
                                <h2 className="titulo">Hola, Miguel <i className="fa-solid fa-user-tie"></i></h2>
                                <p>Aquí puedes gestionar las clases grupales del gimnasio...</p>
                            </div>
                        </div>
                    </section>

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
                                {claseSeleccionada?.categoria || claseSeleccionada?.salon}
                            </p>
                            <p id="verClaseInfo" className="fw-semibold mb-1">
                                Instructor: {claseSeleccionada?.entrenador_encargado}
                            </p>
                            <p className="mb-0">
                                Salón: {claseSeleccionada?.salon} &nbsp;|&nbsp; Estado: {claseSeleccionada?.estado}
                            </p>
                            <hr />
                            <h5>Horario</h5>
                            {claseSeleccionada?.detalle_clase?.[0] ? (
                                <>
                                    <p className="mb-1">{claseSeleccionada.detalle_clase[0].descripcion || 'Sin descripción'}</p>
                                    <p className="mb-0">
                                        {claseSeleccionada.detalle_clase[0].fecha ? `${claseSeleccionada.detalle_clase[0].fecha} · ` : ''}
                                        {claseSeleccionada.detalle_clase[0].hora_inicio} a {claseSeleccionada.detalle_clase[0].hora_fin}
                                        {' · '}Cupo máximo: {claseSeleccionada.detalle_clase[0].cupo_maximo ?? '-'}
                                    </p>
                                </>
                            ) : (
                                <p className="text-muted">Esta clase todavía no tiene horario definido.</p>
                            )}
                            <hr />
                            <h5>Inscritos ({inscritos.length})</h5>
                            {inscritos.length > 0 ? (
                                <ul className="mb-0 ps-3">
                                    {inscritos.map((i) => (
                                        <li key={i.cod_inscripcion}>
                                            {i.usuarios?.nombre_apellido || 'Usuario'}
                                            {i.usuarios?.correo ? ` — ${i.usuarios.correo}` : ''}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">Todavía no hay usuarios inscritos en esta clase.</p>
                            )}
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
                                    <input type="text" name="nombre" className="form-control" value={formClase.nombre} onChange={handleChangeClase} placeholder="Ej: Yoga Flow" required />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Salón</label>
                                    <select name="salon" className="form-select" value={formClase.salon} onChange={handleChangeClase}>
                                        <option>Salon 1</option>
                                        <option>Salon 2</option>
                                        <option>Salon 3</option>
                                    </select>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Categoría</label>
                                    <input type="text" name="categoria" className="form-control" value={formClase.categoria} onChange={handleChangeClase} placeholder="Ej: Cardio" />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Instructor</label>
                                    <input type="text" name="entrenador_encargado" className="form-control" value={formClase.entrenador_encargado} onChange={handleChangeClase} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Estado</label>
                                    <select name="estado" className="form-select" value={formClase.estado} onChange={handleChangeClase}>
                                        <option value="Activa">Activa</option>
                                        <option value="Inactiva">Inactiva</option>
                                        <option value="Cancelada">Cancelada</option>
                                    </select>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Cupo máximo</label>
                                    <input type="number" name="cupo_maximo" min="0" className="form-control" value={formClase.cupo_maximo} onChange={handleChangeClase} />
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Descripción</label>
                                    <input type="text" name="descripcion" className="form-control" value={formClase.descripcion} onChange={handleChangeClase} placeholder="Descripción de la sesión" />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Fecha</label>
                                    <input type="date" name="fecha" className="form-control" value={formClase.fecha} onChange={handleChangeClase} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Hora inicio</label>
                                    <input type="time" name="hora_inicio" className="form-control" value={formClase.hora_inicio} onChange={handleChangeClase} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Hora fin</label>
                                    <input type="time" name="hora_fin" className="form-control" value={formClase.hora_fin} onChange={handleChangeClase} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={cerrarModales}>Cancelar</button>
                            <button type="button" className="btn btn-success" onClick={guardarClase} disabled={guardando}>
                                {guardando ? 'Guardando...' : 'Guardar cambios'}
                            </button>
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