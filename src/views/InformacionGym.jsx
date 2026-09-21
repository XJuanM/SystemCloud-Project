import { Link } from 'react-router-dom';
import '../views/informacionGym.css';

export default function InformacionGimnasio() {
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
                        <Link to="/cliente">
                            <i className="fa-solid fa-house"></i>
                            Inicio
                        </Link>

                        <Link to="/perfil">
                            <i className="fa-solid fa-user"></i>
                            Mi perfil
                        </Link>

                        <Link to="/membresia">
                            <i className="fa-solid fa-credit-card"></i>
                            Mi membresía
                        </Link>

                        <Link to="/rutina-cliente">
                            <i className="fa-solid fa-dumbbell"></i>
                            Mis rutinas
                        </Link>

                        <Link to="/plan-alimenticio">
                            <i className="fa-solid fa-utensils"></i>
                            Mi plan alimenticio
                        </Link>

                        <Link to="/mis-clases">
                            <i className="fa-solid fa-calendar-days"></i>
                            Mis clases
                        </Link>

                        <Link to="/progreso">
                            <i className="fa-solid fa-chart-line"></i>
                            Mi progreso
                        </Link>

                        <Link to="/catalogo">
                            <i className="fa-solid fa-apple-whole"></i>
                            Catálogo
                        </Link>

                        <Link to="/informacion-gimnasio" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
                            <i className="fa-solid fa-circle-info"></i>
                            Información del gimnasio
                        </Link>

                        <Link to="/">
                            <i className="fa-solid fa-right-from-bracket"></i>
                            Salir
                        </Link>
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
                                    Todo lo que necesitas saber antes de entrenar: horarios, sedes,
                                    instalaciones, nuestro equipo de entrenadores y el reglamento
                                    interno. Elige tu sede y revisa los detalles al instante.
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
                                <i className="fa-solid fa-location-dot"></i>
                                <div>
                                    <h3 id="statSedes">0</h3>
                                    <span>Sedes activas</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <i className="fa-solid fa-user-tie"></i>
                                <div>
                                    <h3 id="statEntrenadores">0</h3>
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
                            <span className="info-badge" id="sedeBadge">SEDE PRINCIPAL</span>
                            <h1 id="sedeNombre">Cargando sede...</h1>
                            <p id="sedeDescripcion"></p>

                            <div className="contact-grid">
                                <div className="contact-item">
                                    <i className="fa-solid fa-location-dot"></i>
                                    <div>
                                        <span>Dirección</span>
                                        <p id="sedeDireccion">--</p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <i className="fa-solid fa-phone"></i>
                                    <div>
                                        <span>Teléfono</span>
                                        <p id="sedeTelefono">--</p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <i className="fa-solid fa-envelope"></i>
                                    <div>
                                        <span>Correo</span>
                                        <p id="sedeCorreo">--</p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <i className="fa-brands fa-instagram"></i>
                                    <div>
                                        <span>Redes sociales</span>
                                        <p id="sedeRedes">--</p>
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

                    <section className="info-controls">
                        <h3>Selecciona tu sede</h3>
                        <div className="range-selector" id="sedeSelector">
                            <button data-sede="centro" className="range-btn active">Sede Centro</button>
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
                                <div className="records-filter" id="teamFilter">
                                    <button data-cat="todos" className="filter-btn active">Todos</button>
                                    <button data-cat="fuerza" className="filter-btn">Fuerza</button>
                                    <button data-cat="cardio" className="filter-btn">Cardio</button>
                                    <button data-cat="yoga" className="filter-btn">Yoga</button>
                                    <button data-cat="nutricion" className="filter-btn">Nutrición</button>
                                </div>
                            </div>
                            <div className="team-list" id="teamList"></div>
                        </div>
                    </section>
                </main>
            </div>

            <div className="toast" id="toast"></div>
        </>
    );
}