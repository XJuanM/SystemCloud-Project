import { Link } from 'react-router-dom';
import { useState } from 'react';
import './cliente-Membresia.css';

export default function Membresia() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const abrirModal = () => setIsModalOpen(true);
    const cerrarModal = () => setIsModalOpen(false);
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

                        <Link to="/membresia" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
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
                    <section className="membership-hero">
                        <div className="hero-ring-card">
                            <svg className="ring-svg" viewBox="0 0 220 220">
                                <defs>
                                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#0a9696" />
                                        <stop offset="100%" stopColor="#31f0f0" />
                                    </linearGradient>
                                </defs>
                                <circle className="ring-track" cx="110" cy="110" r="95"></circle>
                                <circle id="ringProgress" className="ring-progress" cx="110" cy="110" r="95"></circle>
                            </svg>

                            <div className="ring-center">
                                <h2 id="daysLeftLabel">--</h2>
                                <span>días restantes</span>
                            </div>
                        </div>

                        <div className="hero-info">
                            <span id="statusBadge" className="plan-badge">PREMIUM · ACTIVA</span>
                            <h1>Tu membresía está activa</h1>
                            <p>
                                Plan <strong id="planNameText">Premium</strong>, vigente desde el{' '}
                                <strong id="startDateText">-</strong> hasta el{' '}
                                <strong id="expirationDateText">-</strong>.
                            </p>

                            <div className="hero-actions">
                                <button id="renewBtn" className="btn-primary" onClick={() => window.renewBtn && window.renewBtn()}>
                                    <i className="fa-solid fa-rotate"></i> Renovar membresía
                                </button>
                                <button id="freezeBtn" className="btn-secondary" onClick={() => window.freezeBtn && window.freezeBtn()}>
                                    <i className="fa-solid fa-snowflake"></i> Congelar membresía
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="membership-details">
                        <div className="benefits-card">
                            <h3>Beneficios incluidos</h3>
                            <ul id="benefitsList"></ul>
                        </div>

                        <div className="plan-card">
                            <h3>Tu plan</h3>

                            <div className="plan-price">
                                <span className="amount" id="planAmount">$0</span>
                                <span className="period">/ mes</span>
                            </div>

                            <div className="plan-meta">
                                <div><span>Método de pago</span><span id="paymentMethod">-</span></div>
                                <div><span>Próximo cobro</span><span id="nextBilling">-</span></div>
                                <div><span>Estado</span><span id="planStatus">-</span></div>
                                <div><span>Sede asignada</span><span id="planLocation">-</span></div>
                            </div>
                        </div>
                    </section>

                    <section className="payment-history">
                        <h3>Historial de pagos</h3>

                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Concepto</th>
                                    <th>Monto</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="paymentTableBody">
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>

            <div className="modal-overlay" id="renewModal">
                <div className="modal">
                    <h3>Elige tu renovación</h3>

                    <div className="plan-options" id="planOptions"></div>

                    <div className="modal-summary">
                        <span>Total a pagar</span>
                        <span id="modalTotal">$0</span>
                    </div>

                    <div className="modal-actions">
                        <button className="btn-secondary" id="cancelRenew" onClick={() => window.cancelRenew && window.cancelRenew()}>Cancelar</button>
                        <button className="btn-primary" id="confirmRenew" onClick={() => window.confirmRenew && window.confirmRenew()}>Confirmar pago</button>
                    </div>
                </div>
            </div>

            <div className="toast" id="toast">
                <i className="fa-solid fa-circle-check"></i>
                <span id="toastMessage">Membresía renovada</span>
            </div>
        </>
    );
}