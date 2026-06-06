import "../pages/Login.css";
import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import Input from "../components/Input.jsx";
import Btn from "../components/Buttons.jsx";

export default function Login() {
  return (
    <section>
      <div className="divLogin">
        <Logo />
        <Input label="Email" type="text" placeholder="" />
        <br />
        <Input label="Contraseña" type="password" placeholder="" />
        <br />
        <h3 style={{ display: "flex", justifyContent: "center" }}>
          <Link style={{ color: "white" }} to="/recuperar-contraseña">
            ¿Olvidaste tu contraseña?
          </Link>
        </h3>
        <br />
        <br />
        <Btn texto="Iniciar sesión" href="" />
        <br />
        <h3 style={{ display: "flex", justifyContent: "center" }}>
          ¿No tienes cuenta?&nbsp;
          <Link style={{ color: "rgb(0, 217, 255)" }} to="/sign-in">
            Crear cuenta
          </Link>
        </h3>
      </div>
    </section>
  );
}
