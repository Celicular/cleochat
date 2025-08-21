regButton = document.getElementById('submit');

function register(data) {
    fetch('http://localhost:3000/register', {
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

    if (!name && !mobile && !email && !password) {
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
        }
    }

    var data = {
        name: name,
        mobile: mobile,
        email: email,
        password: password
    };

    register(data);
})
