loginbtn = document.getElementById('submit');

async function login(data){
    await fetch("/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'Application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
    .then(data => {
        if(data.result == "ok"){
            console.log(data.session);
            alert("logged in");
            document.cookie = `userSession=${data.session}`;
            localStorage.setItem("currentChatName", "");
            localStorage.setItem("currentChatRecieverAddress", "");
            window.location.href = "main.html";

        }else{
            console.log(data);
            alert("email or password is invalid")
        }
    })
}




loginbtn.addEventListener("click", (e) => {
    e.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('pwd').value;
    if(!email || !password){
        alert("Please make sure all fields are filled!")
        return
    }
    data = {
        email: email,
        password: password
    }

    login(data);
})