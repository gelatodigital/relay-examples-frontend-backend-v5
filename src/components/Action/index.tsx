
import "./style.css";
import Button from "../Button";

interface InputProps {
  ready: boolean;
  onClick: (action: number) => void;
  onUpdate: (value: number, action: number) => void;
  text: string;
  max:boolean;
  action: number;
}



const Action = ({
  ready,

  onClick,
  onUpdate,
  text,
  action,
  max
}: InputProps) => {
 

  return (
    <div style={{ width: "300", padding: "10px" }}>

      <Button ready={ready} onClick={() => onClick(action)}>
        {text}
      </Button>
    </div>
  );
};

export default Action;
