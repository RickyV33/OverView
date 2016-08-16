'use strict';
let pagination = require('./pagination');
let request = require('request');

// TODO: Separate responsibilities of authenticate into two parts: (1) log-in and (2) return projects

/**
 * Sets up the URL and passes it to Pagination
 * @param {string} username
 * @param {string} password
 * @param {string} teamName
 * @returns {*}
 */
function authenticate (username, password, teamName) {
  'use strict';
  let url = 'http://' + username + ':' + password + '@' + teamName + '.jamacloud.com/rest/latest/projects';
  return pagination(url, 0, Number.MAX_SAFE_INTEGER);
}

/**
 * Validates that the username, password and teamname are not blank and meet the character length restrictions
 * @param req
 * @returns {boolean}
 */
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
 * Checks the user credentials by connecting to jamacloud and trying to pull project data.
 * If the credentials are valid and the user is authenticated by Jama, then isAuth is set to true
 * Sets the isAuthenticated flag.
 * @param {object} req
 * @param {object} res
 * @param {object} next -  The next function to be called after this one
 */
function isAuthenticated (req, res, next) {
  'use strict';

  let username = req.session.username;
  let password = req.session.password;
  let teamName = req.session.teamName;
  let isAuth = false;
  let isValid = validate(req);

  if (isValid && isServerAuthenticated(username, password, teamName)) {
    isAuth = true;
  }
  req.session.isAuthenticated = isAuth;  // Set the isAuthenticate flag
  next();
}

/**
 * Checks the authentication status of credentials with Jama's servers
 * @param {string} username
 * @param {string} password
 * @param {string} teamName
 *
 * @returns {boolean}
 */
function isServerAuthenticated (username, password, teamName) {
  let url = 'http://' + username + ':' + password + '@' + teamName + '.jamacloud.com/rest/latest/';
  request({url: url, json: true}, function (error, response, body) {
    return (response.body.meta.status === 'OK' && !(error));
  });
}

module.exports = {
  authenticate: authenticate,
  validate: validate,
  isAuthenticated: isAuthenticated
};
