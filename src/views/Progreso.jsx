import { Link } from 'react-router-dom';
import '../views/progreso.css';

export default function Progreso() {
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

                        <Link to="/progreso" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
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
                    <section className="progreso-header">
                        <div className="progreso-header-text">
                            <div className="text">
                                <h2>
                                    Mi progreso
                                    <i className="fa-solid fa-chart-line"></i>
                                </h2>
                                <p>
                                    Aquí queda el registro de cada sesión, cada kilo y cada marca
                                    personal. Revisa tu evolución, mantén viva la racha y celebra
                                    los récords que vas rompiendo semana a semana.
                                </p>
                            </div>
                        </div>

                        <div className="progreso-stats">
                            <div className="stat-card">
                                <i className="fa-solid fa-dumbbell"></i>
                                <div>
                                    <h3 id="statEntrenamientos">0</h3>
                                    <span>Entrenamientos este mes</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <i className="fa-solid fa-fire"></i>
                                <div>
                                    <h3 id="statRacha">0</h3>
                                    <span>Días seguidos activo</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <i className="fa-solid fa-weight-scale"></i>
                                <div>
                                    <h3 id="statPeso">0 kg</h3>
                                    <span>Peso actual</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <i className="fa-solid fa-trophy"></i>
                                <div>
                                    <h3 id="statRecords">0</h3>
                                    <span>Récords personales</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="progreso-hero">
                        <div className="hero-ring-card">
                            <svg className="ring-svg" viewBox="0 0 190 190">
                                <defs>
                                    <linearGradient id="progresoRingGradient">
                                        <stop offset="0%" stopColor="#0a9696" />
                                        <stop offset="100%" stopColor="#43e6e6" />
                                    </linearGradient>
                                </defs>
                                <circle className="ring-track" cx="95" cy="95" r="80"></circle>
                                <circle className="ring-progress" id="ringProgress" cx="95" cy="95" r="80"></circle>
                            </svg>
                            <div className="ring-center">
                                <h2 id="ringPercent">0%</h2>
                                <span>Meta del mes <b id="ringLabel">0/0</b></span>
                            </div>
                        </div>

                        <div className="hero-info">
                            <span className="progreso-badge">OBJETIVO ACTIVO</span>
                            <h1 id="metaTitulo">Bajar al peso objetivo</h1>
                            <p>
                                Llevas <strong id="resumenPerdido">0 kg</strong> de progreso desde que
                                empezaste a registrar tus datos. A este ritmo, tu entrenador estima
                                que alcanzarás la meta en <strong id="resumenTiempo">-- semanas</strong>.
                            </p>

                            <div className="progress-bars">
                                <div className="progress-bar-block">
                                    <div className="progress-bar-top">
                                        <span className="progress-label"><i className="fa-solid fa-weight-scale"></i> Peso</span>
                                        <span className="progress-value" id="barPesoValor">--</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill peso" id="barPeso"></div>
                                    </div>
                                </div>

                                <div className="progress-bar-block">
                                    <div className="progress-bar-top">
                                        <span className="progress-label"><i className="fa-solid fa-percent"></i> Grasa corporal</span>
                                        <span className="progress-value" id="barGrasaValor">--</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill grasa" id="barGrasa"></div>
                                    </div>
                                </div>

                                <div className="progress-bar-block">
                                    <div className="progress-bar-top">
                                        <span className="progress-label"><i className="fa-solid fa-shirt"></i> Cintura</span>
                                        <span className="progress-value" id="barCinturaValor">--</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill cintura" id="barCintura"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="streak-card">
                            <h4><i className="fa-solid fa-fire"></i> Constancia · últimas 12 semanas</h4>
                            <div className="heatmap" id="heatmap"></div>
                            <p>Racha más larga: <span id="rachaMax">0 días</span></p>
                        </div>
                    </section>

                    <section className="progreso-controls">
                        <h3>Evolución de peso</h3>
                        <div className="range-selector" id="rangeSelector">
                            <button data-range="30" className="range-btn active">1M</button>
                            <button data-range="90" className="range-btn">3M</button>
                            <button data-range="180" className="range-btn">6M</button>
                            <button data-range="365" className="range-btn">1A</button>
                        </div>
                    </section>

                    <section className="progreso-chart-wrap">
                        <svg id="pesoChart" className="peso-chart" viewBox="0 0 800 260" preserveAspectRatio="none"></svg>
                        <div className="chart-tooltip" id="chartTooltip"></div>
                    </section>

                    <section className="progreso-log">
                        <div className="log-form-card">
                            <h3>Registrar hoy</h3>
                            <form id="logForm" onSubmit={(e) => { e.preventDefault(); window.logFormSubmit && window.logFormSubmit(); }}>
                                <label>
                                    Peso (kg)
                                    <input type="number" step="0.1" id="inputPeso" placeholder="Ej. 78.4" required />
                                </label>
                                <label>
                                    Grasa corporal (%)
                                    <input type="number" step="0.1" id="inputGrasa" placeholder="Ej. 21.5" />
                                </label>
                                <label>
                                    <input type="checkbox" id="inputEntreno" defaultChecked />
                                    Hoy entrené
                                </label>
                                <button type="submit"><i className="fa-solid fa-circle-plus"></i> Guardar registro</button>
                            </form>
                        </div>

                        <div className="records-card">
                            <div className="records-header">
                                <h3>Récords personales</h3>
                                <div className="records-filter" id="recordsFilter">
                                    <button data-cat="todos" className="filter-btn active">Todos</button>
                                    <button data-cat="fuerza" className="filter-btn">Fuerza</button>
                                    <button data-cat="cardio" className="filter-btn">Cardio</button>
                                </div>
                            </div>
                            <div className="records-list" id="recordsList"></div>
                        </div>
                    </section>
                </main>
            </div>

            <div className="toast" id="toast"></div>
        </>
    );
}