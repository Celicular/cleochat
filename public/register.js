import API_URL from "./config.js";

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const regButton = document.getElementById('submit');

    function register(data) {
        console.log("registering");
        fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(data => {
            if(data.result === "ok") {
                alert("Data is inserted");
                window.location.href = "login.html";
            } else if(data.result === "fail" && data.data === "userexists") {
                console.log("User exists");
                alert("User already exists");
            } else {
                console.log("Error:", data);
                alert("Something went wrong");
            }
        })
        .catch(err => {
            console.error("Fetch error:", err);
            alert("Network or server error");
        });
    }

    regButton.addEventListener('click', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('pwd').value;
        const user = document.getElementById('user').value.trim();

        if (!name || !mobile || !email || !password || !user) {
            alert('Please fill in all fields');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            alert('Please enter a valid email address');
            return;
        }
        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        if (mobile.length < 10) {
            alert('Mobile number must be at least 10 digits long');
            return;
        }
        if (user.length < 8 || user.length > 50) {
            alert('Username must be between 8 and 50 characters');
            return;
        }

        const data = { name, mobile, email, password, username: user };
        register(data);
    });
});