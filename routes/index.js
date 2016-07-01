var express = require('express');
var auth = require('../lib/auth');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Jama Software Capstone' });
});

router.post('/', function (req, res, next) {
  if (auth.validate(req)) {
    auth.authenticate(req.body.username, req.body.password, req.body.teamName).then(function (projects) {
      req.session.username = req.body.username;
      req.session.password = req.body.password;
      req.session.teamName = req.body.teamName;
      req.session.projects = projects;
      res.redirect('/projects');
    }, function () {
      res.render('index', { title: 'Error: Incorrect credentials, please try again.' });
    });
  } else {
    res.render('index', { title: 'Error: Incorrect credentials, please try again.' });
  }
});

module.exports = router;
