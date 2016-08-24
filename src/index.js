/* eslint-env browser */

let auth = require('../lib/auth');

const INVALID_CREDENTIALS_ERROR_MESSAGE = 'Invalid Credentials';

// Capture login form elements (username, password) and teamName from the process environment variable.
// and store them into the credentials object
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logIn').addEventListener('submit', (event) => {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let teamName = document.getElementById('teamName').value;
    let credentials = {body: {username: username, password: password, teamName: teamName}};

    // Pass the credentials object to the validate function in the auth module. Clear form fields and initialize
    // error variable if validate returns false, otherwise do nothing
    if (auth.validate(credentials)) {
      // do nothing
    } else {
      event.preventDefault();
      alert(INVALID_CREDENTIALS_ERROR_MESSAGE);
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    }
  });
});
