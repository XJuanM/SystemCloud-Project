import { Link } from 'react-router-dom';
import './cliente-Perfil.css';

export default function Perfil() {
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
                        

                        <Link to="/perfil" style={{ backgroundColor: "var(--azulito)", color: "var(--blanco)" }}>
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
                    <section className="dashboard-header">
                        <div className="header-text">
                            <div className="text">
                                <h2>
                                    Mi perfil
                                    <i className="fa-solid fa-user"></i>
                                </h2>
                                <p>
                                    Administra tu información personal, tu seguridad y tus
                                    preferencias de notificación desde un solo lugar.
                                </p>
                            </div>
                        </div>

                        <div className="header-cards">
                            <div className="mini-card">
                                <i className="fa-solid fa-calendar-day"></i>
                                <div>
                                    <h3 id="statMemberSince">—</h3>
                                    <span>Miembro desde</span>
                                </div>
                            </div>

                            <div className="mini-card" id="card2">
                                <i className="fa-solid fa-crown"></i>
                                <div>
                                    <h3 id="statMembership">Premium</h3>
                                    <span>Membresía</span>
                                </div>
                            </div>

                            <div className="mini-card" id="card3">
                                <i className="fa-solid fa-dumbbell"></i>
                                <div>
                                    <h3 id="statRoutines">0</h3>
                                    <span>Rutinas completadas</span>
                                </div>
                            </div>

                            <div className="mini-card" id="card4">
                                <i className="fa-solid fa-calendar-check"></i>
                                <div>
                                    <h3 id="statClasses">0</h3>
                                    <span>Clases asistidas</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="profile-content">
                        <div className="profile-card">
                            <div className="avatar-wrap">
                                <img id="avatarPreview" src="../IMG/HjDfGg.jpg" alt="Foto de perfil" />

                                <button className="avatar-edit-btn" id="btnEditAvatar" title="Cambiar foto" onClick={() => window.btnEditAvatar && window.btnEditAvatar()}>
                                    <i className="fa-solid fa-camera"></i>
                                </button>

                                <input type="file" id="avatarInput" accept="image/*" hidden />
                            </div>

                            <h3 className="profile-name" id="profileName">Miguel Ramírez</h3>
                            <span className="profile-role">Cliente Premium</span>

                            <div className="profile-quick-stats">
                                <div className="quick-stat">
                                    <i className="fa-solid fa-envelope"></i>
                                    <span id="quickEmail">miguel.ramirez@correo.com</span>
                                </div>

                                <div className="quick-stat">
                                    <i className="fa-solid fa-phone"></i>
                                    <span id="quickPhone">+57 300 123 4567</span>
                                </div>

                                <div className="quick-stat">
                                    <i className="fa-solid fa-location-dot"></i>
                                    <span id="quickAddress">Bogotá, Colombia</span>
                                </div>
                            </div>

                            <div className="profile-completion">
                                <div className="profile-completion-head">
                                    <span>Perfil completo</span>
                                    <span id="completionPercent">0%</span>
                                </div>

                                <div className="progress">
                                    <div id="completionBar" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="profile-panel">
                            <div className="profile-tabs">
                                <button className="tab-btn active" data-tab="personal">
                                    <i className="fa-solid fa-id-card"></i>
                                    Información personal
                                </button>

                                <button className="tab-btn" data-tab="security">
                                    <i className="fa-solid fa-lock"></i>
                                    Seguridad
                                </button>

                                <button className="tab-btn" data-tab="preferences">
                                    <i className="fa-solid fa-sliders"></i>
                                    Preferencias
                                </button>
                            </div>

                            <div className="tab-content active" id="tab-personal">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="inputFullName">Nombre completo</label>
                                        <input type="text" id="inputFullName" placeholder="Tu nombre completo" />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="inputEmail">Correo electrónico</label>
                                        <input type="email" id="inputEmail" placeholder="tucorreo@ejemplo.com" />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="inputPhone">Teléfono</label>
                                        <input type="tel" id="inputPhone" placeholder="+57 300 000 0000" />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="inputBirthdate">Fecha de nacimiento</label>
                                        <input type="date" id="inputBirthdate" />
                                    </div>

                                    <div className="form-group form-group-full">
                                        <label htmlFor="inputAddress">Dirección</label>
                                        <input type="text" id="inputAddress" placeholder="Ciudad, dirección" />
                                    </div>

                                    <div className="form-group form-group-full">
                                        <label htmlFor="inputBio">Sobre mí</label>
                                        <textarea id="inputBio" rows="3" placeholder="Cuéntanos un poco sobre tus objetivos..."></textarea>
                                    </div>
                                </div>

                                <p className="form-error" id="personalError"></p>

                                <div className="panel-actions">
                                    <button className="btn-save" id="btnSavePersonal" onClick={() => window.btnSavePersonal && window.btnSavePersonal()}>
                                        <i className="fa-solid fa-check"></i>
                                        Guardar cambios
                                    </button>
                                </div>
                            </div>

                            <div className="tab-content" id="tab-security">
                                <div className="form-grid">
                                    <div className="form-group form-group-full">
                                        <label htmlFor="inputCurrentPassword">Contraseña actual</label>
                                        <input type="password" id="inputCurrentPassword" placeholder="••••••••" />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="inputNewPassword">Nueva contraseña</label>
                                        <input type="password" id="inputNewPassword" placeholder="Mínimo 8 caracteres" />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="inputConfirmPassword">Confirmar contraseña</label>
                                        <input type="password" id="inputConfirmPassword" placeholder="Repite la nueva contraseña" />
                                    </div>
                                </div>

                                <div className="password-strength" id="passwordStrength">
                                    <div className="password-strength-bar">
                                        <div id="strengthFill"></div>
                                    </div>
                                    <span id="strengthLabel">Seguridad de la contraseña</span>
                                </div>

                                <p className="form-error" id="securityError"></p>
                                <p className="form-success" id="securitySuccess"></p>

                                <div className="panel-actions">
                                    <button className="btn-save" id="btnSavePassword" onClick={() => window.btnSavePassword && window.btnSavePassword()}>
                                        <i className="fa-solid fa-shield-halved"></i>
                                        Actualizar contraseña
                                    </button>
                                </div>

                                <hr className="panel-divider" />

                                <div className="danger-zone">
                                    <div>
                                        <h4>Cerrar todas las sesiones</h4>
                                        <span>Cierra tu sesión en todos los dispositivos conectados.</span>
                                    </div>
                                    <button className="btn-outline-danger" id="btnCloseSessions" onClick={() => window.btnCloseSessions && window.btnCloseSessions()}>
                                        Cerrar sesiones
                                    </button>
                                </div>
                            </div>

                            <div className="tab-content" id="tab-preferences">
                                <div className="toggle-row">
                                    <div>
                                        <h4>Notificaciones por correo</h4>
                                        <span>Recibe novedades, promociones y recordatorios en tu email.</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" id="toggleEmail" defaultChecked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-row">
                                    <div>
                                        <h4>Notificaciones push</h4>
                                        <span>Alertas en tiempo real en tu navegador o app móvil.</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" id="togglePush" defaultChecked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-row">
                                    <div>
                                        <h4>Recordatorios de clases</h4>
                                        <span>Aviso 1 hora antes de cada clase reservada.</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" id="toggleReminders" defaultChecked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-row">
                                    <div>
                                        <h4>Boletín informativo</h4>
                                        <span>Consejos de entrenamiento y nutrición cada mes.</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" id="toggleNewsletter" />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-row">
                                    <div>
                                        <h4>Perfil visible para otros miembros</h4>
                                        <span>Otros usuarios podrán ver tu nombre y logros en clases grupales.</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" id="togglePublicProfile" />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            <div className="toast" id="toast"></div>
        </>
    );
}