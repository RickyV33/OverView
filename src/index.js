/* eslint-env browser */
import validate from '../lib/auth';

const INVALID_CREDENTIALS_ERROR_MESSAGE = 'Invalid Credentials';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logIn').addEventListener('submit', (event) => {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let teamName = document.getElementById('teamName').value;
    let credentials = {username: username, password: password, teamName: teamName};
    if (validate(credentials)) {
      // run submit function
    } else {
      event.preventDefault();
      alert(INVALID_CREDENTIALS_ERROR_MESSAGE);
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
      document.getElementById('teamName').value = '';
    }
  });
});
