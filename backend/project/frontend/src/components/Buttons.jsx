import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faSyncAlt, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons'

function LoginButton(props) {
    return (
      <button className={props.className}  onClick={props.onClick}>
        Login
      </button>
    );
  }
  
  function LogoutButton(props) {
    return (
      <button className={props.className} onClick={props.onClick}>
        Logout
      </button>
    );
  }
  
  function RegisterButton(props) {
    return (
      <button className={props.className} onClick={props.onClick}>
        Register
      </button>
    );
  }

  function CreateContainerButton(props) {
    return (
      <button className={props.className} onClick={props.onClick}>
        Create Container
      </button>
    );
  }

  function SendFormButton(props) {
    return (
      <button type="submit" className="btn btn-primary btn-dark" >
        {props.text}
      </button>
    );
  }

  function GoBackButton(props) {
    return (
      <button className="btn btn-primary btn-secondary" onClick={props.onClick}>
        Go back
      </button>
    );
  }

  function AddRowButton(props) {
    if (props.disabled){
      return (
        <button className='btn btn-light' onClick={props.onClick} disabled>
          <FontAwesomeIcon icon={faPlus} color="green"/>
        </button>
      );
    }
    return (
      <button className='btn btn-light' onClick={props.onClick}>
        <FontAwesomeIcon icon={faPlus} color="green"/>
      </button>
    );
  }

  function DeleteRowButton(props) {
    if (props.disabled){
      return (
        <button className='btn btn-light' onClick={props.onClick} disabled>
          <FontAwesomeIcon icon={faTrashAlt} color="red"/>
        </button>
      );
    }
    return (
      <button className='btn btn-light' onClick={props.onClick}>
        <FontAwesomeIcon icon={faTrashAlt} color="red"/>
      </button>
    );
  }

  function DeleteButton(props) {
    return (
      <button className='btn btn-light' onClick={props.onClick}>
        <FontAwesomeIcon icon={faTrashAlt} color="red"/>
      </button>
    );
  }

  function UpdateButton(props) {
    return (
      <button className='btn btn-light' onClick={props.onClick}>
        <FontAwesomeIcon icon={faSyncAlt} color="blue"/>
      </button>
    );
  }

  function CompleteButton(props) {
    return (
      <button className='btn btn-light' onClick={props.onClick}>
        <FontAwesomeIcon icon={faCheck} color="green"/>
      </button>
    );
  }
  
  function HideViewButton(props) {
    return (
      <button type="button" class="btn btn-default" onClick={props.onClick}>
        <img src="http://localhost:8000/media/caret-down-fill.svg"></img>
      </button>
    );
  }

  function ShowViewButton(props) {
    return (
      <button type="button" class="btn btn-default" onClick={props.onClick}>
        <img src="http://localhost:8000/media/caret-right-fill.svg"></img>
      </button>
    );
  }

  export {LoginButton, LogoutButton, RegisterButton, CreateContainerButton, SendFormButton, GoBackButton, DeleteButton, UpdateButton, HideViewButton, ShowViewButton, AddRowButton, DeleteRowButton, CompleteButton};