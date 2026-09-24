import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';

export default function MisClasesCliente() {
    const [clasesDisponibles, setClasesDisponibles] = useState([]);
    const [misClasesIds, setMisClasesIds] = useState([]); 
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [vistaActual, setVistaActual] = useState('todas'); 

    useEffect(() => {
        obtenerClases();
    }, []);

    const obtenerClases = async () => {
        try {
            const { data, error } = await supabase
                .from('clases')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            setClasesDisponibles(data);
        } catch (error) {
            console.error('Error al obtener las clases:', error.message);
        } finally {
            setCargando(false);
        }
    };

    // Funciones para inscribirse o cancelar
    const inscribirse = (idClase) => {
        setMisClasesIds([...misClasesIds, idClase]);
    };

    const cancelarInscripcion = (idClase) => {
        setMisClasesIds(misClasesIds.filter(id => id !== idClase));
    };

    // Lógica de filtrado
    const clasesA_Mostrar = clasesDisponibles.filter(clase => {
        if (vistaActual === 'inscritas' && !misClasesIds.includes(clase.cod_clase)) return false;
        
        return clase.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
               clase.entrenador_encargado.toLowerCase().includes(busqueda.toLowerCase());
    });

    return (
        <div className="dashboard-layout">
            {/* BARRA LATERAL DEL CLIENTE */}
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
                    <Link to="/mis-clases" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
                        <i className="fa-solid fa-calendar-days"></i> Mis clases
                    </Link>
                    <Link to="/progreso"><i className="fa-solid fa-chart-line"></i> Mi progreso</Link>
                    <Link to="/catalogo"><i className="fa-solid fa-apple-whole"></i> Catálogo</Link>
                    <Link to="/informacionGym"><i className="fa-solid fa-circle-info"></i> Información del gimnasio</Link>
                    <Link to="/"><i className="fa-solid fa-right-from-bracket"></i> Salir</Link>
                </nav>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="dashboard-main p-4 w-100" style={{ overflowY: 'auto' }}>
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <h2 className="text-white m-0">
                        <i className="fa-solid fa-calendar-days me-2" style={{ color: 'var(--azulito)' }}></i>
                        Gestión de Clases
                    </h2>
                    
                    <div className="d-flex gap-3 align-items-center flex-wrap">
                        <div className="btn-group" role="group">
                            <button 
                                type="button" 
                                className={`btn ${vistaActual === 'todas' ? 'btn-info text-dark fw-bold' : 'btn-outline-info text-white'}`}
                                onClick={() => setVistaActual('todas')}
                            >
                                Todas las clases
                            </button>
                            <button 
                                type="button" 
                                className={`btn ${vistaActual === 'inscritas' ? 'btn-info text-dark fw-bold' : 'btn-outline-info text-white'}`}
                                onClick={() => setVistaActual('inscritas')}
                            >
                                Mis Clases ({misClasesIds.length})
                            </button>
                        </div>

                        <input 
                            type="text" 
                            className="form-control bg-dark text-white border-secondary" 
                            placeholder="Buscar clase o entrenador..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{ minWidth: '220px', maxWidth: '300px' }}
                        />
                    </div>
                </div>

                {cargando ? (
                    <div className="text-center text-white mt-5">
                        <div className="spinner-border text-info" role="status"></div>
                        <p className="mt-2">Cargando catálogo de clases...</p>
                    </div>
                ) : (
                    <div className="row g-3">
                        {clasesA_Mostrar.length > 0 ? (
                            clasesA_Mostrar.map((clase) => {
                                const estaInscrito = misClasesIds.includes(clase.cod_clase);
                                
                                return (
                                    <div key={clase.cod_clase} className="col-12 col-md-6 col-lg-4">
                                        <div className={`card h-100 ${estaInscrito ? 'border-info' : ''}`} style={{ backgroundColor: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px' }}>
                                            <div className="card-body text-white d-flex flex-column">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <h5 className="card-title text-info fw-bold m-0">{clase.nombre}</h5>
                                                    {estaInscrito && <span className="badge bg-info text-dark">Inscrito</span>}
                                                </div>
                                                
                                                <div className="d-flex align-items-center mb-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                                                    <i className="fa-solid fa-location-dot me-2 text-secondary"></i>
                                                    <span>{clase.salon}</span>
                                                </div>
                                                
                                                <div className="d-flex align-items-center mt-2 mb-3">
                                                    <i className="fa-solid fa-user-tie me-2 text-secondary"></i>
                                                    <div>
                                                        <span className="text-secondary small d-block" style={{ lineHeight: '1' }}>Entrenador</span>
                                                        <span className="fw-bold">{clase.entrenador_encargado}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto">
                                                    {estaInscrito ? (
                                                        <button 
                                                            className="btn btn-outline-danger w-100"
                                                            onClick={() => cancelarInscripcion(clase.cod_clase)}
                                                        >
                                                            <i className="fa-solid fa-xmark me-2"></i> Cancelar clase
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className="btn btn-success w-100"
                                                            onClick={() => inscribirse(clase.cod_clase)}
                                                            disabled={clase.estado !== 'Activa'}
                                                        >
                                                            <i className="fa-solid fa-plus me-2"></i> Inscribirme
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-12 text-center text-secondary mt-4">
                                <h5>
                                    {vistaActual === 'inscritas' 
                                        ? "Aún no te has inscrito a ninguna clase." 
                                        : "No se encontraron clases disponibles."}
                                </h5>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}