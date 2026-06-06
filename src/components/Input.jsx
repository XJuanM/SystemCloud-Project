import '../components/Input.css'

export default function Input(props) {
  return (
    <section>
      <div>
        <h3>{props.label}</h3>
        <input className="inputLogin" type={props.type} placeholder={props.placeholder} />
      </div>
    </section>
  );
}