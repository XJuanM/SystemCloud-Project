import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import './cliente-Progreso.css';

export default function Progreso() {
    // Estados para la lista de registros
    const [registros, setRegistros] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Estados para el formulario (CRUD)
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEdicion, setIdEdicion] = useState(null);
    const [formData, setFormData] = useState({
        fecha: '',
        peso: '',
        notas: ''
    });

    useEffect(() => {
        obtenerRegistros();
    }, []);

    
    const obtenerRegistros = async () => {
        try {
            const { data, error } = await supabase
                .from('progreso')
                .select('*')
                .order('fecha', { ascending: false }); // Muestra los más recientes primero

            if (error) throw error;
            setRegistros(data);
        } catch (error) {
            console.error('Error al obtener progreso:', error.message);
        } finally {
            setCargando(false);
        }
    };

    
    const manejarCambioInput = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const guardarRegistro = async (e) => {
        e.preventDefault();
        try {
            if (modoEdicion) {
                // Actualizar registro existente
                const { error } = await supabase
                    .from('progreso')
                    .update({
                        fecha: formData.fecha,
                        peso: parseFloat(formData.peso),
                        notas: formData.notas
                    })
                    .eq('id', idEdicion);
                if (error) throw error;
            } else {
                // Crear nuevo registro
                const { error } = await supabase
                    .from('progreso')
                    .insert([{
                        fecha: formData.fecha,
                        peso: parseFloat(formData.peso),
                        notas: formData.notas
                    }]);
                if (error) throw error;
            }

            // Limpiar formulario y recargar datos
            resetearFormulario();
            obtenerRegistros();
        } catch (error) {
            console.error('Error al guardar:', error.message);
            alert('Hubo un error al guardar el registro.');
        }
    };

    const iniciarEdicion = (registro) => {
        setModoEdicion(true);
        setIdEdicion(registro.id);
        setFormData({
            fecha: registro.fecha,
            peso: registro.peso,
            notas: registro.notas || ''
        });
        window.scrollTo(0, 0); // Sube al inicio donde está el formulario
    };

    const resetearFormulario = () => {
        setModoEdicion(false);
        setIdEdicion(null);
        setFormData({ fecha: '', peso: '', notas: '' });
    };

   
    const eliminarRegistro = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;
        
        try {
            const { error } = await supabase
                .from('progreso')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            obtenerRegistros();
        } catch (error) {
            console.error('Error al eliminar:', error.message);
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img src="../IMG/logoSinFondo2.png" alt="Logo" />
                    <h2>Prime</h2>
                    <p>Panel Cliente</p>
                </div>

                <nav className="sidebar-menu">
                
                    <Link to="/perfil"><i className="fa-solid fa-user"></i> Mi perfil</Link>
                    <Link to="/membresia"><i className="fa-solid fa-credit-card"></i> Mi membresía</Link>
                    <Link to="/rutina-cliente"><i className="fa-solid fa-dumbbell"></i> Mis rutinas</Link>
                    <Link to="/plan-alimenticio"><i className="fa-solid fa-utensils"></i> Mi plan alimenticio</Link>
                    <Link to="/mis-clases"><i className="fa-solid fa-calendar-days"></i> Mis clases</Link>
                    <Link to="/progreso" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
                        <i className="fa-solid fa-chart-line"></i> Mi progreso
                    </Link>
                    <Link to="/catalogo"><i className="fa-solid fa-apple-whole"></i> Catálogo</Link>
                    <Link to="/informacionGym"><i className="fa-solid fa-circle-info"></i> Información del gimnasio</Link>
                    <Link to="/"><i className="fa-solid fa-right-from-bracket"></i> Salir</Link>
                </nav>
            </aside>

            <main className="dashboard-main p-4 w-100" style={{ overflowY: 'auto' }}>
                <h2 className="text-white mb-4">
                    <i className="fa-solid fa-chart-line me-2" style={{ color: 'var(--azulito)' }}></i>
                    Mi Progreso
                </h2>

                <div className="row g-4">
                    {/* COLUMNA IZQUIERDA: FORMULARIO */}
                    <div className="col-12 col-lg-4">
                        <div className="card text-white p-4" style={{ backgroundColor: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px' }}>
                            <h4 className="mb-4">{modoEdicion ? 'Editar Registro' : 'Nuevo Registro'}</h4>
                            <form onSubmit={guardarRegistro}>
                                <div className="mb-3">
                                    <label className="form-label text-secondary">Fecha</label>
                                    <input 
                                        type="date" 
                                        className="form-control bg-dark text-white border-secondary" 
                                        name="fecha" 
                                        value={formData.fecha} 
                                        onChange={manejarCambioInput} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-secondary">Peso (kg)</label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        className="form-control bg-dark text-white border-secondary" 
                                        name="peso" 
                                        placeholder="Ej: 75.5"
                                        value={formData.peso} 
                                        onChange={manejarCambioInput} 
                                        required 
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-secondary">Notas </label>
                                    <textarea 
                                        className="form-control bg-dark text-white border-secondary" 
                                        name="notas" 
                                        rows="3" 
                                        placeholder="¿Cómo te sentiste hoy?"
                                        value={formData.notas} 
                                        onChange={manejarCambioInput}
                                    ></textarea>
                                </div>
                                
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn fw-bold text-dark" style={{ backgroundColor: 'var(--azulito)' }}>
                                        <i className="fa-solid fa-floppy-disk me-2"></i> 
                                        {modoEdicion ? 'Actualizar' : 'Guardar'}
                                    </button>
                                    {modoEdicion && (
                                        <button type="button" className="btn btn-outline-light" onClick={resetearFormulario}>
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    
                    <div className="col-12 col-lg-8">
                        <div className="card text-white p-4 h-100" style={{ backgroundColor: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px' }}>
                            <h4 className="mb-4">Historial de Evolución</h4>
                            
                            {cargando ? (
                                <div className="text-center mt-4">
                                    <div className="spinner-border text-info" role="status"></div>
                                </div>
                            ) : registros.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-dark table-hover align-middle" style={{ backgroundColor: 'transparent' }}>
                                        <thead>
                                            <tr>
                                                <th className="text-secondary">Fecha</th>
                                                <th className="text-secondary">Peso</th>
                                                <th className="text-secondary">Notas</th>
                                                <th className="text-secondary text-end">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {registros.map((reg) => (
                                                <tr key={reg.id}>
                                                    <td className="fw-bold">{reg.fecha}</td>
                                                    <td><span className="badge bg-info text-dark fs-6">{reg.peso} kg</span></td>
                                                    <td style={{ maxWidth: '200px' }} className="text-truncate">{reg.notas || '-'}</td>
                                                    <td className="text-end">
                                                        <button 
                                                            className="btn btn-sm btn-outline-info me-2"
                                                            onClick={() => iniciarEdicion(reg)}
                                                        >
                                                            <i className="fa-solid fa-pen"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => eliminarRegistro(reg.id)}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center text-secondary py-5">
                                    <i className="fa-solid fa-book-open-reader fa-3x mb-3"></i>
                                    <h5>No hay registros aún</h5>
                                    <p>Comienza a registrar tu peso usando el formulario.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}