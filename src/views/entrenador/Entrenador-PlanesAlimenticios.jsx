import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase.js';
import Paginacion from '../../components/Paginacion.jsx';
import './entrenador-PlanesAlimenticios.css';

const ITEMS_POR_PAGINA = 8;

export default function PlanesAlimenticios() {
    const [planes, setPlanes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);

    const [planSeleccionado, setPlanSeleccionado] = useState({
        cod_dieta: '',
        id_usuario: '',
        nombre: '',
        objetivo: '',
        tipo_dieta: 'Normal',
        duracion: '8 semanas',
        calorias_objetivo: '',
        observaciones: '',
        usuarios: { nombre_completo: '' },
        total_calorias: 0
    });

    const [nuevoPlan, setNuevoPlan] = useState({
        id_usuario: '',
        nombre: '',
        objetivo: '',
        tipo_dieta: 'Normal',
        duracion: '8 semanas',
        calorias_objetivo: '',
        observaciones: ''
    });

    const [alimentos, setAlimentos] = useState([]);

    const [detalleDietaSeleccionada, setDetalleDietaSeleccionada] = useState([]);

    const [nuevoDetalleAlimento, setNuevoDetalleAlimento] = useState({
        id_alimento: '',
        cantidad: ''
    });

    useEffect(() => {
        obtenerDatos();
    }, []);

    const obtenerDatos = async () => {
        try {
            console.log("Cargando datos desde Supabase...");

            const { data: usuariosData, error: errorUsuarios } = await supabase
                .from('usuarios')
                .select('*')
                .range(0, 999);

            if (errorUsuarios) throw errorUsuarios;
            setUsuarios(usuariosData || []);

            const { data: alimentosData, error: errorAlimentos } = await supabase
                .from('alimentos')
                .select('*')
                .range(0, 999);

            if (errorAlimentos) throw errorAlimentos;
            setAlimentos(alimentosData || []);

            const { data: dietasData, error: errorDietas } = await supabase
                .from('dietas')
                .select('*')
                .range(0, 999)
                .order('cod_dieta', { ascending: true });

            if (errorDietas) throw errorDietas;
            let detalleData = [];
            let errorDetalle = null;
            const TAM_PAGINA = 1000;
            let pagina = 0;

            while (true) {
                const desde = pagina * TAM_PAGINA;
                const hasta = desde + TAM_PAGINA - 1;

                const { data: bloque, error: errorBloque } = await supabase
                    .from('detalle_dieta')
                    .select('cod_dieta, caloriastotales')
                    .range(desde, hasta);

                if (errorBloque) {
                    errorDetalle = errorBloque;
                    break;
                }

                if (!bloque || bloque.length === 0) break;

                detalleData = detalleData.concat(bloque);

                if (bloque.length < TAM_PAGINA) break;

                pagina++;
            }

            if (errorDetalle) {
                console.warn("Aviso al cargar detalle_dieta:", errorDetalle.message);
            }

            console.log("Dietas obtenidas:", dietasData?.length);
            console.log("Detalles obtenidos:", detalleData?.length);

            const planesConCalculos = (dietasData || []).map((plan) => {
                const idPlanUsuario = plan.id_usuario !== null && plan.id_usuario !== undefined ? String(plan.id_usuario).trim() : '';
                
                const clienteEncontrado = (usuariosData || []).find(cli => {
                    const idCli = cli.id_usuario !== null && cli.id_usuario !== undefined ? String(cli.id_usuario).trim() : 
                                  (cli.id !== null && cli.id !== undefined ? String(cli.id).trim() : '');
                    return idCli === idPlanUsuario && idCli !== '';
                });

                const nombreCompleto = clienteEncontrado?.nombre_apellido || clienteEncontrado?.nombre || 'Sin asignar';

                const alimentosDelPlan = (detalleData || []).filter(d => 
                    d && Number(d.cod_dieta) === Number(plan.cod_dieta)
                );

                const sumaCalorias = alimentosDelPlan.reduce((acc, item) => {
                    const cals = Number(item?.caloriastotales) || 0;
                    return acc + cals;
                }, 0);

                const tieneObjetivo = plan.calorias_objetivo !== null && plan.calorias_objetivo !== undefined && plan.calorias_objetivo !== '';
                const caloriasBaseObjetivo = tieneObjetivo ? Number(plan.calorias_objetivo) : null;
                const caloriasFinales = sumaCalorias > 0
                    ? sumaCalorias
                    : (caloriasBaseObjetivo !== null ? caloriasBaseObjetivo : null);

                return {
                    ...plan,
                    total_calorias: caloriasFinales,
                    usuarios: {
                        nombre_completo: nombreCompleto
                    }
                };
            });

            console.log("Planes listos para pintar en tabla:", planesConCalculos);
            setPlanes(planesConCalculos);

        } catch (error) {
            console.error("Error crítico al obtener los datos:", error.message);
        }
    };

    const guardarNuevoPlan = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('dietas')
                .insert([
                    {
                        id_usuario: nuevoPlan.id_usuario,
                        nombre: nuevoPlan.nombre,
                        objetivo: nuevoPlan.objetivo,
                        tipo_dieta: nuevoPlan.tipo_dieta,
                        duracion: nuevoPlan.duracion,
                        calorias_objetivo: nuevoPlan.calorias_objetivo ? Number(nuevoPlan.calorias_objetivo) : null,
                        observaciones: nuevoPlan.observaciones
                    }
                ]);

            if (error) throw error;

            alert("Plan alimenticio creado con éxito");
            setNuevoPlan({
                id_usuario: '',
                nombre: '',
                objetivo: '',
                tipo_dieta: 'Normal',
                duracion: '8 semanas',
                calorias_objetivo: '',
                observaciones: ''
            });
            obtenerDatos();
        } catch (error) {
            alert("Error al guardar el plan: " + error.message);
        }
    };

    const cargarDetalleDieta = async (cod_dieta) => {
        try {
            const { data, error } = await supabase
                .from('detalle_dieta')
                .select('*')
                .eq('cod_dieta', cod_dieta);

            if (error) throw error;

            const detalleConAlimento = (data || []).map(item => {
                const alimentoEncontrado = alimentos.find(a =>
                    String(a.id_alimento) === String(item.id_alimento)
                );
                return {
                    ...item,
                    alimento_nombre: alimentoEncontrado?.nombre || 'Alimento no encontrado'
                };
            });

            setDetalleDietaSeleccionada(detalleConAlimento);
        } catch (error) {
            console.error("Error al cargar el detalle de la dieta:", error.message);
            setDetalleDietaSeleccionada([]);
        }
    };

    const abrirPlan = (plan) => {
        setPlanSeleccionado(plan);
        setNuevoDetalleAlimento({ id_alimento: '', cantidad: '' });
        cargarDetalleDieta(plan.cod_dieta);
    };

    const agregarAlimentoADieta = async (e) => {
        e.preventDefault();

        if (!nuevoDetalleAlimento.id_alimento) {
            alert("Selecciona un alimento del catálogo");
            return;
        }

        const cantidad = Number(nuevoDetalleAlimento.cantidad) || 0;
        if (cantidad <= 0) {
            alert("Ingresa una cantidad válida");
            return;
        }

        const alimentoElegido = alimentos.find(a => String(a.id_alimento) === String(nuevoDetalleAlimento.id_alimento));
        const caloriasUnitarias = Number(alimentoElegido?.calorias) || 0;
        const proteinasUnitarias = Number(alimentoElegido?.proteinas) || 0;

        try {
            const { error } = await supabase
                .from('detalle_dieta')
                .insert([
                    {
                        cod_dieta: planSeleccionado.cod_dieta,
                        id_alimento: nuevoDetalleAlimento.id_alimento,
                        cantidad: cantidad,
                        caloriastotales: Math.round(caloriasUnitarias * cantidad),
                        proteinastotales: Math.round(proteinasUnitarias * cantidad)
                    }
                ]);

            if (error) throw error;

            setNuevoDetalleAlimento({ id_alimento: '', cantidad: '' });
            await cargarDetalleDieta(planSeleccionado.cod_dieta);
            obtenerDatos();
        } catch (error) {
            alert("Error al agregar el alimento: " + error.message);
        }
    };

    const eliminarAlimentoDeDieta = async (cod_detalled) => {
        try {
            const { error } = await supabase
                .from('detalle_dieta')
                .delete()
                .eq('cod_detalled', cod_detalled);

            if (error) throw error;
            await cargarDetalleDieta(planSeleccionado.cod_dieta);
            obtenerDatos();
        } catch (error) {
            alert("Error al eliminar el alimento: " + error.message);
        }
    };

    const actualizarPlan = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('dietas')
                .update({
                    nombre: planSeleccionado.nombre,
                    objetivo: planSeleccionado.objetivo,
                    tipo_dieta: planSeleccionado.tipo_dieta,
                    duracion: planSeleccionado.duracion,
                    calorias_objetivo: planSeleccionado.calorias_objetivo ? Number(planSeleccionado.calorias_objetivo) : null,
                    observaciones: planSeleccionado.observaciones
                })
                .eq('cod_dieta', planSeleccionado.cod_dieta);

            if (error) throw error;

            alert("Plan alimenticio actualizado con éxito");
            obtenerDatos();
        } catch (error) {
            alert("Error al actualizar: " + error.message);
        }
    };

    const planesFiltradas = planes.filter(p => 
        (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
        (p.objetivo && p.objetivo.toLowerCase().includes(busqueda.toLowerCase())) ||
        (p.usuarios?.nombre_completo && p.usuarios.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()))
    );

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda]);

    const totalPaginas = Math.max(1, Math.ceil(planesFiltradas.length / ITEMS_POR_PAGINA));
    const planesPaginadas = planesFiltradas.slice(
        (paginaActual - 1) * ITEMS_POR_PAGINA,
        paginaActual * ITEMS_POR_PAGINA
    );

    return (
        <>
            <div className="dashboard-layout planes-page">
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
                        <Link to="/planes" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
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
                                    Aquí puedes gestionar los planes alimenticios de tus clientes: asignar comidas por
                                    día, controlar calorías y hacer seguimiento del tipo de dieta de cada uno.
                                </p>
                            </div>
                        </div>

                        <section className="routine-manager">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h3 className="m-0">Gestión de Planes Alimenticios</h3>
                                    <button 
                                        className="btn btn-success" 
                                        data-bs-toggle="modal" 
                                        data-bs-target="#modalCrearPlan"
                                    >
                                        <i className="fa-solid fa-plus me-2"></i> Nuevo Plan
                                    </button>
                                </div>

                                <div className="card-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="Buscar por cliente, plan u objetivo..."
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
                                                    <th>Plan</th>
                                                    <th>Dieta / Calorías Totales</th>
                                                    <th>Estado</th>
                                                    <th className="text-center">Acciones</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {planesPaginadas && planesPaginadas.length > 0 ? (
                                                    planesPaginadas.map((plan) => (
                                                        <tr key={plan.cod_dieta}>
                                                            <td>{plan.cod_dieta}</td>
                                                            <td>
                                                                {plan.usuarios?.nombre_completo && plan.usuarios.nombre_completo !== 'Sin asignar' 
                                                                    ? plan.usuarios.nombre_completo 
                                                                    : <span className="text-danger">Sin asignar</span>
                                                                }
                                                            </td>
                                                            <td>{plan.objetivo || 'Sin objetivo'}</td>
                                                            <td>{plan.nombre || 'Sin nombre'}</td>
                                                            <td>
                                                                {plan.tipo_dieta || 'Normal'} (
                                                                {plan.total_calorias !== null && plan.total_calorias !== undefined
                                                                    ? `${plan.total_calorias} kcal`
                                                                    : <span className="text-muted">sin datos</span>
                                                                })
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-success">Activo</span>
                                                            </td>
                                                            <td className="text-center">
                                                                <button 
                                                                    className="btn btn-info btn-sm me-2"
                                                                    data-bs-toggle="modal" 
                                                                    data-bs-target="#modalVerPlan"
                                                                    onClick={() => abrirPlan(plan)}
                                                                >
                                                                    <i className="fa-solid fa-eye"></i>
                                                                </button>
                                                                <button 
                                                                    className="btn btn-primary btn-sm me-2"
                                                                    data-bs-toggle="modal" 
                                                                    data-bs-target="#modalGestionarAlimentos"
                                                                    onClick={() => abrirPlan(plan)}
                                                                    title="Gestionar alimentos"
                                                                >
                                                                    <i className="fa-solid fa-apple-whole"></i>
                                                                </button>
                                                                <button 
                                                                    className="btn btn-warning btn-sm"
                                                                    data-bs-toggle="modal" 
                                                                    data-bs-target="#modalEditarPlan"
                                                                    onClick={() => setPlanSeleccionado(plan)}
                                                                >
                                                                    <i className="fa-solid fa-pen"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="text-center text-muted py-3">
                                                            No se encontraron planes alimenticios registrados o cargando datos...
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <Paginacion
                                        paginaActual={paginaActual}
                                        totalPaginas={totalPaginas}
                                        onCambiarPagina={setPaginaActual}
                                    />
                                </div>
                            </div>
                        </section>
                    </section>
                </main>
            </div>

            {/* MODAL CREAR NUEVO PLAN */}
            <div className="modal fade" id="modalCrearPlan" tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Asignar Nuevo Plan Alimenticio</h5>
                            <button className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form onSubmit={guardarNuevoPlan}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Seleccionar Cliente</label>
                                    <select 
                                        className="form-select"
                                        required
                                        value={nuevoPlan.id_usuario}
                                        onChange={(e) => setNuevoPlan({...nuevoPlan, id_usuario: e.target.value})}
                                    >
                                        <option value="">-- Seleccione un usuario --</option>
                                        {usuarios.map((u) => {
                                            const idVal = u.id_usuario || u.id;
                                            const nombreVal = u.nombre_apellido || u.nombre || 'Sin nombre';
                                            return (
                                                <option key={idVal} value={idVal}>
                                                    {nombreVal} (ID: {idVal})
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Nombre del Plan</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Ej. Volumen Limpio"
                                            required
                                            value={nuevoPlan.nombre}
                                            onChange={(e) => setNuevoPlan({...nuevoPlan, nombre: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Objetivo</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Ej. Ganar masa muscular"
                                            required
                                            value={nuevoPlan.objetivo}
                                            onChange={(e) => setNuevoPlan({...nuevoPlan, objetivo: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Duración</label>
                                        <select 
                                            className="form-select"
                                            value={nuevoPlan.duracion}
                                            onChange={(e) => setNuevoPlan({...nuevoPlan, duracion: e.target.value})}
                                        >
                                            <option>4 semanas</option>
                                            <option>8 semanas</option>
                                            <option>12 semanas</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Tipo de Dieta</label>
                                        <select 
                                            className="form-select"
                                            value={nuevoPlan.tipo_dieta}
                                            onChange={(e) => setNuevoPlan({...nuevoPlan, tipo_dieta: e.target.value})}
                                        >
                                            <option>Normal</option>
                                            <option>Vegetariana</option>
                                            <option>Vegana</option>
                                            <option>Keto</option>
                                            <option>Alta en proteína</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Calorías Objetivo (Opcional)</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            placeholder="Ej. 2500"
                                            value={nuevoPlan.calorias_objetivo}
                                            onChange={(e) => setNuevoPlan({...nuevoPlan, calorias_objetivo: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label">Observaciones</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="3"
                                            value={nuevoPlan.observaciones}
                                            onChange={(e) => setNuevoPlan({...nuevoPlan, observaciones: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-success" data-bs-dismiss="modal">Guardar Plan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="modalVerPlan" tabIndex="-1">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Detalle del Plan Alimenticio</h5>
                            <button className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <h4>Cliente: {planSeleccionado.usuarios?.nombre_completo}</h4>
                            <p className="text-info fw-semibold">Objetivo: {planSeleccionado.objetivo}</p>
                            <p className="fw-semibold">
                                Plan: {planSeleccionado.nombre} | Dieta: {planSeleccionado.tipo_dieta} | Calorías Totales: {
                                    planSeleccionado.total_calorias !== null && planSeleccionado.total_calorias !== undefined
                                        ? `${planSeleccionado.total_calorias} kcal`
                                        : 'sin datos'
                                }
                            </p>
                            <hr />
                            <h5>Observaciones y Directrices:</h5>
                            <p>{planSeleccionado.observaciones || 'Sin observaciones registradas.'}</p>
                            <hr />
                            <h5>Alimentos asignados</h5>
                            {detalleDietaSeleccionada.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Alimento</th>
                                                <th>Cantidad</th>
                                                <th>Calorías totales</th>
                                                <th>Proteínas totales</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detalleDietaSeleccionada.map((item) => (
                                                <tr key={item.cod_detalled}>
                                                    <td>{item.alimento_nombre}</td>
                                                    <td>{item.cantidad ?? '-'}</td>
                                                    <td>{item.caloriastotales ?? '-'} kcal</td>
                                                    <td>{item.proteinastotales ?? '-'} g</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted">Este plan todavía no tiene alimentos asignados.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL GESTIONAR ALIMENTOS DE LA DIETA */}
            <div className="modal fade" id="modalGestionarAlimentos" tabIndex="-1">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                Alimentos de: {planSeleccionado.nombre || 'Plan'}
                                {planSeleccionado.usuarios?.nombre_completo ? ` — ${planSeleccionado.usuarios.nombre_completo}` : ''}
                            </h5>
                            <button className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="table-responsive mb-4">
                                <table className="table table-sm table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Alimento</th>
                                            <th>Cantidad</th>
                                            <th>Calorías totales</th>
                                            <th>Proteínas totales</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detalleDietaSeleccionada.length > 0 ? (
                                            detalleDietaSeleccionada.map((item) => (
                                                <tr key={item.cod_detalled}>
                                                    <td>{item.alimento_nombre}</td>
                                                    <td>{item.cantidad ?? '-'}</td>
                                                    <td>{item.caloriastotales ?? '-'} kcal</td>
                                                    <td>{item.proteinastotales ?? '-'} g</td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => eliminarAlimentoDeDieta(item.cod_detalled)}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted py-3">
                                                    Todavía no hay alimentos asignados a este plan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <hr />
                            <h6>Agregar alimento</h6>
                            <form onSubmit={agregarAlimentoADieta} className="row g-2 align-items-end">
                                <div className="col-md-6">
                                    <label className="form-label">Alimento</label>
                                    <select
                                        className="form-select"
                                        required
                                        value={nuevoDetalleAlimento.id_alimento}
                                        onChange={(e) => setNuevoDetalleAlimento({ ...nuevoDetalleAlimento, id_alimento: e.target.value })}
                                    >
                                        <option value="">-- Seleccione --</option>
                                        {alimentos.map((a) => (
                                            <option key={a.id_alimento} value={a.id_alimento}>
                                                {a.nombre} ({a.calorias} kcal / {a.proteinas} g prot. por unidad)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Cantidad</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        required
                                        className="form-control"
                                        placeholder="Ej. 100"
                                        value={nuevoDetalleAlimento.cantidad}
                                        onChange={(e) => setNuevoDetalleAlimento({ ...nuevoDetalleAlimento, cantidad: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <button type="submit" className="btn btn-success w-100">
                                        <i className="fa-solid fa-plus me-2"></i> Agregar
                                    </button>
                                </div>
                            </form>
                            <p className="text-muted small mt-2 mb-0">
                                Las calorías y proteínas totales se calculan automáticamente multiplicando la cantidad
                                por los valores del catálogo de alimentos.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="modalEditarPlan" tabIndex="-1">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Editar Plan Alimenticio</h5>
                            <button className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form onSubmit={actualizarPlan}>
                            <div className="modal-body">
                                <h4>Cliente: {planSeleccionado.usuarios?.nombre_completo}</h4>
                                <div className="row mt-3">
                                    <div className="col-md-5 mb-3">
                                        <label className="form-label">Nombre del plan</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={planSeleccionado.nombre || ''}
                                            onChange={(e) => setPlanSeleccionado({...planSeleccionado, nombre: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Duración</label>
                                        <select 
                                            className="form-select"
                                            value={planSeleccionado.duracion || '8 semanas'}
                                            onChange={(e) => setPlanSeleccionado({...planSeleccionado, duracion: e.target.value})}
                                        >
                                            <option>4 semanas</option>
                                            <option>8 semanas</option>
                                            <option>12 semanas</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Tipo de dieta</label>
                                        <select 
                                            className="form-select"
                                            value={planSeleccionado.tipo_dieta || 'Normal'}
                                            onChange={(e) => setPlanSeleccionado({...planSeleccionado, tipo_dieta: e.target.value})}
                                        >
                                            <option>Normal</option>
                                            <option>Vegetariana</option>
                                            <option>Vegana</option>
                                            <option>Keto</option>
                                            <option>Alta en proteína</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Calorías diarias objetivo</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={planSeleccionado.calorias_objetivo || ''}
                                            onChange={(e) => setPlanSeleccionado({...planSeleccionado, calorias_objetivo: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-8 mb-3">
                                        <label className="form-label">Objetivo</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={planSeleccionado.objetivo || ''}
                                            onChange={(e) => setPlanSeleccionado({...planSeleccionado, objetivo: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label">Observaciones</label>
                                        <textarea 
                                            rows="3" 
                                            className="form-control" 
                                            value={planSeleccionado.observaciones || ''}
                                            onChange={(e) => setPlanSeleccionado({...planSeleccionado, observaciones: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-success" data-bs-dismiss="modal">Guardar cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}