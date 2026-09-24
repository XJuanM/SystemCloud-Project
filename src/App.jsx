import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Index from './Index';

import DashboardCliente from './components/DashboardCliente';
import CatalogoAlimentos from './views/cliente/Cliente-CatalogoAlimentos';
import MisClasesCliente from './views/cliente/Cliente-Clases';
import InformacionGym from './views/cliente/Cliente-InformacionGym';
import Membresia from './views/cliente/Cliente-Membresia';
import Perfil from './views/cliente/Cliente-Perfil';
import PlanAlimenticioCliente from './views/cliente/Cliente-PlanesAlimenticios';
import Progreso from './views/cliente/Cliente-Progreso';
import Rutina from './views/cliente/Cliente-Rutinas';





import DashboardEntrenador from './components/DashboardEntrenador';
import Clases from './views/entrenador/Entrenador-Clases';
import Inventario from './views/entrenador/Entrenador-Inventario';
import PlanesAlimenticios from './views/entrenador/Entrenador-PlanesAlimenticios';
import Reportes from './views/entrenador/Entrenador-Reportes';
import RutinasEntrenador from './views/entrenador/Entrenador-Rutinas';
import Usuarios from './views/entrenador/Entrenador-Usuarios';


function App() {
  return ( 
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />

        <Route path="/cliente" element={<DashboardCliente />} />
        <Route path="/membresia" element={<Membresia />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/plan-alimenticio" element={<PlanAlimenticioCliente />} />
        <Route path="/rutina-cliente" element={<Rutina />} />
        <Route path="/progreso" element={<Progreso />} />
        <Route path="/mis-clases" element={<MisClasesCliente />} />
        <Route path="/catalogo" element={<CatalogoAlimentos />} />
        <Route path="/informacionGym" element={<InformacionGym />} /> 

        <Route path="/entrenador" element={<DashboardEntrenador />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/rutinas" element={<RutinasEntrenador />} />
        <Route path="/planes" element={<PlanesAlimenticios />} />
        <Route path="/clases" element={<Clases />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/inventario" element={<Inventario />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;