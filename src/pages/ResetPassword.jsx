import '../pages/ResetPassword.css'
import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import Input from "../components/Input.jsx";
import Btn from "../components/Buttons.jsx";


export default function ResetPassword() {
  return (
    <section>
      <div className="divRP">
        <Logo />
        <h2 style={{ textAlign: "center", fontWeight: "bold" }}>Recuperar contraseña</h2>
        <br />
        <div>
          <p style={{ textAlign: "center" , justifyContent: "center", width: "320px", margin: "0 auto" }}>Ingresa tu email y te enviaremos un link para recuperar tu contraseña.</p>
        </div>
        <br />
        <Input label="Email" type="email" placeholder="" />
        <br />
        <br />
        <br />
        <Btn texto="Enviar email de recuperacion" href="" />
        <br />
        <h3 style={{ display: "flex", justifyContent: "center" }}>
          <Link style={{ color: "rgb(255, 255, 255)" }} to="/">
            Volver
          </Link>
        </h3>
      </div>
    </section>
  );
}