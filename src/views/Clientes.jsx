import { Link } from 'react-router-dom';
import '../views/clientes.css';

export default function DashboardCliente() {
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
                        <Link to="/cliente" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
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

                        <Link to="/informacion-gimnasio">
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
                    <section className="dashboard-header">
                        <div className="header-text">
                            <div className="text">
                                <h2>
                                    Hola, Miguel
                                    <i className="fa-solid fa-user"></i>
                                </h2>
                                <p>
                                    Vas por un excelente camino. Esta semana completaste 4 de tus
                                    5 entrenamientos programados, registras un 92% de asistencia
                                    y tu membresía permanecerá activa durante los próximos 28 días.
                                </p>
                            </div>
                        </div>

                        <div className="header-cards">
                            <div className="mini-card">
                                <i className="fa-solid fa-chart-simple"></i>
                                <div>
                                    <h3>92%</h3>
                                    <span>Asistencia</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-dumbbell"></i>
                                <div>
                                    <h3>4 / 5</h3>
                                    <span>Rutinas</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-calendar-check"></i>
                                <div>
                                    <h3>8</h3>
                                    <span>Clases</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-medal"></i>
                                <div>
                                    <h3>+1.5kg</h3>
                                    <span>Progreso</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bottom-content">
                        <div className="weekly-attendance">
                            <h3>Mi progreso semanal</h3>
                            <canvas id="progressChart"></canvas>
                        </div>

                        <div className="upcoming-expirations">
                            <h3>Próximas clases</h3>

                            <div className="expiration-card">
                                <div>
                                    <h4>Spinning</h4>
                                    <span>Lunes • 6:00 PM</span>
                                </div>
                                <i className="fa-solid fa-bicycle"></i>
                            </div>

                            <div className="expiration-card">
                                <div>
                                    <h4>CrossFit</h4>
                                    <span>Miércoles • 5:00 PM</span>
                                </div>
                                <i className="fa-solid fa-fire"></i>
                            </div>

                            <div className="expiration-card">
                                <div>
                                    <h4>Yoga</h4>
                                    <span>Viernes • 8:00 AM</span>
                                </div>
                                <i className="fa-solid fa-leaf"></i>
                            </div>
                        </div>
                    </section>

                    <section className="gym-goals">
                        <h3>Objetivos personales</h3>

                        <div className="goal">
                            <span>Peso ideal</span>
                            <div className="progress">
                                <div style={{ width: '75%' }}></div>
                            </div>
                            <span>75%</span>
                        </div>

                        <div className="goal">
                            <span>Masa muscular</span>
                            <div className="progress">
                                <div style={{ width: '68%' }}></div>
                            </div>
                            <span>68%</span>
                        </div>

                        <div className="goal">
                            <span>Resistencia</span>
                            <div className="progress">
                                <div style={{ width: '85%' }}></div>
                            </div>
                            <span>85%</span>
                        </div>

                        <div className="goal">
                            <span>Disciplina</span>
                            <div className="progress">
                                <div style={{ width: '92%' }}></div>
                            </div>
                            <span>92%</span>
                        </div>
                    </section>

                    <section className="dashboard-content">
                        <div className="membership-card">
                            <h3>Mi membresía</h3>
                            <h2>Premium</h2>
                            <p>
                                Tu membresía estará activa hasta el{' '}
                                <strong>28 de agosto de 2026</strong>.
                            </p>
                            <button onClick={() => window.renovarMembresia && window.renovarMembresia()}>
                                Renovar membresía
                            </button>
                        </div>

                        <div className="upcoming-expirations">
                            <h3>Mi código QR</h3>
                            <img src="../IMG/HjDfGg.jpg" alt="QR" width="180" />
                            <p style={{ marginTop: '20px' }}>
                                Presenta este código al ingresar al gimnasio.
                            </p>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}