import "../components/Buttons.css";

export default function Btn(props) {
  return (
     <button
      className="btnLogin"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
} 
