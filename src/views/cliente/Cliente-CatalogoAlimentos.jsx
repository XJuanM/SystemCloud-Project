import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase'; // Asegúrate de que la ruta apunte a tu archivo de conexión
import Paginacion from '../../components/Paginacion.jsx';
import './cliente-CatalogoAlimentos.css';

const ITEMS_POR_PAGINA = 9; // 3 columnas x 3 filas

const valorONulo = (v) => (v === null || v === undefined || v === '' ? '—' : v);

const promedio = (lista, campo) => {
    const nums = lista.map((a) => Number(a[campo])).filter((n) => Number.isFinite(n));
    if (nums.length === 0) return 0;
    return nums.reduce((acc, n) => acc + n, 0) / nums.length;
};

export default function CatalogoAlimentos() {
    const [alimentos, setAlimentos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);

    useEffect(() => {
        obtenerAlimentos();
    }, []);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda]);

    const obtenerAlimentos = async () => {
        try {
            // Consulta a la tabla 'alimentos' de Supabase
            const { data, error } = await supabase
                .from('alimentos')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            setAlimentos(data || []);
        } catch (error) {
            console.error('Error al obtener los alimentos:', error.message);
        } finally {
            setCargando(false);
        }
    };

    // Filtrar alimentos por el buscador
    const alimentosFiltrados = alimentos.filter((alimento) =>
        (alimento.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
    );

    const totalPaginas = Math.max(1, Math.ceil(alimentosFiltrados.length / ITEMS_POR_PAGINA));
    const alimentosPaginados = alimentosFiltrados.slice(
        (paginaActual - 1) * ITEMS_POR_PAGINA,
        paginaActual * ITEMS_POR_PAGINA
    );

    useEffect(() => {
        if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
    }, [paginaActual, totalPaginas]);

    const promedioProteinas = promedio(alimentos, 'proteinas');
    const promedioCalorias = promedio(alimentos, 'calorias');

    return (
        <div className="dashboard-layout catalogo-page">
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
                    <Link to="/catalogo" style={{ backgroundColor: 'var(--azulito)', color: 'var(--blanco)' }}>
                        <i className="fa-solid fa-apple-whole"></i> Catálogo de Alimentos
                    </Link>
                    <Link to="/informacionGym"><i className="fa-solid fa-circle-info"></i> Información del gimnasio</Link>
                    <Link to="/"><i className="fa-solid fa-right-from-bracket"></i> Salir</Link>
                </nav>
            </aside>

            <main className="dashboard-main">
                <section className="dashboard-header">
                    <div className="header-text">
                        <div className="text">
                            <h2 className="titulo">Catálogo de Alimentos <i className="fa-solid fa-apple-whole"></i></h2>
                            <p id="headerSummary">
                                Consulta las proteínas y calorías de cada alimento para organizar mejor tu alimentación.
                            </p>
                        </div>
                    </div>

                    <div className="header-cards">
                        <div className="mini-card">
                            <i className="fa-solid fa-basket-shopping"></i>
                            <div>
                                <h3>{alimentos.length}</h3>
                                <span>Alimentos</span>
                            </div>
                        </div>

                        <div className="mini-card">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <div>
                                <h3>{alimentosFiltrados.length}</h3>
                                <span>Resultados</span>
                            </div>
                        </div>

                        <div className="mini-card">
                            <i className="fa-solid fa-drumstick-bite"></i>
                            <div>
                                <h3>{promedioProteinas.toFixed(1)} g</h3>
                                <span>Proteína promedio</span>
                            </div>
                        </div>

                        <div className="mini-card">
                            <i className="fa-solid fa-fire"></i>
                            <div>
                                <h3>{Math.round(promedioCalorias)}</h3>
                                <span>Kcal promedio</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dashboard-content catalogo-content">
                    <div className="inventory-table-wrap cat-table-wrap">
                        <div className="inventory-table-head">
                            <h3>Alimentos disponibles</h3>

                            <div className="inventory-search">
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <input
                                    type="text"
                                    placeholder="Buscar alimento..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>

                        {cargando ? (
                            <p className="empty-state">Cargando base de datos nutricional...</p>
                        ) : alimentosFiltrados.length === 0 ? (
                            <p className="empty-state">No se encontraron alimentos con ese nombre.</p>
                        ) : (
                            <>
                                <div className="cat-grid">
                                    {alimentosPaginados.map((item) => (
                                        <article className="cat-card" key={item.id_alimento}>
                                            <div className="cat-card-top">
                                                <div className="cat-icon">
                                                    <i className="fa-solid fa-apple-whole"></i>
                                                </div>
                                                <div className="cat-title">
                                                    <h4 title={item.nombre}>{item.nombre || 'Sin nombre'}</h4>
                                                    <span>ID Alimento: {item.id_alimento}</span>
                                                </div>
                                            </div>

                                            <div className="cat-stats">
                                                <div>
                                                    <small><i className="fa-solid fa-drumstick-bite"></i> Proteínas</small>
                                                    <strong>{valorONulo(item.proteinas)} <em>g</em></strong>
                                                </div>
                                                <div>
                                                    <small><i className="fa-solid fa-fire"></i> Calorías</small>
                                                    <strong>{valorONulo(item.calorias)} <em>kcal</em></strong>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                <Paginacion
                                    paginaActual={paginaActual}
                                    totalPaginas={totalPaginas}
                                    onCambiarPagina={setPaginaActual}
                                />
                            </>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
