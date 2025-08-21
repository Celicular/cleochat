import {getCookie} from "../functions.js"



const cookie = getCookie("userSession")

async function checkSession(){
    if(cookie){
    await fetch("http://localhost:3000/verify", {
        method:"POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            cookie: cookie
        })
    }).then(res => res.json())
    .then(data => {
        console.log(data.result);
        if(data.result === "ok"){
            return true;
        }else{
            return false;
        }
    })
}
}

document.addEventListener("DOMContentLoaded", () => {
    if (!checkSession()){
    alert("invalid session");
    window.location.href = "login.html";
}
})



document.querySelector(".logout").addEventListener("click", (e) => {
    document.cookie = "userSession=;";
    window.location.href = "login.html"
})  