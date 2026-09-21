import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import '../views/usuarios.css';

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [tituloModal, setTituloModal] = useState('Registrar Usuario');

    const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
    const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    const [form, setForm] = useState({
        id_usuario: null,
        nombre_apellido: '',
        tipo_rol: 'Cliente',
        telefono: '',
        direccion: '',
        correo: '',
        password: ''
    });

    useEffect(() => {
        obtenerUsuarios();
    }, []);

    const obtenerUsuarios = async () => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .range(0, 999);
            if (error) throw error;
            setUsuarios(data || []);
        } catch (error) {
            console.error("Error al obtener los usuarios:", error.message);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const abrirModalCrear = () => {
        setTituloModal('Registrar Usuario');
        setForm({ 
            id_usuario: null, 
            nombre_apellido: '', 
            tipo_rol: 'Cliente', 
            telefono: '', 
            direccion: '', 
            correo: '', 
            password: '' 
        });
        setModalOpen(true);
    };

    const abrirModalEditar = (usuario) => {
        setTituloModal('Editar Usuario');
        setForm(usuario);
        setModalOpen(true);
    };

    const guardarUsuario = async (e) => {
        e.preventDefault();

        try {
            const datosAEnviar = {
                nombre_apellido: form.nombre_apellido,
                tipo_rol: form.tipo_rol,
                telefono: form.telefono ? Number(form.telefono) : null,
                direccion: form.direccion,
                correo: form.correo,
                password: form.password
            };

            if (form.id_usuario) {
                const { error } = await supabase
                    .from('usuarios')
                    .update(datosAEnviar)
                    .eq('id_usuario', form.id_usuario);

                if (error) throw error;
                alert("¡Usuario actualizado con éxito!");
            } else {
                const { error } = await supabase
                    .from('usuarios')
                    .insert([datosAEnviar]);

                if (error) throw error;
                alert("¡Usuario guardado con éxito en Supabase!");
            }
            setModalOpen(false);
            obtenerUsuarios();
        } catch (error) {
            console.error("Error al guardar el usuario:", error.message);
            alert("ERROR DE SUPABASE: " + error.message);
        }
    };

    const verDetalles = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setModalDetallesOpen(true);
    };

    const confirmarEliminar = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setModalEliminarOpen(true);
    };

    const eliminarUsuarioFirme = async () => {
        try {
            const { error } = await supabase
                .from('usuarios')
                .delete()
                .eq('id_usuario', usuarioSeleccionado.id_usuario);

            if (error) throw error;

            alert("Usuario eliminado correctamente");
            setModalEliminarOpen(false);
            obtenerUsuarios();
        } catch (error) {
            console.error("Error al eliminar el usuario:", error.message);
            alert("Error al eliminar: " + error.message);
        }
    };

    const usuariosFiltrados = usuarios.filter((u) => 
        (u.nombre_apellido && u.nombre_apellido.toLowerCase().includes(busqueda.toLowerCase())) ||
        (u.correo && u.correo.toLowerCase().includes(busqueda.toLowerCase()))
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
                        <Link to="/usuarios" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
                            <i className="fa-solid fa-users"></i>
                            Usuarios
                        </Link>
                        <Link to="/rutinas">
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
                                <h2 className="titulo">
                                    Gestión de Usuarios
                                    <i className="fa-solid fa-users"></i>
                                </h2>
                                <p>
                                    Administra todos los usuarios registrados en el gimnasio.
                                    Desde aquí podrás agregar, editar, eliminar y buscar usuarios.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="user-manager">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">Lista de Usuarios</h4>
                                <button className="btn btn-success" onClick={abrirModalCrear}>
                                    <i className="fa-solid fa-user-plus"></i>
                                    Nuevo Usuario
                                </button>
                            </div>

                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <input 
                                            type="text"
                                            className="form-control"
                                            placeholder="Buscar usuario por nombre o correo..."
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover align-middle text-center">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nombre y Apellido</th>
                                                <th>Correo</th>
                                                <th>Teléfono</th>
                                                <th>Dirección</th>
                                                <th>Rol</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuariosFiltrados.length > 0 ? (
                                                usuariosFiltrados.map((u) => (
                                                    <tr key={u.id_usuario}>
                                                        <td>{u.id_usuario}</td>
                                                        <td>{u.nombre_apellido}</td>
                                                        <td>{u.correo}</td>
                                                        <td>{u.telefono}</td>
                                                        <td>{u.direccion || 'N/A'}</td>
                                                        <td><span className="badge badge-rol-cliente">{u.tipo_rol}</span></td>
                                                        <td>
                                                            <button className="btn btn-info btn-sm me-1" onClick={() => verDetalles(u)} title="Ver detalles">
                                                                <i className="fa-solid fa-eye"></i>
                                                            </button>
                                                            <button className="btn btn-warning btn-sm me-1" onClick={() => abrirModalEditar(u)}>
                                                                <i className="fa-solid fa-pen"></i>
                                                            </button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => confirmarEliminar(u)}>
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-muted">No se encontraron usuarios.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {/* MODAL CREAR / EDITAR */}
            {modalOpen && (
                <div className="modal fade show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg" style={{ width: '100%', maxWidth: '650px', margin: 'auto' }}>
                        <div className="modal-content" style={{ backgroundColor: '#1a1d20', color: '#fff', border: '1px solid #2c3237', borderRadius: '12px', padding: '20px' }}>
                            <div className="modal-header border-0 d-flex justify-content-between align-items-center">
                                <h5 className="modal-title fw-bold">{tituloModal}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setModalOpen(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={guardarUsuario}>
                                    <div className="row mb-3">
                                        <div className="col-md-12">
                                            <label className="form-label">Nombre y Apellido</label>
                                            <input type="text" name="nombre_apellido" value={form.nombre_apellido} onChange={handleChange} className="form-control bg-dark text-light border-secondary" placeholder="Ingrese nombre y apellido" required />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Correo</label>
                                            <input type="email" name="correo" value={form.correo} onChange={handleChange} className="form-control bg-dark text-light border-secondary" placeholder="correo@ejemplo.com" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Teléfono</label>
                                            <input type="number" name="telefono" value={form.telefono} onChange={handleChange} className="form-control bg-dark text-light border-secondary" placeholder="3001234567" />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Dirección</label>
                                            <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className="form-control bg-dark text-light border-secondary" placeholder="Ingrese la dirección" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Tipo de Rol</label>
                                            <select name="tipo_rol" value={form.tipo_rol} onChange={handleChange} className="form-select bg-dark text-light border-secondary">
                                                <option value="Cliente">Cliente</option>
                                                <option value="Entrenador">Entrenador</option>
                                                <option value="Administrador">Administrador</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Contraseña</label>
                                        <input type="password" name="password" value={form.password} onChange={handleChange} className="form-control bg-dark text-light border-secondary" placeholder="Ingrese una contraseña" />
                                    </div>
                                    <div className="modal-footer border-0 d-flex justify-content-end gap-2 px-0 pb-0">
                                        <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                                        <button type="submit" className="btn btn-info text-white" style={{ backgroundColor: '#0dcaf0' }}>Guardar Usuario</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalEliminarOpen && (
                <div className="modal fade show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
                        <div className="modal-content" style={{ backgroundColor: '#1a1d20', color: '#fff', border: '1px solid #2c3237', borderRadius: '12px', padding: '15px' }}>
                            <div className="modal-header border-0 d-flex justify-content-between align-items-center">
                                <h5 className="modal-title fw-bold">Confirmar Eliminación</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setModalEliminarOpen(false)}></button>
                            </div>
                            <div className="modal-body text-start">
                                <p className="mb-0">¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.</p>
                            </div>
                            <div className="modal-footer border-0 d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalEliminarOpen(false)}>Cancelar</button>
                                <button type="button" className="btn btn-danger" onClick={eliminarUsuarioFirme}>Sí, eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalDetallesOpen && (
                <div className="modal fade show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}>
                        <div className="modal-content" style={{ backgroundColor: '#1a1d20', color: '#fff', border: '1px solid #2c3237', borderRadius: '12px', padding: '15px' }}>
                            <div className="modal-header border-0 d-flex justify-content-between align-items-center">
                                <h5 className="modal-title fw-bold">Detalles del Usuario</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setModalDetallesOpen(false)}></button>
                            </div>
                            <div className="modal-body text-start">
                                <p><strong>ID:</strong> {usuarioSeleccionado?.id_usuario}</p>
                                <p><strong>Nombre y Apellido:</strong> {usuarioSeleccionado?.nombre_apellido}</p>
                                <p><strong>Correo:</strong> {usuarioSeleccionado?.correo}</p>
                                <p><strong>Teléfono:</strong> {usuarioSeleccionado?.telefono}</p>
                                <p><strong>Dirección:</strong> {usuarioSeleccionado?.direccion || 'N/A'}</p>
                                <p><strong>Rol:</strong> {usuarioSeleccionado?.tipo_rol}</p>
                            </div>
                            <div className="modal-footer border-0 d-flex justify-content-end">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalDetallesOpen(false)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}