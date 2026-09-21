import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import '../views/inventario.css';

export default function Inventario() {
    // Estados para los datos
    const [inventario, setInventario] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    // Estados para modales
    const [mostrarModal, setMostrarModal] = useState(false);
    const [itemSeleccionado, setItemSeleccionado] = useState(null);

    // Cargar inventario al montar el componente
    useEffect(() => {
        obtenerInventario();
    }, []);

    const obtenerInventario = async () => {
        try {
            setCargando(true);
            // Consulta relacional correcta basada en tus tablas 'inventario_maquinas' y 'maquinas'
            const { data, error } = await supabase
                .from('inventario_maquinas')
                .select(`
                    cod_inventario,
                    id_maquina,
                    estado,
                    cantidad,
                    fecha_mantenimiento,
                    maquinas (
                        nombre,
                        descripcion,
                        musculo_enfoque
                    )
                `)
                .order('cod_inventario', { ascending: true });

            if (error) throw error;
            setInventario(data || []);
        } catch (error) {
            console.error("Error al obtener inventario:", error.message);
        } finally {
            setCargando(false);
        }
    };

    // Filtro de búsqueda seguro evaluando el nombre relacionado de la máquina
    const inventarioFiltrado = inventario.filter(item => {
        const nombreMaquina = item.maquinas?.nombre || '';
        return nombreMaquina.toLowerCase().includes(busqueda.toLowerCase());
    });

    // Cálculos de estadísticas para las tarjetas superiores
    const totalEquipos = inventario.length;
    const totalUnidades = inventario.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);
    const equiposEnMantenimiento = inventario.filter(i => i.estado === 'En mantenimiento').length;
    const equiposFueraServicio = inventario.filter(i => i.estado === 'Fuera de servicio').length;

    // Funciones de Modales
    const abrirModalNuevo = () => {
        setItemSeleccionado(null);
        setMostrarModal(true);
    };

    const abrirModalEditar = (item) => {
        setItemSeleccionado(item);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
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
                        <Link to="/clases"><i className="fa-solid fa-people-group"></i>Clases</Link>
                        <Link to="/inventario" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
                            <i className="fa-solid fa-box"></i>Inventario
                        </Link>
                        <Link to="/reportes"><i className="fa-solid fa-bug"></i>Reportes</Link>
                        <Link to="/"><i className="fa-solid fa-right-from-bracket"></i>Salir</Link>
                    </nav>
                </aside>

                <main className="dashboard-main">
                    <section className="dashboard-header">
                        <div className="header-text">
                            <div className="text">
                                <h2 className="titulo">Inventario <i className="fa-solid fa-box"></i></h2>
                                <p id="headerSummary">
                                    Gestiona el estado y mantenimiento de todas las máquinas y equipos del gimnasio.
                                </p>
                            </div>
                        </div>

                        <div className="header-cards">
                            <div className="mini-card">
                                <i className="fa-solid fa-boxes-stacked"></i>
                                <div>
                                    <h3 id="statTotalProducts">{totalEquipos}</h3>
                                    <span>Modelos de Máquinas</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-dumbbell"></i>
                                <div>
                                    <h3 id="statTotalValue">{totalUnidades}</h3>
                                    <span>Unidades Totales</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-screwdriver-wrench"></i>
                                <div>
                                    <h3 id="statLowStock">{equiposEnMantenimiento}</h3>
                                    <span>En Mantenimiento</span>
                                </div>
                            </div>

                            <div className="mini-card" style={{ borderColor: equiposFueraServicio > 0 ? 'rgba(230,60,60,.5)' : ''}}>
                                <i className="fa-solid fa-triangle-exclamation" style={{ color: equiposFueraServicio > 0 ? 'rgb(240,90,90)' : '' }}></i>
                                <div>
                                    <h3 id="statMovements">{equiposFueraServicio}</h3>
                                    <span>Fuera de Servicio</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="dashboard-content inventory-content">
                        <div className="inventory-table-wrap">
                            <div className="inventory-table-head">
                                <h3>Equipos en stock</h3>

                                <div className="inventory-search">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nombre..." 
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                    />
                                </div>

                                <button className="btn-add-product" onClick={abrirModalNuevo}>
                                    <i className="fa-solid fa-plus"></i>
                                    Nuevo equipo
                                </button>
                            </div>

                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th>Equipo</th>
                                        <th>Cantidad</th>
                                        <th>Estado</th>
                                        <th>Fecha Mantenimiento</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargando ? (
                                        <tr><td colSpan="5" className="empty-state">Cargando inventario...</td></tr>
                                    ) : inventarioFiltrado.length === 0 ? (
                                        <tr><td colSpan="5" className="empty-state">No se encontraron equipos que coincidan con tu búsqueda.</td></tr>
                                    ) : (
                                        inventarioFiltrado.map((item) => (
                                            <tr key={item.cod_inventario}>
                                                <td>
                                                    <div className="product-cell">
                                                        <div className="product-icon">
                                                            <i className="fa-solid fa-dumbbell"></i>
                                                        </div>
                                                        <div>
                                                            <span className="product-name">{item.maquinas?.nombre || 'Sin nombre'}</span>
                                                            <span className="product-sku">ID Máquina: {item.id_maquina}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="stock-qty">{item.cantidad}</span>
                                                    <span className="stock-unit">uds</span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        item.estado === 'Disponible' ? 'badge-ok' : 
                                                        item.estado === 'En mantenimiento' ? 'badge-low' : 'badge-out'
                                                    }`}>
                                                        {item.estado}
                                                    </span>
                                                </td>
                                                <td>{item.fecha_mantenimiento || 'Sin programar'}</td>
                                                <td>
                                                    <div className="row-actions">
                                                        <button title="Editar" onClick={() => abrirModalEditar(item)}>
                                                            <i className="fa-solid fa-pen"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="upcoming-expirations stock-alerts" style={{ height: 'auto', minHeight: '400px' }}>
                            <h3 style={{ textAlign: 'left', marginBottom: '20px' }}>Alertas de Mantenimiento</h3>
                            <div id="alertsList" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {equiposEnMantenimiento === 0 && equiposFueraServicio === 0 ? (
                                    <p className="empty-state" style={{ textAlign: 'left' }}>Todos los equipos operan con normalidad.</p>
                                ) : (
                                    inventario
                                        .filter(i => i.estado !== 'Disponible')
                                        .slice(0, 5)
                                        .map(alerta => (
                                            <div className="alert-card" key={`alert-${alerta.cod_inventario}`} style={{ display: 'flex', alignItems: 'center', textAlign: 'left', width: '100%' }}>
                                                <div className={`alert-icon ${alerta.estado === 'En mantenimiento' ? 'warn' : 'danger'}`} style={{ marginRight: '14px', flexShrink: 0 }}>
                                                    <i className="fa-solid fa-wrench"></i>
                                                </div>
                                                <div style={{ overflow: 'hidden', width: '100%' }}>
                                                    <h4 style={{ margin: 0, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {alerta.maquinas?.nombre || 'Máquina'}
                                                    </h4>
                                                    <span style={{ fontSize: '0.8rem', color: 'rgb(170,170,170)', display: 'block' }}>
                                                        {alerta.estado} - Programado: {alerta.fecha_mantenimiento}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            <div className={`modal-overlay ${mostrarModal ? 'active' : ''}`}>
                <div className="modal-box" style={{ textAlign: 'left' }}>
                    <div className="modal-header">
                        <h3 style={{ margin: 0 }}>{itemSeleccionado ? 'Editar Equipo' : 'Nuevo Equipo'}</h3>
                        <button className="modal-close" onClick={cerrarModal}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="form-group" style={{ alignItems: 'stretch' }}>
                            <label style={{ textAlign: 'left', display: 'block' }}>Nombre del equipo</label>
                            <input 
                                type="text" 
                                defaultValue={itemSeleccionado?.maquinas?.nombre || ''} 
                                placeholder="Ej. Press de pecho" 
                                style={{ width: '100%' }} 
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ alignItems: 'stretch' }}>
                                <label style={{ textAlign: 'left', display: 'block' }}>ID Máquina (Ref)</label>
                                <input 
                                    type="number" 
                                    defaultValue={itemSeleccionado?.id_maquina || ''} 
                                    placeholder="Ej. 1" 
                                    style={{ width: '100%' }} 
                                />
                            </div>

                            <div className="form-group" style={{ alignItems: 'stretch' }}>
                                <label style={{ textAlign: 'left', display: 'block' }}>Estado</label>
                                <select 
                                    defaultValue={itemSeleccionado?.estado || 'Disponible'} 
                                    style={{ width: '100%' }}
                                >
                                    <option value="Disponible">Disponible</option>
                                    <option value="En mantenimiento">En mantenimiento</option>
                                    <option value="Fuera de servicio">Fuera de servicio</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ alignItems: 'stretch' }}>
                                <label style={{ textAlign: 'left', display: 'block' }}>Cantidad</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    defaultValue={itemSeleccionado?.cantidad || ''} 
                                    placeholder="0" 
                                    style={{ width: '100%' }} 
                                />
                            </div>

                            <div className="form-group" style={{ alignItems: 'stretch' }}>
                                <label style={{ textAlign: 'left', display: 'block' }}>Fecha Mantenimiento</label>
                                <input 
                                    type="date" 
                                    defaultValue={itemSeleccionado?.fecha_mantenimiento || ''} 
                                    style={{ width: '100%' }} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions" style={{ marginTop: '20px' }}>
                        <button className="btn-cancel" onClick={cerrarModal}>Cancelar</button>
                        <button className="btn-save">Guardar equipo</button>
                    </div>
                </div>
            </div>
        </>
    );
}