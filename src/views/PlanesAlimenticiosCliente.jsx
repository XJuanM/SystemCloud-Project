import { Link } from 'react-router-dom';
import '../views/plan-alimenticio.css';

export default function PlanAlimenticioCliente() {
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

                        <Link to="/rutina-cliente">
                            <i className="fa-solid fa-dumbbell"></i>
                            Mis rutinas
                        </Link>

                        <Link to="/plan-alimenticio" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
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
                    <section className="nutri-hero">
                        <div className="hero-ring-card">
                            <svg className="ring-svg" viewBox="0 0 200 200">
                                <defs>
                                    <linearGradient id="nutriRingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#43e6e6" />
                                        <stop offset="100%" stopColor="#43e6e6" />
                                    </linearGradient>
                                </defs>
                                <circle className="ring-track" cx="100" cy="100" r="86"></circle>
                                <circle id="ringProgress" className="ring-progress" cx="100" cy="100" r="86"></circle>
                            </svg>

                            <div className="ring-center">
                                <h2 id="ringKcal">0</h2>
                                <span>kcal de <b id="ringKcalGoal">0</b></span>
                            </div>
                        </div>

                        <div className="hero-info">
                            <span className="nutri-badge" id="nutriBadge">PLAN ALIMENTICIO</span>
                            <h1 id="clienteNombre">Hola</h1>
                            <p>
                                Objetivo: <strong id="objetivoText">-</strong> ·
                                Meta calórica <strong id="metaText">-</strong> ·
                                Comidas al día <strong id="comidasText">-</strong>
                            </p>

                            <div className="macro-bars">
                                <div className="macro-bar" data-macro="protein">
                                    <div className="macro-bar-top">
                                        <span className="macro-label"><i className="fa-solid fa-drumstick-bite"></i> Proteína</span>
                                        <span className="macro-value"><span id="proteinVal">0</span>g / <span id="proteinGoal">0</span>g</span>
                                    </div>
                                    <div className="macro-track"><div className="macro-fill protein" id="proteinFill"></div></div>
                                </div>
                                <div className="macro-bar" data-macro="carbs">
                                    <div className="macro-bar-top">
                                        <span className="macro-label"><i className="fa-solid fa-wheat-awn"></i> Carbohidratos</span>
                                        <span className="macro-value"><span id="carbsVal">0</span>g / <span id="carbsGoal">0</span>g</span>
                                    </div>
                                    <div className="macro-track"><div className="macro-fill carbs" id="carbsFill"></div></div>
                                </div>
                                <div className="macro-bar" data-macro="fat">
                                    <div className="macro-bar-top">
                                        <span className="macro-label"><i className="fa-solid fa-droplet"></i> Grasas</span>
                                        <span className="macro-value"><span id="fatVal">0</span>g / <span id="fatGoal">0</span>g</span>
                                    </div>
                                    <div className="macro-track"><div className="macro-fill fat" id="fatFill"></div></div>
                                </div>
                            </div>
                        </div>

                        <div className="water-card">
                            <h4><i className="fa-solid fa-glass-water"></i> Hidratación</h4>
                            <div className="water-glasses" id="waterGlasses"></div>
                            <p><span id="waterCount">0</span> / <span id="waterGoal">8</span> vasos</p>
                        </div>
                    </section>

                    <section className="meal-selector" id="mealSelector"></section>

                    <section className="meal-panel">
                        <div className="meal-panel-header">
                            <h3 id="mealTitle">Desayuno</h3>
                            <span id="mealCount">0 alimentos · 0 kcal</span>
                        </div>

                        <div id="foodList" className="food-list"></div>
                    </section>
                </main>
            </div>

            <div className="toast" id="toast">
                <i className="fa-solid fa-circle-check"></i>
                <span id="toastMessage">Alimento registrado</span>
            </div>
        </>
    );
}