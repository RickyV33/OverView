"use strict";
var request = require('request');

function authenticate(username, password) {
  "use strict";
  let promise = new Promise(function(resolve, reject){

    console.log(req.body);
    let url = 'http://' + username + ':' + password + '@jamacloud.com/rest/latest';

    request({url: url}, function (error, response, body) {
      if(error){
        reject(error);
      }
      else{
        resolve(response);
        console.log("response is: " + response);
        console.log("body is: " + body);
      }
    });
  });
};


function validate(req) {
  "use strict";

  let username = req.body.username;
  let password = req.body.password;

  return (username && password.length >= 6 && username.length <= 200 && password.length <= 200);
}

module.exports = {
  authenticate: authenticate,
  validate: validate
}