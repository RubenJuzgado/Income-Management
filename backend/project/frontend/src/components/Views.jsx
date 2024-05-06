import React from 'react'
import axios from 'axios';
import { useState, useEffect, useContext } from "react";
import { CreateContainerButton, DeleteButton, HideViewButton, UpdateButton, ShowViewButton, CompleteButton } from './Buttons'
import { CreateContainerForm, cookies, UserContext, CreateSavingsGoalForm, ContainerContext } from './Forms'


function ContainersView() {
    const [containers, setContainers] = useState([]);
    const [showContainerForm, setShowCreateContainerForm] = useState({
        create: false,
        update: false,
        name: '',
        money: 0
    });
    const [showContainers, setShowContainers] = useState(true);
    const [error, setError] = useState('');
    const currentUser = useContext(UserContext);
    const { containerChanges, setContainerChanges, savingsGoalChanges } = useContext(ContainerContext);

    const handleShowContainers = () => {
        console.log("handleShowContainers")
        setShowContainers(!showContainers);
    }
    
    const getContainers = () => {
        const headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": cookies.get('csrftoken')
        }
        axios.post("/api/get_containers/", {"email": currentUser.email}, {headers: headers})
        .then((data)=>{
            setContainers(data.data.containers);
            setContainerChanges(!containerChanges); // Para que se actualice el estado de los contenedores en el contexto y se actualice Metas de ahorro
            console.log("containers", containers)
            setError('');
        })
        .catch((error)=>{
            setError(error.response.data.detail);
        })
        
    }

    const createContainer = () => {
        setShowCreateContainerForm({create: true, update: false, name: ''});
    }

    const deleteContainer = (containerName) => {
        const headers = {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies.get('csrftoken')
        }
        axios.post("/api/delete_container/",{"email": currentUser.email, "name": containerName}, {headers: headers})
        .then((data)=>{
            console.log(data); 
            getContainers();
            setContainerChanges(!containerChanges); // Para que se actualice el estado de los contenedores en el contexto y se actualice Metas de ahorro
            setError('');
        })
        .catch((error)=>{
            console.log(error);
            setError(error.response.data.detail);
        })
    }

    const updateContainer = (containerName, containerMoney) => {
        setShowCreateContainerForm({create: false, update: true, name: containerName, money: containerMoney});
    }

    useEffect(() => {
        getContainers();
    }, [savingsGoalChanges]);

    

    if (showContainerForm.create) {
        console.log("showContainerForm.create")
        return <CreateContainerForm name='' money={0}/>
    } else if (showContainerForm.update) {
        console.log("showContainerForm.update")
        return <CreateContainerForm name={showContainerForm.name} money={showContainerForm.money} />
    }
    if (showContainers) {
        return (
            <div>
                <div class="container mx-2 my-2">
                    <h1><HideViewButton onClick={handleShowContainers}/>Containers</h1>
                    <div class="d-flex mx-3">
                        <CreateContainerButton className="btn btn-primary rounded-0" onClick={createContainer} />
                    </div>
                </div>
                {error && <div class="container mx-2 my-2 justify-content-left"><div class="d-flex mx-3"><p class='text-danger'>{error}</p></div></div>}
                <div class="container d-flex justify-content-around">
                    <div class="row row-cols-4 justify-content-around">
                        {containers.map((container, index) => {
                            return (
                                <ContainersTable money={container.money} name={container.name} unavailable_money={container.unavailable_money} deleteContainer={deleteContainer} updateContainer={updateContainer}/>                          
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    } else {
        return <div class="container mx-2 my-2"><h1><ShowViewButton onClick={handleShowContainers}/>Containers</h1></div>
    }
}

function ContainersTable(props) {
    const money = Number(props.money);
    const name = props.name;
    const availableMoney = money - Number(props.unavailable_money);
    const deleteContainer = props.deleteContainer;
    const updateContainer = props.updateContainer;
    const tablaStyle = {
        marginLeft: '10px', // Ajusta el valor según tus preferencias
        marginTop: '10px', // Ajusta el valor según tus preferencias
    };

    return (
        <div class="col">
            <table class="table border" style={tablaStyle}>
                <thead>
                <tr class="border-top-0">
                    <th colspan="2" class="text-center">{name}</th>
                </tr>
                <tr>
                    <td colspan="2" class="text-center border-0">Total money: {money}€ <br/> Available money: {availableMoney}€</td>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td class="text-start"><DeleteButton onClick={() => deleteContainer(name)}/></td>
                    <td class="text-end"><UpdateButton onClick={() => updateContainer(name, money)}/></td>
                </tr>
                </tbody>
            </table>
        </div>
    )
}

function SavingsGoalsView (props) {
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [showSavingsGoalForm, setShowSavingsGoalForm] = useState({
        create: false,
        update: false,
        name: '',
        goal: 0,
    });
    const [showSavingsGoals, setShowSavingsGoals] = useState(true);
    const [error, setError] = useState('');
    const currentUser = useContext(UserContext);
    const { containerChanges, savingsGoalChanges, setSavingsGoalChanges } = useContext(ContainerContext);

    const handleShowSavingsGoals = () => {
        setShowSavingsGoals(!showSavingsGoals);
    }

    const getSavingsGoals = () => {
        const headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": cookies.get('csrftoken')
        }
        axios.post("/api/get_savings_goals/", {"email": currentUser.email}, {headers: headers})
        .then((data)=>{
            console.log(data);
            setSavingsGoals(data.data.savings_goals);
            console.log(savingsGoals)
            setError('');
        })
        .catch((error)=>{
            console.log(error);
            console.log(error.response.data.detail);
            setError(error.response.data.detail);
        })
    }

    const deleteSavingsGoal = (savingsGoalName) => {
        
        const headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": cookies.get('csrftoken')
        }
        axios.post("/api/delete_savings_goal/",{"email": currentUser.email, "name": savingsGoalName}, {headers: headers})
        .then((data)=>{
            console.log(data);
            getSavingsGoals();
            setSavingsGoalChanges(!savingsGoalChanges); // Para que se actualice el estado de las metas de ahorro en el contexto y se actualice Contenedores
            setError('');
        })
        .catch((error)=>{
            console.log(error);
            setError(error.response.data.detail);
        })
    }

    const updateSavingsGoal = (savingsGoalName, savingsGoalGoal) => {
        setShowSavingsGoalForm({create: false, update: true, name: savingsGoalName, goal: savingsGoalGoal});
        console.log("showSavingsGoalForm", showSavingsGoalForm)
    }

    const completeSavingsGoal = (savingsGoalName, savingsGoalGoal, savingsGoalCurrentAmount) => {
        if (savingsGoalGoal > savingsGoalCurrentAmount) {
            setError("You have not reached the goal yet.");
            return;
        }
        const headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": cookies.get('csrftoken')
        }
        axios.post("/api/complete_savings_goal/",{"email": currentUser.email, "name": savingsGoalName}, {headers: headers})
        .then((data)=>{
            console.log(data);
            getSavingsGoals();
            setSavingsGoalChanges(!savingsGoalChanges); // Para que se actualice el estado de las metas de ahorro en el contexto y se actualice Contenedores
            setError('');
        })
        .catch((error)=>{
            console.log(error);
            setError(error.response.data.detail);
        })
    }

    function createSavingsGoal() {
        setShowSavingsGoalForm({create: true, update: false, name: '', goal: 0});
    }

    useEffect(() => {
        getSavingsGoals();
    }, [containerChanges]);

    if (showSavingsGoalForm.create) {
        return <CreateSavingsGoalForm />
    }

    if (showSavingsGoalForm.update) {
        return <CreateSavingsGoalForm name={showSavingsGoalForm.name} goal={showSavingsGoalForm.goal} />
    }

    if (showSavingsGoals) {
        return (
            <div>
                <div class="container mx-2 my-2">
                    <h1><HideViewButton onClick={handleShowSavingsGoals}/>Savings Goals</h1>
                    <div class="d-flex mx-3">
                        <CreateContainerButton className="btn btn-primary rounded-0" onClick={createSavingsGoal} />
                    </div>
                </div>
                {error && <div class="container mx-2 my-2 justify-content-left"><div class="d-flex mx-3"><p class='text-danger'>{error}</p></div></div>}
                <div class="container d-flex justify-content-around">
                    <div class="row row-cols-4 justify-content-around">
                        {savingsGoals.map((savingsGoal, index) => {
                            return (
                                <SavingsGoalsTable key={index} goal={savingsGoal.goal} name={savingsGoal.name} currentAmount={savingsGoal.currentAmount} deleteSavingsGoal={deleteSavingsGoal} updateSavingsGoal={updateSavingsGoal} completeSavingsGoal={completeSavingsGoal} />                          
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    } else {
        return <div class="container mx-2 my-2"><h1><ShowViewButton onClick={handleShowSavingsGoals}/>Savings Goals</h1></div>
    }


}

function SavingsGoalsTable(props) {
    const goal = props.goal;
    const name = props.name;
    const currentAmount = props.currentAmount;
    const deleteSavingsGoal = props.deleteSavingsGoal;
    const updateSavingsGoal = props.updateSavingsGoal;
    const completeSavingsGoal = props.completeSavingsGoal;
    const tablaStyle = {
        marginLeft: '10px', // Ajusta el valor según tus preferencias
        marginTop: '10px', // Ajusta el valor según tus preferencias
    };
    if (goal){
        return (
            <div class="col">
                <table class="table border" style={tablaStyle}>
                    <thead>
                    <tr class="border-top-0">
                        <th colspan="3" class="text-center">{name}</th>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-center border-0">{currentAmount}/{goal}€</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="text-start"><DeleteButton onClick={() => deleteSavingsGoal(name)}/></td>
                        <td class="text-center"><UpdateButton onClick={() => updateSavingsGoal(name, goal)}/></td>
                        <td class="text-end"><CompleteButton onClick={() => completeSavingsGoal(name, goal, currentAmount)}/></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    } else {
        return (
            <div class="col">
                <table class="table border" style={tablaStyle}>
                    <thead>
                    <tr class="border-top-0">
                        <th colspan="2" class="text-center">{name}</th>
                    </tr>
                    <tr>
                        <td colspan="2" class="text-center border-0">{currentAmount}€</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="text-start"><DeleteButton onClick={() => deleteSavingsGoal(name)}/></td>
                        <td class="text-end"><UpdateButton onClick={() => updateSavingsGoal(name, goal)}/></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
    
}

export { ContainersView, SavingsGoalsView }