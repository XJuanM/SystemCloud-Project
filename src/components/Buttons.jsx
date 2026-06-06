import '../components/Buttons.css'

export default function Btn(props) {
  return (
    <section>
        <button className="btnLogin" href={props.href}>
          {props.texto}
        </button>
    </section>
  );
}