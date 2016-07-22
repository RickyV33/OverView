let session = require('express-session');

'use strict';
let pagination = require('./pagination');

// TODO: Separate responsibilities of authenticate into two parts: (1) log-in and (2) return projects
function authenticate (username, password, teamName) {
  'use strict';
  let url = 'http://' + username + ':' + password + '@' + teamName + '.jamacloud.com/rest/latest/projects';
  return pagination(url, 0, Number.MAX_SAFE_INTEGER);
}

function validate (req) {
  'use strict';

  let username = req.body.username;
  let password = req.body.password;
  let teamName = req.body.teamName;

  return (username !== '' && username.length <= 200 &&
    password.length >= 6 && password.length <= 200 &&
    teamName !== '');
}

/**
 * Checks the user credentials. Sets the isAuthenticated flag.
 */
function isAuthenticated (req, res, next) {
  'use strict';

  let username = req.session.username;
  let password = req.session.password;
  let teamName = req.session.teamName;
  let isAuth = false;

  if (username !== undefined && password !== undefined && teamName !== undefined) {
    if (username !== '' && username.length <= 200 &&
      password.length >= 6 && password.length <= 200 &&
      teamName !== '') {
      isAuth = true;
    }
  }

  req.session.isAuthenticated = isAuth;  // Set the isAuthenticate flag
  next();  // Continue logic flow as normal
}

module.exports = {
  authenticate: authenticate,
  validate: validate,
  isAuthenticated: isAuthenticated
};
