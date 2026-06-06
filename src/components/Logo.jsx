import logoProyect from "../assets/LogoProyectoSinFondo.png";

export default function Logo() {
  return (
    <section>
        <img
          src={logoProyect}
          width="300"
          height="300"
          alt="Logo del proyecto"
        />
    </section>
  );
}