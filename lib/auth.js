/* eslint-env mocha */

'use strict';

let pagination = require('./pagination');
/**
 * Retrieve all user projects from jama's api using a user's username, password, and teamName. Prior to calling the
 * pagination function, the requested`url` is appended with the appropriate suffix to complete the request for all
 * items. The URL should be in the following format:
 * http://username:password@teamname.jamacloud.com/rest/latest/projects
 *
 * This function will either return a resolved promise with a payload of items, or a rejected promise.
 *
 * @param {String} username
 * @param {String} password
 * @param {String} teamName
 * @return {Promise} the promise will either be resolved with a payload of items of type project, or will be rejected
 */
// TODO: Separate responsibilities of authenticate into two parts: (1) log-in and (2) return projects
function authenticate (username, password, teamName) {
  let url = 'http://' + username + ':' + password + '@' + teamName + '.jamacloud.com/rest/latest/projects';
  return pagination(url, 0, Number.MAX_SAFE_INTEGER);
}

/**
 * Validate a user's login credentials and verify they are in the following format:
 * username: non empty string with maximum length of 200
 * password: non empty string with a minimum length of 6, and a maximum length of 200
 * teamName: non empty string containing the user's teamName from the environment variable
 * Returns true if login credentials are in required format, false otherwise
 *
 * @param {Object} req
 * @return {boolean} true if login credentials are in required format, flase otherwise
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

module.exports = {
  authenticate: authenticate,
  validate: validate
};
