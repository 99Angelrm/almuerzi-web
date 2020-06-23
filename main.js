let mealsState = [];
let user = {};

let ruta = "login" // login, registe, orders
const stringToHtml = (s) =>{
    const parser = new DOMParser();
    const doc = parser.parseFromString(s,'text/html');
    return doc.body.firstChild;
}
const renderItem = (item) =>{
    const element = stringToHtml(`<li data-id='${item._id}'>${item.name}</li>`);
    element.addEventListener('click',()=>{
        const mealslist = document.getElementById('meals-list');
        Array.from(mealslist.children).forEach(x=>x.classList.remove('selected'));
        element.classList.add('selected');
        const mealsInput = document.getElementById('meal-id');
        mealsInput.value= item._id;
    })
    return element;
}

const renderOrder = (order,meals) =>{
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = stringToHtml(`<li data-id='${order._id}'>${meal.name} ${order.user_id}</li>`);
    return element
}

const inicializaFormulario = () =>{
    const orderForm = document.getElementById("order");
    const logOut = document.getElementById("salida");
    orderForm.onsubmit = (e) =>{
        e.preventDefault();
        const submit = document.getElementById("submit");
        submit.setAttribute('disabled',true)
        const mealId=document.getElementById("meal-id");
        const mealIdValue=mealId.value;
        if(!mealIdValue){
            alert('Elige algo HDP')
            submit.removeAttribute('disabled')
            return
        }
        const order = {
            meal_id: mealIdValue,
            user_id: user.email,
        }
        fetch('https://serverless.99angelrm.vercel.app/api/orders',{
            method: 'POST',
            headers:{
                'Content-type':'application/json',
            },
            body: JSON.stringify(order)
        }).then(x=> x.json())
        .then(respuesta => {
            const renderedOrder = renderOrder(respuesta,mealsState)
            const ordersList = document.getElementById('orders-list')
            ordersList.appendChild(renderedOrder)
            submit.removeAttribute("disabled")
        })
    }
    logOut.onsubmit = (e) =>{
        e.preventDefault();
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        renderLogin()
    }
}

inicializaDatos = () =>{
    fetch('https://serverless.99angelrm.vercel.app/api/meals')
    .then(response =>response.json())
    .then(data => {
        mealsState=data;
        const submit = document.getElementById('submit');
        const mealslist = document.getElementById('meals-list')
        const listItems = data.map(renderItem)
        mealslist.removeChild(mealslist.firstElementChild);
        listItems.forEach(element => mealslist.appendChild(element));
        submit.removeAttribute("disabled")
        fetch('https://serverless.99angelrm.vercel.app/api/orders')
            .then(response => response.json())
            .then(ordersData => {
                const ordersList = document.getElementById("orders-list")
                const listOrders = ordersData.map(orderData => renderOrder(orderData,data))
                ordersList.removeChild(ordersList.firstElementChild)
                listOrders.forEach(element => ordersList.appendChild(element))
                console.log(ordersList)
            })
    })
}

const loginfunction = (email,password) =>{
    fetch("https://serverless.99angelrm.vercel.app/api/auth/login",{
        method: 'POST',
        headers:{
            'Content-type':'application/json',
        },
        body: JSON.stringify({email,password})
    })

}

const renderApp = () =>{
    const token = localStorage.getItem("token")
    if(token){
        user = JSON.parse(localStorage.getItem("user"))
        return renderOrders()
    }
    renderLogin()
}

const renderOrders= () =>{
    const ordersView = document.getElementById("orders-view")
        document.getElementById("app").innerHTML = ordersView.innerHTML;
        inicializaFormulario()
        inicializaDatos()
}

const renderLogin = () =>{
    const loginTemplate = document.getElementById("login-template")
    document.getElementById("app").innerHTML = loginTemplate.innerHTML;
    const logingForm = document.getElementById("login-form")
    logingForm.onsubmit = (e)=>{
        e.preventDefault()
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value
        fetch("https://serverless.99angelrm.vercel.app/api/auth/login",{
        method: 'POST',
        headers:{
            'Content-type':'application/json',
        },
        body: JSON.stringify({email,password})
    }).then(x=> x.json())
    .then(respuesta => {
        localStorage.setItem("token",respuesta.token)
        ruta = "orders"
        return respuesta.token
    }).then(token=>{
        return fetch("https://serverless.99angelrm.vercel.app/api/auth/me",{
            method: 'GET',
            headers:{
            'Content-type':'application/json',
            autorization : token,
        },
        })        
    })
    .then(x=> x.json())
    .then(fetchedUser=>{
        localStorage.setItem("user",JSON.stringify(fetchedUser))
        user=fetchedUser;
        renderOrders()
    })
    }
}

window.onload = () =>{
    renderApp()
} 