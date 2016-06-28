
const INVALID_USERNAME_PASSWORD_ERROR_MESSAGE = "Invalid Username and/or Password Combination";

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("logIn").addEventListener('submit', (event) => {
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        if (username && password.length > 5 && username.length < 200 && password.length < 200) {
            //run submit function
        }
        else{
            event.preventDefault();
            alert(INVALID_USERNAME_PASSWORD_ERROR_MESSAGE);
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
        }

    });

});