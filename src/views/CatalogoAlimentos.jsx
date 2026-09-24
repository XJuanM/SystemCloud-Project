import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase'; // Asegúrate de que la ruta apunte a tu archivo de conexión

export default function CatalogoAlimentos() {
    const [alimentos, setAlimentos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        obtenerAlimentos();
    }, []);

    const obtenerAlimentos = async () => {
        try {
            // Consulta a la tabla 'alimentos' de Supabase
            const { data, error } = await supabase
                .from('alimentos')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            setAlimentos(data);
        } catch (error) {
            console.error('Error al obtener los alimentos:', error.message);
        } finally {
            setCargando(false);
        }
    };

    // Filtrar alimentos por el buscador
    const alimentosFiltrados = alimentos.filter(alimento =>
        alimento.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

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
                    <Link to="/progreso"><i className="fa-solid fa-chart-line"></i> Mi progreso</Link>
                    <Link to="/catalogo" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
                        <i className="fa-solid fa-apple-whole"></i> Catálogo
                    </Link>
                    <Link to="/informacionGym"><i className="fa-solid fa-circle-info"></i> Información del gimnasio</Link>
                    <Link to="/"><i className="fa-solid fa-right-from-bracket"></i> Salir</Link>
                </nav>
            </aside>

            <main className="dashboard-main p-4 w-100" style={{ overflowY: 'auto' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="text-white m-0">
                        <i className="fa-solid fa-apple-whole me-2" style={{ color: 'var(--azulito)' }}></i>
                        Catálogo de Alimentos
                    </h2>

                    <div className="search-bar">
                        <input
                            type="text"
                            className="form-control bg-dark text-white border-secondary"
                            placeholder="Buscar alimento..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{ minWidth: '250px' }}
                        />
                    </div>
                </div>

                {cargando ? (
                    <div className="text-center text-white mt-5">
                        <div className="spinner-border text-info" role="status"></div>
                        <p className="mt-2">Cargando base de datos nutricional...</p>
                    </div>
                ) : (
                    <div className="row g-3">
                        {alimentosFiltrados.length > 0 ? (
                            alimentosFiltrados.map((item) => (
                                <div key={item.id_alimento} className="col-12 col-md-6 col-lg-4 col-xl-3">
                                    <div className="card h-100" style={{ backgroundColor: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px' }}>
                                        <div className="card-body text-white">
                                            <h5 className="card-title text-info fw-bold mb-3">{item.nombre}</h5>

                                            <div className="d-flex justify-content-between mb-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                                                <span className="text-secondary small">Proteínas</span>
                                                <span className="fw-bold">{item.proteinas} g</span>
                                            </div>

                                            <div className="d-flex justify-content-between">
                                                <span className="text-secondary small">Calorías</span>
                                                <span className="fw-bold">{item.calorias} kcal</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center text-secondary mt-4">
                                <h5>No se encontraron alimentos con ese nombre.</h5>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}