
import API_URL from "./config.js";

regButton = document.getElementById('submit');

function register(data) {
    fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
    .then(data => {
        if(data.result == "ok"){
            alert("data is inserted");
            window.location.href = "login.html";
        }else if(data.result == "fail" && data.data == "userexists"){
            console.log("user exists");
        }else{
            console.log("error");
        }
    })
}





regButton.addEventListener('click', function(event) {
    event.preventDefault();
    var name = document.getElementById('name').value;
    var mobile = document.getElementById('mobile').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('pwd').value;
    var user = document.getElementById('user').value;

    if (!name && !mobile && !email && !password && !user) {
        alert('Please fill in all fields');
        return;
    }else{
        if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
            alert('Please enter a valid email address');
            return;
        }else if (password.length < 6){
            alert('Password must be at least 6 characters long');
            return;
        }else if (mobile.length < 10) {
            alert('Mobile number must be at least 10 digits long');
            return;
        }else if(user.length < 8 || user.length > 50){
            alert('username must be minimum 8 characters and maximum 50 characters')
        }
    }

    var data = {
        name: name,
        mobile: mobile,
        email: email,
        password: password,
        username: user
    };

    register(data);
})
