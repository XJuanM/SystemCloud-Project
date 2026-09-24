import React, { useState } from "react";
import "./index.css";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./components/Logo.jsx";
import Btn from "./components/Buttons.jsx";
import { supabase } from "./supabase.js";
import bcrypt from "bcryptjs";

export default function Index() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDireccion, setRegDireccion] = useState("");
  const [regTelefono, setRegTelefono] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // 1. Supabase Auth crea el usuario y guarda la contraseña
    //    hasheada (bcrypt) en auth.users. Esto es lo que realmente
    //    se usa para autenticar en el login.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
    });

    if (authError) {
      console.error("Error al crear cuenta en Auth:", authError.message);
      alert("Error en el registro: " + authError.message);
      return;
    }

    // 2. Hasheamos la contraseña en el cliente solo para no guardarla
    //    en texto plano en la tabla "usuarios" (esquema sin cambios).
    //    Ojo: este hash NO se usa para el login, eso lo hace Auth arriba.
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(regPassword, salt);

    const { error: dbError } = await supabase
      .from("usuarios")
      .insert([{
        nombre_apellido: regName,
        correo: regEmail,
        password: hashedPassword,
        telefono: regTelefono,
        direccion: regDireccion,
        tipo_rol: "Cliente",
      }]);

    if (dbError) {
      console.error("Error al guardar en tabla usuarios:", dbError.message);
      alert("La cuenta se creó, pero hubo un error guardando el perfil.");
    } else {
      console.log("Registro completo exitoso.");
      alert("¡Registro exitoso! Ya puedes iniciar sesión.");
      setShowRegister(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // Supabase Auth compara la contraseña contra el hash guardado
    // en auth.users. No hay que hashear nada acá tampoco.
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      console.error("Error al iniciar sesión:", error.message);
      alert("Correo o contraseña incorrectos.");
      return;
    }

    console.log("¡Sesión iniciada con éxito!", data);

    const accessToken = data.session.access_token;
    console.log("Tu token JWT es:", accessToken);

    // Buscamos el rol del usuario en la tabla "usuarios" por su correo
    const { data: perfil, error: perfilError } = await supabase
      .from("usuarios")
      .select("tipo_rol")
      .eq("correo", loginEmail)
      .single();

    if (perfilError || !perfil) {
      console.error("Error al obtener el rol del usuario:", perfilError?.message);
      alert("Sesión iniciada, pero no se pudo determinar tu rol.");
      setShowLogin(false);
      return;
    }

    alert("¡Bienvenido! Has iniciado sesión correctamente.");
    setShowLogin(false);

    switch (perfil.tipo_rol) {
      case "Administrador":
        navigate("/admin");
        break;
      case "Entrenador":
        navigate("/usuarios");
        break;
      case "Cliente":
        navigate("/perfil");
        break;
      default:
        console.warn("Rol no reconocido:", perfil.tipo_rol);
        navigate("/");
    }
  };

  return (
    <>
      <header className="header">
        <nav className="navbar navbar-expand-lg navbar-sc">
          <div className="navbar-logo">
            <Logo />
          </div>

          <div className="collapse navbar-collapse navbar-links" id="navbarNav">
            <ul className="navbar-nav navbar-links">
              <li>
                <a className="dropdown-item" href="#servicios">
                  Servicios
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item" href="#contacto">
                  Contactanos
                </a>
              </li>

              <li style={{ marginLeft: "15px" }}>
                <Btn
                  className="button-ingresar"
                  onClick={() => setShowLogin(true)}
                >
                  Ingresar
                </Btn>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {showLogin && (
        <div
          className="sc-modal"
          style={{ display: "flex" }}
          onClick={() => setShowLogin(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowLogin(false)}>
              &times;
            </span>
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <center>
                <Btn className="btn-submit" type="submit">
                  Ingresar
                </Btn>
              </center>
            </form>
            <div className="modal-links">
              <a href="#recuperar">Recuperar contraseña</a>
              <a
                href="#registro"
                onClick={(e) => {
                  e.preventDefault();
                  setShowLogin(false);
                  setShowRegister(true);
                }}
              >
                Registrarse
              </a>
            </div>
          </div>
        </div>
      )}

      {showRegister && (
        <div
          className="sc-modal"
          style={{ display: "flex" }}
          onClick={() => setShowRegister(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowRegister(false)}>
              &times;
            </span>
            <h2>Crear Cuenta</h2>
            <form onSubmit={handleRegisterSubmit}>
              <div className="input-group">
                <label htmlFor="reg-name">Nombre completo</label>
                <input type="text" id="reg-name" required value={regName}
                  onChange={(e) => setRegName(e.target.value)} />
              </div>
              <div className="input-group">
                <label htmlFor="reg-email">Correo electrónico</label>
                <input type="email" id="reg-email" required value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <label htmlFor="reg-password">Crear contraseña</label>
                <input type="password" id="reg-password" required value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)} />
              </div>
              <div className="input-group">
                <label htmlFor="reg-telefono">Telefono</label>
                <input type="text" id="reg-telefono" required value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)} />
              </div>
              <div className="input-group">
                <label htmlFor="reg-direccion">Direccion</label>
                <input type="text" id="reg-direccion" required value={regDireccion}
                  onChange={(e) => setRegDireccion(e.target.value)} />
              </div>
              <center>
                <Btn className="btn-submit" type="submit">
                  Registrarme
                </Btn>
              </center>
            </form>
            <div className="modal-links" style={{ justifyContent: "center" }}>
              <a
                href="#login"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRegister(false);
                  setShowLogin(true);
                }}
              >
                ¿Ya tienes cuenta? Inicia sesión
              </a>
            </div>
          </div>
        </div>
      )}

      <section className="hero" id="inicio">
        <div className="hero-content">
          <h1>PRIME</h1>
          <p className="hero-subtitle">
            Transformando la gestión fitness en una experiencia inteligente
          </p>
          <p className="hero-description">
            Alcanza tus objetivos con una combinación de entrenamiento
            inteligente, una nutrición equilibrada y un seguimiento continuo de
            tu progreso. Cada paso cuenta para construir una versión más fuerte
            y saludable de ti.
          </p>
          <Btn
            className="button-ingresar"
            onClick={() => setShowRegister(true)}
          >
            Empieza hoy
          </Btn>
        </div>
      </section>

      <section className="services-section" id="servicios">
        <h2 className="section-title">Impulsa tu Progreso</h2>

        <div className="cards-container">
          <div className="sc-card">
            <div className="card-icon">💎</div>
            <h3>Membresías Flexibles</h3>
            <p>
              Acceso completo a nuestra plataforma, seguimiento de métricas
              avanzadas y soporte continuo para maximizar tu rendimiento.
            </p>
          </div>

          <div className="sc-card">
            <div className="card-icon">🏋️‍♂️</div>
            <h3>Rutinas Inteligentes</h3>
            <p>
              Planes de entrenamiento personalizados adaptados a tus objetivos,
              nivel de experiencia y progreso en tiempo real.
            </p>
          </div>

          <div className="sc-card">
            <div className="card-icon">🥗</div>
            <h3>Planes Alimenticios</h3>
            <p>
              Dietas estructuradas, conteo de macros y recomendaciones
              nutricionales para complementar tu esfuerzo en el gimnasio.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer-system" id="contacto">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-4">
              <div className="footer-brand">
                <h2>Prime</h2>
                <p>
                  Transformando la gestión fitness en una experiencia
                  inteligente
                </p>
              </div>
            </div>

            <div className="col-lg-3">
              <h4>Navegación</h4>
              <ul className="footer-links">
                <li>
                  <a href="#inicio">Inicio</a>
                </li>
                <li>
                  <a href="#servicios">Servicios</a>
                </li>
                <li>
                  <a href="#contacto">Contáctenos</a>
                </li>
              </ul>
            </div>

            <div className="col-lg-3">
              <h4>Contacto</h4>
              <ul className="footer-contact">
                <li>
                  <span className="icon">📧</span> contacto@prime.com
                </li>
                <li>
                  <span className="icon">📱</span> +57 300 000 0000
                </li>
                <li>
                  <span className="icon">📍</span> Colombia
                </li>
              </ul>
            </div>

            <div className="col-lg-2 mt-5 mt-lg-0">
              <h4>Síguenos</h4>
              <div className="redes">
                <a href="#instagram" className="social-link">
                  <i className="bi bi-instagram"></i> @GYMSportFit
                </a>
                <a href="#facebook" className="social-link">
                  <i className="bi bi-facebook"></i> @GYMSportFit
                </a>
                <a href="#linkedin" className="social-link">
                  <i className="bi bi-linkedin"></i> @GYMSportFit
                </a>
                <a href="#twitter" className="social-link">
                  <i className="bi bi-twitter-x"></i> @GYMSportFit
                </a>
              </div>
            </div>
          </div>

          <hr className="footer-divider" />

          <div className="footer-copy">
            <span>© 2026 PRIME.</span>
            <div className="footer-legal">
              <a href="#privacidad">Política de privacidad</a>
              <a href="#terminos">Términos y condiciones</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}