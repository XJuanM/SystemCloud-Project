import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardCliente from './components/DashboardCliente';
import DashboardEntrenador from './components/DashboardEntrenador';
import Membresia from './views/MiMembresia';
import Perfil from './views/Perfil';
import PlanAlimenticioCliente from './views/PlanesAlimenticiosCliente';
import Rutina from './views/RutinasCliente';
import Progreso from './views/Progreso';
import Usuarios from './views/Usuarios';
import RutinasEntrenador from './views/RutinasEntrenador';
import PlanesAlimenticios from './views/PlanesAlimenticios';
import Clases from './views/Clases';
import Reportes from './views/Reportes';
import Inventario from './views/Inventario';
import InformacionGym from './views/InformacionGym'; 
import './App.css';

function App() {
  return ( 
    <BrowserRouter>
      <Routes>
        <Route path="/cliente" element={<DashboardCliente />} />
        <Route path="/membresia" element={<Membresia />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/plan-alimenticio" element={<PlanAlimenticioCliente />} />
        <Route path="/rutina-cliente" element={<Rutina />} />
        <Route path="/progreso" element={<Progreso />} />
        <Route path="/informacionGym" element={<InformacionGym />} /> 

        <Route path="/entrenador" element={<DashboardEntrenador />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/rutinas" element={<RutinasEntrenador />} />
        <Route path="/planes" element={<PlanesAlimenticios />} />
        <Route path="/clases" element={<Clases />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/inventario" element={<Inventario />} />
        
        <Route path="/" element={<Usuarios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;