import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase.js';
import './entrenador-Reportes.css';

export default function Reportes() {
    const [reportes, setReportes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos');

    const [mostrarModal, setMostrarModal] = useState(false);
    const [tipoReporte, setTipoReporte] = useState('Financiero');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [formatoSalida, setFormatoSalida] = useState('PDF');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        obtenerReportes();
    }, []);

    const obtenerReportes = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from('reportes')
                .select('*')
                .order('cod_reporte', { ascending: false });

            if (error) throw error;
            setReportes(data || []);
        } catch (error) {
            console.error("Error al obtener reportes:", error.message);
        } finally {
            setCargando(false);
        }
    };

    const totalReportes = reportes.length;
    
    const mesActual = new Date().toISOString().slice(0, 7); 
    const reportesEsteMes = reportes.filter(r => r.fecha_generado && r.fecha_generado.startsWith(mesActual)).length;

    const reportesEnProceso = reportes.filter(r => r.estado === 'En proceso').length;

    const obtenerFormatoMasUsado = () => {
        if (reportes.length === 0) return '—';
        const conteo = reportes.reduce((acc, curr) => {
            acc[curr.formato] = (acc[curr.formato] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(conteo).reduce((a, b) => conteo[a] > conteo[b] ? a : b);
    };

    const reportesFiltrados = reportes.filter(r => {
        const coincideBusqueda = (r.titulo && r.titulo.toLowerCase().includes(busqueda.toLowerCase())) ||
                                 (r.tipo && r.tipo.toLowerCase().includes(busqueda.toLowerCase()));
        const coincideTipo = filtroTipo === 'todos' || r.tipo === filtroTipo;
        return coincideBusqueda && coincideTipo;
    });

    const generarReporte = async (e) => {
        e.preventDefault();
        if (!fechaDesde || !fechaHasta) {
            setFormError('Por favor selecciona el rango de fechas.');
            return;
        }

        try {
            const nuevoTitulo = `${tipoReporte} (${fechaDesde} a ${fechaHasta})`;
            const { error } = await supabase
                .from('reportes')
                .insert([{
                    titulo: nuevoTitulo,
                    tipo: tipoReporte,
                    rango: `${fechaDesde} - ${fechaHasta}`,
                    formato: formatoSalida,
                    estado: 'Generado',
                    fecha_generado: new Date().toISOString().split('T')[0]
                }]);

            if (error) throw error;

            alert('¡Reporte generado con éxito!');
            setMostrarModal(false);
            setFechaDesde('');
            setFechaHasta('');
            setFormError('');
            obtenerReportes();
        } catch (error) {
            console.error("Error al generar reporte:", error.message);
            setFormError('Error al guardar en la base de datos.');
        }
    };

    const eliminarReporte = async (cod_reporte) => {
        if (!window.confirm('¿Estás seguro de eliminar este reporte?')) return;
        try {
            const { error } = await supabase
                .from('reportes')
                .delete()
                .eq('cod_reporte', cod_reporte);

            if (error) throw error;
            obtenerReportes();
        } catch (error) {
            console.error("Error al eliminar:", error.message);
        }
    };

    return (
        <>
            <div className="dashboard-layout reportes-page">
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
                        <Link to="/reportes" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
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
                                <h2 className="titulo">Reportes <i className="fa-solid fa-chart-column"></i></h2>
                                <p id="headerSummary">
                                    Resumen general y estadísticas de la actividad del gimnasio.
                                </p>
                            </div>
                        </div>

                        <div className="header-cards">
                            <div className="mini-card">
                                <i className="fa-solid fa-file-lines"></i>
                                <div>
                                    <h3>{totalReportes}</h3>
                                    <span>Reportes generados</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-calendar-days"></i>
                                <div>
                                    <h3>{reportesEsteMes}</h3>
                                    <span>Este mes</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-hourglass-half"></i>
                                <div>
                                    <h3>{reportesEnProceso}</h3>
                                    <span>En proceso</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-file-export"></i>
                                <div>
                                    <h3>{obtenerFormatoMasUsado()}</h3>
                                    <span>Formato más usado</span>
                                </div>
                            </div>
                        </div>
                    </section>


                    <section className="gym-goals reports-manager">
                        <div className="reports-manager-head">
                            <h3>Gestión de reportes</h3>

                            <div className="reports-manager-actions">
                                <div className="inventory-search">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Buscar reporte..." 
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                    />
                                </div>

                                <select 
                                    className="filter-select" 
                                    value={filtroTipo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                >
                                    <option value="todos">Todos los tipos</option>
                                    <option value="Financiero">Financiero</option>
                                    <option value="Asistencia">Asistencia</option>
                                    <option value="Clientes">Clientes</option>
                                    <option value="Rendimiento">Rendimiento</option>
                                </select>

                                <button className="btn-add-product" onClick={() => setMostrarModal(true)}>
                                    <i className="fa-solid fa-plus"></i>
                                    Generar reporte
                                </button>
                            </div>
                        </div>

                        <table className="inventory-table reports-table">
                            <thead>
                                <tr>
                                    <th>Reporte</th>
                                    <th>Tipo</th>
                                    <th>Rango</th>
                                    <th>Formato</th>
                                    <th>Estado</th>
                                    <th>Generado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr><td colSpan="7" className="empty-state">Cargando reportes...</td></tr>
                                ) : reportesFiltrados.length === 0 ? (
                                    <tr><td colSpan="7" className="empty-state">No se encontraron reportes que coincidan con tu búsqueda.</td></tr>
                                ) : (
                                    reportesFiltrados.map((r) => (
                                        <tr key={r.cod_reporte}>
                                            <td>{r.titulo}</td>
                                            <td>{r.tipo}</td>
                                            <td>{r.rango}</td>
                                            <td><strong>{r.formato}</strong></td>
                                            <td>
                                                <span className={`badge ${r.estado === 'Generado' ? 'badge-ok' : 'badge-low'}`}>
                                                    {r.estado}
                                                </span>
                                            </td>
                                            <td>{r.fecha_generado}</td>
                                            <td>
                                                <div className="row-actions">
                                                    <button title="Eliminar" onClick={() => eliminarReporte(r.cod_reporte)}>
                                                        <i className="fa-solid fa-trash" style={{ color: 'rgb(240,90,90)' }}></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>

                    <section className="dashboard-content reports-content">
                        <div className="upcoming-expirations recent-reports" style={{ width: '100%' }}>
                            <h3>Reportes recientes</h3>
                            <div id="recentReportsList">
                                {reportes.slice(0, 4).map(r => (
                                    <div key={`recent-${r.cod_reporte}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div>
                                            <strong style={{ display: 'block', fontSize: '0.9rem' }}>{r.titulo}</strong>
                                            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{r.tipo} • {r.fecha_generado}</span>
                                        </div>
                                        <span className={`badge ${r.estado === 'Generado' ? 'badge-ok' : 'badge-low'}`} style={{ height: 'fit-content' }}>
                                            {r.estado}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            <div className={`modal-overlay ${mostrarModal ? 'active' : ''}`}>
                <div className="modal-box" style={{ textAlign: 'left' }}>
                    <div className="modal-header">
                        <h3 style={{ margin: 0 }}>Generar reporte</h3>
                        <button className="modal-close" onClick={() => setMostrarModal(false)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <form onSubmit={generarReporte}>
                        <div className="modal-body">
                            <div className="form-group" style={{ alignItems: 'stretch' }}>
                                <label style={{ display: 'block' }}>Tipo de reporte</label>
                                <select 
                                    value={tipoReporte} 
                                    onChange={(e) => setTipoReporte(e.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    <option value="Financiero">Financiero — ingresos y pagos</option>
                                    <option value="Asistencia">Asistencia — check-ins de clientes</option>
                                    <option value="Clientes">Clientes — altas y bajas</option>
                                    <option value="Rendimiento">Rendimiento — rutinas y progreso</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group" style={{ alignItems: 'stretch' }}>
                                    <label style={{ display: 'block' }}>Desde</label>
                                    <input 
                                        type="date" 
                                        value={fechaDesde} 
                                        onChange={(e) => setFechaDesde(e.target.value)}
                                        style={{ width: '100%' }}
                                        required 
                                    />
                                </div>

                                <div className="form-group" style={{ alignItems: 'stretch' }}>
                                    <label style={{ display: 'block' }}>Hasta</label>
                                    <input 
                                        type="date" 
                                        value={fechaHasta} 
                                        onChange={(e) => setFechaHasta(e.target.value)}
                                        style={{ width: '100%' }}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ alignItems: 'stretch' }}>
                                <label style={{ display: 'block' }}>Formato de salida</label>
                                <select 
                                    value={formatoSalida} 
                                    onChange={(e) => setFormatoSalida(e.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    <option value="PDF">PDF</option>
                                    <option value="Excel">Excel</option>
                                    <option value="CSV">CSV</option>
                                </select>
                            </div>

                            {formError && <p className="form-error" style={{ color: 'rgb(240,90,90)', marginTop: '10px' }}>{formError}</p>}
                        </div>

                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button type="button" className="btn-cancel" onClick={() => setMostrarModal(false)}>Cancelar</button>
                            <button type="submit" className="btn-save">
                                <i className="fa-solid fa-bolt"></i>
                                Generar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}