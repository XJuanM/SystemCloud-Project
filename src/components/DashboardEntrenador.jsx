import './DashboardEntrenador'
export default function DashboardEntrenador() { 
    return(
        <aside className ="sidebar">
            <div className ="sidebar-logo">
                <img src="../IMG/logoSinFondo2.png" alt="Logo" />
                <h2>System Cloud</h2>
                <p>Panel entrenador</p>
            </div>

            <nav className ="sidebar-menu">
                <link href="../Usuarios/usuarios.html">
                    <i className ="fa-solid fa-users"></i>
                    Usuarios
                </link>

                <link href="../Rutinas/rutinas.html">
                    <i className ="fa-solid fa-dumbbell"></i>
                    Rutinas
                </link>

                <link href="../Planes Alimenticios/planes.html">
                    <i className ="fa-solid fa-jar-wheat"></i>
                    Planes Alimenticios
                </link>

                <link href="../Clases/clases.html">
                    <i className ="fa-solid fa-people-group"></i>
                    Clases
                </link>


                <link href="../Inventario/inventario.html">
                    <i className ="fa-solid fa-box"></i>
                    Inventario
                </link>


                <link href="../Reportes/reportes.html">
                    <i className ="fa-solid fa-bug"></i>
                    Reportes
                </link>

                <link href="../HTML/index.html">
                    <i className ="fa-solid fa-right-from-bracket"></i>
                    Salir
                </link>
            </nav>
        </aside>
    )

}