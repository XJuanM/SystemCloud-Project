import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// ⚠️ Ajusta esta ruta a donde tengas tu cliente de Supabase
import { supabase } from '../../supabase.js';
import bcrypt from 'bcryptjs';

import './cliente-Perfil.css';

const TABLA = 'usuarios';
// ⚠️ Ajusta esta clave a como guardas al usuario al iniciar sesión
const SESSION_KEY = 'usuario';

// Lee el usuario logueado (id_usuario o correo) desde el storage
function getSesion() {
    try {
        const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function nivelPassword(pw) {
    let puntos = 0;
    if (pw.length >= 8) puntos++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) puntos++;
    if (/\d/.test(pw)) puntos++;
    if (/[^A-Za-z0-9]/.test(pw)) puntos++;
    const niveles = [
        { w: '0%', c: 'rgb(240,90,90)', t: 'Seguridad de la contraseña' },
        { w: '25%', c: 'rgb(240,90,90)', t: 'Débil' },
        { w: '50%', c: 'rgb(240,170,60)', t: 'Regular' },
        { w: '75%', c: 'rgb(120,210,90)', t: 'Buena' },
        { w: '100%', c: 'rgb(60,220,170)', t: 'Fuerte' },
    ];
    return pw ? niveles[puntos] : niveles[0];
}

export default function Perfil() {
    const navigate = useNavigate();
    const toastTimer = useRef(null);

    const [usuario, setUsuario] = useState(null);      // fila completa de "usuarios"
    const [cargando, setCargando] = useState(true);
    const [tab, setTab] = useState('personal');

    // Formulario de datos personales (columnas reales de la tabla)
    const [form, setForm] = useState({ nombre_apellido: '', correo: '', telefono: '', direccion: '' });
    const [errorPersonal, setErrorPersonal] = useState('');
    const [guardando, setGuardando] = useState(false);

    // Seguridad
    const [pw, setPw] = useState({ actual: '', nueva: '', confirmar: '' });
    const [errorPw, setErrorPw] = useState('');
    const [okPw, setOkPw] = useState('');
    const [guardandoPw, setGuardandoPw] = useState(false);

    const [avatar, setAvatar] = useState('../IMG/HjDfGg.jpg');
    const [toast, setToast] = useState({ show: false, msg: '' });

    const mostrarToast = (msg) => {
        setToast({ show: true, msg });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast({ show: false, msg: '' }), 2600);
    };

    // ---------- Cargar usuario desde Supabase ----------
    useEffect(() => {
        let activo = true;

        async function cargar() {
            const sesion = getSesion();
            let query = supabase.from(TABLA).select('*');

            if (sesion?.id_usuario) {
                query = query.eq('id_usuario', sesion.id_usuario);
            } else if (sesion?.correo) {
                query = query.eq('correo', sesion.correo);
            } else {
                // Si usas Supabase Auth, se busca por el correo de la sesión
                const { data } = await supabase.auth.getUser();
                if (!data?.user?.email) {
                    if (activo) { setCargando(false); navigate('/'); }
                    return;
                }
                query = query.eq('correo', data.user.email);
            }

            const { data, error } = await query.maybeSingle();
            if (!activo) return;

            if (error || !data) {
                setErrorPersonal('No se pudo cargar tu perfil.');
            } else {
                setUsuario(data);
                setForm({
                    nombre_apellido: data.nombre_apellido ?? '',
                    correo: data.correo ?? '',
                    telefono: data.telefono != null ? String(data.telefono) : '',
                    direccion: data.direccion ?? '',
                });
            }
            setCargando(false);
        }

        cargar();
        return () => { activo = false; clearTimeout(toastTimer.current); };
    }, [navigate]);

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    // ---------- Guardar datos personales ----------
    const guardarPersonal = async () => {
        setErrorPersonal('');
        const nombre = form.nombre_apellido.trim();
        const correo = form.correo.trim();
        const telefono = form.telefono.replace(/\D/g, '');

        if (!nombre) return setErrorPersonal('El nombre es obligatorio.');
        if (!/^\S+@\S+\.\S+$/.test(correo)) return setErrorPersonal('Ingresa un correo válido.');

        setGuardando(true);
        const cambios = {
            nombre_apellido: nombre,
            correo,
            telefono: telefono ? Number(telefono) : null,
            direccion: form.direccion.trim() || null,
        };

        const { data, error } = await supabase
            .from(TABLA)
            .update(cambios)
            .eq('id_usuario', usuario.id_usuario)
            .select()
            .single();
        setGuardando(false);

        if (error) {
            const desborde = /out of range|integer/i.test(error.message);
            return setErrorPersonal(
                desborde
                    ? 'El teléfono es demasiado largo para la columna (int4). Cambia "telefono" a bigint o text en Supabase.'
                    : 'No se pudieron guardar los cambios: ' + error.message
            );
        }

        setUsuario(data);
        mostrarToast('Perfil actualizado');
    };

    // ---------- Cambiar contraseña ----------
    // Igual que en Index: la contraseña real vive en Supabase Auth (es la que
    // usa el login) y en la tabla "usuarios" solo se guarda el hash bcrypt.
    const guardarPassword = async () => {
        setErrorPw(''); setOkPw('');

        if (!pw.actual) return setErrorPw('Escribe tu contraseña actual.');

        // La tabla guarda un hash bcrypt. Si quedó una contraseña antigua en
        // texto plano (de antes del hash) se compara directo.
        const guardada = usuario.password ?? '';
        const esHash = /^\$2[aby]\$/.test(guardada);
        const actualCorrecta = esHash ? bcrypt.compareSync(pw.actual, guardada) : pw.actual === guardada;
        if (!actualCorrecta) return setErrorPw('La contraseña actual no es correcta.');

        if (pw.nueva.length < 8) return setErrorPw('La nueva contraseña debe tener mínimo 8 caracteres.');
        if (pw.nueva !== pw.confirmar) return setErrorPw('Las contraseñas no coinciden.');
        if (pw.nueva === pw.actual) return setErrorPw('La nueva contraseña debe ser distinta a la actual.');

        setGuardandoPw(true);

        // 1. Supabase Auth: es la contraseña con la que se inicia sesión
        const { error: errAuth } = await supabase.auth.updateUser({ password: pw.nueva });
        if (errAuth) {
            setGuardandoPw(false);
            return setErrorPw('No se pudo actualizar tu contraseña de acceso: ' + errAuth.message);
        }

        // 2. Hash bcrypt para la tabla "usuarios" (mismo procedimiento que Index)
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(pw.nueva, salt);

        const { data, error } = await supabase
            .from(TABLA)
            .update({ password: hashedPassword })
            .eq('id_usuario', usuario.id_usuario)
            .select()
            .single();
        setGuardandoPw(false);

        if (error) {
            return setErrorPw('Tu contraseña de acceso se cambió, pero no se pudo actualizar el registro: ' + error.message);
        }

        setUsuario(data);
        setPw({ actual: '', nueva: '', confirmar: '' });
        setOkPw('Contraseña actualizada correctamente.');
    };

    const cerrarSesion = async () => {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        await supabase.auth.signOut().catch(() => {});
        navigate('/');
    };

    const cambiarAvatar = (e) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;
        const lector = new FileReader();
        lector.onload = () => setAvatar(lector.result);
        lector.readAsDataURL(archivo);
    };

    // ---------- Derivados ----------
    const rol = usuario?.tipo_rol ?? '—';
    const completado = useMemo(() => {
        if (!usuario) return 0;
        const campos = [usuario.nombre_apellido, usuario.correo, usuario.telefono, usuario.direccion];
        return Math.round((campos.filter((c) => c !== null && c !== undefined && String(c).trim() !== '').length / campos.length) * 100);
    }, [usuario]);
    const fuerza = nivelPassword(pw.nueva);
    const vacio = (v) => (v === null || v === undefined || String(v).trim() === '' ? 'No registrado' : v);

    return (
        <>
            <div className="dashboard-layout perfil-page">
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

                        <Link to="/" onClick={cerrarSesion}>
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
                                <i className="fa-solid fa-id-badge"></i>
                                <div>
                                    <h3>{usuario?.id_usuario ?? '—'}</h3>
                                    <span>ID de usuario</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-crown"></i>
                                <div>
                                    <h3>{rol}</h3>
                                    <span>Rol</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-dumbbell"></i>
                                <div>
                                    <h3>0</h3>
                                    <span>Rutinas completadas</span>
                                </div>
                            </div>

                            <div className="mini-card">
                                <i className="fa-solid fa-calendar-check"></i>
                                <div>
                                    <h3>0</h3>
                                    <span>Clases asistidas</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="profile-content">
                        <div className="profile-card">
                            <div className="avatar-wrap">
                                <img src={avatar} alt="Foto de perfil" />

                                <button className="avatar-edit-btn" title="Cambiar foto" onClick={() => document.getElementById('avatarInput').click()}>
                                    <i className="fa-solid fa-camera"></i>
                                </button>

                                <input type="file" id="avatarInput" accept="image/*" hidden onChange={cambiarAvatar} />
                            </div>

                            <h3 className="profile-name">{cargando ? 'Cargando…' : vacio(usuario?.nombre_apellido)}</h3>
                            <span className="profile-role">{rol}</span>

                            <div className="profile-quick-stats">
                                <div className="quick-stat">
                                    <i className="fa-solid fa-envelope"></i>
                                    <span>{vacio(usuario?.correo)}</span>
                                </div>

                                <div className="quick-stat">
                                    <i className="fa-solid fa-phone"></i>
                                    <span>{vacio(usuario?.telefono)}</span>
                                </div>

                                <div className="quick-stat">
                                    <i className="fa-solid fa-location-dot"></i>
                                    <span>{vacio(usuario?.direccion)}</span>
                                </div>
                            </div>

                            <div className="profile-completion">
                                <div className="profile-completion-head">
                                    <span>Perfil completo</span>
                                    <span>{completado}%</span>
                                </div>

                                <div className="progress">
                                    <div style={{ width: completado + '%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="profile-panel">
                            <div className="profile-tabs">
                                <button className={`tab-btn ${tab === 'personal' ? 'active' : ''}`} onClick={() => setTab('personal')}>
                                    <i className="fa-solid fa-id-card"></i>
                                    Información personal
                                </button>

                                <button className={`tab-btn ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>
                                    <i className="fa-solid fa-lock"></i>
                                    Seguridad
                                </button>

                                <button className={`tab-btn ${tab === 'preferences' ? 'active' : ''}`} onClick={() => setTab('preferences')}>
                                    <i className="fa-solid fa-sliders"></i>
                                    Preferencias
                                </button>
                            </div>

                            <div className={`tab-content ${tab === 'personal' ? 'active' : ''}`}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="inputFullName">Nombre completo</label>
                                        <input type="text" id="inputFullName" name="nombre_apellido" value={form.nombre_apellido} onChange={onChange} placeholder="Tu nombre completo" />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="inputEmail">Correo electrónico</label>
                                        <input type="email" id="inputEmail" name="correo" value={form.correo} onChange={onChange} placeholder="tucorreo@ejemplo.com" />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="inputPhone">Teléfono</label>
                                        <input type="tel" id="inputPhone" name="telefono" value={form.telefono} onChange={onChange} placeholder="3001234567" />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="inputAddress">Dirección</label>
                                        <input type="text" id="inputAddress" name="direccion" value={form.direccion} onChange={onChange} placeholder="Ciudad, dirección" />
                                    </div>
                                </div>

                                <p className="form-error">{errorPersonal}</p>

                                <div className="panel-actions">
                                    <button className="btn-save" onClick={guardarPersonal} disabled={cargando || guardando || !usuario}>
                                        <i className="fa-solid fa-check"></i>
                                        {guardando ? 'Guardando…' : 'Guardar cambios'}
                                    </button>
                                </div>
                            </div>

                            <div className={`tab-content ${tab === 'security' ? 'active' : ''}`}>
                                <div className="form-grid">
                                    <div className="form-group form-group-full">
                                        <label htmlFor="inputCurrentPassword">Contraseña actual</label>
                                        <input type="password" id="inputCurrentPassword" value={pw.actual} onChange={(e) => setPw({ ...pw, actual: e.target.value })} placeholder="••••••••" />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="inputNewPassword">Nueva contraseña</label>
                                        <input type="password" id="inputNewPassword" value={pw.nueva} onChange={(e) => setPw({ ...pw, nueva: e.target.value })} placeholder="Mínimo 8 caracteres" />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="inputConfirmPassword">Confirmar contraseña</label>
                                        <input type="password" id="inputConfirmPassword" value={pw.confirmar} onChange={(e) => setPw({ ...pw, confirmar: e.target.value })} placeholder="Repite la nueva contraseña" />
                                    </div>
                                </div>

                                <div className="password-strength" id="passwordStrength">
                                    <div className="password-strength-bar">
                                        <div id="strengthFill" style={{ width: fuerza.w, background: fuerza.c }}></div>
                                    </div>
                                    <span id="strengthLabel">{fuerza.t}</span>
                                </div>

                                <p className="form-error">{errorPw}</p>
                                <p className="form-success">{okPw}</p>

                                <div className="panel-actions">
                                    <button className="btn-save" onClick={guardarPassword} disabled={!usuario || guardandoPw}>
                                        <i className="fa-solid fa-shield-halved"></i>
                                        {guardandoPw ? 'Actualizando…' : 'Actualizar contraseña'}
                                    </button>
                                </div>

                                <hr className="panel-divider" />

                                <div className="danger-zone">
                                    <div>
                                        <h4>Cerrar todas las sesiones</h4>
                                        <span>Cierra tu sesión en todos los dispositivos conectados.</span>
                                    </div>
                                    <button className="btn-outline-danger" onClick={cerrarSesion}>
                                        Cerrar sesiones
                                    </button>
                                </div>
                            </div>

                            <div className={`tab-content ${tab === 'preferences' ? 'active' : ''}`}>
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

            <div className={`toast ${toast.show ? 'show' : ''}`}>
                <i className="fa-solid fa-circle-check"></i>
                {toast.msg}
            </div>
        </>
    );
}