import { Link } from 'react-router-dom';
import './clientes.css';

export default function DashboardCliente() { 
    return (  
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src="../IMG/logoSinFondo2.png" alt="Logo" />
                <h2>System Cloud</h2>
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
    );
}