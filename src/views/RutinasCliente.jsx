import { Link } from 'react-router-dom';
import '../views/rutinasCliente.css';

export default function Rutina() {
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
                        

                        <Link to="/perfil">
                            <i className="fa-solid fa-user"></i>
                            Mi perfil
                        </Link>

                        <Link to="/membresia">
                            <i className="fa-solid fa-credit-card"></i>
                            Mi membresía
                        </Link>

                        <Link to="/rutina-cliente" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
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

                        <Link to="/informacionGym">
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
                    <section className="routine-hero">
                        <div className="hero-ring-card">
                            <svg className="ring-svg" viewBox="0 0 200 200">
                                <defs>
                                    <linearGradient id="routineRingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#0a9696" />
                                        <stop offset="100%" stopColor="#31f0f0" />
                                    </linearGradient>
                                </defs>
                                <circle className="ring-track" cx="100" cy="100" r="86"></circle>
                                <circle id="ringProgress" className="ring-progress" cx="100" cy="100" r="86"></circle>
                            </svg>

                            <div className="ring-center">
                                <h2 id="ringPercent">0%</h2>
                                <span>completado esta semana</span>
                            </div>
                        </div>

                        <div className="hero-info">
                            <span className="routine-badge" id="routineBadge">RUTINA</span>
                            <h1 id="clienteNombre">Hola</h1>
                            <p>
                                Objetivo: <strong id="objetivoText">-</strong> ·
                                Nivel <strong id="nivelText">-</strong> ·
                                Duración <strong id="duracionText">-</strong>
                            </p>

                            <div className="mini-stats">
                                <div><h3 id="statCompletados">0</h3><span>Ejercicios hechos</span></div>
                                <div><h3 id="statTotal">0</h3><span>Ejercicios totales</span></div>
                                <div><h3 id="statDias">0</h3><span>Días con rutina</span></div>
                            </div>
                        </div>
                    </section>

                    <section className="day-selector" id="daySelector"></section>

                    <section className="day-panel">
                        <div className="day-panel-header">
                            <h3 id="dayTitle">Lunes</h3>
                            <span id="dayCount">0 ejercicios</span>
                        </div>

                        <div id="exerciseList" className="exercise-list"></div>
                    </section>
                </main>
            </div>

            <div className="toast" id="toast">
                <i className="fa-solid fa-circle-check"></i>
                <span id="toastMessage">Ejercicio completado</span>
            </div>
        </>
    );
}