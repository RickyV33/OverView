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
 * Checks the user credentials. Redirects if the credentials are not valid.
 * Note - req.session.error needs to be deleted after the message is displayed
 * on redirected page
 */
function isAuthenticated (req, res, next) {
  'use strict';

  let username = req.session.username;
  let password = req.session.password;
  let teamName = req.session.teamName;

  if (username && password && teamName) {
    if (username !== '' && username.length <= 200 &&
      password.length >= 6 && password.length <= 200 &&
      teamName !== '') {
      next();  // Continue logic flow as normal
    }
  }

  let authError = new Error('Authentication failed on projects page', 401);

  console.log(authError);
  req.session.error = authError.message;  // Passes the error message to the redirected page
  console.log('passed authError');
  res.redirect('/');
}

module.exports = {
  authenticate: authenticate,
  validate: validate,
  isAuthenticated: isAuthenticated
};
