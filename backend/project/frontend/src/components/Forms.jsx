import Cookies from 'universal-cookie'
import axios from 'axios'
import React from 'react'
import { useState, createContext, useContext, useEffect } from "react";
import { LoginButton, LogoutButton, RegisterButton, SendFormButton, GoBackButton, AddRowButton, DeleteRowButton, HideViewButton, ShowViewButton } from './Buttons'
import { ContainersView, SavingsGoalsView } from './Views'

const cookies = new Cookies();

const UserContext = createContext();
const ContainerContext = createContext();
const RowsContext = createContext();


function RegisterForm (props) {
  
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passLength, setPassLength] = useState(false);
    const [passUpper, setPassUpper] = useState(false);
    const [passLower, setPassLower] = useState(false);
    const [passNumber, setPassNumber] = useState(false);
    const [passSpecial, setPassSpecial] = useState(false);
    const [passMatch, setPassMatch] = useState(false);
    const [error, setError] = useState('');
    const [registered, setRegistered] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
  
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
    }
    const handleNameChange = (e) => {
      setName(e.target.value);
    }
    const handleSurnameChange = (e) => {
      setSurname(e.target.value);
    }
    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
      setPassLength(e.target.value.length >= 11);
      setPassUpper(e.target.value.match(/[A-Z]/) !== null);
      setPassLower(e.target.value.match(/[a-z]/) !== null);
      setPassNumber(e.target.value.match(/[0-9]/) !== null);
      setPassSpecial(e.target.value.match(/[^A-Za-z0-9]/) !== null);
      setPassMatch(e.target.value === confirmPassword);
    }
    const handleConfirmPasswordChange = (e) => {
      setConfirmPassword(e.target.value);
      setPassMatch(e.target.value === password);
    }
  
    const validPassword = () => {
      return passLength && passUpper && passLower && passNumber && passSpecial && passMatch;
    }
  
    const register = (event) => {
      event.preventDefault();
      if (!validPassword()){
        return;
      }
      const headers = {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies.get('csrftoken')
      }
      // Make a POST request to the API
      axios.post("/api/register/", {
        email: email,
        name: name,
        surname: surname,
        password: password
      }, {headers: headers})
      .then((data)=>{
        console.log(data);
        setRegistered(true);
        setError('');
      })
      .catch((err)=>{
        console.log(err);
        setError(err.response.data.detail);
      });
    }
  
    function getLoginForm() {
      setShowLoginForm(true);
    }
  
    if (!registered && !showLoginForm){
      return(
        <div>
          <LoginButton className='btn btn-primary rounded-0 ml-1' onClick={getLoginForm} /><RegisterButton className='btn btn-disabled rounded-0'/>
          <div className='container mt-3'>
            <h1>Income Management</h1>
            <br></br>
            <h2>Register</h2>
            <form onSubmit={register}>
              <div className='form-group'>
                <label htmlFor='text' className='form-label'>Email</label>
                <input type='text' className='form-control' id='email' name='email' value={email} onChange={handleEmailChange} />
              </div>
              <div className='form-group'>
                <label htmlFor='text' className='form-label'>Name</label>
                <input type='text' className='form-control' id='name' name='name' value={name} onChange={handleNameChange} />
              </div>
              <div className='form-group'>
                <label htmlFor='text' className='form-label'>Surname</label>
                <input type='text' className='form-control' id='surname' name='surname' value={surname} onChange={handleSurnameChange} />
              </div>
              <div className='form-group'>
                <label htmlFor='password' className='form-label'>Password</label>
                <input type='password' className='form-control' id='password' name='password' value={password} onChange={handlePasswordChange} />
              </div>
              <div className='form-group'>
                <label htmlFor='password' className='form-label'>Confirm Password</label>
                <input type='password' className='form-control' id='confirmPassword' name='confirmPassword' value={confirmPassword} onChange={handleConfirmPasswordChange} />
              </div>
              <div className='form-group'>
                <ul>
                  <li className={passLength ? 'text-success' : 'text-danger'}>At least 11 characters</li>
                  <li className={passUpper ? 'text-success' : 'text-danger'}>At least one uppercase letter</li>
                  <li className={passLower ? 'text-success' : 'text-danger'}>At least one lowercase letter</li>
                  <li className={passNumber ? 'text-success' : 'text-danger'}>At least one number</li>
                  <li className={passSpecial ? 'text-success' : 'text-danger'}>At least one special character</li>
                  <li className={passMatch ? 'text-success' : 'text-danger'}>Passwords match</li>
                </ul>
              </div>
              <br></br>
              <SendFormButton text="Register" />
            </form>
            <p className='text-danger'>{error}</p>
          </div>
        </div>
      )
    } else {
      return(
        <div>
          <LoginForm />
        </div>
      )
    }
}

function LoginForm() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [containerChanges, setContainerChanges] = useState(false);
    const [savingsGoalChanges, setSavingsGoalChanges] = useState(false);
    const [currentUser, setCurrentUser] = useState({
      email: '',
      name: '',
      surname: ''
    });
    const [error, setError] = useState('');
    
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
    }
    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
    }
  
    const login = (event) => {
      event.preventDefault();
      // Make a POST request to the API
      const headers = {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies.get('csrftoken')
      }
      axios.post("/api/login/", {
        email: email,
        password: password
      }, {headers: headers})
      .then((data)=>{
        console.log(data);
        setCurrentUser({
          email: data.data.user.email,
          name: data.data.user.name,
          surname: data.data.user.surname
        });
        console.log("Cambie el estado de currentUser");
        setIsAuthenticated(true);
        setError('');
      })
      .catch((err)=>{
        console.log(err);
        setError(err.response.data.detail);
      });
    }

    const logout = () => {
      setIsAuthenticated(false);
      setCurrentUser({
        email: '',
        name: '',
        surname: ''
      });
    }
  
    function getRegisterForm() {
      setShowRegisterForm(true);
    }
  
    if (isAuthenticated){
      return(
        <UserContext.Provider value={currentUser}>
        <ContainerContext.Provider value={{containerChanges, setContainerChanges, savingsGoalChanges, setSavingsGoalChanges}}>
        <div>
          <LogoutButton className='btn btn-primary rounded-0' onClick={logout} />
          <div className='container d-flex justify-content-around'>
            <h1>Income Management</h1>
          </div>
          <br></br>
          
          <ContainersView />
          <SavingsGoalsView />
          
        </div>
        </ContainerContext.Provider>
        </UserContext.Provider>
      )
    } else {
      if (showRegisterForm){
        return(
          <div>
            <RegisterForm />
          </div>
        )
      } else {
        return(
          <div>
            <LoginButton className='btn btn-disabled rounded-0' id="login_button" /><RegisterButton className='btn btn-primary rounded-0' id="register_button" onClick={getRegisterForm} />
            <div className='container mt-3'>
              <h1>Income Management</h1>
              <br></br>
              <h2>Login</h2>
              <form onSubmit={login}>
                <div className='form-group'>
                  <label htmlFor='text' className='form-label'>Email</label>
                  <input type='text' className='form-control' id='email' name='email' value={email} onChange={handleEmailChange} />
                </div>
                <div className='form-group'>
                  <label htmlFor='password' className='form-label'>Password</label>
                  <input type='password' className='form-control' id='password' name='password' value={password} onChange={handlePasswordChange} />
                </div>
                <br></br>
                <SendFormButton text="Login" />
                {/* <button type='submit' className='btn btn-primary btn-dark'>Login</button> */}
              </form>
              <p className='text-danger'>{error}</p>
            </div>
          </div>
        )
      }
    }
}

function CreateContainerForm(props) {
  const [containerName, setContainerName] = useState(props.name);
  const [containerMoney, setContainerMoney] = useState(props.money);
  const [isCreated, setIsCreated] = useState(false);
  const { containerChanges, setContainerChanges } = useContext(ContainerContext);
  const [showForm, setShowForm] = useState(true);
  const [error, setError] = useState('');
  const currentUser = useContext(UserContext);

  const handleContainerNameChange = (e) => {
    setContainerName(e.target.value);
  }
  const handleContainerMoneyChange = (e) => {
    setContainerMoney(e.target.value);
  }

  const handleShowForm = () => {
    setShowForm(!showForm);
  }

  const createContainer = (event) => {
    event.preventDefault();
    const headers = {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies.get('csrftoken')
    }
    axios.post("/api/create_container/", {"email": currentUser.email, "name": containerName, "money": containerMoney}, {headers: headers})
    .then((data)=>{
      setIsCreated(true);
      setContainerChanges(!containerChanges); // Para que se actualice el estado de los contenedores en el contexto y se actualice Metas de ahorro
      setError('');
    })
    .catch((error)=>{
      setError(error.response.data.detail);
    })
  }

  const updateContainerMoney = (event) => {
    event.preventDefault();
    const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": cookies.get('csrftoken')
    }
    axios.post("/api/update_container/",{"email": currentUser.email, "name": containerName, "money": containerMoney, "originalName": props.name}, {headers: headers})
    .then((data)=>{
        console.log(data);
        setIsCreated(true);
        setContainerChanges(!containerChanges); // Para que se actualice el estado de los contenedores en el contexto y se actualice Metas de ahorro
        setError('');
    })
    .catch((error)=>{
        console.log(error);
        setError(error.response.data.detail);
    })
  }

  const goBack = () => {
    setIsCreated(true);
  }

  if (isCreated){
    return(
      <div>
        <ContainersView />
      </div>
    )
  }
  if (!props.name){
    if (!showForm){
      return(
        <div>
          <div class="container mx-2 my-2">
            <h1><ShowViewButton onClick={handleShowForm} />Create Container</h1>
          </div>
        </div>
      )
    }
    return (
      <div>
        <div class="container mx-2 my-2">
          <h1><HideViewButton onClick={handleShowForm} />Create Container</h1>
          <div class="mx-5">
            <form onSubmit={createContainer}>
              <div className='form-group'>
                <label htmlFor='text' className='form-label'>Container Name</label>
                <input  type='text' className='form-control' id='containerName' name='containerName' value={containerName} onChange={handleContainerNameChange} />
              </div>
              <div className='form-group'>
                <label htmlFor='number' className='form-label'>Initial Money</label>
                <input type='number' min="0" className='form-control' id='containerMoney' name='containerMoney' value={containerMoney} onChange={handleContainerMoneyChange} />
              </div>
              <br></br>
              <SendFormButton text="Create Container" /> <GoBackButton onClick={goBack} />
            </form>
            {error && <div class="my-2" ><p class='text-danger'>{error}</p></div>}
          </div>
        </div>
      </div>
    )
  }
  if (!showForm){
    return (
      <div>
        <div class="container mx-2 my-2">
          <h1><ShowViewButton onClick={handleShowForm} />Update Container</h1>
        </div>
      </div>
    )

  }
  return (
    <div>
      <div class="container mx-2 my-2">
        <h1><HideViewButton onClick={handleShowForm}/>Update Container</h1>
        <div class="mx-5">
        <form onSubmit={updateContainerMoney}>
          <div className='form-group'>
            <label htmlFor='text' className='form-label'>Container Name</label>
            <input type='text' className='form-control' id='containerName' name='containerName' value={containerName} onChange={handleContainerNameChange} />
          </div>
          <div className='form-group'>
            <label htmlFor='number' className='form-label'>Money</label>
            <input type='number' min="0" className='form-control' id='containerMoney' name='containerMoney' value={containerMoney} onChange={handleContainerMoneyChange} />
          </div>
          <br></br>
          <SendFormButton text="Update Container" /> <GoBackButton onClick={goBack} />
        </form>
        {error && <div class="my-2" ><p class='text-danger'>{error}</p></div>}
        </div>
      </div>
    </div>
  
  )
}

function CreateSavingsGoalForm(props) {
  const [isCreated, setIsCreated] = useState(false);
  const [rowsNumber, setRowsNumber] = useState([1]); // Array de números para poder hacer un map y crear los campos
  const [disableAddButton, setDisableAddButton] = useState(false);
  const [disableDeleteButton, setDisableDeleteButton] = useState(true);
  const [originalRows, setOriginalRows] = useState([]);
  const [name, setName] = useState(props.name);
  const [goal, setGoal] = useState(props.goal);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [containers, setContainers] = useState([]);
  const currentUser = useContext(UserContext);
  const { containerChanges, savingsGoalChanges, setSavingsGoalChanges } = useContext(ContainerContext);

  function handleNameChange(event) {
    setName(event.target.value);
  }

  function handleGoalChange(event) {
    setGoal(event.target.value);
  }

  function handleShowForm() {
    setShowForm(!showForm);
  }

  useEffect(() => {
    const headers = {
      "Content-Type": "application/json",
      "X-CSRFToken": cookies.get('csrftoken')
    }
    axios.post("/api/get_containers/", {"email": currentUser.email}, {headers: headers})
    .then((data)=>{
      console.log(data);
      setContainers(data.data.containers);
      checkAddRow();
      checkRemoveRow();
      setError('');
    })
    .catch((error)=>{
      setError(error.response.data.detail);
    })
  }, [containerChanges]);

  useEffect(() => {
    checkAddRow();
    checkRemoveRow();
  }, [rowsNumber]);

  if (props.name){
    useEffect(() => {
      const headers = {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies.get('csrftoken')
      }
      axios.post("/api/get_savings/", {"email": currentUser.email, "name": props.name}, {headers: headers})
      .then((data)=>{
        console.log(data);
        setRowsNumber([...Array(data.data.savings.length).keys()].map(i => i + 1));
        console.log("data.data.savings", data.data.savings);
        setRows(data.data.savings);
        setOriginalRows(data.data.savings);
        setError('');
      })
      .catch((error)=>{
        setError(error.response.data.detail);
      })
    }, []);
  }

  function goBack(event) {
    event.preventDefault();
    setIsCreated(true);
  }

  function addRow(event) {
    event.preventDefault();
    // Add a new number to the array
    if (rowsNumber.length < containers.length){
      setRowsNumber([...rowsNumber, Number(rowsNumber[rowsNumber.length - 1]) + 1]);
    }
  }

  function removeRow(event) {
    event.preventDefault();
    if (rowsNumber.length > 1){
      // Remove the last number from the array
      setRowsNumber(rowsNumber.slice(0, -1));
      setRows(rows.slice(0, -1));
    }
  }

  function checkAddRow() {
    if (rowsNumber.length === containers.length){
      setDisableAddButton(true);
    } else {
      setDisableAddButton(false);
    }
  }

  function checkRemoveRow() {
    if (rowsNumber.length === 1){
      setDisableDeleteButton(true);
    } else {
      setDisableDeleteButton(false);
    }
  }

  function createSavingsGoal(event) {
    event.preventDefault();
    const headers = {
      "Content-Type": "application/json",
      "X-CSRFToken": cookies.get('csrftoken')
    }
    if (!checkRows()){
      return;
    }

    axios.post("/api/create_savings_goal/", {"email": currentUser.email, "name": name, "goal": goal, "rows": rows}, {headers: headers})
    .then((data)=>{
      console.log(data);
      setIsCreated(true);
      setSavingsGoalChanges(!savingsGoalChanges); // Para que se actualice el estado de las metas de ahorro en el contexto y se actualice Contenedores
      setError('');
    })
    .catch((error)=>{
      console.log(error);
      console.log(error.response.data.detail);
      setError(error.response.data.detail);;
    })
  }

  function updateSavingsGoal(event) {
    event.preventDefault();
    const headers = {
      "Content-Type": "application/json",
      "X-CSRFToken": cookies.get('csrftoken')
    }
    if (!checkRows()){
      return;
    }
    axios.post("/api/update_savings_goal/", {"email": currentUser.email, "name": name, "goal": goal, "rows": rows, "originalName": props.name, "originalGoal": props.goal, "originalRows": originalRows }, {headers: headers})
    .then((data)=>{
      console.log(data);
      setIsCreated(true);
      setSavingsGoalChanges(!savingsGoalChanges); // Para que se actualice el estado de las metas de ahorro en el contexto y se actualice Contenedores
      setError('');
    })
    .catch((error)=>{
      console.log(error);
      console.log(error.response.data.detail);
      setError(error.response.data.detail);
    })
  }

  function checkRows() {
    var usedContainers = [];
    if (name === ''){
      setError("Please fill the name of the savings goal");
      return false;
    }

    // Si lo hago sobre la longitud de rows me da error porque se crea una row vacía al principio al final del array cuando se edita una meta de ahorro
    for (let i = 0; i < rows.length; i++){
      if (rows[i].container === ''){
        setError("Please select a container for each row");
        return false;
      } else if (usedContainers.includes(rows[i].container)) {
        setError("Please select a different container for each row");
        return false;
      } else if (rows[i].quantity === 0){
        setError("Please fill the quantity for each row");
        return false;
      }
      usedContainers.push(rows[i].container);
    }
    return true;
  }

  if (isCreated){
    return(
      <div>
        <SavingsGoalsView />
      </div>
    )
  }
  if (!props.name){
    if (!showForm){
      return(
        <div>
          <div class="container mx-2 my-2">
            <h1><ShowViewButton onClick={handleShowForm} />Create Savings Goal</h1>
          </div>
        </div>
      )
    }
    return(
      <RowsContext.Provider value={{rows, setRows, goal}}>
      <div>
        <div class="container mx-2 my-2">
          <h1><HideViewButton onClick={handleShowForm} />Create Savings Goal</h1>
          <div class="mx-4">
            <form onSubmit={createSavingsGoal}>
                <div className='container justify-content-around'>
                  <div className='row'>
                    <div className='col'>
                      <label htmlFor='text' className='form-label'>Savings Goal Name</label>
                      <input type='text' className='form-control' id='savingsGoalName' name='savingsGoalName' value={name} onChange={handleNameChange}/>
                    </div>
                    <div className='col'>
                      <label htmlFor='number' className='form-label'>Goal</label>
                      <input type='number' min="1" className='form-control' id='goal' name='goal' value={goal} onChange={handleGoalChange} />
                    </div>
                  </div>
                  {rowsNumber.map((rowNumber, index) => (<ContainerSelection key={rowNumber.id} id={index} containers={containers} goal={goal}  />))}
                  <div className='row justify-content-left'>
                    <div className='col'>
                      <AddRowButton onClick={addRow} disabled={disableAddButton} /> <DeleteRowButton onClick={removeRow} disabled={disableDeleteButton} />
                    </div>
                  </div>           
                </div>
              <br></br>
              <SendFormButton text="Create Savings Goal" /> <GoBackButton onClick={goBack}/>
            </form>
            {error && <div class="my-2" ><p class='text-danger'>{error}</p></div>}
          </div>
        </div>
      </div>
      </RowsContext.Provider>
    )
  }
  if (!showForm){
    return (
      <div>
        <div class="container mx-2 my-2">
          <h1><ShowViewButton onClick={handleShowForm} />Update Savings Goal</h1>
        </div>
      </div>
    )
  }
  
  return(
    <RowsContext.Provider value={{rows, setRows, goal}}>
    <div>
      <div class="container mx-2 my-2">
        <h1><HideViewButton onClick={handleShowForm}/>Update Savings Goal</h1>
        <div class="mx-4">
          <form onSubmit={updateSavingsGoal}>
              <div className='container justify-content-around'>
                <div className='row'>
                  <div className='col'>
                    <label htmlFor='text' className='form-label'>Savings Goal Name</label>
                    <input type='text' className='form-control' id='savingsGoalName' name='savingsGoalName' value={name} onChange={handleNameChange}/>
                  </div>
                  <div className='col'>
                    <label htmlFor='number' className='form-label'>Goal</label>
                    <input type='number' min="0" className='form-control' id='goal' name='goal' value={goal} onChange={handleGoalChange}/>
                  </div>
                </div>
                
                {rowsNumber.map((rowNumber, index) => (<ContainerSelection key={rowNumber.id} id={index} containers={containers} goal={goal} />))}
                <div className='row justify-content-left'>
                  <div className='col'>
                    <AddRowButton onClick={addRow} disabled={disableAddButton} /> <DeleteRowButton onClick={removeRow} disabled={disableDeleteButton} />
                  </div>
                </div>           
              </div>
            <br></br>
            <SendFormButton text="Update Savings Goal" /> <GoBackButton onClick={goBack}/>
          </form>
          {error && <div class="my-2" ><p class='text-danger'>{error}</p></div>}
        </div>
      </div>
    </div>
    </RowsContext.Provider>
  )
}

function ContainerSelection(props) {

  const { rows, setRows, goal } = useContext(RowsContext);
  const containers = props.containers;
  
  const [row, setRow] = useState({
    id: props.id,
    container: '',
    quantity: 0
  });
  const containerKey = 'container-' + props.id;
  const quantityKey = 'fixed-quantity-' + props.id;

  useEffect(() => {
    // Si ya se ha creado la fila, la actualizo
    if (rows[props.id]){
      setRow(rows[props.id]);
    // Si no, la añado al array
    } else {
      setRows([...rows, row]);
    }
    
  }, [rows]);

  function calculateExceedsCurrentAmount(rows, goal, newQuantity, index) {
    var currentAmount = 0;
    rows.forEach((row, i) => {
      if (i !== index){
        currentAmount += Number(row.quantity);
      }
    });
    // Si la cantidad actual más la nueva cantidad menos la meta es mayor que 0, se excede
    return (Number(currentAmount) + Number(newQuantity) - Number(goal)) > 0;
  }

  const handleContainerChange = (e) => {
    setRow(row => ({...row, container: e.target.value}));
    setRows(rows.map((nrow, index) => {
      if (index === props.id) {
        return {
          ...nrow,
          container: e.target.value
        };
      }
      return nrow;
    }));
  }

  const handleFixedQuantityChange = (e) => {
    if (!goal || !calculateExceedsCurrentAmount(rows, goal, e.target.value, props.id)) {
      setRow(row => ({...row, quantity: e.target.value}));
      setRows(rows.map((nrow, index) => {
        if (index === props.id) {
          return {
            ...nrow,
            quantity: e.target.value
          };
        }
        return nrow;
      }));
    }
  }
  
  return (
      <div className='row my-2 justify-content-around'>
        <div className='col'>
          <label htmlFor='text' className='form-label'>Container</label>
          <select className='form-control' id={containerKey} name={containerKey} value={row.container} onChange={handleContainerChange}>
            <option value=''>Select a container</option>
            {containers.map((container, index) => {
              return (
                <option value={container.name}>{container.name}</option>
              );
            })}
          </select>
        </div>
        <div className='col'>
          <label htmlFor='number' className='form-label'>Quantity</label>
          <input type='number' min="0" className='form-control' id={quantityKey} name={quantityKey} value={row.quantity} onChange={handleFixedQuantityChange} />
        </div>
      </div>
  )
}

export { LoginForm, RegisterForm, CreateContainerForm, CreateSavingsGoalForm, cookies, UserContext, ContainerContext } ;