import { ReactComponent as Flagship } from "../../icons/flagship.svg";
import { State, Status } from "../../types/Status";
import Button from "../Button";
import "./style.css";

interface HeaderProps {
  ready: boolean;
  status?: Status | null;
  signerAddress: string | null;
  onConnect: React.MouseEventHandler<HTMLButtonElement>;
  onDisconnect: React.MouseEventHandler<HTMLButtonElement>;
}

const Header = ({
  ready,
  status,
  onConnect,
  onDisconnect,
  signerAddress,
}: HeaderProps) => (
  <header>
    <a href="https://www.gelato.network/" className="logo">
      <Flagship />
    </a>
    <div className="links">
      <a href="https://www.gelato.network/blog">Blog</a>
      <a href="https://github.com/gelatodigital">GitHub</a>
      <a href="https://docs.gelato.network/developer-services/relay">
        Documentation
      </a>
    </div>
    {/* {(status?.state == State.pending || status?.state == State.failed) && (
      <Button status={status} ready={ready} onClick={onConnect}>
        <img src={metamask} width={25} height={25} /> <span style={{position:'relative', top:'-6px'}}>Connect </span>
      </Button>
    )} */}
    {status?.state == State.success && (
      <button  onClick={onDisconnect} className="btn bg-connect-button">
        <span>
         Disconnect
        </span>
      </button>
    )}
  </header>
);

export default Header;
