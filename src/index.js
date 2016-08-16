/* eslint-env browser */

let auth = require('../lib/auth');

const INVALID_CREDENTIALS_ERROR_MESSAGE = 'Invalid Credentials';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logIn').addEventListener('submit', (event) => {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let teamName = process.env.TEAM_NAME;
    let credentials = {body: {username: username, password: password, teamName: teamName}};

    if (auth.validate(credentials)) {
      // run submit function
    } else {
      event.preventDefault();
      alert(INVALID_CREDENTIALS_ERROR_MESSAGE);
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    }
  });
});
