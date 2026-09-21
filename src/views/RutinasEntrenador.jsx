import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import '../views/rutinasEntrenador.css';

export default function RutinasEntrenador() {
    const [rutinas, setRutinas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    
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

    useEffect(() => {
        obtenerDatos();
    }, []);

    const obtenerDatos = async () => {
        try {
            // 1. Obtenemos los usuarios
            const { data: usuariosData, error: errorUsuarios } = await supabase
                .from('usuarios')
                .select('*');

            if (errorUsuarios) throw errorUsuarios;
            setUsuarios(usuariosData || []);
            console.log("👥 Usuarios cargados:", usuariosData);

            // 2. Obtenemos las rutinas limpias
            const { data: rutinasData, error: errorRutinas } = await supabase
                .from('rutinas')
                .select('*');

            if (errorRutinas) throw errorRutinas;
            console.log("📋 Rutinas cargadas:", rutinasData);

            // 3. Cruzamos manualmente los datos para asegurar que tome 'nombre_apellido'
            const rutinasConUsuarios = (rutinasData || []).map(rutina => {
                // Buscamos el usuario comparando el id_usuario
                const clienteEncontrado = (usuariosData || []).find(u => 
                    String(u.id_usuario || u.id || '').trim() === String(rutina.id_usuario || '').trim()
                );

                const nombreCompleto = clienteEncontrado?.nombre_apellido || 'Sin asignar';

                return {
                    ...rutina,
                    usuarios: {
                        nombre_completo: nombreCompleto,
                        nombre: nombreCompleto, // Por compatibilidad si otra parte lo lee
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

    const rutinasFiltradas = rutinas.filter(r => 
        (r.nombre && r.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
        (r.objetivo && r.objetivo.toLowerCase().includes(busqueda.toLowerCase())) ||
        (r.usuarios?.nombre_completo && r.usuarios.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()))
    );

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

                <main className="rutinas-main">
                    <section className="users-rutinas">
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

                        <section className="routine-manager">
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
                                                {rutinasFiltradas.length > 0 ? (
                                                    rutinasFiltradas.map((rutina) => (
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
                                                                    onClick={() => setRutinaSeleccionada(rutina)}
                                                                >
                                                                    <i className="fa-solid fa-eye"></i>
                                                                </button>
                                                                <button 
                                                                    className="btn btn-warning btn-sm"
                                                                    data-bs-toggle="modal" 
                                                                    data-bs-target="#modalEditarRutina"
                                                                    onClick={() => setRutinaSeleccionada(rutina)}
                                                                >
                                                                    <i className="fa-solid fa-pen"></i>
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

                    </section>
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
        </>
    );
}