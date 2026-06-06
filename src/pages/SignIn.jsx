import '../pages/SignIn.css'
import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import Input from "../components/Input.jsx";
import Btn from "../components/Buttons.jsx";


export default function SignIn() {
  return (
    <section>
      <div className="container">
        <Logo />
        <Input label="Nombre" type="text" placeholder="" />
        <br />
        <Input label="Fecha de nacimiento" type="date" placeholder="" />
        <br />
        <Input label="Email" type="email" placeholder="" />
        <br />
        <Input label="Contraseña" type="password" placeholder="" />
        <br />
        <Input label="Confirmar contraseña" type="password" placeholder="" />
        <br />
        <br />
        <Btn texto="Crear cuenta" href="" />
        <br />
        <h3 style={{ display: "flex", justifyContent: "center" }}>
          ¿Ya tienes cuenta?&nbsp;
          <Link style={{ color: "rgb(0, 217, 255)" }} to="/">
            Iniciar sesión
          </Link>
        </h3>
      </div>
    </section>
  );
}