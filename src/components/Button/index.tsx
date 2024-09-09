import Spinner from '../Spinner';
import { State, Status } from '../../types/Status';
import { ReactComponent as Cross } from '../../icons/cross.svg';
import { ReactComponent as Check } from '../../icons/check.svg';
import './style.css';

interface ButtonProps {
  ready: boolean;
  status?: Status | null;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;

}

const Button = ({ ready, status, onClick, children }: ButtonProps) => {
  const state = status?.state;
  const pending = state === State.pending;

  return (
    <div className='button flex align-items-center'>
      { !!status && (
        <div className='status'>
          {/* <span className='icon'>
            { state === State.failed && <Cross /> }
            { state === State.success && <Check /> }
            { state === State.pending && <Spinner /> }
          </span> */}

        </div>
      )}
      <button
        disabled={ pending }
        onClick={ onClick }>
        { pending ? 'Pending...' : children }
      </button>
    </div>
  );
};

export default Button;