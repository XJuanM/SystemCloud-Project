import { useState } from 'react';
import { Link } from 'react-router-dom';
import './cliente-InformacionGym.css';

export default function InformacionGimnasio() {
    // ESTADO PARA EL FILTRO DE ENTRENADORES
    const [filtroActual, setFiltroActual] = useState('todos');

    // DATOS SIMULADOS DE ENTRENADORES (Modo lectura para el cliente)
    const entrenadores = [
        { id: 1, nombre: "Dilan Bohorquez", rol: "Entrenador Personal", categoria: "fuerza", icono: "fa-dumbbell" },
        { id: 2, nombre: "Ana García", rol: "Instructora", categoria: "cardio", icono: "fa-person-running" },
        { id: 3, nombre: "Carlos Ruiz", rol: "Instructor de Yoga", categoria: "yoga", icono: "fa-child-reaching" },
        { id: 4, nombre: "Sofía López", rol: "Nutricionista Deportiva", categoria: "nutricion", icono: "fa-apple-whole" },
        { id: 5, nombre: "Miguel Torres", rol: "Entrenador de Pesas", categoria: "fuerza", icono: "fa-dumbbell" }
    ];

    // LÓGICA DE FILTRADO
    const entrenadoresFiltrados = entrenadores.filter(entrenador => {
        if (filtroActual === 'todos') return true;
        return entrenador.categoria === filtroActual;
    });

    return (
        <>
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
                        <Link to="/catalogo"><i className="fa-solid fa-apple-whole"></i> Catálogo</Link>
                        <Link to="/informacionGym" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
                            <i className="fa-solid fa-circle-info"></i>
                            <span>Información del gimnasio</span>
                        </Link>
                        <Link to="/"><i className="fa-solid fa-right-from-bracket"></i> Salir</Link>
                    </nav>
                </aside>

                <main className="dashboard-main">
                    <section className="info-header">
                        <div className="info-header-text">
                            <div className="text">
                                <h2>
                                    Información del gimnasio
                                    <i className="fa-solid fa-circle-info"></i>
                                </h2>
                                <p>
                                    Todo lo que necesitas saber antes de entrenar: horarios,
                                    instalaciones, nuestro equipo de entrenadores y el reglamento
                                    interno.
                                </p>
                            </div>
                        </div>

                        <div className="info-stats">
                            <div className="stat-card">
                                <i className="fa-solid fa-clock"></i>
                                <div>
                                    <h3 id="statHorario">--</h3>
                                    <span>Horario general</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <i className="fa-solid fa-user-tie"></i>
                                <div>
                                    <h3 id="statEntrenadores">{entrenadores.length}</h3>
                                    <span>Entrenadores certificados</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <i className="fa-solid fa-calendar-week"></i>
                                <div>
                                    <h3 id="statClases">0</h3>
                                    <span>Clases semanales</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="info-hero">
                        <div className="hero-ring-card">
                            <svg className="ring-svg" viewBox="0 0 190 190">
                                <defs>
                                    <linearGradient id="infoRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#0a9696" />
                                        <stop offset="100%" stopColor="#43e6e6" />
                                    </linearGradient>
                                </defs>
                                <circle className="ring-track" cx="95" cy="95" r="80"></circle>
                                <circle className="ring-progress" id="ringAforo" cx="95" cy="95" r="80"></circle>
                            </svg>
                            <div className="ring-center">
                                <h2 id="ringAforoPercent">0%</h2>
                                <span>Aforo actual <b id="ringAforoLabel">0/0</b></span>
                            </div>
                        </div>

                        <div className="hero-info">
                            <h1 id="gymNombre">System Cloud Gym</h1>
                            <p id="gymDescripcion">Cargando información del gimnasio...</p>

                            <div className="contact-grid">
                                <div className="contact-item">
                                    <i className="fa-solid fa-location-dot"></i>
                                    <div>
                                        <span>Dirección</span>
                                        <p id="gymDireccion">--</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <i className="fa-solid fa-phone"></i>
                                    <div>
                                        <span>Teléfono</span>
                                        <p id="gymTelefono">--</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <i className="fa-solid fa-envelope"></i>
                                    <div>
                                        <span>Correo</span>
                                        <p id="gymCorreo">--</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <i className="fa-brands fa-instagram"></i>
                                    <div>
                                        <span>Redes sociales</span>
                                        <p id="gymRedes">--</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="hours-card">
                            <h4><i className="fa-solid fa-calendar-days"></i> Horario de la semana</h4>
                            <div className="hours-list" id="hoursList"></div>
                            <p>Hoy: <span id="hoyEstado">--</span></p>
                        </div>
                    </section>

                    <section className="info-facilities-wrap">
                        <h3>Nuestras instalaciones</h3>
                        <div className="facilities-grid" id="facilitiesGrid"></div>
                    </section>

                    <section className="info-log">
                        <div className="reglamento-card">
                            <h3>Reglamento del gimnasio</h3>
                            <div className="accordion" id="reglamentoAccordion"></div>
                        </div>

                        <div className="team-card">
                            <div className="team-header">
                                <h3>Nuestros entrenadores</h3>
                                {/* BOTONES DE FILTRO CON EVENTOS onClick */}
                                <div className="records-filter">
                                    <button onClick={() => setFiltroActual('todos')} className={`filter-btn ${filtroActual === 'todos' ? 'active' : ''}`}>Todos</button>
                                    <button onClick={() => setFiltroActual('fuerza')} className={`filter-btn ${filtroActual === 'fuerza' ? 'active' : ''}`}>Fuerza</button>
                                    <button onClick={() => setFiltroActual('cardio')} className={`filter-btn ${filtroActual === 'cardio' ? 'active' : ''}`}>Cardio</button>
                                    <button onClick={() => setFiltroActual('yoga')} className={`filter-btn ${filtroActual === 'yoga' ? 'active' : ''}`}>Yoga</button>
                                    <button onClick={() => setFiltroActual('nutricion')} className={`filter-btn ${filtroActual === 'nutricion' ? 'active' : ''}`}>Nutrición</button>
                                </div>
                            </div>

                            {/* LISTA DINÁMICA DE ENTRENADORES */}
                            <div className="team-list">
                                {entrenadoresFiltrados.length > 0 ? (
                                    entrenadoresFiltrados.map((entrenador) => (
                                        <div key={entrenador.id} className="team-item">
                                            <i className={`fa-solid ${entrenador.icono}`}></i>
                                            <div className="team-body">
                                                <h5>{entrenador.nombre}</h5>
                                                <span className="team-role">{entrenador.rol}</span>
                                            </div>
                                            <span className="team-tag">{entrenador.categoria}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>No hay entrenadores en esta categoría.</p>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
            <div className="toast" id="toast"></div>
        </>
    );
}